import { useState, useEffect } from "react";
import { BsChevronDown } from "react-icons/bs";
import TokenModal from "./TokenModal";
import { DebounceInput } from "react-debounce-input";
import { useContext } from "react";
import { bgLoadingStates, GlobalContext } from "../context/GlobalState";
import Button from "./Button";
import BigNumber from "bignumber.js";
import WrappedInput from "./WrappedInput";
import {ReactComponent as XLogo} from "../assets/datax-x-logo.svg"

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

  function checksPass() {
    return accountId && otherToken && value && balance.gt(0.00001);
  }

  return (
    <div id={`${pos}-swapInput`} className="mt-4 rounded-xl">
      <div className="md:grid md:grid-cols-5 bg-city-blue bg-opacity-30 rounded-xl p-1">
        <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center p-1">
          {value ? (
            <img src={value.logoURI} className="w-10 h-10 rounded-md" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-background flex justify-center items-center text-3xl">
              <XLogo style={{height: "30px"}} />
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
                className="text-xs text-type-100 border-type-300 border rounded-full px-2 py-1 mt-1 hover:bg-gray-600"
              >
                Select token
              </p>
            )}
          </div>
        </div>
        <div className="col-span-3 mt-3 md:mt-0 ">
          <div className="h-full w-full rounded-lg bg-opacity-100 text-3xl p-1 flex items-center">
            <div className="flex justify-between items-center bg-black bg-opacity-70 p-1 rounded-lg">
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
                className="h-full w-full rounded-lg bg-opacity-0 bg-white text-2xl outline-none overflow-ellipsis focus:placeholder-type-200 placeholder-type-400"
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
                        if (checksPass()) onPerc(100);
                      }}
                      text="Max"
                      classes={`${
                        checksPass() ? "border-type-300 hover:bg-primary-600" : "text-type-600 border-type-600"
                      } px-2 py-0 border rounded-full text-xs`}
                      disabled={checksPass() ? false : true}
                    />
                    <DebounceInput
                      id={`token${pos}-perc-input`}
                      value={perc.dp(3).toString()}
                      type="number"
                      debounceTimeout={500}
                      onChange={(e) => {
                        if (checksPass()) onPerc(e.target.value);
                      }}
                      className={`text-xs ${
                        checksPass()
                          ? "modalSelectBg bg-opacity-25"
                          : "bg-primary-500 bg-opacity-25 text-primary-600"
                      }   py-1 rounded px-1 w-12 outline-none`}
                      placeholder="%"
                      disabled={checksPass() ? false : true}
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
