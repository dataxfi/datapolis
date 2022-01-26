import { useState, useEffect } from "react";
import { BsChevronDown } from "react-icons/bs";
import TokenModal from "./TokenModal";
import { DebounceInput } from "react-debounce-input";
import { useContext } from "react";
import { bgLoadingStates, GlobalContext } from "../context/GlobalState";
import Button from "./Button";
import BigNumber from "bignumber.js";
import WrappedInput from "./WrappedInput";
import { useLocation } from "react-router-dom";
const SwapInput = ({
  title,
  value,
  pos,
  setToken,
  num,
  updateNum,
  balance,
  loading,
  otherToken,
  onPerc,
  perc,
  max,
}: {
  title: string;
  value: Record<any, any> | null;
  pos: number;
  setToken: Function;
  num: string;
  updateNum: Function;
  balance: BigNumber;
  loading: boolean;
  otherToken: string;
  onPerc: Function;
  perc: BigNumber;
  max: BigNumber;
}) => {
  const [showModal, setShowModal] = useState(false);
  const { accountId, handleConnect, bgLoading, setBgLoading } = useContext(GlobalContext);

  const tokenSelected = (token: Record<any, any>) => {
    setToken(token, pos, true);
    setShowModal(false);
  };

  function connectWalletOrShowlist() {
    if (accountId) {
      setShowModal(true);
    } else {
      handleConnect();
    }
  }

  // useEffect(() => {
  //   if (value) setToken(value, pos, false);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [accountId]);

  return (
    <div id={`${pos}-swapInput`} className="mt-4 bg-primary-800 p-4 rounded-lg">
      <div className="md:grid md:grid-cols-5">
        <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
          {value ? (
            <img src={value.logoURI} className="w-14 h-14 rounded-md" alt="" />
          ) : (
            <div className="w-14 h-14 rounded-md bg-background font-pollerOne text-yellow text-center pt-3 text-3xl">
              X
            </div>
          )}
          <div
            id={`selectToken${pos}`}
            role="button"
            tabIndex={0}
            onClick={() => {
              connectWalletOrShowlist();
            }}
          >
            <p className="text-xs text-type-200">{title}</p>
            {value ? (
              <span className="text-sm sm:text-2xl text-type-200 font-bold grid grid-flow-col items-center gap-1 ">
                <span id={`selectedToken${pos}`} className="text-sm sm:text-lg">
                  {value.symbol}
                </span>
                <BsChevronDown className="text-type-200" size="16" />
              </span>
            ) : (
              <p
                id="selectTokenBtn"
                className="text-xs text-type-100 border-type-300 border rounded-full px-2 py-1 mt-1 hover:bg-primary-600"
              >
                Select token
              </p>
            )}
          </div>
        </div>
        <div className="col-span-3 mt-3 md:mt-0">
          <div className="h-full w-full rounded-lg bg-primary-900 text-3xl p-2">
            <div className="flex justify-between items-center">
              <DebounceInput
                id={`token${pos}-input`}
                key={`token${pos}-input`}
                data-test-max={max.dp(5).toString()}
                max={max}
                step="any"
                disabled={loading}
                debounceTimeout={500}
                onChange={(e) => {
                  updateNum(e.target.value);
                }}
                onWheel={(event: any) => event.currentTarget.blur()}
                onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                element={WrappedInput}
                type="number"
                className="h-full w-full rounded-lg bg-primary-900 text-3xl outline-none overflow-ellipsis focus:placeholder-type-200 placeholder-type-400"
                placeholder="0.0"
                value={Number(num) > 0 ? num : ""}
              />
              <div>
                {balance ? (
                  <p id={`token${pos}-balance`} className="text-sm text-type-400 whitespace-nowrap text-right">
                    Balance: {balance.dp(3).toString()}
                  </p>
                ) : (
                  <></>
                )}
                {/* {
                                value ?
                                <p className="text-type-300 text-sm text-right">
                                =$320.08
                                </p> : <></>
                            } */}
                {pos === 2 ? null : balance ? (
                  <div className="text-sm text-type-300 grid grid-flow-col justify-end gap-2">
                    <Button
                      id="maxTrade"
                      onClick={() => {
                        if (accountId && otherToken && value) onPerc(100);
                      }}
                      text="Max"
                      classes={`${accountId && otherToken && value? "border-type-300 hover:bg-primary-600":"text-type-600 border-type-600"} px-2 py-0 border rounded-full text-xs`}
                      disabled={accountId && otherToken && value ? false : true}
                    />
                    <DebounceInput
                      id={`token${pos}-perc-input`}
                      value={perc.dp(3).toString()}
                      type="number"
                      debounceTimeout={500}
                      onChange={(e) => {
                        if (accountId && otherToken && value) onPerc(e.target.value);
                      }}
                      className={`text-xs ${accountId && otherToken && value? "text-type-200 placeholder-gray-500 bg-primary-700 ":"text-type-600 border-type-600 bg-primary-700"}   py-1 rounded px-1 w-12 outline-none`}
                      placeholder="%"
                      disabled={accountId && otherToken && value ? false : true}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>

          {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
          {/* <input onChange={(e) => updateNum(e.target.value)} onWheel={ event => event.currentTarget.blur() } onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} type="number" className="h-full w-full rounded-lg bg-primary-900 text-3xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400" placeholder="0.0" value={num} /> */}
        </div>
      </div>
      {showModal ? (
        <TokenModal onClick={tokenSelected} close={() => setShowModal(false)} otherToken={otherToken} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default SwapInput;
