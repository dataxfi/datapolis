 import { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
 
export default function useTxModalToggler (txReceipt:any) {
    const {showConfirmModal, setShowConfirmModal, setShowTxDone} = useContext(GlobalContext)
    useEffect(() => {
    if (txReceipt) {
      if (showConfirmModal) {
        setShowConfirmModal(false);
        setShowTxDone(true);
      }
    }
  }, [txReceipt]);
}
