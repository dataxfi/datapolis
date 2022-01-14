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
import { checkNotation, toFixed18, toFixed2, toFixed5 } from "../utils/equate";
// import { program } from "@babel/types"
// import { get } from "https"
import { addTxHistory, deleteRecentTxs } from "../utils/txHistoryUtils";
import useTxModalToggler from "../hooks/useTxModalToggler";
import usePTxManager from "../hooks/usePTxManager";
import errorMessages from "../utils/errorMessages";
import { MoonLoader } from "react-spinners";
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

const INITIAL_MAX_EXCHANGE = {
  maxBuy: null,
  maxSell: null,
  maxPercent: null,
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
  const [maxExchange, setMaxExchange] = useState<any>(INITIAL_MAX_EXCHANGE);

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
    let maxBuy;
    let maxSell;
    let maxPercent;
    if (!isOCEAN(token1.info.address) && !isOCEAN(token2.info.address)) {
      maxSell = await ocean.getMaxExchange(token1.info.pool);
      maxSell = String(Math.floor(Number(maxSell)));

      console.log("Max Sell", maxSell);

      let DtReceivedForMaxSell = await ocean.getDtReceivedForExactDt(
        maxSell,
        token1.info.pool,
        token2.info.pool
      );

      console.log("Dt Received for max sell", DtReceivedForMaxSell);

      maxBuy = await ocean.getMaxExchange(token2.info.pool);
      maxBuy = String(Math.floor(Number(maxBuy)));

      console.log("Max Buy", maxBuy);

      let DtNeededForMaxBuy = await ocean.getDtNeededForExactDt(
        maxBuy,
        token1.info.pool,
        token2.info.pool
      );

      console.log("Dt Needed for max buy", DtNeededForMaxBuy);

      // There are two scenarios that happen at this stage
      // If the Dt received for the maxSell is less than the maxBuy, then the maxSell can be left as is
      // and the maxBuy is set to the the DT received for the max sell

      // If the Dt received for the maxSell is greater than the maxBuy, then the maxSell needs to be set
      // to the Dt needed for the maxBuy, and the max buy can stay as is

      if (Number(DtReceivedForMaxSell) < Number(maxBuy)) {
        console.log("Setting maxBuy to DtReceived for maxSell");

        maxBuy = DtReceivedForMaxSell;
      } else {
        console.log("Setting maxSell to DtNeeded for maxBuy");

        maxSell = DtNeededForMaxBuy;
      }
    } else if (isOCEAN(token2.info.address)) {
      // Case DT to OCEAN

      // Max sell is the max amount of DT that can be traded
      maxSell = await ocean.getMaxExchange(token1.info.pool);
      console.log("Exact max sell:", maxSell);

      // Max buy is the amount of OCEAN bought from max sell
      maxBuy = await calculateExchange(true, maxSell);
    } else {
      // Case OCEAN to DT

      // Max buy is the max amount of DT that can be traded
      maxBuy = await ocean.getMaxExchange(token2.info.pool);
      console.log("Exact max buy:", maxBuy);
      if (maxBuy - Math.floor(Number(maxBuy)) > 0.5) {
        maxBuy = String(Math.floor(Number(maxBuy)));
      } else {
        // maxBuy = String(Math.floor(Number(maxBuy)));
        maxBuy = String(Number(maxBuy) - 0.5);
        console.log(maxBuy);
      }

      //Max sell is the amount of OCEAN sold for maxBuy
      maxSell = await calculateExchange(false, maxBuy);
    }

    //Max percent is the percent of the max sell out of token 1 balance
    //if balance is 0 max percent should be 0
    if (Number(token1.balance) === 0 || !token1.balance) {
      maxPercent = 0;
    } else {
      maxPercent = String((maxSell / token1.balance) * 100);
    }

    //if maxPercent is greater than 100, max buy and sell is determined by the balance of token1
    console.log("Max percent", Number(maxPercent));

    if (Number(maxPercent) > 100) {
      maxPercent = "100";
      if (Number(toFixed5(token1.balance)) > 0.00001) {
        maxSell = toFixed5(token1.balance);
        maxBuy = await calculateExchange(true, maxSell);
      }
    }

    const maxExchange = {
      maxPercent,
      maxBuy: toFixed5(maxBuy),
      maxSell: toFixed5(maxSell),
    };

    console.log("Max Exchange (safe values)", maxExchange);

    return maxExchange;
  }

  useEffect(() => {
    if (token1.info && token2.info) {
      setMaxExchange(INITIAL_MAX_EXCHANGE);
      getMaxExchange().then((res) => {
        setMaxExchange(res);
        if (token1.value && Number(token1.value) > Number(res.maxSell)) {
          setToken1({ ...token1, value: res.maxSell });
          setToken2({ ...token2, value: res.maxBuy });
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
      setToken1({ ...token1, info, balance, value:"" });
      if (updateOther) updateOtherTokenValue(true, "0");
    } else if (pos === 2) {
      setToken2({ ...token2, info, balance, value:""});
      if (updateOther) updateOtherTokenValue(false, "0");
    }
  };

  async function swapTokens() {
    setToken1({ ...token2, value: "" });
    setToken2({ ...token1, value: "" });
    setExactToken(1);
  }

  function updateValueFromPercentage(fromToken: Boolean, value: string) {
    let perc = parseFloat(value);
    if (Number.isNaN(perc)) {
      if (fromToken) {
        setToken1({ ...token1, percentage: "" });
      } else {
        setToken2({ ...token2, percentage: "" });
      }
    } else if (perc > 100) {
      if (fromToken) {
        setToken1({ ...token1, percentage: "100", value: token1.balance });
        setToken2({ ...token2, percentage: "" });
        updateOtherTokenValue(true, 100);
      } else {
        setToken2({ ...token2, percentage: "100", value: token2.balance });
        setToken1({ ...token1, percentage: "" });
        updateOtherTokenValue(false, 100);
      }
    } else {
      // In house calulations need notation checked to avoid E-notation errors
      if (fromToken) {
        const value = checkNotation(
          Number(toFixed5(token1.balance)) * (perc / 100)
        );
        console.log("Value from perc", value);

        setToken1({
          ...token1,
          percentage: String(perc),
          value: value.toString(),
        });
        updateOtherTokenValue(true, value.toString());
      } else {
        const value = checkNotation(
          Number(toFixed5(token2.balance)) * (perc / 100)
        );
        console.log("Value from perc", value);

        setToken2({
          ...token2,
          percentage: String(perc),
          value: value.toString(),
        });
        updateOtherTokenValue(false, value.toString());
      }
    }
  }

  async function updateOtherTokenValue(from: boolean, inputAmount: any) {
    if (token1.info && token2.info) {
      if (from) {
        setToken2({ ...token2, loading: true });
        let exchange = await calculateExchange(from, inputAmount);
        exchange = Number(toFixed5(exchange));
        setPostExchange(exchange / inputAmount);
        setToken2({ ...token2, value: exchange, loading: false });
        setExactToken(1);
      } else {
        setToken1({ ...token1, loading: true });
        let exchange = await calculateExchange(from, inputAmount);
        exchange = Number(toFixed5(exchange || 0));
        setPostExchange(inputAmount / exchange || 0);
        setToken1({ ...token1, value: exchange, loading: false });
        setExactToken(2);
      }
    }
  }

  // This is easily testable, if we someone writes tests for this in the future, it'll be great
  async function calculateExchange(from: boolean, amount: any) {
    try {
      if (!amount) {
        return;
      }
      // OCEAN to DT where amount is either from sell or buy input
      if (isOCEAN(token1.info.address)) {
        if (from) {
          return await ocean.getDtReceived(token2.info.pool, amount);
        } else {
          return await ocean.getOceanNeeded(token2.info.pool, amount);
        }
      }

      // DT to OCEAN where amount is either from sell or buy input
      if (isOCEAN(token2.info.address)) {
        if (from) {
          return await ocean.getOceanReceived(token1.info.pool, amount);
        } else {
          return await ocean.getDtNeeded(token1.info.pool, amount);
        }
      }

      // DT to DT where amount is either from sell or buy input
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
      console.log(error);
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
      console.log("TradeX Caught an Error for Transaction:", txDateId);

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
      !(Number(token1.value) || Number(token2.value))
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
      if (
        Number(toFixed5(token1.balance)) >= Number(token1.value) &&
        Number(toFixed5(token1.balance)) !== 0
      ) {
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
      <div
        id="swapModal"
        className="flex my-3 w-full h-full items-center justify-center "
      >
        <div className="max-w-2xl lg:mx-auto sm:mx-4 mx-3 bg-primary-900 w-full rounded-lg p-4 hm-box ">
          <div className="flex justify-between relative">
            <p className="text-xl">{text.T_SWAP}</p>
            <div className="grid grid-flow-col gap-2 items-center">
              <div
                id="tradeSettingsBtn"
                onClick={() => setShowSettings(true)}
                className="hover:bg-primary-700 px-1.5 py-1.5 rounded-lg"
                role="button"
              >
                <MdTune size="24" />
              </div>
            </div>
            {showSettings ? (
              <div
                id="settingsModal"
                className="absolute top-10 right-0 max-w-sm"
              >
                <OutsideClickHandler
                  onOutsideClick={() => {
                    setShowSettings(false);
                  }}
                >
                  <div className="bg-primary-900 rounded-lg border border-gray-700 p-4 w-full">
                    <p className="text-type-100">Transaction settings</p>
                    <div className="mt-2">
                      <p className="text-type-300 text-sm">
                        Slippage tolerance
                      </p>
                      <div className="grid grid-flow-col gap-2 items-center">
                        <div className="flex justify-between focus:border-secondary-500 bg-primary-700 rounded-lg items-center px-2 py-1">
                          <input
                            id="slippageInput"
                            type="number"
                            onChange={(e) => setSlippage(e.target.value || "")}
                            value={slippage}
                            className="text-lg bg-primary-700 outline-none rounded-l-lg w-32"
                          />
                          <p className="text-type-200 text-lg">%</p>
                        </div>
                        <div>
                          <Button
                            id="autoSlippageBtn"
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
            max={maxExchange.maxSell}
            perc={String(Math.floor(token1.percentage))}
            onPerc={async (val: string) => {
              let exchangeLimit;

              maxExchange.maxPercent
                ? (exchangeLimit = maxExchange)
                : (exchangeLimit = await getMaxExchange());

              const { maxPercent, maxBuy, maxSell } = exchangeLimit;

              if (Number(val) >= Number(maxPercent)) {
                setToken1({
                  ...token1,
                  value: maxSell,
                  percentage: maxPercent,
                });
                setToken2({ ...token2, value: maxBuy });
              } else {
                updateValueFromPercentage(true, val);
              }
            }}
            otherToken={token2.info ? token2.info.symbol : ""}
            num={token1.value}
            value={token1.info}
            balance={token1.balance}
            title={text.T_SWAP_FROM}
            pos={1}
            setToken={setToken}
            updateNum={async (value: string) => {
              //Setting state here allows for max to be persisted in the input
              setToken1({ ...token1, value });
              if (token1.info && token2.info) {
                let exchangeLimit;

                maxExchange.maxSell
                  ? (exchangeLimit = maxExchange)
                  : (exchangeLimit = await getMaxExchange());

                const { maxSell, maxBuy } = exchangeLimit;
                console.log("Value", value, "MaxSell", maxSell);

                if (Number(value) > Number(maxSell)) {
                  console.log("Value > MaxSell");
                  setToken2({ ...token2, value: maxBuy });
                  setToken1({ ...token1, value: maxSell, percentage: 100 });
                } else {
                  const percentage =
                    Number(toFixed5(token1.balance)) === 0
                      ? "100"
                      : (Number(value) / token1.balance) * 100;
                  console.log("Value < MaxSell");
                  setToken1({
                    ...token1,
                    value,
                    percentage,
                  });
                  updateOtherTokenValue(true, value);
                }
              }
            }}
            loading={token1.loading}
          />
          <div className="px-4 relative my-12">
            <div
              id="swapTokensBtn"
              onClick={() => {
                if (token2 && !token2.loading) {
                  swapTokens();
                }
              }}
              role="button"
              tabIndex={0}
              className="rounded-full border-primary-900 border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex swap-center items-center justify-center"
            >
              {token2.loading ? (
                <MoonLoader size={25} color={"white"} />
              ) : (
                <IoSwapVertical size="30" className="text-gray-300" />
              )}
            </div>
          </div>
          <SwapInput
            max={maxExchange.maxBuy}
            perc={token2.percentage}
            onPerc={() => {}}
            otherToken={token1.info ? token1.info.symbol : ""}
            num={token2.value}
            value={token2.info}
            balance={token2.balance}
            title={text.T_SWAP_TO}
            pos={2}
            setToken={setToken}
            updateNum={async (value: string) => {
              //Setting state here allows for max to be persisted in the input
              setToken1({ ...token2, value });
              if (token1.info && token2.info) {
                let exchangeLimit;

                maxExchange.maxBuy
                  ? (exchangeLimit = maxExchange)
                  : (exchangeLimit = await getMaxExchange());

                const { maxBuy, maxSell } = exchangeLimit;

                if (Number(value) > Number(maxBuy)) {
                  console.log("Value > MaxBuy");
                  setToken2({ ...token2, value: maxBuy });
                  setToken1({ ...token1, value: maxSell });
                } else {
                  console.log("Value < MaxBuy");
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
              id="executeTradeBtn"
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
