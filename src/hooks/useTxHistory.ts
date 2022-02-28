import { useEffect, useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import { getLocalTxHistory, setLocalTxHistory } from "../utils/txHistoryUtils";
import { ITxHistory } from "../utils/types";

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
  } = useContext(GlobalContext);

  //initializes transaction history from local storage
  useEffect(() => {
    if (accountId && chainId && watcher) {
      const localHistory: ITxHistory = getLocalTxHistory({ chainId, accountId });
      if (localHistory) {
        for(let [id, tx] of Object.entries(localHistory)){
          if(tx.status ==="Pending"){
            delete localHistory[id] 
          }
        }
        setTxHistory(localHistory);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, accountId]);

  //manages pending transaction indicator
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
      let newTxHistory: ITxHistory;

      switch (status) {
        case "Pending":
          newTxs = pendingTxs;
          newTxs.push(txDateId);
          setTxHistory({ ...txHistory, [txDateId]: lastTx });
          addHistory();
          break;
        case "Indexing":
          const allNotifications = notifications;
          allNotifications.push({ type: "tx", newTx: lastTx });
          setNotifications([...allNotifications]);
          newTxs = pendingTxs.filter((item) => item !== txDateId);
          addHistory();
          break;
        case "Failure":
          let localTxHistory = getLocalTxHistory({ chainId, accountId });
          newTxHistory = { ...txHistory, ...localTxHistory };
          delete newTxHistory[txDateId];
          setTxHistory({ ...newTxHistory });
          setLocalTxHistory({ txHistory: newTxHistory, accountId, chainId });
          newTxs = pendingTxs.filter((item) => item !== txDateId);
          break;
        default:
          newTxs = pendingTxs.filter((item) => item !== txDateId);
          break;
      }

      setPendingTxs(newTxs);
    }
  }, [lastTx]);



}
