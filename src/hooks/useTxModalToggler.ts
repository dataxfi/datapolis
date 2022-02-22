import { useContext, useEffect } from "react";
import { INITIAL_TOKEN_STATE } from "../components/Swap";
import { GlobalContext } from "../context/GlobalState";

export default function useTxModalToggler(
  txReceipt: any,
  setTxReceipt: Function,
  t1State?: Function,
  t2State?: Function
) {
  const { showConfirmModal, setShowConfirmModal, setShowTxDone } = useContext(GlobalContext);
  useEffect(() => {
    if (txReceipt) {
      if (showConfirmModal && setShowConfirmModal && setShowTxDone) {
        setShowConfirmModal(false);
        setShowTxDone(true);
      }
      if (t1State) t1State(INITIAL_TOKEN_STATE);
      if (t2State) t2State(INITIAL_TOKEN_STATE);
      setTxReceipt(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txReceipt]);
}
