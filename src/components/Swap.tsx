import SwapInput from "./SwapInput";
import { IoSwapVertical } from "react-icons/io5";
import { MdTune } from "react-icons/md";
import { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import Button, { IBtnProps } from "./Button";
import OutsideClickHandler from "react-outside-click-handler";
import ConfirmSwapModal from "./ConfirmSwapModal";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import { toFixed2, toFixed5 } from "../utils/equate";
// import { program } from "@babel/types"
// import { get } from "https"
import { addTxHistory, deleteRecentTxs } from "../utils/txHistoryUtils";
import useTxModalToggler from "../hooks/useTxModalToggler";
import usePTxManager from "../hooks/usePTxManager";
import errorMessages from "../utils/errorMessages";

const text = {
  T_SWAP: "TradeX",
  T_SWAP_FROM: "You are selling",
  T_SWAP_TO: "You are buying",
};

// interface BtnProps {
//   text: string
//   classes: string
//   disabled: boolean
// }

const INITIAL_TOKEN_STATE = {
  info: null,
  value: 0,
  balance: "",
  percentage: "",
};

const Swap = () => {
  const {
    handleConnect,
    accountId,
    ocean,
    chainId,
    config,
    setLoading,
    txHistory,
    setTxHistory,
    showConfirmModal,
    setShowConfirmModal,
    showTxDone,
    setShowTxDone,
    notifications,
    setNotifications,
  } = useContext(GlobalContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmSwapModal, setShowConfirmSwapModal] = useState(false);
  const [network, setNetwork] = useState(null);
  const [lastTxUrl, setLastTxUrl] = useState("");
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [token1, setToken1] = useState<any>(INITIAL_TOKEN_STATE);
  const [token2, setToken2] = useState<any>(INITIAL_TOKEN_STATE);
  const [exactToken, setExactToken] = useState<number>(1);
  const [postExchange, setPostExchange] = useState<any>(null);
  const [slippage, setSlippage] = useState<number | string>(1);
  //very last transaction
  const [lastTxId, setLastTxId] = useState<any>(null);
  const [btnProps, setBtnProps] = useState<IBtnProps>({
    text: "Select Tokens",
    classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
    disabled: true,
  });
  const [maxExchange, setMaxExchange] = useState<any>(null);

  //hooks
  usePTxManager(lastTxId);
  useTxModalToggler(txReceipt);

  useEffect(() => {
    if (config) {
      console.log("Known - ", config);
    }
  }, [config]);

  async function getMaxExchange() {
    console.log("Changing max buy");
    let maxTrade;
    let tokenNeeded;
    let sellLimit;
    let tokens;
    if (!isOCEAN(token1.info.address) && !isOCEAN(token2.info.address)) {
      console.log("we in here");
      const maxT1 = await ocean.getMaxExchange(token1.info.pool);
      const maxT2 = await ocean.getMaxExchange(token2.info.pool);

      console.log(maxT1, maxT2);

      if (Number(maxT1) < Number(maxT2)) {
        console.log("max t1 < max t2");
        maxTrade = maxT1;
        sellLimit = true;
      } else {
        maxTrade = maxT2;
        console.log("max t1 > max t2");
      }

      tokens = [toFixed2(maxT1), toFixed2(maxT2)];
    } else if (isOCEAN(token2.info.address)) {
      maxTrade = await ocean.getMaxExchange(token1.info.pool);
      tokenNeeded = await calculateExchange(true, toFixed2(maxTrade));
      sellLimit = true;
      //maxTrade = (Number(maxTrade) / 2).toString()
    } else {
      maxTrade = await ocean.getMaxExchange(token2.info.pool);
      tokenNeeded = await calculateExchange(false, toFixed2(maxTrade));
      sellLimit = false;
    }

    console.log(maxTrade);
    console.log(tokenNeeded);
    return tokens
      ? {
          maxTrade: toFixed2(maxTrade),
          tokenNeeded: toFixed2(tokenNeeded),
          sellLimit,
          tokens,
        }
      : {
          maxTrade: toFixed2(maxTrade),
          tokenNeeded: toFixed2(tokenNeeded),
          sellLimit,
        };
  }

  useEffect(() => {
    if (token1.info && token2.info) {
      setToken1({ ...token1, loading: true });
      setToken2({ ...token2, loading: true });
      getMaxExchange().then((res) => {
        setMaxExchange(res);
        if (token1.value > 0) {
          setToken1({ ...token1, loading: false });
          setToken(token1.info, 1, true);
        } else {
          setToken1({ ...token1, loading: false });
          setToken2({ ...token2, loading: false });
        }
      });
    }
  }, [token1.info, token2.info]);

  useEffect(() => {
    setLoading(false);
    getButtonProperties();
    //if unknown network, reset token selection
    if (config && config.default.network === "unknown") {
      setToken1(INITIAL_TOKEN_STATE);
      setToken2(INITIAL_TOKEN_STATE);
      setBtnProps({
        text: "Network Not Supported",
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
        disabled: true,
      });
    }

    //if chain changes, reset tokens
    if (!network) {
      setNetwork(chainId);
    }
    if (chainId !== network) {
      setToken1(INITIAL_TOKEN_STATE);
      setToken2(INITIAL_TOKEN_STATE);
      setNetwork(chainId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1, token2, accountId, config, chainId]);

  const setToken = async (
    info: Record<any, any>,
    pos: number,
    updateOther: boolean
  ) => {
    const balance = await ocean.getBalance(info.address, accountId);
    if (pos === 1) {
      setToken1({ ...token1, info, balance });
      if (updateOther) updateOtherTokenValue(true, token1.value);
    } else if (pos === 2) {
      setToken2({ ...token2, info, balance });
      if (updateOther) updateOtherTokenValue(false, token2.value);
    }
  };

  async function swapTokens() {
    setToken1({ ...token2, value: "0", loading: true });
    setToken2({ ...token1, value: "0", loading: true });
    // let exchange = await calculateExchange(true, token2.value);
    // exchange = Number(toFixed5(exchange));
    // setPostExchange(exchange / token2.value);
    //setToken2({ ...token1, value: "0" });
    setExactToken(1);
  }

  async function updateValueFromPercentage(fromToken: Boolean, value: string) {
    let perc = parseFloat(value);
    let limit;
    let exchangeLimit;
    let balOrLim;

    maxExchange
      ? (exchangeLimit = maxExchange)
      : (exchangeLimit = await getMaxExchange());

    exchangeLimit.sellLimit
      ? (limit = exchangeLimit.maxTrade)
      : (limit = exchangeLimit.tokenNeeded);
    if (!exchangeLimit.tokenNeeded) {
      fromToken
        ? (limit = exchangeLimit.tokens[0])
        : (limit = exchangeLimit.tokens[1]);
    }

    console.log(exchangeLimit);

    fromToken
      ? (balOrLim = Number(token1.balance) > Number(limit))
      : (balOrLim = Number(token2.balance) > Number(limit));

    if (Number.isNaN(perc)) {
      if (fromToken) {
        setToken1({ ...token1, percentage: "" });
      } else {
        setToken2({ ...token2, percentage: "" });
      }
    } else if (perc > 100) {
      if (fromToken) {
        if (balOrLim) {
          console.log(1);

          perc = (Number(limit) / Number(token1.balance)) * 100;
          setToken1({
            ...token1,
            percentage: perc,
            value: limit,
          });
        } else {
          console.log(2);

          perc = 100;
          setToken1({
            ...token1,
            percentage: Math.trunc(perc),
            value: token1.balance,
          });
        }
        // setToken2({...token2, percentage: ''})
        updateOtherTokenValue(true, perc);
      } else {
        if (balOrLim) {
          console.log(3);

          perc = (Number(limit) / Number(token2.balance)) * 100;
          setToken2({
            ...token2,
            percentage: Math.trunc(perc),
            value: limit,
          });
        } else {
          console.log(4);

          perc = 100;
          setToken2({
            ...token2,
            percentage: Math.trunc(perc),
            value: token2.balance,
          });
        }
        // setToken1({...token1, percentage: ''})
        updateOtherTokenValue(false, perc);
      }
    } else {
      let value;
      if (fromToken) {
        if (balOrLim) {
          console.log(5);
          perc = (Number(limit) / Number(token1.balance)) * 100;
          value = Number(toFixed5(token1.balance * (perc / 100)));
        } else {
          console.log(6);
          value = Number(toFixed5(token1.balance * (perc / 100)));
        }
        setToken1({
          ...token1,
          percentage: String(Math.trunc(perc)),
          value: value.toString(),
        });
        // setToken2({...token2, percentage: ''})
        updateOtherTokenValue(true, value.toString());
      } else {
        if (balOrLim) {
          console.log(7);

          perc = (Number(limit) / Number(token2.balance)) * 100;
          value = Number(toFixed5(token2.balance * (perc / 100)));
        } else {
          console.log(8);

          value = Number(toFixed5(token2.balance * (perc / 100)));
        }
        setToken2({
          ...token2,
          percentage: String(Math.trunc(perc)),
          value: value.toString(),
        });

        // setToken1({...token1, percentage: ''})
        updateOtherTokenValue(false, value.toString());
      }
    }
  }

  async function updateOtherTokenValue(from: boolean, inputAmount: any) {
    if (token1.info && token2.info) {
      if (from) {
        setToken2({ ...token2, loading: true });
        let exchange = await calculateExchange(from, inputAmount);
        if (
          !exchange ||
          (maxExchange.tokens &&
            Number(exchange) > Number(maxExchange.tokens[1]))
        ) {
          const max = maxExchange.tokens[1]
          console.log("resetting 2 to max");
          setToken2({ ...token2, value: max });
          updateOtherTokenValue(false, max);
          setPostExchange(exchange / max);
        } else {
          console.log("setting number 2");
          exchange = Number(toFixed5(exchange));
          setPostExchange(exchange / inputAmount);
          setToken2({ ...token2, value: exchange, loading: false });
          setExactToken(1);
        }
      } else {
        setToken1({ ...token1, loading: true });
        let exchange = await calculateExchange(from, inputAmount);
        console.log("resetting 1 to max");
        if (
          !exchange ||
          (maxExchange.tokens &&
            Number(exchange) > Number(maxExchange.tokens[0]))
        ) {
          const max = maxExchange.tokens[0]
          setToken1({ ...token1, value: max });
          updateOtherTokenValue(false, max);
          setPostExchange(max / exchange || 0);
        } else {
          console.log("setting number 1");

          exchange = Number(toFixed5(exchange || 0));
          setToken1({ ...token1, value: exchange, loading: false });
          setPostExchange(inputAmount / exchange || 0);
          setExactToken(2);
        }
      }
    }
  }

  // This is easily testable, if we someone writes tests for this in the future, it'll be great
  async function calculateExchange(from: boolean, amount: any) {
    try {
      if (!amount) {
        return;
      }
      if (isOCEAN(token1.info.address)) {
        if (from) {
          return await ocean.getDtReceived(token2.info.pool, amount);
        } else {
          return await ocean.getOceanNeeded(token2.info.pool, amount);
        }
      }

      if (isOCEAN(token2.info.address)) {
        if (from) {
          return await ocean.getOceanReceived(token1.info.pool, amount);
        } else {
          return await ocean.getDtNeeded(token1.info.pool, amount);
        }
      }

      if (from) {
        return await ocean.getDtReceivedForExactDt(
          amount.toString(),
          token1.info.pool,
          token2.info.pool
        );
      } else {
        return await ocean.getDtNeededForExactDt(
          amount.toString(),
          token1.info.pool,
          token2.info.pool
        );
      }
    } catch (error) {
      if (maxExchange.tokens) {
        if (from) {
          setToken2({ ...token2, value: maxExchange.tokens[0] });
        } else {
          setToken1({ ...token1, value: maxExchange.tokens[1] });
        }
      }
    }
  }

  function isOCEAN(tokenAddress: string) {
    return (
      tokenAddress.toLowerCase() ===
      ocean.config.default.oceanTokenAddress.toLowerCase()
    );
  }

  async function makeTheSwap() {
    let txReceipt = null;
    let txType;
    let txDateId = null;
    try {
      if (isOCEAN(token1.info.address)) {
        if (exactToken === 1) {
          console.log("exact ocean to dt");
          console.log(
            accountId,
            token2.info.pool.toString(),
            token2.value.toString(),
            token1.value.toString()
          );
          txDateId = addTxHistory({
            chainId,
            setTxHistory,
            txHistory,
            accountId: String(accountId),
            token1,
            token2,
            txType: "Ocean to DT",
            slippage: (Number(slippage) / 100).toString(),
            status: "pending",
          });
          setLastTxId(txDateId);
          txType = "Ocean to DT";

          txReceipt = await ocean.swapExactOceanToDt(
            accountId,
            token2.info.pool.toString(),
            token2.value.toString(),
            token1.value.toString(),
            (Number(slippage) / 100).toString()
          );
        } else {
          console.log("ocean to exact dt");
          console.log(
            accountId,
            token2.info.pool,
            token2.value.toString(),
            token1.value.toString()
          );
          txDateId = addTxHistory({
            chainId,
            setTxHistory,
            txHistory,
            accountId: String(accountId),
            token1,
            token2,
            txType: "Ocean to DT",
            slippage: (Number(slippage) / 100).toString(),
            status: "pending",
          });
          setLastTxId(txDateId);

          txType = "Ocean to DT";

          txReceipt = await ocean.swapExactOceanToDt(
            accountId,
            token2.info.pool,
            token2.value.toString(),
            token1.value.toString(),
            (Number(slippage) / 100).toString()
          );
        }
      } else if (isOCEAN(token2.info.address)) {
        if (exactToken === 1) {
          console.log("exact dt to ocean");
          txDateId = addTxHistory({
            chainId,
            setTxHistory,
            txHistory,
            accountId: String(accountId),
            token1,
            token2,
            txType: "DT to Ocean",
            slippage: (Number(slippage) / 100).toString(),
            status: "pending",
          });
          setLastTxId(txDateId);

          txType = "DT to Ocean";
          txReceipt = await ocean.swapExactDtToOcean(
            accountId,
            token1.info.pool,
            token2.value.toString(),
            token1.value.toString(),
            (Number(slippage) / 100).toString()
          );
        } else {
          //Error: Throws not enough datatokens
          console.log("dt to exact ocean");
          console.log(
            accountId,
            token1.info.pool,
            token2.value.toString(),
            token1.value.toString()
          );
          txDateId = addTxHistory({
            chainId,
            setTxHistory,
            txHistory,
            accountId: String(accountId),
            token1,
            token2,
            txType: "DT to Ocean",
            slippage: (Number(slippage) / 100).toString(),
            status: "pending",
          });
          setLastTxId(txDateId);

          txType = "DT to Ocean";
          txReceipt = await ocean.swapExactDtToOcean(
            accountId,
            token1.info.pool,
            token2.value.toString(),
            token1.value.toString(),
            (Number(slippage) / 100).toString()
          );
        }
      } else {
        if (exactToken === 1) {
          console.log("exact dt to dt");
          console.log(
            accountId,
            token1.info.address,
            token2.info.address,
            token2.value.toString(),
            token1.value.toString(),
            token1.info.pool,
            token2.info.pool,
            config.default.routerAddress,
            (Number(slippage) / 100).toString()
          );

          txDateId = addTxHistory({
            chainId,
            setTxHistory,
            txHistory,
            accountId: String(accountId),
            token1,
            token2,
            txType: "DT to DT",
            slippage: (Number(slippage) / 100).toString(),
            status: "pending",
          });
          setLastTxId(txDateId);

          txType = "DT to DT";
          txReceipt = await ocean.swapExactDtToDt(
            accountId,
            token1.info.address,
            token2.info.address,
            token2.value.toString(),
            token1.value.toString(),
            token1.info.pool,
            token2.info.pool,
            config.default.routerAddress,
            (Number(slippage) / 100).toString()
          );
        } else {
          console.log("dt to exact dt");
          console.log(
            accountId,
            token1.info.address,
            token2.info.address,
            token2.value.toString(),
            token1.value.toString(),
            token1.info.pool,
            token2.info.pool,
            config.default.routerAddress,
            (Number(slippage) / 100).toString()
          );

          txDateId = addTxHistory({
            chainId,
            setTxHistory,
            txHistory,
            accountId: String(accountId),
            token1,
            token2,
            txType: "DT to DT",
            slippage: (Number(slippage) / 100).toString(),
            status: "pending",
          });
          setLastTxId(txDateId);

          txType = "DT to DT";

          txReceipt = await ocean.swapExactDtToDt(
            accountId,
            token1.info.address,
            token2.info.address,
            token2.value.toString(),
            token1.value.toString(),
            token1.info.pool,
            token2.info.pool,
            config.default.routerAddress,
            (Number(slippage) / 100).toString()
          );
        }
      }
      if (txReceipt) {
        setTxReceipt(txReceipt);
        setLastTxUrl(
          config.default.explorerUri + "/tx/" + txReceipt.transactionHash
        );
        addTxHistory({
          chainId,
          setTxHistory,
          txHistory,
          accountId: String(accountId),
          token1,
          token2,
          txType,
          slippage: (Number(slippage) / 100).toString(),
          txDateId,
          txHash: txReceipt.transactionHash,
          status: "indexing",
          txReceipt,
        });
        setToken1(INITIAL_TOKEN_STATE);
        setToken2(INITIAL_TOKEN_STATE);
        setPostExchange(null);
      } else {
        throw new Error("Didn't receive a receipt.");
      }
    } catch (error: any) {
      setShowConfirmModal(false);
      const allNotifications = notifications;
      allNotifications.push({
        type: "alert",
        alert: {
          message: errorMessages(error),
          link: null,
          type: "alert",
        },
      });
      setNotifications([...allNotifications]);
      deleteRecentTxs({
        txDateId,
        setTxHistory,
        txHistory,
        accountId,
        chainId,
      });
    }
  }

  function getConfirmModalProperties(): string[] {
    if (token1.info && token2.info) {
      if (isOCEAN(token1.info.address) || isOCEAN(token2.info.address)) {
        return [
          `Approve TradeX to spend ${token1.value} ${token1.info.symbol}`,
          `Swap ${token1.value} ${token1.info.symbol} for ${token2.value} 
  ${token2.info.symbol}`,
        ];
      } else {
        return [
          `Swap ${token1.value} ${token1.info.symbol} for ${token2.value} 
  ${token2.info.symbol}`,
        ];
      }
    }
    return [];
  }

  function getButtonProperties() {
    if (!accountId) {
      setBtnProps({
        text: "Connect Wallet",
        classes:
          "bg-primary-100 bg-opacity-20 hover:bg-opacity-40 text-background-800",
        disabled: false,
      });
    }

    if (accountId && !(token1.info && token2.info)) {
      setBtnProps({
        text: "Select Tokens",
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
        disabled: true,
      });
    }

    if (
      accountId &&
      token1.info &&
      token2.info &&
      !(token1.value || token2.value)
    ) {
      setBtnProps({
        text: "Enter Token Amount",
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
        disabled: true,
      });
    }

    if (
      accountId &&
      token1.info &&
      token2.info &&
      token1.value &&
      token2.value &&
      token1.balance
    ) {
      if (Number(token1.balance) >= Number(token1.value)) {
        setBtnProps({
          text: "Approve & Swap",
          classes:
            "bg-primary-100 bg-opacity-20 hover:bg-opacity-40 text-background-800",
          disabled: false,
        });
      } else {
        setBtnProps({
          text: `Not Enough ${token1.info.symbol}`,
          classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
          disabled: true,
        });
      }
    }
  }
  return (
    <>
      <div className="flex my-3 w-full h-full items-center justify-center ">
        <div className="max-w-2xl lg:mx-auto sm:mx-4 mx-3 bg-primary-900 w-full rounded-lg p-4 hm-box ">
          <div className="flex justify-between relative">
            <p className="text-xl">{text.T_SWAP}</p>
            <div className="grid grid-flow-col gap-2 items-center">
              <div
                onClick={() => setShowSettings(true)}
                className="hover:bg-primary-700 px-1.5 py-1.5 rounded-lg"
                role="button"
              >
                <MdTune size="24" />
              </div>
            </div>
            {showSettings ? (
              <div className="absolute top-10 right-0 max-w-sm">
                <OutsideClickHandler
                  onOutsideClick={() => {
                    setShowSettings(false);
                  }}
                >
                  <div className="bg-primary-900 rounded-lg p-4 w-full">
                    <p className="text-type-100">Transaction settings</p>
                    <div className="mt-2">
                      <p className="text-type-300 text-sm">
                        Slippage tolerance
                      </p>
                      <div className="grid grid-flow-col gap-2 items-center">
                        <div className="flex justify-between focus:border-secondary-500 bg-primary-700 rounded-lg items-center px-2 py-1">
                          <input
                            type="number"
                            onChange={(e) => setSlippage(e.target.value || "")}
                            value={slippage}
                            className="text-lg bg-primary-700 outline-none rounded-l-lg w-32"
                          />
                          <p className="text-type-200 text-lg">%</p>
                        </div>
                        <div>
                          <Button
                            onClick={() => setSlippage(1)}
                            text="Auto"
                            classes="text-type-300 p-2 bg-primary-800 rounded-lg"
                          />
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
          <SwapInput
            perc={token1.percentage}
            onPerc={(val: string) => updateValueFromPercentage(true, val)}
            otherToken={token2.info ? token2.info.symbol : ""}
            num={token1.value}
            value={token1.info}
            balance={token1.balance}
            title={text.T_SWAP_FROM}
            pos={1}
            setToken={setToken}
            updateNum={(value: string) => {
              if (token1.info && token2.info) {
                let limit;
                let exchangeLimit;

                maxExchange
                  ? (exchangeLimit = maxExchange)
                  : (exchangeLimit = getMaxExchange());

                exchangeLimit.sellLimit
                  ? (limit = exchangeLimit.maxTrade)
                  : (limit = exchangeLimit.tokenNeeded);

                if (Number(value) > Number(limit)) {
                  setToken1({ ...token1, value: limit });
                  updateOtherTokenValue(true, limit);
                } else {
                  setToken1({ ...token1, value });
                  updateOtherTokenValue(true, value);
                }
              }
            }}
            loading={token1.loading}
          />
          <div className="px-4 relative my-12">
            <div
              onClick={() => {
                swapTokens();
              }}
              role="button"
              tabIndex={0}
              className="rounded-full border-black border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex swap-center items-center justify-center"
            >
              <IoSwapVertical size="30" className="text-gray-300" />
            </div>
          </div>
          <SwapInput
            perc={token2.percentage}
            onPerc={(val: string) => updateValueFromPercentage(true, val)}
            otherToken={token1.info ? token1.info.symbol : ""}
            num={token2.value}
            value={token2.info}
            balance={token2.balance}
            title={text.T_SWAP_TO}
            pos={2}
            setToken={setToken}
            updateNum={(value: string) => {
              if (token1.info && token2.info) {
                let limit;
                let exchangeLimit;

                maxExchange
                  ? (exchangeLimit = maxExchange)
                  : (exchangeLimit = getMaxExchange());

                exchangeLimit.sellLimit
                  ? (limit = exchangeLimit.tokenNeeded)
                  : (limit = exchangeLimit.maxTrade);

                if (Number(value) > Number(limit)) {
                  setToken2({ ...token2, value: limit });
                  updateOtherTokenValue(false, limit);
                } else {
                  console.log("Value is less than max buy");

                  setToken2({ ...token2, value });
                  updateOtherTokenValue(false, value);
                }
              }
            }}
            loading={token2.loading}
          />

          {token1.info &&
          token2.info &&
          !Number.isNaN(postExchange) &&
          Number(postExchange) !== 0 ? (
            <div className="my-4 p-2 bg-primary-800 flex justify-between text-type-400 text-sm rounded-lg">
              <p>Exchange rate</p>
              <p>
                1 {token1.info.symbol} ={" "}
                {Number(postExchange).toLocaleString("en", {
                  maximumFractionDigits: 4,
                })}{" "}
                {token2.info.symbol}
              </p>
            </div>
          ) : (
            <></>
          )}

          <div className="mt-4">
            <Button
              text={btnProps.text}
              onClick={() => {
                btnProps.text === "Connect Wallet"
                  ? handleConnect()
                  : setShowConfirmSwapModal(true);
              }}
              classes={"px-4 py-4 rounded-lg w-full " + btnProps.classes}
              disabled={btnProps.disabled}
            />
          </div>
        </div>
      </div>

      <ConfirmSwapModal
        close={() => setShowConfirmSwapModal(false)}
        confirm={() => {
          setShowConfirmSwapModal(false);
          setShowConfirmModal(true);
          makeTheSwap();
        }}
        show={showConfirmSwapModal}
        token1={token1}
        token2={token2}
        postExchange={postExchange}
        slippage={slippage}
      />
      <ConfirmModal
        show={showConfirmModal}
        close={() => setShowConfirmModal(false)}
        txs={getConfirmModalProperties()}
      />
      <TransactionDoneModal
        show={showTxDone}
        txHash={lastTxUrl}
        close={() => setShowTxDone(false)}
      />
    </>
  );
};

export default Swap;
