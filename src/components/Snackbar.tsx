import { useContext, useEffect, useState } from "react";
import { BsCheckCircle, BsX } from "react-icons/bs";
import { GlobalContext } from "../context/GlobalState";
import { toFixed5 } from "../utils/equate";
import { getTxById, TxObject, getTxUrl } from "../utils/useTxHistory";

const Snackbar = () => {
  const {
    accountId,
    chainId,
    txHistory,
    showSnackbar,
    setShowSnackbar,
    lastTxId,
    ocean,
    showConfirmModal,
    showTxDone,
  } = useContext(GlobalContext);
  const [lastTx, setLastTx] = useState<TxObject | null>(null);
  const [url, setUrl] = useState<string>("");
  const [opacity, setOpacity] = useState<string>("0");
  // const [progress, setProgress] = useState<string>("100");
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  //store whether the txdone modal showed at anypoint
  const [txDoneHasntShowed, setTxDoneHasntShowed] = useState<boolean>(true);

  useEffect(() => {
    console.log(showTxDone);
    // this ensures that if the txDoneModal shows and is exited, the snackbar wont show after
    if (showTxDone) setTxDoneHasntShowed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTxDone]);

  useEffect(() => {
    if (showSnackbar) {
      const fetchedTx: any = getTxById({
        accountId,
        chainId,
        txDateId: lastTxId,
        txHistory,
      });
      if (fetchedTx) {
        setLastTx(fetchedTx);
        switch (fetchedTx.txType) {
          case "Unstake Ocean":
          case "Stake Ocean":
            setTokenInfo({
              token1: fetchedTx.token1,
              token2: fetchedTx.token2,
            });
            break;
          default:
            setTokenInfo({
              token1: {
                ...fetchedTx.token1.info,
                value: fetchedTx.token1.value,
              },
              token2: {
                ...fetchedTx.token2.info,
                value: fetchedTx.token2.value,
              },
            });
            break;
        }
        const newUrl = getTxUrl({
          ocean,
          txHash: fetchedTx.txHash,
          accountId,
        });
        if (newUrl) setUrl(newUrl);
      }

      //console.log(txDoneHasntShowed, !showConfirmModal, showSnackbar);
      if (showSnackbar && !showConfirmModal && txDoneHasntShowed) {
        easeInOut();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTxId, showSnackbar, showConfirmModal]);

  function easeInOut() {
    setTimeout(() => {
      setOpacity("100");
    }, 500);

    setTimeout(() => {
      setOpacity("0");
    }, 7500);

    setTimeout(() => {
      setShowSnackbar(false);
      setTxDoneHasntShowed(true);
      setLastTx(null)
    }, 8000);
  }

  // function progressBar() {
  //   setTimeout(() => {
  //     setProgress("75");
  //   }, 1500);
  //   setTimeout(() => {
  //     setProgress("50");
  //   }, 3500);
  //   setTimeout(() => {
  //     setProgress("25");
  //   }, 5500);
  //   setTimeout(() => {
  //     setProgress("0");
  //   }, 75000);
  // }

  if (!showSnackbar || !lastTx || showTxDone || showConfirmModal) return null;
  return (
    <div
      className={`max-w-xs fixed md:top-8 md:right-8 w-full mx-auto bg-primary-800 rounded-lg p-4 transition-opacity ease-in-out opacity-${opacity} duration-500`}
    >
      <div className="flex justify-between items-start">
        <div className="grid grid-flow-col gap-4 items-center">
          <BsCheckCircle size="24" className="text-green-400" />
          <div>
            {/* <p className="text-type-100 text-sm">{lastTx.txType}</p> */}
            <p>
              {lastTx.txType.includes("Stake")
                ? `Stake ${toFixed5(lastTx.stakeAmt)} OCEAN in ${
                    tokenInfo.token1.symbol
                  }/${tokenInfo.token2.symbol} pool`
                : lastTx.txType.includes("Unstake")
                ? `Unstake ${toFixed5(lastTx.stakeAmt)} OCEAN from ${
                    tokenInfo.token1.symbol
                  }/${tokenInfo.token2.symbol} pool`
                : `Trade ${tokenInfo.token1.value} ${tokenInfo.token1.symbol} for ${tokenInfo.token2.value} ${tokenInfo.token2.symbol}`}
            </p>
            <p className="text-type-300 text-sm">
              <a
                target="_blank"
                rel="noreferrer"
                href={url}
                className="hover:text-green-400"
              >
                View on explorer
              </a>
            </p>
          </div>
        </div>
        <div>
          <BsX
            role="button"
            color="white"
            onClick={() => {
              setShowSnackbar(false);
            }}
          />
        </div>
      </div>
      {/* <div className="relative pt-1">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-400">
          <div className="bg-gray-900 h-full w-1/2"> </div>
        </div>
      </div> */}
    </div>
  );
};

export default Snackbar;
