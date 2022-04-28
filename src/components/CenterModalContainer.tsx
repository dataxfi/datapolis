import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import ConfirmModal from "./ConfirmModal";
import ConfirmTxDetailsModal from "./ConfirmTxDetailsModal";
import DisclaimerModal from "./DisclaimerModal";
import TokenModal from "./TokenModal";
import TransactionDoneModal from "./TransactionDoneModal";
import TxHistoryModal from "./TxHistoryModal";
import UnlockTokenModal from "./UnlockTokenModal";

export default function CenterModalContainer() {
  const { showTokenModal, showTxDone, showConfirmModal, showTxHistoryModal, showConfirmTxDetails, showDisclaimer, showUnlockTokenModal } = useContext(GlobalContext);
  const [show, setShow] = useState(false);

  useEffect(() => {
    showTokenModal || showTxDone || showConfirmModal || showTxHistoryModal || showConfirmTxDetails || showDisclaimer || showUnlockTokenModal ? setShow(true) : setShow(false);
  }, [showTokenModal, showTxDone, showConfirmModal, showTxHistoryModal, showConfirmTxDetails, showDisclaimer, showUnlockTokenModal]);

  return (
    <div className={`w-full h-full absolute z-20 ${show ? "block" : "hidden"}`}>
      <div className="w-full h-full relative">
        <UnlockTokenModal />
        <DisclaimerModal />
        <TxHistoryModal />
        <TokenModal />
        <ConfirmModal />
        <TransactionDoneModal />
        <ConfirmTxDetailsModal />
      </div>
    </div>
  );
}
