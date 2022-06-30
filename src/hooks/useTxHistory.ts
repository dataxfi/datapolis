import { Config } from '@dataxfi/datax.js';
import { useEffect, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { ITxHistory } from '../@types/types';

export default function useTxHistory() {
  const {
    txHistory,
    pendingTxs,
    accountId,
    chainId,
    watcher,
    setTxHistory,
    lastTx,
    setSnackbarItem,
    setConfirmingTx,
    config
  } = useContext(GlobalContext);

  // initializes transaction history from local storage
  useEffect(() => {
    if (accountId && chainId && watcher) {
      const localHistory: ITxHistory = getLocalTxHistory({ chainId, accountId });
      if (localHistory) {
        for (const [id, tx] of Object.entries(localHistory)) {
          if (tx.status === 'Pending') {
            delete localHistory[id];
          }
        }
        setTxHistory(localHistory);
      }
    }
  }, [chainId, accountId]);

  // manages pending transaction indicator
  useEffect(() => {
    function addHistory() {
      if (accountId && chainId && lastTx) {
        const { txDateId } = lastTx;
        const newTxHistory = { ...txHistory, [txDateId]: lastTx };
        setTxHistory(newTxHistory);
        setLocalTxHistory({ txHistory: newTxHistory, accountId, chainId });
      }
    }

    if (lastTx && chainId && accountId) {
      let newTxs;
      const { txDateId, status } = lastTx;

      switch (status) {
        case 'Pending':
          newTxs = pendingTxs;
          newTxs.push(txDateId);
          setTxHistory({ ...txHistory, [txDateId]: lastTx });
          addHistory();
          break;
        case 'Indexing':
          setSnackbarItem({ type: 'tx', newTx: lastTx });
          newTxs = pendingTxs.filter((item) => item !== txDateId);
          addHistory();
          break;
        case 'Failure': {
          const localTxHistory = getLocalTxHistory({ chainId, accountId });
          const newTxHistory = { ...txHistory, ...localTxHistory };
          delete newTxHistory[txDateId];
          setTxHistory({ ...newTxHistory });
          setLocalTxHistory({ txHistory: newTxHistory, accountId, chainId });
          newTxs = pendingTxs.filter((item) => item !== txDateId);
          setConfirmingTx(false);
          break;
        }
        default:
          newTxs = pendingTxs.filter((item) => item !== txDateId);
          break;
      }

      // setPendingTxs(newTxs);
    }
  }, [lastTx]);
}

export function getTxUrl({ txHash, accountId, config }: {config: Config, txHash?: string | null; accountId: string }) {
  try {
    if (txHash && accountId) {
      return config.default.explorerUri + '/tx/' + txHash;
    } else if (config && accountId) {
      return config.default.explorerUri + '/address/' + accountId;
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
