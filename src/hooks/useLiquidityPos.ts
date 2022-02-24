import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isOCEAN } from "../components/Swap";
import { GlobalContext, INITIAL_TOKEN_STATE } from "../context/GlobalState";
import { bgLoadingStates, removeBgLoadingState } from "../context/GlobalState";
import { percOf } from "../utils/equate";
import { getLocalPoolData, setLocalPoolDataStorage } from "../utils/stakedPoolsUtils";
import { ILiquidityPosition } from "../utils/types";
import { getToken } from "./useTokenList";

export default function useLiquidityPos(
  importPool?: string | undefined,
  setImportPool?: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  const {
    allStakedPools,
    setSingleLiquidityPos,
    chainId,
    accountId,
    ocean,
    setAllStakedPools,
    token1,
    token2,
    web3,
  } = useContext(GlobalContext);

  useEffect(() => {
    if (
      web3 &&
      ocean &&
      accountId &&
      chainId &&
      token1.info &&
      token2.info &&
      (isOCEAN(token1.info.address, ocean) || isOCEAN(token2.info?.address, ocean))
    ) {
      let dtPool: string;

      isOCEAN(token1.info.address, ocean) ? (dtPool = token1.info.pool) : (dtPool = token2.info.pool);

      const localStoragePoolData = getLocalPoolData(accountId, chainId);

      if (allStakedPools) {
        const singlePosition = allStakedPools.find((pool: { address: string }) => pool.address === dtPool);
        setSingleLiquidityPos(singlePosition);
      } else if (localStoragePoolData) {
        setAllStakedPools(JSON.parse(localStoragePoolData));
      } else {
        updateSingleStakePool(dtPool).then((res) => {
          if (res) setAllStakedPools([res]);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1.info, token2.info, ocean, allStakedPools, accountId, web3]);

  useEffect(() => {
    console.log("importing", importPool);

    if (importPool && setImportPool && chainId) {
      updateSingleStakePool(importPool).then((res) => {
        if (res && allStakedPools) {
          setAllStakedPools([...allStakedPools, res]);
          setLocalPoolDataStorage([...allStakedPools, res], chainId);
        } else if (res) {
          setAllStakedPools([res]);
          setLocalPoolDataStorage([res], chainId);
        }
      });
      setImportPool(undefined);
    }
  }, [importPool]);

  async function updateSingleStakePool(poolAddress: string): Promise<ILiquidityPosition | void> {
    if (!ocean || !accountId || !web3 || !chainId) return;
    try {
      poolAddress = poolAddress.toLowerCase();
      const shares = await ocean.getMyPoolSharesForPool(poolAddress, accountId);
      const token1Info = await getToken(web3, chainId, poolAddress, "pool");
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
