import { useContext, useEffect } from "react";
import { GlobalContext, INITIAL_TOKEN_STATE } from "../context/GlobalState";

export default function useTxModalToggler() {
  const { showConfirmModal, setShowConfirmModal, setShowTxDone, lastTx, setToken1, setToken2 } = useContext(GlobalContext);
  useEffect(() => {
    if (lastTx && lastTx.status === "Indexing") {
      if (showConfirmModal) {
        setShowConfirmModal(false);
        setShowTxDone(true);
      }
      setToken1(INITIAL_TOKEN_STATE);
      setToken2(INITIAL_TOKEN_STATE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTx]);
}
