import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { ISnackbarItem, ITxDetails } from '../utils/types';
import { BsX, BsXCircle } from 'react-icons/bs';
import { IoCheckboxOutline } from 'react-icons/io5';
import { getTxUrl } from '../hooks/useTxHistory';
import BigNumber from 'bignumber.js';
export default function Snackbar() {
  const { snackbarItem, setSnackbarItem, ocean, accountId } = useContext(GlobalContext);
  const [currentNot, setCurrentNot] = useState<ISnackbarItem>();
  const [opacity, setOpacity] = useState<string>('100');
  const [txDetails, setTxDetails] = useState<ITxDetails>();
  const [url, setUrl] = useState<string>();
  const [cleanup, setCleanup] = useState<boolean>(true);
  const [progress, setProgress] = useState<string>('100%');

  useEffect(() => {
    if (snackbarItem) setProgress('100%');
  }, [snackbarItem]);

  useEffect(() => {
    if (snackbarItem && !currentNot) {
      setCurrentNot(snackbarItem);
      setSnackbarItem(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbarItem, currentNot]);

  useEffect(() => {
    if (ocean && accountId && currentNot?.newTx) { setUrl(getTxUrl({ ocean, accountId, txHash: currentNot.newTx.txReceipt?.transactionHash })); }
    setTxDetails(currentNot?.newTx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, accountId, currentNot]);

  useEffect(() => {
    if ((txDetails || currentNot?.error) && cleanup) {
      display();
    }

    return () => {
      setCleanup(true);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txDetails, currentNot]);

  function errorMessage(currentNot: any) {
    if (currentNot.error?.error?.code === 4001) {
      return 'User rejected transaction';
    } else {
      return currentNot.message;
    }
  }

  function display() {
    // render time is 6 seconds
    setTimeout(() => {
      setOpacity('100');
    }, 500);

    setTimeout(() => {
      setProgress('0%');
    }, 500);

    setTimeout(() => {
      setOpacity('0');
    }, 5500);

    setTimeout(() => {
      setCurrentNot(undefined);
      setTxDetails(undefined);
    }, 6000);
  }

  if (!currentNot) return <></>;
  return (
    <div className={'max-w-xs fixed right-2 top-18 md:right-8 w-full'}>
      <div
        className={`relative top-0 left-0 max-w-xs w-full mx-auto bg-black bg-opacity-90 rounded-lg p-1 lg:p-4 transition-opacity ease-in-out opacity-${opacity} duration-500`}
      >
        <div className="flex justify-between items-center">
          <div className="grid grid-flow-col gap-4 items-center">
            {txDetails && currentNot?.type === 'tx' ? (
              <>
                <IoCheckboxOutline size="24" className="text-city-blue" />
                <div>
                  <p>
                    {txDetails.txType === 'stake' && txDetails.token2.info ? `Stake ${new BigNumber(txDetails.token1.value).dp(5).toString()} OCEAN in ${
                          txDetails.token2.info.symbol
                        }/OCEAN pool` : txDetails.txType === 'unstake' && txDetails.shares && txDetails.token2.info ? `Unstake ${new BigNumber(txDetails.shares).dp(5).toString()} OCEAN from ${
                          txDetails.token2.info.symbol
                        }/OCEAN pool` : txDetails.txType === 'approve' ? `Unlock ${txDetails.token1.info?.symbol}` : `Trade ${new BigNumber(txDetails.token1.value).dp(5).toString()} ${
                          txDetails.token1.info?.symbol
                        } for ${new BigNumber(txDetails.token2.value).dp(5).toString()} ${
                          txDetails.token2.info?.symbol
                        }`}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <a target="_blank" rel="noreferrer" href={url} className="hover:text-city-blue">
                      View on explorer
                    </a>
                  </p>
                </div>
              </>
            ) : currentNot?.type === 'error' ? (
              <>
                <BsXCircle className="text-red-500 mr-4" />
                <p>{errorMessage(currentNot)}</p>
              </>
            ) : (
              <></>
            )}
          </div>
          <div>
            <BsX
              role="button"
              color="white"
              onClick={() => {
                setCurrentNot(undefined);
                setCleanup(false);
              }}
            />
          </div>
        </div>
        <div className="bottom-0 left-0 w-full bg-gray-900 h-2 absolute rounded-b-full overflow-clip">
          <div
            className={`h-full ${
              currentNot.type === 'error' ? 'from-red-900 via-red-900' : 'from-stake-blue via-stake-blue'
            } bg-opacity-60 transition-all transform duration-[5400ms] ease-linear rounded-bl-full bg-gradient-to-r to-transparent`}
            style={{ width: progress }}
          />
        </div>
      </div>
    </div>
  );
}
