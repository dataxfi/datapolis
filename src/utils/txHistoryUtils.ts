import { TokenInfo } from "./tokenListUtils";
import { TransactionReceipt } from "web3-core";
import Web3 from "web3";
import Watcher from "@dataxfi/datax.js/dist/Watcher";

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
  stakeAmt?: string;
  txReceipt?: TransactionReceipt;
}

export interface TxHistory {
  [txDateId: string]: TxObject;
}

export interface TxSelection extends TxObject {
  txDateId: string | number;
  txLink: string;
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
  txReceipt,
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
  txReceipt?: TransactionReceipt;
  stakeAmt?: string | number;
}) {
  try {
    let localTxHistory = getLocalTxHistory({ chainId, accountId });

    if (!txDateId) {
      txDateId = String(Date.now());
    }
    if (!txHash) txHash = null;

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
      txReceipt,
    };

    const newTxHistory: TxHistory = {
      ...localTxHistory,
      ...txHistory,
      [txDateId]: newTx,
    };

    setTxHistory(newTxHistory);
    setLocalTxHistory({ txHistory: newTxHistory, accountId, chainId });

    switch (status) {
      case "Success":
        break;
      case "indexing":
        break;
      default:
        status = "pending";
        break;
    }
    return txDateId;
  } catch (error) {
    console.error(error);
  }
}

export function conformTx(tx: any) {
  switch (tx.txType) {
    case "unstake":
    case "stake":
      return {
        token1: tx.token1,
        token2: tx.token2,
      };
    default:
      return {
        token1: {
          ...tx.token1.info,
          value: tx.token1.value,
        },
        token2: {
          ...tx.token2.info,
          value: tx.token2.value,
        },
      };
  }
}

export function getTxUrl({
  ocean,
  txHash,
  accountId,
}: {
  ocean: any;
  txHash?: string | null;
  accountId: string;
}) {
  try {
    if (txHash && ocean && accountId) {
      return ocean.config.default.explorerUri + "/tx/" + txHash;
    } else if (ocean && accountId) {
      return ocean.config.default.explorerUri + "/address/" + accountId;
    } else {
      throw new Error("Couldn't generate transaction URL");
    }
  } catch (error) {
    console.error(error);
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
  if (!accountId) return;
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

export async function watchTx({
  tx,
  watcher,
  web3,
  chainId,
  setTxHistory,
  txHistory,
}: {
  tx: TxSelection;
  watcher: Watcher;
  web3: Web3;
  chainId: string | number;
  setTxHistory: Function;
  txHistory: TxHistory;
}) {
  const {
    accountId,
    token1,
    token2,
    txHash,
    status,
    txType,
    slippage,
    stakeAmt,
    txReceipt,
    txDateId,
  } = tx;

  const response = txHash
    ? await watcher.waitTransaction(web3, txHash, {
        interval: 250,
        blocksToWait: 1,
      })
    : null;

  if (status !== "Success" && response && response.status === true) {
    addTxHistory({
      chainId,
      setTxHistory,
      txHistory,
      accountId,
      token1,
      token2,
      txType,
      txHash,
      status: "Success",
      slippage,
      txDateId,
      stakeAmt,
      txReceipt,
    });
  } else if (response && response.status === false) {
    addTxHistory({
      chainId,
      setTxHistory,
      txHistory,
      accountId,
      token1,
      token2,
      txType,
      txHash,
      status: "Failure",
      slippage,
      txDateId,
      stakeAmt,
      txReceipt,
    });
  }

  return response;
}

export function setPendingTxsFromHistory({txHistory, pendingTxs, setPendingTxs}:{txHistory:any, pendingTxs:any, setPendingTxs:Function}) {
  const allPending = pendingTxs;
  const olderThanAnHour = Date.now() - 3600000;
      for (let [id, tx] of Object.entries(txHistory)) {
        if (
          Number(id) > olderThanAnHour &&
          //@ts-ignore
          tx.status === "pending" &&
          !pendingTxs.includes(id)
        ) {
          //if the tx is within the last hour and pending, set pendingTxs with tx
          allPending.push(id);
          setPendingTxs(allPending);
        }
      }
}