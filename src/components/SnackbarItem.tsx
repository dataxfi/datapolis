import { useContext, useEffect, useState } from "react";
import { BsCheckCircle, BsX } from "react-icons/bs";
import { GlobalContext } from "../context/GlobalState";
import { getTxUrl, conformTx } from "../utils/txHistoryUtils";
import BigNumber from 'bignumber.js'
const SnackbarItem = ({
  tx,
  setCurrentNot,
}: {
  tx: any;
  setCurrentNot: Function;
}) => {
  const { ocean, accountId, notifications, setNotifications } =
    useContext(GlobalContext);
  const [opacity, setOpacity] = useState<string>("0");
  // const [progress, setProgress] = useState<string>("100");
  const [tokenInfo, setTokenInfo] = useState<any>();
  const [txDetails, setTxDetails] = useState<any>();
  const [url, setUrl] = useState<any>();
  const [cleanup, setCleanup] = useState(true)

  useEffect(() => {
    setUrl(getTxUrl({ ocean, accountId, txHash: tx.txHash }));
    setTokenInfo(conformTx(tx));
    setTxDetails(tx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx]);

  useEffect(() => {
    if (txDetails && cleanup) {
      display();
    }

    return () => {(setCleanup(true)) }
    
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
      const allNotifications = notifications;
      const newNotifications = allNotifications.slice(1);
      setNotifications(newNotifications);
    }, 6000);
  }

  if (!txDetails) return null;
  return (
    <div
      className={`max-w-xs w-full mx-auto bg-black bg-opacity-90 rounded-lgm p-1 lg:p-4 transition-opacity ease-in-out opacity-${opacity} duration-500`}
    >
      <div className="flex justify-between items-start">
        <div className="grid grid-flow-col gap-4 items-center">
          <BsCheckCircle size="24" className="text-green-400" />
          <div>
            {/* <p className="text-type-100 text-sm">{lastTx.txType}</p> */}
            <p>
              {tx.txType === "stake"
                ? `Stake ${new BigNumber(tx.stakeAmt).dp(5).toString()} OCEAN in ${
                    tokenInfo.token1.symbol
                  }/OCEAN pool`
                : tx.txType === "unstake"
                ? `Unstake ${new BigNumber(tx.stakeAmt).dp(5).toString()} OCEAN from ${
                    tokenInfo.token1.symbol
                  }/OCEAN pool`
                : `Trade ${new BigNumber(tokenInfo.token1.value).dp(5).toString()} ${tokenInfo.token1.symbol} for ${new BigNumber(tokenInfo.token2.value).dp(5).toString()} ${tokenInfo.token2.symbol}`}
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
              setCurrentNot(null);
              setCleanup(false)
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
