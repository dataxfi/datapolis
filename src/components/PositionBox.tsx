import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext, placeHolderOrContent } from '../context/GlobalState';
import BigNumber from 'bignumber.js';
import { IPoolLiquidity } from '../utils/types';
import { IPoolDetails, IToken } from '@dataxfi/datax.js';

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
  const [] = useState<IPoolDetails>();
  const {
    tokenOut,
    chainId,
    web3,
    accountId,
    tokensCleared,
    setTokenOut,
    trade,
    stake,
    refAddress,
    config,
    poolDetails,
    setPoolDetails,
  } = useContext(GlobalContext);

  useEffect(() => {
    if (!chainId || !web3 || !accountId || !tokensCleared.current) return;
    if (tokenOut.info?.pools[0].id) {
      stake
        ?.getPoolDetails(tokenOut.info.pools[0].id)
        .then((res) => {
          const { name, symbol } = res.baseToken;
          const { baseToken, datatoken, baseTokenLiquidity, datatokenLiquidity, id, totalShares } = res;
          const poolDetails = {
            id,
            totalShares,
            baseToken,
            datatoken,
            datatokenLiquidity: new BigNumber(datatokenLiquidity).dp(5).toString(),
            baseTokenLiquidity: new BigNumber(baseTokenLiquidity).dp(5).toString(),
          };
          setPoolDetails(poolDetails);
          updatePositionBox(poolDetails);
        })
        .catch(console.error);
    }
  }, [chainId, web3, accountId, tokenOut.info?.address, tokensCleared]);

  async function updatePositionBox(pool: IPoolDetails) {
    if (!accountId || !trade || !config || !refAddress) return;
    try {
      if (setLoading) setLoading(true);
      const { id, baseToken, datatoken } = pool;

      const [res1, res2, myPoolShares] = await Promise.all([
        trade?.getSpotPrice(id, baseToken.id, datatoken.id),
        trade?.getSpotPrice(id, datatoken.id, baseToken.id),
        stake?.sharesBalance(accountId, id.toLowerCase()),
      ]);

      if (myPoolShares) setYourShares(new BigNumber(myPoolShares));
      setOceanToDt(new BigNumber(res1));
      setDtToOcean(new BigNumber(res2));

      if (myPoolShares) {
        const stakeInfo = {
          meta: [id, accountId, refAddress, config.custom.uniV2AdapterAddress],
          path: [baseToken.id],
          uints: ['0', '0', myPoolShares],
        };

        const response = await stake?.calcTokenOutGivenPoolIn(stakeInfo);
        let baseAmountOut;
        if (response) baseAmountOut = response.baseAmountOut;

        setYourLiquidity(new BigNumber(baseAmountOut || 0));
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (setLoading) setLoading(false);
    }
  }

  return (
    <div className="flex border border-city-blue border-opacity-50 mt-4 rounded-lg p-2 w-full">
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
              {new BigNumber(poolDetails?.baseTokenLiquidity || 0).dp(2).toString()} {poolDetails?.baseToken.symbol}
            </p>
            <p className="text-gray-200 text-xs">
              {new BigNumber(poolDetails?.datatokenLiquidity || 0).dp(2).toString()} {poolDetails?.datatoken.symbol}
            </p>
          </div>,
          '6rem',
          !!poolDetails,
          2
        )}
      </div>
      <div className="my-1">
        <p className="text-gray-300 text-xs mb-1">Your liquidity</p>
        {placeHolderOrContent(
          <div id="yourLiquidity" className={`${loading ? 'blur-xs' : ''}`}>
            <p className="text-gray-200 text-xs">{yourShares.dp(5).toString()} shares</p>
            <p className="text-gray-200 text-xs">
              {yourLiquidity.dp(5).toString()} {poolDetails?.baseToken.symbol}
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
