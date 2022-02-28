import { useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalContext, INITIAL_TOKEN_STATE } from "../context/GlobalState";

export default function useWatchLocation() {
  const { setLocation, setToken1, setToken2, token1, token2, tokensCleared, accountId } = useContext(GlobalContext);
  const currentLocation = useLocation();
  const lastLocation = useRef(currentLocation);
  useEffect(() => {
    setLocation(currentLocation.pathname);
    if (
      currentLocation.pathname === "/trade" ||
      (lastLocation.current.pathname === "/trade" && currentLocation.pathname === "/stake")
    ) {
      if (currentLocation.pathname === "/trade") {
        setToken1(INITIAL_TOKEN_STATE);
      }
      setToken2(INITIAL_TOKEN_STATE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation.pathname !== lastLocation.current.pathname) {
      tokensCleared.current = false;
    }

    if (currentLocation.pathname === "/trade") {
      if (!token1.info && !token2.info) {
        tokensCleared.current = true;
        lastLocation.current = currentLocation;
      }
    } else {
      if (!token2.info) {
        tokensCleared.current = true;
        lastLocation.current = currentLocation;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation.pathname, token1.info, token2.info, token1, token2]);

  const initialAccount = useRef(accountId);
  const navigate = useNavigate();
  useEffect(() => {
    if (
      initialAccount.current &&
      accountId !== initialAccount.current &&
      currentLocation.pathname === "/stake/remove"
    ) {
      navigate("/stake/list");
    }
    initialAccount.current = accountId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);
}
