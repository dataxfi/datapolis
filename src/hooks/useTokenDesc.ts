import axios from "axios";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";

export default function useTokenDesc() {
  const { token2, setShowDescModal, setT2DIDResponse, location } = useContext(GlobalContext);

  useEffect(() => {
    const isStakeORTrade = location === "/stake" || location === "/trade";
    if (token2.info && isStakeORTrade)
      axios
        .get(
          `https://aquarius.oceanprotocol.com/api/v1/aquarius/assets/ddo/did:op:${token2.info?.address.substring(2)}`
        )
        .then(setT2DIDResponse)
        .then(() => {
          setShowDescModal(true);
        })
        .catch((error) => {
          setShowDescModal(false);
        });
  }, [token2.info?.address, location]);
}
