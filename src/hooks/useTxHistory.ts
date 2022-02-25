import { useEffect, useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import { getLocalTxHistory, setPendingTxsFromHistory } from "../utils/txHistoryUtils";

export default function useTxHistory() {
  const {
    txHistory,
    pendingTxs,
    setPendingTxs,
    notifications,
    setNotifications,
    accountId,
    chainId,
    watcher,
    setTxHistory,
    lastTx,
    setLastTx,
  } = useContext(GlobalContext);

  //initializes transaction history from local storage
  useEffect(() => {
    if (accountId && chainId && watcher) {
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

  //manages pending transaction indicator
  useEffect(() => {
    console.log("Last tx", lastTx);
    
    if (lastTx) {
      let newTxs;
      const { txDateId, status } = lastTx;
      console.log("Status", status);
      
      if (status === "Pending") {
        newTxs = pendingTxs;
        newTxs.push(txDateId);
        setTxHistory({...txHistory, txDateId: lastTx})
      } else {
        newTxs = pendingTxs.filter((item) => item !== txDateId);
        console.log("Filtering", newTxs);
        
      }
      setPendingTxs(newTxs);
    }
  }, [lastTx]);


}
