import { IToken } from "@dataxfi/datax.js";
import axios from "axios";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";

export default function useTokenDesc() {
  const { token2, setT2DIDResponse, location } = useContext(GlobalContext);

  useEffect(() => {
    if (token2.info?.address) {
      getDID(setT2DIDResponse, token2);
    } else {
      setT2DIDResponse(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token2.info?.address, location]);
}

export async function getDID(
  setT2DIDResponse: React.Dispatch<any>,
  token2: IToken
) {
  axios
    .get(`https://aquarius.oceanprotocol.com/api/v1/aquarius/assets/ddo/did:op:${token2.info?.address.substring(2)}`)
    .then(setT2DIDResponse)
   
}
