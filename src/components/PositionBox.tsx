import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext, placeHolderOrContent } from '../context/GlobalState';
import BigNumber from 'bignumber.js';
import { IPoolLiquidity } from '../@types/types';
import {  ITokenInfo } from '@dataxfi/datax.js';
import { getToken } from '../hooks/useTokenList';

export default function PositionBox({
  loading,
  setLoading,
}: {
  loading?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [dtToOcean, setDtToOcean] = useState<BigNumber>(new BigNumber(''));
  const [oceanToDt, setOceanToDt] = useState<BigNumber>(new BigNumber(''));
  const [yourLiquidity, setYourLiquidity] = useState<BigNumber>(new BigNumber(0));
  const [yourShares, setYourShares] = useState<BigNumber>(new BigNumber(0));
  const [reserves, setReserves] = useState<{ base: string; dt: string }>();
  const [poolTokens, setPoolTokens] = useState<{ datatoken: ITokenInfo; baseToken: ITokenInfo }>();

  const { tokenOut, chainId, web3, accountId, tokensCleared, trade, stake, refAddress, config } =
    useContext(GlobalContext);

  useEffect(() => {
    if (!chainId || !web3 || !accountId || !tokensCleared.current) return;
    if (tokenOut.info?.pools) {
      updatePositionBox(tokenOut.info.pools[0].id);
    }
  }, [chainId, web3, accountId, tokenOut.info?.address, tokensCleared]);

  async function updatePositionBox(poolAddress: string) {
    if (!accountId || !trade || !config || !refAddress || !stake || !web3 || !chainId) return;
    try {
      if (setLoading) setLoading(true);

      const [baseTokenAddress, datatokenAddress] = await Promise.all([
        stake?.getBaseToken(poolAddress),
        stake?.getDatatoken(poolAddress),
      ]);

      const [baseToken, datatoken] = await Promise.all([
        getToken(web3, chainId, baseTokenAddress, 'exchange', config, accountId),
        getToken(web3, chainId, poolAddress, 'pool', config, accountId),
      ]);

      if (baseToken && datatoken) setPoolTokens({ datatoken, baseToken });

      const [oceanToDt, dtToOcean, myPoolShares, dt, base] = await Promise.all([
        trade?.getSpotPrice(poolAddress, baseTokenAddress, datatokenAddress),
        trade?.getSpotPrice(poolAddress, datatokenAddress, baseTokenAddress),
        stake?.sharesBalance(accountId, poolAddress.toLowerCase()),
        stake.getReserve(poolAddress, datatokenAddress),
        stake.getReserve(poolAddress, baseTokenAddress),
      ]);

      setReserves({ dt, base });

      if (myPoolShares) setYourShares(new BigNumber(myPoolShares));
      setOceanToDt(new BigNumber(oceanToDt));
      setDtToOcean(new BigNumber(dtToOcean));

      if (myPoolShares && myPoolShares !== '0') {
        const stakeInfo = {
          meta: [poolAddress, accountId, refAddress, config.custom.uniV2AdapterAddress],
          path: [baseTokenAddress],
          uints: [myPoolShares, "0", '0'],
        };

        const response = await stake?.calcTokenOutGivenPoolIn(stakeInfo);
        let baseAmountOut;
        if (response) baseAmountOut = response.baseAmountOut;

        setYourLiquidity(new BigNumber(baseAmountOut || 0));
      } else {
        setYourLiquidity(new BigNumber(0));
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (setLoading) setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row border border-city-blue border-opacity-50 mt-4 rounded-lg p-2 w-full">
      <div className="my-1 mr-4">
        <p className="text-gray-300 text-xs mb-1">Swap Rate</p>
        {placeHolderOrContent(
          <div id="swapRate" className={`${loading ? 'blur-xs' : ''}`}>
            <p className="text-gray-200 text-xs">
              {oceanToDt.dp(5).toString()} OCEAN per {tokenOut.info?.symbol}
            </p>
            <p className="text-gray-200 text-xs">
              {dtToOcean.dp(5).toString()} {tokenOut.info?.symbol} per OCEAN
            </p>
          </div>,
          '12rem',
          !!(tokenOut.info && oceanToDt.gt(0) && dtToOcean.gt(0)),
          2
        )}
      </div>
      <div className="my-1 mr-4">
        <p className="text-gray-300 text-xs mb-1">Pool liquidity</p>
        {placeHolderOrContent(
          <div id="poolLiquidity" className={`${loading ? 'blur-xs' : ''}`}>
            <p className="text-gray-200 text-xs">
              {new BigNumber(reserves?.base || 0).dp(2).toString()} {poolTokens?.baseToken.symbol}
            </p>
            <p className="text-gray-200 text-xs">
              {new BigNumber(reserves?.dt || 0).dp(2).toString()} {poolTokens?.datatoken.symbol}
            </p>
          </div>,
          '6rem',
          !!(poolTokens && tokenOut.info),
          2
        )}
      </div>
      <div className="my-1">
        <p className="text-gray-300 text-xs mb-1">Your liquidity</p>
        {placeHolderOrContent(
          <div id="yourLiquidity" className={`${loading ? 'blur-xs' : ''}`}>
            <p className="text-gray-200 text-xs">{yourShares.dp(5).toString()} shares</p>
            <p className="text-gray-200 text-xs">
              {yourLiquidity.dp(5).toString()} {poolTokens?.baseToken.symbol}
            </p>
          </div>,
          '8rem',
          !!(tokenOut.info && yourLiquidity),
          2
        )}
      </div>
    </div>
  );
}
