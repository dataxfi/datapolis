import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext, placeHolderOrContent } from '../context/GlobalState';
import BigNumber from 'bignumber.js';
import { IPoolLiquidity } from '../utils/types';
import { IToken } from '@dataxfi/datax.js';

export default function PositionBox({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [dtToOcean, setDtToOcean] = useState<BigNumber>(new BigNumber(''));
  const [oceanToDt, setOceanToDt] = useState<BigNumber>(new BigNumber(''));
  const [yourLiquidity, setYourLiquidity] = useState<BigNumber>(new BigNumber(0));
  const [yourShares, setYourShares] = useState<BigNumber>(new BigNumber(0));
  const [poolLiquidity, setPoolLiquidity] = useState<IPoolLiquidity | null>(null);
  const { tokenOut, chainId, web3, ocean, accountId, tokensCleared, setTokenOut } = useContext(GlobalContext);

  useEffect(() => {
    if (!chainId || !web3 || !ocean || !accountId || !tokensCleared.current) return;
    if (tokenOut.info && !ocean.isOCEAN(tokenOut.info.address)) {
      updateToken(tokenOut);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, chainId, web3, ocean, accountId, tokenOut.info, tokensCleared]);

  async function updateToken(token: IToken) {
    if (!accountId || !ocean) return;
    try {
      if (!token.info?.pool) throw new Error('Pool attribute is missing from token.');
      setLoading(true);
      const { pool } = token.info;
      setTokenOut(token);
      const [res1, res2, myPoolShares, totalPoolShares] = await Promise.all([
        ocean?.getOceanPerDt(pool),
        ocean?.getDtPerOcean(pool),
        ocean?.getMyPoolSharesForPool(pool, accountId),
        ocean?.getTotalPoolShares(pool),
      ]);
      setYourShares(new BigNumber(myPoolShares));
      setOceanToDt(new BigNumber(res1));
      setDtToOcean(new BigNumber(res2));

      setYourLiquidity(new BigNumber(await ocean.getOceanRemovedforPoolShares(pool, myPoolShares)));
      const { dtAmount, oceanAmount } = await ocean.getTokensRemovedforPoolShares(pool, String(totalPoolShares));
      setPoolLiquidity({ dtAmount: new BigNumber(dtAmount), oceanAmount: new BigNumber(oceanAmount) });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
          !!(tokenOut.info && oceanToDt.gt(0) && dtToOcean.gt(0))
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
          !!(tokenOut.info && poolLiquidity)
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
          !!(tokenOut.info && yourLiquidity)
        )}
      </div>
    </div>
  );
}
