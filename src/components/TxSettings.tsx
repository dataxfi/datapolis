import { MdTune } from 'react-icons/md';
import OutsideClickHandler from 'react-outside-click-handler';
import BigNumber from 'bignumber.js';
import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function TxSettings() {
  const { showTxSettings, setShowTxSettings, slippage, setSlippage } = useContext(GlobalContext);
  return (
    <div className="flex relative">
      <div className="grid grid-flow-col gap-2 items-center">
        <div
          id="tradeSettingsBtn"
          onClick={() => setShowTxSettings(true)}
          className="hover:bg-primary-700 px-1.5 py-1.5 rounded-lg"
          role="button"
        >
          <MdTune size="24" />
        </div>
      </div>
      {showTxSettings ? (
        <div id="settingsModal" className="absolute top-0 left-0 max-w-sm">
          <OutsideClickHandler
            onOutsideClick={() => {
              setShowTxSettings(false);
            }}
          >
            <div className="bg-black rounded-lg border bg-opacity-90 border-primary-500 p-2 w-full">
              <p className="text-gray-100">Transaction settings</p>
              <div className="mt-2">
                <p className="text-gray-300 text-sm">Slippage tolerance</p>
                <div className="grid grid-flow-col gap-2 items-center">
                  <div className="flex justify-between focus:border-white bg-primary-700 rounded-lg items-center px-2 py-1">
                    <input
                      id="slippageInput"
                      type="number"
                      onChange={(e) => setSlippage(new BigNumber(e.target.value))}
                      value={slippage.dp(5).toString()}
                      className="text-lg bg-primary-700 outline-none rounded-l-lg w-32"
                    />
                    <p className="text-gray-200 text-lg">%</p>
                  </div>
                  <div>
                    <button
                      id="autoSlippageBtn"
                      onClick={() => setSlippage(new BigNumber(1))}
                      className="text-gray-300 p-2 bg-primary-800 rounded-lg"
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </OutsideClickHandler>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
