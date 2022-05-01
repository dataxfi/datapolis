import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import BigNumber from 'bignumber.js';
import { IPoolLiquidity } from '../utils/types';
import { IToken } from '@dataxfi/datax.js';
import { Collapse } from 'react-collapse';

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
  const { token2, chainId, web3, ocean, accountId, tokensCleared, setToken2 } = useContext(GlobalContext);

  useEffect(() => {
    if (!chainId || !web3 || !ocean || !accountId || !tokensCleared.current) return;
    if (token2.info && !ocean.isOCEAN(token2.info.address)) {
      updateToken(token2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, chainId, web3, ocean, accountId, token2.info, tokensCleared]);

  async function updateToken(token: IToken) {
    if (!accountId || !ocean) return;
    try {
      if (!token.info?.pool) throw new Error('Pool attribute is missing from token.');
      setLoading(true);
      const { pool } = token.info;
      setToken2(token);
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
    <Collapse isOpened={token2.info && !loading && oceanToDt.gt(0) && dtToOcean.gt(0) ? true : false}>
      <div className="flex border border-city-blue border-opacity-50 mt-4 rounded-lg p-2 w-full">
        <div className="my-1 mr-4">
          <p className="text-gray-300 text-xs">Swap Rate</p>
          {token2.info && oceanToDt.gt(0) && dtToOcean.gt(0) && !loading ? (
            <div id="swapRate">
              <p className="text-gray-200 text-xs">
                {oceanToDt.dp(5).toString()} OCEAN per {token2.info.symbol}
              </p>
              <p className="text-gray-200 text-xs">
                {dtToOcean.dp(5).toString()} {token2.info.symbol} per OCEAN
              </p>
            </div>
          ) : (
            <div> - </div>
          )}
        </div>
        <div className="my-1 mr-4">
          <p className="text-gray-300 text-xs">Pool liquidity</p>
          {token2.info && poolLiquidity && !loading ? (
            <div id="poolLiquidity">
              <p className="text-gray-200 text-xs">{poolLiquidity?.oceanAmount.dp(5).toString()} OCEAN</p>
              <p className="text-gray-200 text-xs">
                {poolLiquidity?.dtAmount.dp(5).toString()} {token2.info.symbol}
              </p>
            </div>
          ) : (
            <div> - </div>
          )}
        </div>
        <div className="my-1">
          <p className="text-gray-300 text-xs">Your liquidity</p>
          {token2.info && yourLiquidity && !loading ? (
            <div id="yourLiquidity">
              <p className="text-gray-200 text-xs">{yourShares.dp(5).toString()} Shares</p>
              <p className="text-gray-200 text-xs">{yourLiquidity.dp(5).toString()} OCEAN</p>
            </div>
          ) : (
            <div> - </div>
          )}
        </div>
      </div>
    </Collapse>
  );
}
