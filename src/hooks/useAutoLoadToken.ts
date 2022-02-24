import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GlobalContext, INITIAL_TOKEN_STATE } from "../context/GlobalState";
import { getToken } from "./useTokenList";

export default function useAutoLoadToken(updateToken: Function) {
  const { web3, chainId, setToken2, token2 } = useContext(GlobalContext);

  const url = useLocation();
  useEffect(() => {
    const queryParams = new URLSearchParams(url.search);
    const pool = queryParams.get("pool");

    if (pool && web3 && chainId) {
      getToken(web3, chainId, pool, "pool").then((info) => {
        console.log(info);
        if (info) {
          const token = { ...INITIAL_TOKEN_STATE, info };
          setToken2(token);
        }
      });
    }
  }, [url, web3, chainId]);
}
