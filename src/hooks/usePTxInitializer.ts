import { useEffect, useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import {
  getLocalTxHistory,
  setPendingTxsFromHistory,
} from "../utils/txHistoryUtils";

export default function usePTxInitializer() {
  const {
    accountId,
    chainId,
    setTxHistory,
    pendingTxs,
    setPendingTxs,
    watcher,
  } = useContext(GlobalContext);

  useEffect(() => {
    if (accountId && chainId && watcher && setTxHistory && setPendingTxs) {
      const localHistory = getLocalTxHistory({ chainId, accountId });
      if (localHistory) {
        setTxHistory(localHistory);
        setPendingTxsFromHistory({
          txHistory: localHistory,
          pendingTxs,
          setPendingTxs,
          watcher,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, accountId]);
}
