import { TokenInfo } from "./useTokenList";
import { TransactionReceipt } from 'web3-core'

export interface TxTokenDetails {
  balance: string;
  info: TokenInfo;
  percentage: string;
  value: string;
}

export interface TxObject {
  accountId: string;
  token1: TxTokenDetails | TokenInfo;
  token2: TxTokenDetails | TokenInfo;
  txHash: string | null;
  status: string;
  txType: string;
  slippage?: string;
  stakeAmt?:string
  txReceipt?: TransactionReceipt
}

export interface TxHistory {
  [txDateId: string]: TxObject;
}

export function addTxHistory({
  chainId,
  setTxHistory,
  txHistory,
  accountId,
  token1,
  token2,
  txType,
  txHash,
  status,
  slippage,
  txDateId,
  stakeAmt,
  pendingTxs,
  setPendingTxs,
  setShowSnackbar,
  setLastTxId,
  txReceipt
}: {
  chainId: string | number;
  setTxHistory: Function;
  txHistory: TxHistory;
  accountId: string;
  token1?: any;
  token2?: any;
  txType?: string;
  txHash?: string | null;
  status?: string;
  slippage?: string;
  txDateId?: number | string;
  pendingTxs: [];
  txReceipt?: TransactionReceipt
  setPendingTxs: Function;
  setShowSnackbar: Function;
  setLastTxId: Function;
  stakeAmt?:string
}) {
  try {
    let localTxHistory = getLocalTxHistory({ chainId, accountId });

    if (!txDateId) {
      txDateId = String(Date.now());
      setLastTxId(txDateId);
    }
    if (!txHash) txHash = null;

    switch (status) {
      case "successful":
      case "success":
      case "pending":
        break;
      case "indexing":
        const newPendingTxs = pendingTxs.map((tx) => tx !== txDateId);
        setPendingTxs(newPendingTxs);
        setShowSnackbar(true);
        break;
      default:
        status = "pending approval";
        setPendingTxs([...pendingTxs, txDateId]);
        break;
    }

    let existingTx = localTxHistory[txDateId];
    let newTx = {
      ...existingTx,
      accountId,
      token1,
      token2,
      txType,
      txHash,
      status,
      slippage,
      stakeAmt,
      txReceipt
    };

    const newTxHistory: TxHistory = {
      ...localTxHistory,
      ...txHistory,
      [txDateId]: newTx,
    };

    setTxHistory(newTxHistory);
    setLocalTxHistory({ txHistory: newTxHistory, accountId, chainId });
    return txDateId;
  } catch (error) {
    console.error(error);
  }
}

export function getTxUrl({
  ocean,
  txHash, 
  accountId
}: {

  ocean: any;
  txHash?: string | null
  accountId: string
}) {
  try {
    if (txHash) {
      return ocean.config.default.explorerUri + "/tx/" + txHash;
    } else {
      throw new Error("Couldn't generate transaction URL");
    }
  } catch (error) {
    console.error(error);
    if (ocean) return ocean.config.default.explorerUri + "/address/" + accountId
  }
}

export function deleteRecentTxs({
  txDateId,
  setTxHistory,
  txHistory,
  accountId,
  chainId,
}: {
  txDateId?: string | number | null;
  setTxHistory: Function;
  txHistory: TxHistory;
  accountId: string;
  chainId: string | number;
}) {
  try {
    if (txDateId) {
      let localTxHistory = getLocalTxHistory({ chainId, accountId });
      txDateId = String(txDateId);
      const newTxHistory = { ...txHistory, ...localTxHistory };
      delete newTxHistory[txDateId];
      setTxHistory({ ...newTxHistory });
      setLocalTxHistory({ txHistory: newTxHistory, accountId, chainId });
    }
  } catch (error) {
    console.error(error);
  }
}

export function setLocalTxHistory({
  txHistory,
  accountId,
  chainId,
}: {
  txHistory: string | TxHistory;
  accountId: string;
  chainId: string | number;
}) {
  try {
    localStorage.setItem(
      `txHistory@${chainId}@${accountId.toLowerCase()}`,
      JSON.stringify(txHistory)
    );
  } catch (error) {
    console.error(error);
  }
}

export function getTxById({
  txDateId,
  txHistory,
  chainId,
  accountId,
}: {
  txDateId: string | number;
  txHistory: TxHistory;
  chainId: string;
  accountId: string;
}) {
  try {
    let found;
    if (!txHistory) txHistory = getLocalTxHistory({ chainId, accountId });
    if (txHistory) found = txHistory[txDateId];
    if (found) {
      return found;
    } else {
      throw new Error("Couldn't find transaction.");
    }
  } catch (error) {
    console.error(error);
  }
}

export function getLocalTxHistory({
  chainId,
  accountId,
}: {
  chainId: string | number;
  accountId: string;
}) {
  try {
    const localTxHistory = localStorage.getItem(
      `txHistory@${chainId}@${accountId.toLowerCase()}`
    );
    if (localTxHistory) return JSON.parse(localTxHistory);
    return {};
  } catch (error) {
    console.error(error);
  }
}

