import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { isOCEAN } from "../components/Swap";
import { GlobalContext } from "../context/GlobalState";
import { percOf } from "../utils/equate";
import { getLocalPoolData, setLocalPoolDataStorage } from "../utils/stakedPoolsUtils";
import { ILiquidityPosition } from "../utils/types";
import { getToken } from "./useTokenList";

export default function useLiquidityPos(
  importPool?: string | undefined,
  setImportPool?: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  const { allStakedPools, setSingleLiquidityPos, chainId, accountId, ocean, setAllStakedPools, token1, token2, web3 } =
    useContext(GlobalContext);
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pool = queryParams.get("pool");

    if (
      web3 &&
      ocean &&
      accountId &&
      chainId &&
      token1.info &&
      token2.info &&
      (isOCEAN(token1.info.address, ocean) || isOCEAN(token2.info?.address, ocean))
    ) {
      let dtPool: string | null = pool;
      console.log("Importing", pool);

      if (dtPool === null)
        isOCEAN(token1.info.address, ocean) ? (dtPool = token1.info.pool) : (dtPool = token2.info.pool);

      const localStoragePoolData = getLocalPoolData(accountId, chainId);

      console.log(allStakedPools);
      const findPool = (pool: { address: string }) => pool.address === dtPool;

      if (allStakedPools) {
        const singlePosition = allStakedPools.find(findPool);
        setSingleLiquidityPos(singlePosition);
      } else if (localStoragePoolData) {
        updateSingleStakePool(dtPool).then((res) => {
          if (res) {
            setSingleLiquidityPos(res);
            const parsedData: ILiquidityPosition[] = JSON.parse(localStoragePoolData);
            const oldDataIndex = parsedData.findIndex(findPool);
            parsedData.splice(oldDataIndex, 1, res);
            setAllStakedPools(parsedData);
          }
        });
      } else {
        updateSingleStakePool(dtPool).then((res) => {
          if (res) {
            setAllStakedPools([res]);
            setSingleLiquidityPos(res);
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1.info, token2.info, ocean, allStakedPools, accountId, web3]);

  const nextToImport = useRef(importPool);
  useEffect(() => {
    if (importPool && chainId && !loading) {
      updateSingleStakePool(importPool)
        .then((res) => {
          if (res && allStakedPools) {
            let newData = allStakedPools;
            const index = allStakedPools.findIndex((item) => item.address === res.address);
            console.log(index);

            index >= 0 ? newData.splice(index, 1, res) : newData.push(res);
            setAllStakedPools(newData);
            setLocalPoolDataStorage(newData, chainId);
          } else if (res) {
            setAllStakedPools([res]);
            setLocalPoolDataStorage([res], chainId);
          }
        })
        .catch(console.error)
        .finally(() => {
          if (setImportPool) setImportPool(nextToImport.current);
          setLoading(false);
        });
    } else if (loading) {
      nextToImport.current = importPool;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importPool, loading]);

  async function updateSingleStakePool(poolAddress: string): Promise<ILiquidityPosition | void> {
    if (!ocean || !accountId || !web3 || !chainId) return;
    try {
      poolAddress = poolAddress.toLowerCase();
      const shares = await ocean.getMyPoolSharesForPool(poolAddress, accountId);
      const token1Info = await getToken(web3, chainId, ocean.config.default.oceanTokenAddress, "reserve");
      const token2Info = await getToken(web3, chainId, poolAddress, "pool");
      const totalPoolShares = await ocean.getTotalPoolShares(poolAddress);
      const yourPoolSharePerc = percOf(shares, totalPoolShares);
      const { dtAmount, oceanAmount } = await ocean.getTokensRemovedforPoolShares(poolAddress, String(totalPoolShares));
      if (token1Info && token2Info)
        return {
          address: poolAddress,
          accountId,
          totalPoolShares,
          yourPoolSharePerc,
          dtAmount,
          oceanAmount,
          token1Info,
          token2Info,
          shares,
        };
    } catch (error) {
      console.error(error);
    }
    return;
  }
}
