import { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import { TokenList } from "@dataxfi/datax.js";
export const useTokenList = async (chainId: number): Promise<any> => {
  const { web3, setTokenResponse, accountId, chainId: globalChainId } =
    useContext(GlobalContext);

  useEffect(() => {
    if (accountId) {
      const tokenList = new TokenList(
        web3,
        "4",
        process.env.REACT_APP_PINATA_KEY || "",
        process.env.REACT_APP_PINATA_KEY || ""
      );

      const {
        REACT_APP_CLIENT_EMAIL = "",
        REACT_APP_PRIVATE_KEY = "",
        REACT_APP_TOKEN_URI = "",
        REACT_APP_SCOPE = "",
        REACT_APP_PRIVATE_KEY_ID = "",
      } = process.env;

      tokenList
        .fetchPreparedTokenList(
          chainId ? chainId : 4,
          REACT_APP_CLIENT_EMAIL,
          REACT_APP_PRIVATE_KEY,
          REACT_APP_TOKEN_URI,
          REACT_APP_SCOPE,
          REACT_APP_PRIVATE_KEY_ID
        )
        .then((res) => {
          console.log(res)
          setTokenResponse(res);
        }).catch((err)=>{
          console.error(err)
          setTokenResponse(err)
        })
    }
  }, [globalChainId]);
};
