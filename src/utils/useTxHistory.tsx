export interface TxObject {
  accountId: string;
  token1: string;
  token2: string;
  txHash: string | null;
  status: string;
  txType: string;
  slippage: string;
}

export interface TxHistory {
  [txDateId: string]: TxObject;
}

export function setTxHistory({
  chainId,
  setRecentTxs,
  recentTxs,
  accountId,
  token1,
  token2,
  txType,
  txHash,
  status,
  slippage,
  txDateId,
}: {
  chainId: string | number;
  setRecentTxs: Function;
  recentTxs: TxHistory;
  accountId: string;
  token1?: any;
  token2?: any;
  txType?: string;
  txHash?: string | null;
  status?: string;
  slippage?: string;
  txDateId?: number | string;
}) {
  try {
    let localTxHistory = getLocalTxHistory({ chainId, accountId });

    if (!txDateId) txDateId = String(Date.now());
    if (!txHash) txHash = null;
    if (!status) status = "pending approval";

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
      };

    console.log(newTx);
    const newTxHistory: TxHistory = {
      ...localTxHistory,
      ...recentTxs,
      [txDateId]: newTx,
    };

    setRecentTxs(newTxHistory);
    setLocalTxHistory({ recentTxs: newTxHistory, accountId, chainId });
    return txDateId;
  } catch (error) {
    console.error(error);
  }
}

export function deleteRecentTxs({
  txDateId,
  setRecentTxs,
  recentTxs,
  accountId,
  chainId,
}: {
  txDateId?: string | number | null;
  setRecentTxs: Function;
  recentTxs: TxHistory;
  accountId: string;
  chainId: string | number;
}) {
  try {
    if (txDateId) {
      let localTxHistory = getLocalTxHistory({ chainId, accountId });
      txDateId = String(txDateId);
      const newTxHistory = { ...recentTxs, ...localTxHistory };
      delete newTxHistory[txDateId];
      setRecentTxs({ ...newTxHistory });
      setLocalTxHistory({ recentTxs: newTxHistory, accountId, chainId });
    }
  } catch (error) {
    console.error(error);
  }
}

export function setLocalTxHistory({
  recentTxs,
  accountId,
  chainId,
}: {
  recentTxs: string | TxHistory;
  accountId: string;
  chainId: string | number;
}) {
  try {
    localStorage.setItem(
      `txHistory@${chainId}@${accountId}`,
      JSON.stringify(recentTxs)
    );
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
      `txHistory@${chainId}@${accountId}`
    );
    if (localTxHistory) return JSON.parse(localTxHistory);
    return {};
  } catch (error) {
    console.error(error);
  }
}
