import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GlobalContext, INITIAL_TOKEN_STATE } from "../context/GlobalState";
import { getToken } from "./useTokenList";
import BigNumber from "bignumber.js";
export default function useAutoLoadToken() {
  const { web3, chainId, setToken2, token1, setToken1, ocean, accountId } = useContext(GlobalContext);

  const url = useLocation();
  useEffect(() => {
    const queryParams = new URLSearchParams(url.search);
    const pool = queryParams.get("pool");

    if (token1.info?.symbol !== "OCEAN" && accountId && ocean && web3 && chainId) {
      getToken(web3, chainId, ocean.config.default.oceanTokenAddress, "reserve").then(async (res) => {
        const balance = new BigNumber(
          await ocean.getBalance(ocean.config.default.oceanTokenAddress.toLowerCase(), accountId)
        );

        if (res)
          setToken1({
            ...INITIAL_TOKEN_STATE,
            info: res,
            balance,
          });
      });
    }

    if (pool && web3 && chainId && ocean && accountId) {
      getToken(web3, chainId, pool, "pool").then((info) => {
        console.log(info);
        if (info) {
          const token = { ...INITIAL_TOKEN_STATE, info };
          setToken2(token);
        }
      });

      console.log(token1.info?.symbol !== "OCEAN");
    }
  }, [url, web3, chainId, ocean, accountId]);
}
