import { ITxHistory } from "./types";
import { Ocean } from "@dataxfi/datax.js";

export function getTxUrl({ ocean, txHash, accountId }: { ocean: Ocean; txHash?: string | null; accountId: string }) {
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

export function setLocalTxHistory({
  txHistory,
  accountId,
  chainId,
}: {
  txHistory: string | ITxHistory;
  accountId: string;
  chainId: string | number;
}) {
  try {
    localStorage.setItem(`txHistory@${chainId}@${accountId.toLowerCase()}`, JSON.stringify(txHistory));
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
  txHistory: ITxHistory;
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

export function getLocalTxHistory({ chainId, accountId }: { chainId: string | number; accountId: string }): ITxHistory {
  try {
    const localTxHistory = localStorage.getItem(`txHistory@${chainId}@${accountId.toLowerCase()}`);
    if (localTxHistory) return JSON.parse(localTxHistory);
  } catch (error) {
    console.error(error);
  }
  return {};
}
