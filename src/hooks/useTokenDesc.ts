import { IToken } from "@dataxfi/datax.js";
import axios from "axios";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";

export default function useTokenDesc() {
  const { token2, setShowDescModal, setT2DIDResponse, location } = useContext(GlobalContext);

  useEffect(() => {
    // const isStakeORTrade = location === "/stake" || location === "/trade";
    if (token2.info?.address)
    getDID(setT2DIDResponse, setShowDescModal, token2)
     
  }, [token2.info?.address, location]);
}


export async function getDID(setT2DIDResponse:React.Dispatch<any>, setShowDescModal:React.Dispatch<any>, token2: IToken){
  axios
  .get(
    `https://aquarius.oceanprotocol.com/api/v1/aquarius/assets/ddo/did:op:${token2.info?.address.substring(2)}`
  )
  .then(setT2DIDResponse)
  .then(() => {
    setShowDescModal(true);
  })
  .catch(() => {
    setShowDescModal(false);
  });
}