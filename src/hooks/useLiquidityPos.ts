import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isOCEAN } from "../components/Swap";
import { GlobalContext } from "../context/GlobalState";
import { bgLoadingStates, removeBgLoadingState } from "../context/GlobalState";
import { percOf } from "../utils/equate";
import { getLocalPoolData } from "../utils/stakedPoolsUtils";
import { ILiquidityPosition } from "../utils/types";
import { getToken } from "./useTokenList";

export default function useLiquidityPos() {
  const { allStakedPools, setSingleLiquidityPos, chainId, accountId, ocean, setAllStakedPools, token1, token2, web3 } =
    useContext(GlobalContext);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pool = queryParams.get("pool");

    if (
      ocean &&
      accountId &&
      chainId &&
      token1.info &&
      token2.info &&
      (isOCEAN(token1.info.address, ocean) || isOCEAN(token2.info?.address, ocean))
    ) {
      let dtPool: string | null = pool;
      if (dtPool === null)
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
  }, [token1, token2, ocean, allStakedPools]);

  // useEffect(() => {
  //   if (!bgLoading || !setBgLoading || !setSingleLiquidityPos) return;
  //   if (!singleLiquidityPos && poolAddress && !bgLoading?.includes(bgLoadingStates.singlePoolData)) {
  //     setBgLoading([...bgLoading, bgLoadingStates.singlePoolData]);
  //     if (allStakedPools) {
  //       const currentPool = allStakedPools.find((pool: { address: string }) => pool.address === poolAddress);
  //       setSingleLiquidityPos(currentPool);
  //       console.log(currentPool);
  //     }
  //   }
  //   setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData));
  // }, [allStakedPools, poolAddress]);

  // useEffect(() => {
  //   let localStoragePoolData;
  //   if (accountId && chainId) {
  //     localStoragePoolData = getLocalPoolData(accountId, chainId);
  //     if (localStoragePoolData && poolAddress) {
  //       setPoolDataFromLocal({
  //         localStoragePoolData,
  //         poolAddress: poolAddress,
  //         setAllStakedPools,
  //         setSingleLiquidityPos,
  //         setBgLoading,
  //         bgLoading,
  //       });
  //     }
  //     if (poolAddress && ocean) {
  //       setBgLoading([...bgLoading, bgLoadingStates.singlePoolData]);
  //       updateSingleStakePool({
  //         ocean,
  //         accountId,
  //         localData: JSON.parse(localStoragePoolData || ""),
  //         poolAddress: poolAddress || "",
  //         setAllStakedPools,
  //       }).then(() => {
  //         setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData));
  //       });
  //     }
  //   }
  // }, [chainId, accountId, ocean]);

  // useEffect(() => {
  //   if (
  //     accountId &&
  //     chainId &&
  //     setAllStakedPools &&
  //     setBgLoading &&
  //     setSingleLiquidityPos &&
  //     bgLoading &&
  //     allStakedPools &&
  //     singleLiquidityPos
  //   ) {
  //     if (txReceipt && !bgLoading?.includes(bgLoadingStates.singlePoolData) && ocean) {
  //       setBgLoading([...bgLoading, bgLoadingStates.singlePoolData]);
  //       updateSingleStakePool({
  //         ocean,
  //         accountId,
  //         localData: allStakedPools,
  //         poolAddress: singleLiquidityPos.address,
  //         setAllStakedPools,
  //       }).then((info) => {
  //         console.log("Updates liquidity position", info);
  //         setSingleLiquidityPos(info);
  //       });
  //       if (setTxReceipt) setTxReceipt(null);
  //       setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData));
  //     }
  //   }
  // }, [txReceipt, setTxReceipt]);

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
    // if (localData) {
    //   const found = localData.findIndex((pool) => pool.address === poolAddress);
    //   if (found > -1) {
    //     localData.splice(found, 1, updatedPool);
    //   } else {
    //     localData.splice(0, 0, updatedPool);
    //   }
    //   setLocalPoolDataStorage(localData, chainId);
    // } else {
    //   const allStakedPools: ILiquidityPosition[] = [updatedPool];
    //   setLocalPoolDataStorage(allStakedPools, ocean.networkId);
    // }
  }
}
