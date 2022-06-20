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
  const [poolLiquidity, setPoolLiquidity] = useState<IPoolLiquidity | null>(null);
  const { tokenOut, chainId, web3, accountId, tokensCleared, setTokenOut, trade, stake, refAddress, config } =
    useContext(GlobalContext);

  useEffect(() => {
    if (!chainId || !web3 || !accountId || !tokensCleared.current) return;
    if (tokenOut.info?.pool) {
      stake?.getPoolDetails(tokenOut.info.pool).then(updateToken);
    }
  }, [chainId, web3, accountId, tokenOut.info?.address, tokensCleared]);

  async function updateToken(pool: IPoolDetails) {
    if (!accountId || !trade) return;
    try {
      if (setLoading) setLoading(true);
      const { id, baseToken, datatoken, baseTokenLiquidity, datatokenLiquidity } = pool;

      const [res1, res2, myPoolShares, totalPoolShares] = await Promise.all([
        trade?.getSpotPrice(id, baseToken.address, datatoken.address),
        trade?.getSpotPrice(id, datatoken.address, baseToken.address),
        stake?.sharesBalance(id, accountId),
        stake?.getTotalPoolShares(id),
      ]);

      if (myPoolShares) setYourShares(new BigNumber(myPoolShares));
      setOceanToDt(new BigNumber(res1));
      setDtToOcean(new BigNumber(res2));

      const stakeInfo = {
        meta: [id, accountId, refAddress, config?.custom.uniV2AdapterAddress],
        path: [baseToken.address],
        uints: ['0', '0', myPoolShares || "0"],
      };

      const response = await stake?.calcTokenOutGivenPoolIn(stakeInfo);
      let poolAmountOut;
      if (response) poolAmountOut = response.poolAmountOut;

      setYourLiquidity(new BigNumber(poolAmountOut || 0));
      setPoolLiquidity({ dtAmount: new BigNumber(datatokenLiquidity), oceanAmount: new BigNumber(baseTokenLiquidity) });
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
            <p className="text-gray-200 text-xs">{poolLiquidity?.oceanAmount.dp(5).toString()} OCEAN</p>
            <p className="text-gray-200 text-xs">
              {poolLiquidity?.dtAmount.dp(5).toString()} {tokenOut.info?.symbol}
            </p>
          </div>,
          '6rem',
          !!(tokenOut.info && poolLiquidity),
          2
        )}
      </div>
      <div className="my-1">
        <p className="text-gray-300 text-xs mb-1">Your liquidity</p>
        {placeHolderOrContent(
          <div id="yourLiquidity" className={`${loading ? 'blur-xs' : ''}`}>
            <p className="text-gray-200 text-xs">{yourShares.dp(5).toString()} Shares</p>
            <p className="text-gray-200 text-xs">{yourLiquidity.dp(5).toString()} OCEAN</p>
          </div>,
          '8rem',
          !!(tokenOut.info && yourLiquidity),
          2
        )}
      </div>
    </div>
  );
}
