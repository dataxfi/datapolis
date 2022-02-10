import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import { bgLoadingStates, removeBgLoadingState } from "../context/GlobalState";
import { updateSingleStakePool, getLocalPoolData, setPoolDataFromLocal } from "../utils/stakedPoolsUtils";

export default function useCurrentPool(
  poolAddress: string,
  setPoolAddress: Function,
  txReceipt?: any,
  setTxReceipt?: Function
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
    if (!currentStakePool && poolAddress && !bgLoading.includes(bgLoadingStates.singlePoolData)) {
      setBgLoading([...bgLoading, bgLoadingStates.singlePoolData]);
      if (allStakedPools) {
        const currentPool = allStakedPools.find((pool: { address: string }) => pool.address === poolAddress);
        setCurrentStakePool(currentPool);
        console.log(currentPool);
      }
    }
    setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData));
  }, [allStakedPools, poolAddress]);

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
      // !currentStakePool && !allStakedPools
      if (poolAddress && ocean) {
        setBgLoading([...bgLoading, bgLoadingStates.singlePoolData]);
        updateSingleStakePool({
          ocean,
          accountId,
          localData: JSON.parse(localStoragePoolData || ""),
          poolAddress: poolAddress || "",
          setAllStakedPools,
        }).then(() => {
          setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData));
        });
      }
    }
  }, [chainId, accountId, ocean]);

  useEffect(() => {
    if (txReceipt && !bgLoading.includes(bgLoadingStates.singlePoolData)) {
      setBgLoading([...bgLoading, bgLoadingStates.singlePoolData]);
      updateSingleStakePool({
        ocean,
        accountId,
        localData: allStakedPools,
        poolAddress: currentStakePool.address,
        setAllStakedPools,
      }).then((info) => {
        console.log("Updates liquidity position", info);
        setCurrentStakePool(info);
      });
      if (setTxReceipt) setTxReceipt(null);
      setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData));
    }
  }, [txReceipt, setTxReceipt]);
}
