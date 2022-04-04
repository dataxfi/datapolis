import { useContext, useEffect, useState } from "react";
import { BsBoxArrowUpRight, BsX } from "react-icons/bs";
import { PulseLoader } from "react-spinners";
import { GlobalContext } from "../context/GlobalState";
import {
  TxSelection,
  getLocalTxHistory,
  TxHistory,
  getTxUrl,
  watchTx,
  conformTx,
} from "../utils/txHistoryUtils";

function TxHistoryModal() {
  const {
    pendingTxs,
    txHistory,
    setTxHistory,
    showTxHistoryModal,
    setShowTxHistoryModal,
    chainId,
    accountId,
    ocean,
    watcher,
    web3,
    setShowConfirmModal,
    setShowTxDone,
    showTxDone,
    showConfirmModal,
  } = useContext(GlobalContext);

  const [page, setPage] = useState([0, 5]);
  const [txSelection, setTxSelection] = useState<TxSelection[]>([]);
  const [txsByDate, setTxsByDate] = useState<TxSelection[]>([]);
  const [noTxHistory, setNoTxHistory] = useState<boolean>(false);

  useEffect(() => {
    if (showTxHistoryModal) {
      if (showConfirmModal) setShowConfirmModal(false);
      if (showTxDone) setShowTxDone(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirmModal, showTxDone, showTxHistoryModal]);

  useEffect(() => {
    if (ocean && watcher && txSelection && web3 && accountId) {
      // watchTx(txSelection[0])
      txSelection.forEach((tx) => {
        if (tx.status !== "Success")
          watchTx({
            tx,
            watcher,
            web3,
            chainId,
            setTxHistory,
            txHistory,
          });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txSelection, watcher, web3, accountId]);

  useEffect(() => {
    try {
      if (accountId && txHistory && Object.keys(txHistory).length !== 0) {
        const parsedHistory = parseHistory(txHistory);
        if (!parsedHistory) return;
        setTxsByDate(parsedHistory);
        const selection = parsedHistory.slice(page[0], page[1]);
        setTxSelection(selection);
        setNoTxHistory(false);
      } else {
        const localHistory = getLocalTxHistory({ chainId, accountId });
        if (
          accountId &&
          localHistory &&
          Object.keys(localHistory).length !== 0
        ) {
          setTxHistory(localHistory);
          const parsedHistory = parseHistory(txHistory);
          if (!parsedHistory) return;
          setTxsByDate(parsedHistory);
          const selection = parsedHistory.slice(page[0], page[1]);
          setTxSelection(selection);
          setNoTxHistory(false);
        } else {
          setNoTxHistory(true);
        }
      }
    } catch (error) {
      console.error(error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHistory, pendingTxs, chainId, accountId, page, ocean]);

  function parseHistory(history: TxHistory) {
    if (!history) return;
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
    return txsByDate;
  }

  function lastPage() {
    if (page[0] === 0) return;
    setPage([page[0] - 5, page[1] - 5]);
  }

  function nextPage() {
    if (page[1] >= txsByDate.length) return;
    setPage([page[0] + 5, page[1] + 5]);
  }

  function pageRange() {
    if (page[1] > txSelection.length)
      return `${page[0] + 1} - ${txSelection.length + page[0]}`;
    return `${page[0] + 1} - ${page[1]}`;
  }

  function exactTime(tx: any) {
    const stamp = new Date(Number(tx.txDateId));
    const hours24 = stamp.getHours();
    const amPm = hours24 > 12 ? "Pm" : "Am";
    const hours12 = hours24 > 12 ? hours24 - 12 : hours24;
    let minutes: string | number = stamp.getMinutes();
    if(Number(minutes) < 10){
      minutes = `0${minutes}`
    }
    return `${hours12}:${minutes} ${amPm}`;
  }

  function txItemTitle(tx: any) {
    const { txType } = tx;
    const { token1, token2 } = conformTx(tx);
    
    switch (txType) {
      case "stake":
        return `Stake ${token1.symbol}/OCEAN`;
      case "unstake":
        return `Unstake ${token1.symbol}/OCEAN`;
      default:
        return `${token1.symbol} to ${token2.symbol}`;
    }
  }

  if (!showTxHistoryModal) return null;
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:max-w-md w-full z-20 shadow">
      <div className="bg-black bg-opacity-95 border rounded-lg p-4 hm-box mx-3">
        <div className="flex justify-between mb-2">
          <h3>Recent Transactions</h3>
          <BsX
            onClick={() => setShowTxHistoryModal(false)}
            size={28}
            className="text-type-200"
            role="button"
          />
        </div>
        {noTxHistory ? (
          <div className="px-5 pb-10 pt-5 w-full text-center text-gray-400">
            There is no transaction history for your account on this chain.
            {/* <button>Fetch From Chain</button> */}
          </div>
        ) : (
          <>
            <ul>
              {txSelection.map((tx, index) => (
                <li
                  key={`tx${index}`}
                  className="flex flex-col mb-2 justify-center bg-gray-800 rounded-lg p-2 hover:bg-gray-900 border border-transparent hover:border-gray-600"
                >
                  <div className="flex flex-row w-full justify-between">
                    <div className="flex">
                      <h4>{txItemTitle(tx)}: </h4>
                      <p
                        className={`ml-1 ${
                          tx.status === "Success"
                            ? "text-city-blue"
                            : tx.status === "Failure"
                            ? "text-red-600"
                            : "text-primary-400"
                        } `}
                      >
                        {tx.status}
                      </p>
                      {tx.status === "Success" ||
                      tx.status === "Failure" ? null : (
                        <div className="pt-.5">
                          <PulseLoader size="3px" color="white" />
                        </div>
                      )}
                    </div>
                    <a
                      href={tx.txLink}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        tx.txLink.includes("/tx/") ? "text-city-blue" : ""
                      }
                    >
                      <BsBoxArrowUpRight />
                    </a>
                  </div>
                  <div className="flex flex-row">
                    <p className="text-xs text-primary-400 pr-1">
                      {new Date(Number(tx.txDateId)).toDateString()} at
                    </p>
                    <p className="text-xs text-primary-400">{exactTime(tx)}</p>
                  </div>
                </li>
              ))}
            </ul>{" "}
            <div className="flex justify-between">
              <button className="text-lg" onClick={lastPage}>
                {"<"}
              </button>
              <p>{pageRange()}</p>
              <button className="text-lg" onClick={nextPage}>
                {">"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TxHistoryModal;
