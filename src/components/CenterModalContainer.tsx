import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import ConfirmTxDetailsModal from './ConfirmTxDetailsModal';
import DisclaimerModal from './DisclaimerModal';
import TokenModal from './TokenModal';
import TxDoneModal from './TxDoneModal';
import TxHistoryModal from './TxHistoryModal';
import UnlockTokenModal from './UnlockTokenModal';

export default function CenterModalContainer() {
  const {
    showTokenModal,
    showTxDone,
    confirmingTx,
    showTxHistoryModal,
    showConfirmTxDetails,
    showDisclaimer,
    showUnlockTokenModal,
  } = useContext(GlobalContext);
  const [show, setShow] = useState(false);

  useEffect(() => {
    showTokenModal ||
    showTxDone ||
    confirmingTx ||
    showTxHistoryModal ||
    showConfirmTxDetails ||
    showDisclaimer ||
    showUnlockTokenModal ? setShow(true) : setShow(false);
  }, [
    showTokenModal,
    showTxDone,
    confirmingTx,
    showTxHistoryModal,
    showConfirmTxDetails,
    showDisclaimer,
    showUnlockTokenModal,
  ]);

  return (
    <div className={`w-full h-full absolute z-20 top-0 left-0 right-0 bottom-0 ${show ? 'block' : 'hidden'}`}>
      <div className="w-full h-full relative">
        <UnlockTokenModal />
        <DisclaimerModal />
        <TxHistoryModal />
        <TokenModal />
        <TxDoneModal />
        <ConfirmTxDetailsModal />
      </div>
    </div>
  );
}
