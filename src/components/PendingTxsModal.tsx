import { useContext, useEffect, useState } from "react";
import { BsBoxArrowUpRight, BsX } from "react-icons/bs";
import { PulseLoader } from "react-spinners";
import { GlobalContext } from "../context/GlobalState";
import {
  TxObject,
  getLocalTxHistory,
  TxHistory,
  getTxUrl,
} from "../utils/useTxHistory";

function PendingTxsModal() {
  const {
    pendingTxs,
    txHistory,
    setTxHistory,
    showPendingTxsModal,
    setShowPendingTxsModal,
    chainId,
    accountId,
    ocean,
  } = useContext(GlobalContext);

  interface TxSelection extends TxObject {
    txDateId: string | number;
    txLink: string;
  }

  const [page, setPage] = useState([0, 5]);
  const [txSelection, setTxSelection] = useState<TxSelection[]>();
  const [txsByDate, setTxsByDate] = useState<TxSelection[]>([])

  useEffect(() => {
    function parseHistory(history: TxHistory) {
      const txsByDate = [];
      for (let [txDateId, tx] of Object.entries(history)) {
        let txLink = getTxUrl({
          ocean,
          txHash: tx.txHash,
          accountId,
        });
        if (!txLink) txLink = "/";
        txsByDate.push({ txDateId, ...tx, txLink });
      }
      //@ts-ignore
      txsByDate.sort(
        (date1, date2) => Number(date2.txDateId) - Number(date1.txDateId)
      );
      console.log(txsByDate);
      return txsByDate;
    }

    if (txHistory) {
      const parsedHistory = parseHistory(txHistory);
      setTxsByDate(parsedHistory)
      const selection = parsedHistory.slice(page[0], page[1]);
      setTxSelection(selection);
    } else {
      setTxHistory(getLocalTxHistory({ chainId, accountId }));
    }
  }, [txHistory, pendingTxs, chainId, accountId, page]);


  function lastPage(){
      if(page[0] === 0) return 
      setPage([page[0] - 5, page[1] - 5])
  }

  function nextPage(){
      if(page[1] >= txsByDate.length) return
      setPage([page[0] + 5, page[1] + 5])

  }

  return showPendingTxsModal && txSelection ? (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:max-w-sm w-full z-20 shadow">
      <div className="bg-primary-900 border rounded-lg p-4 hm-box mx-3">
        <div className="flex justify-between mb-2">
          <h3>Recent Transactions</h3>
          <BsX
            onClick={() => setShowPendingTxsModal(false)}
            size={28}
            className="text-type-200"
            role="button"
          />
        </div>
        <ul>
          {txSelection.map((tx) => (
            <li className="flex flex-col mb-2 justify-center bg-gray-800 rounded-lg p-2 hover:bg-gray-900 border border-transparent hover:border-gray-600">
              <div className="flex flex-row w-full justify-between">
                <div className="flex">
                  <h4>{tx.txType}: </h4>
                  <p
                    className={`ml-1 ${
                      tx.status === "success"
                        ? "text-green-400"
                        : "text-primary-400"
                    } `}
                  >
                    {tx.status}
                  </p>
                  <div className="pt-.5">
                    <PulseLoader size="3px" color="white" />
                  </div>
                </div>
                <a
                  href={tx.txLink}
                  target="_blank"
                  className={tx.txLink.includes("/tx/") ? "text-green-400" : ""}
                >
                  <BsBoxArrowUpRight />
                </a>
              </div>
              <div className="flex flex-row">
                <p className="text-xs text-primary-400">
                  {new Date(Number(tx.txDateId)).toDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>{" "}
        <div className="flex justify-between">
          <button className="text-lg" onClick={lastPage}>
            {"<"}
          </button>
          <p>
            {page[0] + 1} - {page[1]}
          </p>
          <button className="text-lg" onClick={nextPage}>
            {">"}
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default PendingTxsModal;
