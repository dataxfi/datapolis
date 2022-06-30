import React, { SetStateAction, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { IPoolMetaData, ITxDetails, ITxType } from '../@types/types';
import BigNumber from 'bignumber.js';

export default function useTxHandler(
  txFunction: Function,
  executeTx: boolean,
  setExecuteTx: React.Dispatch<SetStateAction<boolean>>,
  txDetails: {
    afterSlippage: BigNumber;
    slippage?: BigNumber;
    postExchange?: BigNumber;
    shares?: BigNumber;
    pool?: IPoolMetaData;
    dataxFee?: string;
    swapFee?: string;
    tokenToUnlock? :string
  },
  allowanceOverride?: BigNumber,
  txAmountOverride?: BigNumber
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
    showUnlockTokenModal,
  } = useContext(GlobalContext);

  useEffect(() => {
    const allowanceNeeded = allowanceOverride ? allowanceOverride : tokenIn.allowance;
    const txAmount = txAmountOverride ? txAmountOverride : tokenIn.value;
    if (showUnlockTokenModal && allowanceNeeded?.lt(txAmount)) {
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

    const allowanceNeeded = allowanceOverride ? allowanceOverride : tokenIn.allowance;
    const txAmount = txAmountOverride ? txAmountOverride : tokenIn.value;

    if (accountId && executeTx) {
      if (allowanceNeeded?.lt(txAmount)) {
        console.log('Token approval needed');
        setPreTxDetails({
          accountId,
          status: 'Pending',
          tokenIn,
          tokenOut,
          afterSlippage: tokenIn.value,
          txDateId: Date.now().toString(),
          txType: 'approve',
          shares: txAmountOverride,
          tokenToUnlock: txDetails.tokenToUnlock 
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
          case '/stake/remove':
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
        console.log('Executing TX');

        setLastTx(preTxDetails);
        txFunction(preTxDetails);
      }
    }
  }, [executeTx, txApproved]);
}
