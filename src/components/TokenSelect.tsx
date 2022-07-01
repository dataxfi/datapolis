import React, { useEffect, useState, useContext } from 'react';
import { BsBoxArrowUpRight, BsChevronDown } from 'react-icons/bs';
import { DebounceInput } from 'react-debounce-input';
import { GlobalContext } from '../context/GlobalState';
import BigNumber from 'bignumber.js';
import WrappedInput from './WrappedInput';
import { ReactComponent as XLogo } from '../assets/datax-x-logo.svg';
import { IToken } from '@dataxfi/datax.js';
import { TokenSelectTitles } from '../@types/types';
import MaxToolTip from './MaxToolTip';
import useTokenImgSrc from '../hooks/useTokenImgSrc';
import TokenImage from './TokenImage';

export default function TokenSelect({
  token,
  pos,
  updateNum,
  onPerc = () => {},
  onMax = () => {},
  max,
}: {
  setToken: React.Dispatch<React.SetStateAction<IToken>>;
  token: IToken;
  pos: 1 | 2;
  updateNum?: Function;
  otherToken: string;
  onPerc?: Function;
  onMax?: Function;
  max: BigNumber;
}) {
  const {
    accountId,
    handleConnect,
    tokensCleared,
    location,
    config,
    selectTokenPos,
    setBlurBG,
    setShowTokenModal,
    path,
    balanceTokenIn
  } = useContext(GlobalContext);
  const [enabled, setEndabled] = useState(false);
  const [title, setTitle] = useState<TokenSelectTitles>();
  const [imgSrc, setImgSrc] = useState(token.info?.logoURI);

  useTokenImgSrc(setImgSrc, token.info);

  useEffect(() => {
    if (
      location === '/stake' &&
      path &&
      path.length > 0 &&
      accountId &&
      max.gt(0) &&
      balanceTokenIn.gt(0) &&
      (token.info?.address.toLowerCase() === path[0].toLowerCase() ||
        token.info?.address.toLowerCase() === accountId?.toLowerCase())
    ) {
      setEndabled(true);
    } else {
      setEndabled(false);
    }
  }, [token, max, accountId]);

  useEffect(() => {
    if (location === '/trade') {
      if (pos === 1) {
        setTitle('You are selling');
      } else {
        setTitle('You are buying');
      }
    } else if (location === '/stake/remove') {
      setTitle('You will receive');
    } else {
      if (pos === 1) {
        setTitle('You are staking');
      } else {
        setTitle('Datatoken pool');
      }
    }
  }, [location, setTitle, pos]);

  function connectWalletOrShowlist() {
    if (accountId) {
      setShowTokenModal(true);
      setBlurBG(true);
      selectTokenPos.current = pos;
    } else {
      if (handleConnect) handleConnect();
    }
  }

  return (
    <div id={`${pos}-swapInput`} className="mt-4 rounded-xl">
      <div className="md:grid md:grid-cols-5 bg-city-blue bg-opacity-30 rounded-xl p-1">
        <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center p-1">
          {token?.info && tokensCleared.current ? (
            <a href={`https://polygonscan.com/address/${token.info.address}`} target="blank">
              <TokenImage imgSrc={imgSrc || ''} className="w-10 h-10 rounded-md" />
            </a>
          ) : (
            <div className="w-10 h-10 rounded-md bg-background flex justify-center items-center text-3xl">
              <XLogo style={{ height: '30px' }} />
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
            <p className="text-xs text-gray-200 text-left">{title}</p>
            {token?.info && tokensCleared.current ? (
              <span className="text-sm sm:text-2xl text-gray-200 font-bold flex justify-center items-center">
                <span id={`selectedToken${pos}`} className="text-sm sm:text-lg">
                  {token.info.symbol}
                </span>
                <BsChevronDown className="text-gray-200" size="16" />
              </span>
            ) : (
              <p id="selectTokenBtn" className="text-xs btn-dark rounded-full mt-1">
                Select Token
              </p>
            )}
          </div>
        </div>

        {location === '/stake' && pos === 2 ? (
          token.info ? (
            <div className="col-span-3 ml-4 mt-3 md:mt-0">
              <div>
                <p className="text-gray-100 uppercase text-xs md:text-base">{token.info?.name}</p>
                <div className="grid grid-flow-col justify-start gap-4 text-sm">
                  <a
                    id="stakePoolLink"
                    href={config?.default.explorerUri + '/address/' + token.info?.pools[0].id}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white grid grid-flow-col items-center gap-2 justify-start border-b border-gray-300"
                  >
                    Pool <BsBoxArrowUpRight />{' '}
                  </a>
                  <a
                    id="stakeTokenLink"
                    href={config?.default.explorerUri + '/address/' + token.info?.address}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white grid grid-flow-col items-center gap-2 justify-start border-b border-gray-300"
                  >
                    Token <BsBoxArrowUpRight />{' '}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )
        ) : (
          <div className="col-span-3 mt-3 md:mt-0 ">
            <div className="h-full w-full rounded-lg bg-opacity-100 text-3xl p-1 flex-col items-center">
              {token?.balance ? (
                <p id={`token${pos}-balance`} className="text-sm text-gray-400 whitespace-nowrap text-right">
                  Balance: {balanceTokenIn.dp(3).toString()}
                </p>
              ) : (
                <></>
              )}
              <div className="flex justify-between items-center bg-black bg-opacity-70 p-1 rounded-lg">
                <DebounceInput
                  id={`token${pos}-input`}
                  key={`token${pos}-input`}
                  data-test-max={max.dp(5).toString()}
                  max={max}
                  step="any"
                  disabled={token?.loading || location === '/stake/remove' || !enabled}
                  debounceTimeout={500}
                  onChange={(e) => {
                    if (updateNum) updateNum(e.target.value);
                  }}
                  onWheel={(event: React.MouseEvent<HTMLInputElement>) => event.currentTarget.blur()}
                  onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
                  element={WrappedInput}
                  type="number"
                  className="h-full w-full rounded-lg bg-opacity-0 bg-white text-2xl outline-none overflow-ellipsis focus:placeholder-gray-200 placeholder-gray-400 mr-2"
                  placeholder="0.0"
                  value={token?.value.gt(0) ? token?.value.dp(5).toString() : ''}
                />
                <div>
                  {pos === 2 || location === '/stake/remove' ? null : token?.balance ? (
                    <div className="text-sm text-gray-300 grid grid-flow-col justify-end gap-2 items-center">
                      <MaxToolTip />
                      <button
                        id="maxBtn"
                        onClick={() => {
                          if (enabled) onMax();
                        }}
                        className={'btn-dark btn-sm rounded-full text-xs'}
                        disabled={!enabled}
                      >
                        Max
                      </button>
                      <DebounceInput
                        id={`token${pos}-perc-input`}
                        value={token.percentage.dp(3).toString()}
                        type="number"
                        debounceTimeout={500}
                        onChange={(e) => {
                          if (enabled) onPerc(e.target.value);
                        }}
                        className={`text-xs ${
                          enabled ? 'modalSelectBg bg-opacity-25' : 'bg-primary-500 bg-opacity-25 text-primary-600'
                        }   py-1 rounded px-1 w-12 outline-none`}
                        placeholder="%"
                        disabled={!enabled}
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
    </div>
  );
}
