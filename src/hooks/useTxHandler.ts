import React, { SetStateAction, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { ITxDetails, ITxType } from '../utils/types';
import BigNumber from 'bignumber.js';

export default function useTxHandler(
  txFunction: Function,
  executeTx: boolean,
  setExecuteTx: React.Dispatch<SetStateAction<boolean>>,
  txDetails: { slippage?: BigNumber; postExchange?: BigNumber; shares?: BigNumber }
) {
  const {
    accountId,
    handleConnect,
    setPreTxDetails,
    tokenIn,
    tokenOut,
    setExecuteUnlock,
    setShowConfirmTxDetails,
    setShowUnlockTokenModal,
    txApproved,
    setBlurBG,
    setLastTx,
    preTxDetails,
    location,
    showUnlockTokenModal
  } = useContext(GlobalContext);

  useEffect(() => {
    if (showUnlockTokenModal && tokenIn.allowance?.gt(tokenIn.value)) {
      setBlurBG(false);
      setShowUnlockTokenModal(false);
      txFunction(true);
    }
  }, [tokenIn.allowance]);

  useEffect(() => {
    if (!accountId && executeTx) {
      handleConnect();
      setExecuteTx(false);
      return;
    }

    if (accountId) {
      if (tokenIn.allowance?.lt(tokenIn.value)) {
        setPreTxDetails({
          accountId,
          status: 'Pending',
          tokenIn,
          tokenOut,
          txDateId: Date.now().toString(),
          txType: 'approve',
        });
        setExecuteUnlock(true);
        setShowUnlockTokenModal(true);
        setBlurBG(true);
        setExecuteTx(false);
      } else if (!txApproved && executeTx) {
        let txType: ITxType;
        switch (location) {
          case '/stake':
            txType = 'stake';
            break;
          case '/unstake':
            txType = 'unstake';
            break;
          default:
            txType = 'swap';
            break;
        }

        const preTxDetails: ITxDetails = {
          accountId,
          status: 'Pending',
          tokenIn,
          tokenOut,
          txDateId: Date.now().toString(),
          txType,
          ...txDetails,
        };
        setPreTxDetails(preTxDetails);
        setShowConfirmTxDetails(true);
        setBlurBG(true);
      } else if (executeTx && preTxDetails) {
        setLastTx(preTxDetails);
        txFunction(preTxDetails);
      }
    }
  }, [executeTx, txApproved]);
}
