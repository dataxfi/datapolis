import { useContext, useEffect, useState } from 'react';
import { BsX } from 'react-icons/bs';
import OutsideClickHandler from 'react-outside-click-handler';
import { GlobalContext } from '../context/GlobalState';
import Loader from './Loader';

const ConfirmModal = () => {
  const { showConfirmModal, setShowConfirmModal, location, token1, token2, singleLiquidityPos, setBlurBG } =
    useContext(GlobalContext);
  const [txMessage, setTxMessage] = useState('Check wallet for transaction to confirm.');

  useEffect(() => {
    if (token1.info && token2.info)
      switch (location) {
        case '/stake':
          setTxMessage(`Stake ${token1.value?.toString()} OCEAN in ${token2.info?.symbol} pool`);
          break;
        case '/stake/remove':
          if (singleLiquidityPos)
            setTxMessage(
              `Unstake ${token1.value.dp(5).toString()} ${token1.info?.symbol} from the ${token2.info?.symbol} pool.`
            );
          break;
        default:
          setTxMessage(
            `Swap ${token1.value.dp(5)} ${token1.info?.symbol} for ${token2.value.dp(5)} ${token2.info?.symbol}`
          );
          break;
      }
  }, [location, token1.info, token2.info, token1.value, token2.value]);

  function close() {
    setShowConfirmModal(false);
    setBlurBG(false);
  }

  return showConfirmModal ? (
    <div className="fixed center md:max-w-sm w-full z-30">
      <OutsideClickHandler onOutsideClick={close}>
        <div className="bg-black bg-opacity-90 p-4 rounded-lg border padding mx-3 shadow hm-box">
          <div className="flex justify-end">
            <BsX
              onClick={close}
              role="button"
              size="28"
              className="text-gray-200 text-right"
              id="closeConfrimModalBtn"
            />
          </div>
          <div className="flex items-center justify-center">
            <Loader size={48} />
          </div>
          <div className="text-center">
            <p className="text-gray-100 text-lg mt-2">You will have to confirm 1 transaction</p>
            <div id="confirmItem" className="flex flex-row">
              <p className="text-gray-200  text-left mt-2 mr-2">{`1.`}</p>
              <p className="text-gray-200  text-left mt-2">{txMessage}</p>
            </div>
            <p className="mt-8 text-gray-400 text-sm">Confirm this transaction in your wallet</p>
          </div>
        </div>
      </OutsideClickHandler>
    </div>
  ) : (
    <></>
  );
};

export default ConfirmModal;
