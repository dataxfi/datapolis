import { useContext, useEffect, useState } from 'react';
import { BsCheckCircle, BsX } from 'react-icons/bs';
import OutsideClickHandler from 'react-outside-click-handler';
import { GlobalContext, INITIAL_TOKEN_STATE } from '../context/GlobalState';
import BigNumber from 'bignumber.js';

const TransactionDoneModal = () => {
  const { showTxDone, setShowTxDone, lastTx, config, setBlurBG } = useContext(GlobalContext);
  const [lastTxUrl, setLastTxUrl] = useState<string>('');

  useEffect(() => {
    if (config && lastTx?.txReceipt?.transactionHash)
      setLastTxUrl(config.default.explorerUri + '/tx/' + lastTx.txReceipt.transactionHash);
  }, [lastTx?.txReceipt?.transactionHash]);

  function close() {
    setShowTxDone(false);
    setBlurBG(false);
  }
  return showTxDone ? (
    <div id="transactionDoneModal" className="fixed center sm:max-w-sm w-full z-30 shadow">
      <OutsideClickHandler onOutsideClick={close}>
        <div className="bg-black bg-opacity-90 border rounded-lg pb-8 p-4 hm-box mx-3">
          <div className="flex justify-end">
            <BsX id="transactionDoneModalCloseBtn" onClick={close} size={28} className="text-gray-200" role="button" />
          </div>

          <div className="mt-4 flex justify-center">
            <BsCheckCircle size={56} className="text-city-blue" />
          </div>
          <div>
            <p className="text-center text-gray-100 text-lg">Transaction Processed</p>
            <p className="text-blue-400 text-center mt-1">
              <a id="transactionLink" target="_blank" rel="noreferrer" className="text-city-blue" href={lastTxUrl}>
                View on explorer
              </a>
            </p>
          </div>
        </div>
      </OutsideClickHandler>
    </div>
  ) : (
    <></>
  );
};

export default TransactionDoneModal;
