import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import { bgLoadingStates, removeBgLoadingState } from "../context/GlobalState";
import {
  updateSingleStakePool,
  getLocalPoolData,
  setPoolDataFromLocal,
} from "../utils/stakedPoolsUtils";

export default function useCurrentPool(
  poolAddress: string,
  setPoolAddress: Function
) {
  const {
    allStakedPools,
    setCurrentStakePool,
    currentStakePool,
    bgLoading,
    setBgLoading,
    chainId,
    accountId,
    ocean,
    setAllStakedPools,
  } = useContext(GlobalContext);

  const location = useLocation();
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pool = queryParams.get("pool");
    if (pool) setPoolAddress(pool);
  }, [location]);

  useEffect(() => {
    if (
      currentStakePool &&
      poolAddress &&
      !bgLoading.includes(bgLoadingStates.singlePoolData)
    ) {
      setBgLoading([...bgLoading, bgLoadingStates.singlePoolData]);
      if (allStakedPools) {
        const currentPool = allStakedPools.find(
          (pool: { address: string }) => pool.address === poolAddress
        );
        setCurrentStakePool(currentPool);
      }
    }
      setBgLoading(
        removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData)
      );
  }, [allStakedPools]);

  useEffect(() => {
    let localStoragePoolData;
    if (accountId) {
      localStoragePoolData = getLocalPoolData(accountId, chainId);
      if (localStoragePoolData && poolAddress) {
        setPoolDataFromLocal({
          localStoragePoolData,
          poolAddress: poolAddress,
          setAllStakedPools,
          setCurrentStakePool,
          setBgLoading,
          bgLoading,
        });
      }
    }

    if (
      !currentStakePool &&
      !allStakedPools &&
      poolAddress &&
      ocean &&
      accountId
    ) {
      setBgLoading([...bgLoading, bgLoadingStates.singlePoolData]);
      updateSingleStakePool({
        ocean,
        accountId,
        localData: JSON.parse(localStoragePoolData || ""),
        poolAddress: poolAddress || "",
        setAllStakedPools,
      }).then(() => {
        setBgLoading(
          removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData)
        );
        setBgLoading(
          removeBgLoadingState(bgLoading, bgLoadingStates.allStakedPools)
        )
      });
    }
  }, [chainId, accountId]);
}
