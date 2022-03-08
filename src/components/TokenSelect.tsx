import { useEffect, useState } from "react";
import { BsBoxArrowUpRight, BsChevronDown } from "react-icons/bs";
import TokenModal from "./TokenModal";
import { DebounceInput } from "react-debounce-input";
import { useContext } from "react";
import { GlobalContext, INITIAL_TOKEN_STATE } from "../context/GlobalState";
import Button from "./Button";
import BigNumber from "bignumber.js";
import WrappedInput from "./WrappedInput";
import { ReactComponent as XLogo } from "../assets/datax-x-logo.svg";
import { TokenInfo } from "@dataxfi/datax.js/dist/TokenList";
import { IToken, TokenSelectTitles } from "../utils/types";

export default function TokenSelect({
  setToken,
  token,
  pos,
  updateNum,
  otherToken,
  onPerc = () => {},
  max,
}: {
  setToken: React.Dispatch<React.SetStateAction<IToken>>;
  token: IToken;
  pos: 1 | 2;
  updateNum: Function;
  otherToken: string;
  onPerc?: Function;
  max: BigNumber;
}) {
  const [showModal, setShowModal] = useState(false);
  const { accountId, handleConnect, tokensCleared, location, config, ocean } = useContext(GlobalContext);

  const [title, setTitle] = useState<TokenSelectTitles>();

  useEffect(() => {
    if (location === "/trade") {
      if (pos === 1) {
        setTitle("You are selling");
      } else {
        setTitle("You are buying");
      }
    } else if (location === "/stake/remove") {
      setTitle("You will receive");
    } else {
      if (pos === 1) {
        setTitle("You are spending");
      } else {
        setTitle("Pool");
      }
    }
  }, [location, setTitle, pos]);

  const tokenSelected = async (info: TokenInfo) => {
    if (!ocean || !accountId) return;
    const balance = new BigNumber(await ocean?.getBalance(info.address, accountId));
    if (setToken) setToken({ ...INITIAL_TOKEN_STATE, info, balance });
    setShowModal(false);
  };

  function connectWalletOrShowlist() {
    if (accountId) {
      setShowModal(true);
    } else {
      if (handleConnect) handleConnect();
    }
  }

  function checksPass() {
    return accountId && otherToken && token?.value && token.balance.gt(0.00001);
  }

  return (
    <div id={`${pos}-swapInput`} className="mt-4 rounded-xl">
      <div className="md:grid md:grid-cols-5 bg-city-blue bg-opacity-30 rounded-xl p-1">
        <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center p-1">
          {token?.info && tokensCleared.current ? (
            <img src={token?.info.logoURI} className="w-10 h-10 rounded-md" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-background flex justify-center items-center text-3xl">
              <XLogo style={{ height: "30px" }} />
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
            <p className="text-xs text-gray-200">{title}</p>
            {token?.info && tokensCleared.current ? (
              <span className="text-sm sm:text-2xl text-gray-200 font-bold grid grid-flow-col items-center gap-1 ">
                <span id={`selectedToken${pos}`} className="text-sm sm:text-lg">
                  {token.info.symbol}
                </span>
                <BsChevronDown className="text-gray-200" size="16" />
              </span>
            ) : (
              <p
                id="selectTokenBtn"
                className="text-xs text-gray-100 border-gray-300 border rounded-full px-2 py-1 mt-1 hover:bg-gray-600"
              >
                Select token
              </p>
            )}
          </div>
        </div>

        {location === "/stake" && pos === 2 ? (
          token.info ? (
            <div className="col-span-3 ml-4 mt-3 md:mt-0">
              <div>
                <p className="text-gray-100 uppercase text-xs md:text-base">{token.info?.name}</p>
                <div className="grid grid-flow-col justify-start gap-4 text-sm">
                  <a
                    id="stakePoolLink"
                    href={config?.default.explorerUri + "/address/" + token.info?.pool}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white grid grid-flow-col items-center gap-2 justify-start border-b border-gray-300"
                  >
                    Pool <BsBoxArrowUpRight />{" "}
                  </a>
                  <a
                    id="stakeTokenLink"
                    href={config?.default.explorerUri + "/address/" + token.info?.address}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white grid grid-flow-col items-center gap-2 justify-start border-b border-gray-300"
                  >
                    Token <BsBoxArrowUpRight />{" "}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )
        ) : (
          <div className="col-span-3 mt-3 md:mt-0 ">
            <div className="h-full w-full rounded-lg bg-opacity-100 text-3xl p-1 flex items-center">
              <div className="flex justify-between items-center bg-black bg-opacity-70 p-1 rounded-lg">
                <DebounceInput
                  id={`token${pos}-input`}
                  key={`token${pos}-input`}
                  data-test-max={max.dp(5).toString()}
                  max={max}
                  step="any"
                  disabled={token?.loading}
                  debounceTimeout={500}
                  onChange={(e) => {
                    updateNum(e.target.value);
                  }}
                  onWheel={(event: React.MouseEvent<HTMLInputElement>) => event.currentTarget.blur()}
                  onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                  element={WrappedInput}
                  type="number"
                  className="h-full w-full rounded-lg bg-opacity-0 bg-white text-2xl outline-none overflow-ellipsis focus:placeholder-gray-200 placeholder-gray-400"
                  placeholder="0.0"
                  value={token?.value.gt(0) ? token?.value.dp(5).toString() : ""}
                />
                <div>
                  {token?.balance ? (
                    <p id={`token${pos}-balance`} className="text-sm text-gray-400 whitespace-nowrap text-right">
                      Balance: {token.balance.dp(3).toString()}
                    </p>
                  ) : (
                    <></>
                  )}
                  {pos === 2 ? null : token?.balance ? (
                    <div className="text-sm text-gray-300 grid grid-flow-col justify-end gap-2">
                      <Button
                        id="maxTrade"
                        onClick={() => {
                          if (checksPass()) onPerc(100);
                        }}
                        text="Max"
                        classes={`${
                          checksPass() ? "border-gray-300 hover:bg-primary-600" : "text-gray-600 border-gray-600"
                        } px-2 py-0 border rounded-full text-xs`}
                        disabled={checksPass() ? false : true}
                      />
                      <DebounceInput
                        id={`token${pos}-perc-input`}
                        value={token.percentage.dp(3).toString()}
                        type="number"
                        debounceTimeout={500}
                        onChange={(e) => {
                          if (checksPass()) onPerc(e.target.value);
                        }}
                        className={`text-xs ${
                          checksPass() ? "modalSelectBg bg-opacity-25" : "bg-primary-500 bg-opacity-25 text-primary-600"
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
            {/* <input onChange={(e) => updateNum(e.target.value)} onWheel={ event => event.currentTarget.blur() } onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} type="number" className="h-full w-full rounded-lg bg-primary-900 text-3xl px-2 outline-none focus:placeholder-gray-200 placeholder-gray-400" placeholder="0.0" value={num} /> */}
          </div>
        )}
      </div>
      {showModal ? (
        <TokenModal onClick={tokenSelected} close={() => setShowModal(false)} otherToken={otherToken} pos={pos} />
      ) : (
        <></>
      )}
    </div>
  );
}
