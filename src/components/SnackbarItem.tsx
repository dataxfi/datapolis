import { useContext, useEffect, useState } from "react";
import { BsX } from "react-icons/bs";
import { IoCheckboxOutline } from "react-icons/io5";
import { GlobalContext } from "../context/GlobalState";
import { getTxUrl } from "../utils/txHistoryUtils";
import BigNumber from "bignumber.js";
import { ITxDetails } from "../utils/types";
const SnackbarItem = ({ tx, setCurrentNot }: { tx: ITxDetails; setCurrentNot: Function }) => {
  const { ocean, accountId, notifications, setNotifications, setToken1, setToken2 } = useContext(GlobalContext);
  const [opacity, setOpacity] = useState<string>("0");
  // const [progress, setProgress] = useState<string>("100");
  const [txDetails, setTxDetails] = useState<any>();
  const [url, setUrl] = useState<any>();
  const [cleanup, setCleanup] = useState(true);

  useEffect(() => {
    if (ocean && accountId && tx.txReceipt)
      setUrl(getTxUrl({ ocean, accountId, txHash: tx.txReceipt.transactionHash }));
    setTxDetails(tx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx, ocean, accountId]);

  useEffect(() => {
    if (txDetails && cleanup) {
      display();
    }

    return () => {
      setCleanup(true);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txDetails]);

  function display() {
    //default render time is 6 seconds
    setTimeout(() => {
      //show
      setOpacity("100");
    }, 500);

    setTimeout(() => {
      //hide
      setOpacity("0");
    }, 5500);

    setTimeout(() => {
      setCurrentNot(null);
      if (!notifications || !setNotifications) return;
      const allNotifications = notifications;
      const newNotifications = allNotifications.slice(1);
      setNotifications(newNotifications);
    }, 6000);
  }

  if (!txDetails) return null;
  return (
    <div
      className={`max-w-xs w-full mx-auto bg-black bg-opacity-90 rounded-lg p-1 lg:p-4 transition-opacity ease-in-out opacity-${opacity} duration-500`}
    >
      <div className="flex justify-between items-start">
        <div className="grid grid-flow-col gap-4 items-center">
          <IoCheckboxOutline size="24" className="text-city-blue" />
          <div>
            {/* <p className="text-type-100 text-sm">{lastTx.txType}</p> */}
            <p>
              {tx.txType === "stake" && tx.token2.info
                ? `Stake ${new BigNumber(tx.token1.value).dp(5).toString()} OCEAN in ${
                    tx.token2.info.symbol
                  }/OCEAN pool`
                : tx.txType === "unstake" && tx.shares && tx.token2.info
                ? `Unstake ${new BigNumber(tx.shares).dp(5).toString()} OCEAN from ${
                    tx.token2.info.symbol
                  }/OCEAN pool`
                : tx.txType === "approve"
                ? `Unlock ${tx.token1.value} ${tx.token1.info?.symbol}`
                : `Trade ${new BigNumber(tx.token1.value).dp(5).toString()} ${
                    tx.token1.info?.symbol
                  } for ${new BigNumber(tx.token2.value).dp(5).toString()} ${tx.token2.info?.symbol}`}
            </p>
            <p className="text-type-300 text-sm">
              <a target="_blank" rel="noreferrer" href={url} className="hover:text-city-blue">
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
              setCurrentNot(null);
              setCleanup(false);
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

export default SnackbarItem;

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
