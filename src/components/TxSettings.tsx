import { MdTune } from 'react-icons/md';
import OutsideClickHandler from 'react-outside-click-handler';
import BigNumber from 'bignumber.js';
import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { DebounceInput } from 'react-debounce-input';
import WrappedInput from './WrappedInput';

export default function TxSettings() {
  const { showTxSettings, setShowTxSettings, slippage, setSlippage } = useContext(GlobalContext);
  return (
    <div className="flex relative ml-2">
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
        <div id="settingsModal" className="absolute bottom-0 right-0 max-w-sm z-30">
          <OutsideClickHandler
            onOutsideClick={() => {
              setShowTxSettings(false);
            }}
          >
            <div className="bg-black rounded-lg border bg-opacity-90 border-primary-500 p-2 w-full">
              <p className="text-gray-100">Transaction Settings</p>
              <div className="mt-2">
                <p className="text-gray-300 text-sm mb-1">Slippage Tolerance</p>
                <div className="grid grid-flow-col gap-2 items-center">
                  <div className="flex justify-between focus:border-white bg-primary-700 rounded-lg items-center px-2 ">
                    <DebounceInput
                      id="slippageInput"
                      type="number"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isNaN(Number(val))) return;
                        setSlippage(new BigNumber(e.target.value));
                      }}
                      value={slippage.isNaN() || slippage.lte(0) ? '' : slippage.dp(5).toString()}
                      className="text-lg bg-primary-700 outline-none rounded-l-lg w-32 text-right"
                      placeholder="1.0"
                      debounceTimeout={500}
                      element={WrappedInput}
                    />
                    <p className="text-gray-200 text-lg mx-2">%</p>
                  </div>
                  <div className="h-full">
                    <button
                      id="autoSlippageBtn"
                      onClick={() => setSlippage(new BigNumber(1))}
                      className="text-gray-300 px-2 h-full bg-primary-800 rounded-lg"
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
