import SwapInput from "./SwapInput";
import { IoSwapVertical } from "react-icons/io5";
import { MdTune } from "react-icons/md";
import { useState, useContext, useEffect } from "react";
import { bgLoadingStates, GlobalContext, removeBgLoadingState } from "../context/GlobalState";
import Button, { IBtnProps } from "./Button";
import OutsideClickHandler from "react-outside-click-handler";
import ConfirmSwapModal from "./ConfirmSwapModal";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";

import { addTxHistory, deleteRecentTxs } from "../utils/txHistoryUtils";
import useTxModalToggler from "../hooks/useTxModalToggler";
import usePTxManager from "../hooks/usePTxManager";
import errorMessages from "../utils/errorMessages";
import { MoonLoader } from "react-spinners";
import BigNumber from "bignumber.js";
import { toFixed5 } from "../utils/equate";
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
interface IToken {
  balance: BigNumber;
  value: BigNumber | string;
  info: any;
  loading: boolean;
  percentage: BigNumber;
}

const INITIAL_TOKEN_STATE: IToken = {
  info: null,
  value: new BigNumber(0),
  balance: new BigNumber(0),
  percentage: new BigNumber(0),
  loading: false,
};

interface IMaxExchange {
  maxBuy: BigNumber;
  maxSell: BigNumber;
  maxPercent: BigNumber;
}

const INITIAL_MAX_EXCHANGE: IMaxExchange = {
  maxBuy: new BigNumber(0),
  maxSell: new BigNumber(0),
  maxPercent: new BigNumber(0),
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
    bgLoading,
    setBgLoading,
  } = useContext(GlobalContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmSwapModal, setShowConfirmSwapModal] = useState(false);
  const [network, setNetwork] = useState(null);
  const [lastTxUrl, setLastTxUrl] = useState("");
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [token1, setToken1] = useState<IToken>(INITIAL_TOKEN_STATE);
  const [token2, setToken2] = useState<IToken>(INITIAL_TOKEN_STATE);
  const [exactToken, setExactToken] = useState<number>(1);
  const [postExchange, setPostExchange] = useState<BigNumber>(new BigNumber(0));
  const [slippage, setSlippage] = useState<BigNumber>(new BigNumber(1));
  //very last transaction
  const [lastTxId, setLastTxId] = useState<any>(null);
  const [btnProps, setBtnProps] = useState<IBtnProps>({
    text: "Select Tokens",
    classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
    disabled: true,
  });
  const [maxExchange, setMaxExchange] = useState<IMaxExchange>(INITIAL_MAX_EXCHANGE);
  const [txsForTPair, setTxsForTPair] = useState<BigNumber>(new BigNumber(2));
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
    let maxBuy: BigNumber;
    let maxSell: BigNumber;
    let maxPercent: BigNumber;
    try {
      if (!isOCEAN(token1.info.address) && !isOCEAN(token2.info.address)) {
        maxSell = new BigNumber(await ocean.getMaxExchange(token1.info.pool)).dp(0);
        console.log("Max Sell", maxSell.toString());

        let DtReceivedForMaxSell: BigNumber = new BigNumber(
          await ocean.getDtReceivedForExactDt(maxSell, token1.info.pool, token2.info.pool)
        );
        console.log("Dt Received for max sell", DtReceivedForMaxSell.toString());

        maxBuy = new BigNumber(await ocean.getMaxExchange(token2.info.pool)).dp(0);
        console.log("Max Buy", maxBuy);

        let DtNeededForMaxBuy: BigNumber = new BigNumber(
          await ocean.getDtNeededForExactDt(maxBuy, token1.info.pool, token2.info.pool)
        );
        console.log("Dt Needed for max buy", DtNeededForMaxBuy.toString());

        // If the Dt received for the maxSell is less than the maxBuy, then the maxSell can be left as is
        // and the maxBuy is set to the the DT received for the max sell
        if (DtReceivedForMaxSell.lt(maxBuy)) {
          console.log("Setting maxBuy to DtReceived for maxSell");
          maxBuy = DtReceivedForMaxSell;
        } else {
          // If the Dt received for the maxSell is greater than the maxBuy, then the maxSell needs to be set
          // to the Dt needed for the maxBuy, and the max buy can stay as is
          console.log("Setting maxSell to DtNeeded for maxBuy");
          maxSell = DtNeededForMaxBuy;
        }
      } else if (isOCEAN(token2.info.address)) {
        // DT to OCEAN
        // Max sell is the max amount of DT that can be traded
        maxSell = new BigNumber(await ocean.getMaxExchange(token1.info.pool));
        console.log("Exact max sell:", maxSell.toString());
        // Max buy is the amount of OCEAN bought from max sell
        maxBuy = new BigNumber(await calculateExchange(true, maxSell));
      } else {
        // OCEAN to DT
        // Max buy is the max amount of DT that can be traded
        maxBuy = new BigNumber(await ocean.getMaxExchange(token2.info.pool));
        console.log("Exact max buy:", maxBuy.toString());
        if (maxBuy.minus(maxBuy.dp(0)).gte(0.05)) {
          maxBuy = maxBuy.dp(0);
        } else {
          maxBuy = maxBuy.minus(0.05);
        }
        //Max sell is the amount of OCEAN sold for maxBuy
        maxSell = await calculateExchange(false, maxBuy);
        console.log("Max Sell:", maxSell, maxSell.toString());
      }

      //Max percent is the percent of the max sell out of token 1 balance
      //if balance is 0 max percent should be 0
      if (token1.balance.eq(0)) {
        maxPercent = new BigNumber(0);
      } else {
        console.log("Max Sell:", maxSell, maxSell.toString());
        maxPercent = maxSell.div(token1.balance).multipliedBy(100);
      }

      //if maxPercent is greater than 100, max buy and sell is determined by the balance of token1
      console.log("Max percent", Number(maxPercent));

      if (maxPercent.gt(100)) {
        maxPercent = new BigNumber(100);
        if (token1.balance.dp(5).lt(0.00001)) {
          maxSell = token1.balance.dp(5);
          maxBuy = await calculateExchange(true, maxSell);
        }
      }

      const maxExchange = {
        maxPercent,
        maxBuy: maxBuy.dp(5),
        maxSell: maxSell.dp(5),
      };
      console.log(
        "Max Buy:",
        maxBuy.toString(),
        "Max Sell:",
        maxSell.toString(),
        "Max Percent:",
        maxPercent.toString()
      );

      return maxExchange;
    } catch (error) {
      console.error(error);
    }

    return INITIAL_MAX_EXCHANGE;
  }

  useEffect(() => {
    if (token1.info && token2.info) {
      setMaxExchange(INITIAL_MAX_EXCHANGE);
      getMaxExchange()
        .then((res) => {
          if (res) {
            setMaxExchange(res);
            if (token1.value && Number(token1.value) > Number(res.maxSell)) {
              setToken1({ ...token1, value: res.maxSell });
              setToken2({ ...token2, value: res.maxBuy });
            }
          }
        })
        .catch(console.error);
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

  const setToken = async (info: Record<any, any>, pos: number) => {
    const balance: BigNumber = new BigNumber(await ocean.getBalance(info.address, accountId));
    if (pos === 1) {
      setToken1({ ...token1, info, balance, value: new BigNumber(0) });
      setToken2({ ...token2, value: new BigNumber(0) });
      // if (updateOther) updateOtherTokenValue(true, "0");
    } else if (pos === 2) {
      setToken2({ ...token2, info, balance, value: new BigNumber(0) });
      setToken1({ ...token1, value: new BigNumber(0) });
      //if (updateOther) updateOtherTokenValue(false, "0");
    }
  };

  async function swapTokens() {
    setToken1({ ...token2, value: new BigNumber(0) });
    setToken2({ ...token1, value: new BigNumber(0) });
    setExactToken(1);
  }

  function updateValueFromPercentage(fromToken: Boolean, value: string) {
    let perc = new BigNumber(value);
    if (perc.isNaN()) {
      setToken1({ ...token1, percentage: new BigNumber(0) });
    } else if (perc.gt(100)) {
      setToken1({ ...token1, percentage: new BigNumber(100), value: token1.balance });
      setToken2({ ...token2, percentage: new BigNumber(0) });
      updateOtherTokenValue(true, new BigNumber(100));
    } else {
      let value: BigNumber = token1.balance.multipliedBy(perc).div(100).dp(5);
      console.log("Value from perc", value.toString());
      setToken1({ ...token1, percentage: perc, value });
      updateOtherTokenValue(true, value);
    }
  }

  async function updateOtherTokenValue(from: boolean, inputAmount: BigNumber) {
    if (token1.info && token2.info) {
      if (from) {
        setToken2({ ...token2, loading: true });
        let exchange = await calculateExchange(from, inputAmount);
        console.log(inputAmount.toString(), exchange.toString());

        setPostExchange(exchange.div(inputAmount));
        setToken2({ ...token2, value: exchange, loading: false });
        setExactToken(1);
      } else {
        setToken1({ ...token1, loading: true });
        let exchange = await calculateExchange(from, inputAmount);
        console.log(inputAmount.toString(), exchange.toString());

        setPostExchange(inputAmount.div(exchange));
        setToken1({ ...token1, value: exchange, loading: false });
        setExactToken(2);
      }
    }
    setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.calcTrade));
  }

  useEffect(() => {
    console.log("Currently loading in bg:", bgLoading, token1.loading, token2.loading);
  }, [bgLoading]);
  // This is easily testable, if we someone writes tests for this in the future, it'll be great
  async function calculateExchange(from: boolean, amount: BigNumber): Promise<BigNumber> {
    try {
      if (amount.isNaN() || amount.eq(0)) {
        return new BigNumber(0);
      }
      // OCEAN to DT where amount is either from sell or buy input
      if (isOCEAN(token1.info.address)) {
        if (from) {
          return new BigNumber(await ocean.getDtReceived(token2.info.pool, amount.dp(18).toString()));
        } else {
          return new BigNumber(await ocean.getOceanNeeded(token2.info.pool, amount.dp(18).toString()));
        }
      }

      // DT to OCEAN where amount is either from sell or buy input
      if (isOCEAN(token2.info.address)) {
        if (from) {
          return new BigNumber(await ocean.getOceanReceived(token1.info.pool, amount.dp(18).toString()));
        } else {
          return new BigNumber(await ocean.getDtNeeded(token1.info.pool, amount.dp(18).toString()));
        }
      }

      // DT to DT where amount is either from sell or buy input
      if (from) {
        return new BigNumber(
          await ocean.getDtReceivedForExactDt(amount.dp(18).toString(), token1.info.pool, token2.info.pool)
        );
      } else {
        return new BigNumber(
          await ocean.getDtNeededForExactDt(amount.dp(18).toString(), token1.info.pool, token2.info.pool)
        );
      }
    } catch (error) {
      console.error(error);
      return new BigNumber(0);
    }
  }

  function isOCEAN(tokenAddress: string) {
    return tokenAddress.toLowerCase() === ocean.config.default.oceanTokenAddress.toLowerCase();
  }

  async function makeTheSwap() {
    let txReceipt = null;
    let txType;
    let txDateId = null;
    let decSlippage = slippage.div(100).dp(5).toString();
    console.log(decSlippage);
    const { t1Val, t2Val } = getTokenVal();
    try {
      if (isOCEAN(token1.info.address)) {
        if (exactToken === 1) {
          console.log("exact ocean to dt");
          console.log(accountId, token2.info.pool.toString(), token2.value.toString(), token1.value.toString());
          // prettier-ignore
          txDateId = addTxHistory({chainId,setTxHistory,txHistory,accountId: String(accountId),token1,token2,txType: "Ocean to DT",slippage: decSlippage,status: "pending",});
          setLastTxId(txDateId);
          txType = "Ocean to DT";

          txReceipt = await ocean.swapExactOceanToDt(accountId, token2.info.pool.toString(), t2Val, t1Val, decSlippage);
        } else {
          console.log("ocean to exact dt");
          // prettier-ignore
          txDateId = addTxHistory({chainId,setTxHistory,txHistory,accountId: String(accountId),token1,token2,txType: "Ocean to DT",slippage: decSlippage,status: "pending",});
          setLastTxId(txDateId);

          txType = "Ocean to DT";

          txReceipt = await ocean.swapExactOceanToDt(accountId, token2.info.pool, t2Val, t1Val, decSlippage);
        }
      } else if (isOCEAN(token2.info.address)) {
        if (exactToken === 1) {
          console.log("exact dt to ocean");
          // prettier-ignore
          txDateId = addTxHistory({chainId,setTxHistory,txHistory,accountId: String(accountId),token1,token2,txType: "DT to Ocean",slippage: decSlippage,status: "pending",});
          setLastTxId(txDateId);

          txType = "DT to Ocean";
          txReceipt = await ocean.swapExactDtToOcean(accountId, token1.info.pool, t2Val, t1Val, decSlippage);
        } else {
          //Error: Throws not enough datatokens
          console.log("dt to exact ocean");
          console.log(accountId, token1.info.pool, token2.value.toString(), token1.value.toString());
          // prettier-ignore
          txDateId = addTxHistory({chainId,setTxHistory,txHistory,accountId: String(accountId),token1,token2,txType: "DT to Ocean",slippage: decSlippage,status: "pending",});
          setLastTxId(txDateId);

          txType = "DT to Ocean";
          txReceipt = await ocean.swapExactDtToOcean(accountId, token1.info.pool, t2Val, t1Val, decSlippage);
        }
      } else {
        if (exactToken === 1) {
          console.log("exact dt to dt");
          // prettier-ignore
          console.log(accountId,token1.info.address,token2.info.address,t2Val,t1Val,token1.info.pool,token2.info.pool,config.default.routerAddress,decSlippage);
          // prettier-ignore
          txDateId = addTxHistory({chainId,setTxHistory,txHistory,accountId: String(accountId),token1,token2,txType: "DT to DT",slippage: decSlippage,status: "pending",});
          setLastTxId(txDateId);
          txType = "DT to DT";
          txReceipt = await ocean.swapExactDtToDt(
            accountId,
            token1.info.address,
            token2.info.address,
            t2Val,
            t1Val,
            token1.info.pool,
            token2.info.pool,
            config.default.routerAddress,
            decSlippage
          );
        } else {
          console.log("dt to exact dt");
          // prettier-ignore
          console.log(accountId,token1.info.address,token2.info.address,t2Val,t1Val,token1.info.pool,token2.info.pool,config.default.routerAddress,decSlippage);
          // prettier-ignore
          txDateId = addTxHistory({chainId,setTxHistory,txHistory,accountId: String(accountId),token1,token2,txType: "DT to DT",slippage: decSlippage,status: "pending",});
          setLastTxId(txDateId);

          txType = "DT to DT";

          txReceipt = await ocean.swapExactDtToDt(
            accountId,
            token1.info.address,
            token2.info.address,
            t2Val,
            t1Val,
            token1.info.pool,
            token2.info.pool,
            config.default.routerAddress,
            decSlippage
          );
        }
      }
      if (txReceipt) {
        setTxReceipt(txReceipt);
        setLastTxUrl(config.default.explorerUri + "/tx/" + txReceipt.transactionHash);
        addTxHistory({
          chainId,
          setTxHistory,
          txHistory,
          accountId: String(accountId),
          token1: { ...token1, value: toFixed5(token1.value) },
          token2: { ...token2, value: toFixed5(token2.value) },
          txType,
          slippage: decSlippage,
          txDateId,
          txHash: txReceipt.transactionHash,
          status: "indexing",
          txReceipt,
        });
        setToken1(INITIAL_TOKEN_STATE);
        setToken2(INITIAL_TOKEN_STATE);
        setPostExchange(new BigNumber(0));
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
  /**
   * Check how many approvals are needed for a transaction.
   */
  async function getNeededApprovals() {
    if (token1.info && token2.info) {
      //if token 1 or 2 is ocean then always 2 txs (always approve t1)
      if (isOCEAN(token1.info.address) || isOCEAN(token2.info.address)) {
        console.log("One of the tokens is ocean, two approvals needed");
        setTxsForTPair(new BigNumber(2));
      } else {
        try {
          console.log("Neither of the tokens are ocean, check if token 1 is approved");
          //if token one is DT and is already approved and token 2 is DT then 1 or 2 txs dpending on t1 approval
          const t1Approved = await ocean.checkIfApproved(
            token1.info.address,
            accountId,
            config.default.routerAddress,
            token1.value
          );
          console.log("response from check if approved:", t1Approved);
          t1Approved ? setTxsForTPair(new BigNumber(1)) : setTxsForTPair(new BigNumber(2));
        } catch (error) {}
      }
    }
  }

  interface ITokenTypes {
    t1Val: string;
    t2Val: string;
    t1BN: BigNumber;
    t2BN: BigNumber;
  }

  function getTokenVal() {
    let t1Val;
    let t2Val;
    typeof token1.value === "string" ? (t1Val = token1.value) : (t1Val = token1.value.dp(5).toString());
    typeof token2.value === "string" ? (t2Val = token1.value) : (t2Val = token2.value.dp(5).toString());
    return { t1Val, t2Val, t1BN: new BigNumber(t1Val), t2BN: new BigNumber(t2Val) } as ITokenTypes;
  }

  function getConfirmModalProperties(): string[] {
    const { t1Val, t2Val } = getTokenVal();
    if (token1.info && token2.info) {
      switch (txsForTPair.toString()) {
        case "1":
          return [
            `Swap ${token1.value} ${token1.info.symbol} for ${t2Val} 
    ${token2.info.symbol}`,
          ];
        case "2":
          return [
            `Approve TradeX to spend ${t1Val} ${token1.info.symbol}`,
            `Swap ${t1Val} ${token1.info.symbol} for ${t2Val} 
  ${token2.info.symbol}`,
          ];
        default:
          return [];
      }
    }
    return [];
  }

  function getButtonProperties() {
    const { t1BN, t2BN } = getTokenVal();
    if (!accountId) {
      setBtnProps({
        text: "Connect Wallet",
        classes: "bg-primary-100 bg-opacity-20 hover:bg-opacity-40 text-background-800",
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

    if ((accountId && token1.info && token2.info && t1BN.eq(0)) || !t2BN.eq(0)) {
      setBtnProps({
        text: "Enter Token Amount",
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
        disabled: true,
      });
    }

    if (accountId && token1.info && token2.info && t1BN.gt(0) && t2BN.gt(0) && token1.balance.gt(0)) {
      if (token1.balance.dp(5).gte(token1.value) && !token1.balance.eq(0)) {
        setBtnProps({
          text: "Approve & Swap",
          classes: "bg-primary-100 bg-opacity-20 hover:bg-opacity-40 text-background-800",
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

  async function dbUpdateToken1(value: string) {
    const bnVal = new BigNumber(value);
    //Setting state here allows for max to be persisted in the input
    setToken1({ ...token1, value: bnVal });
    if (token1.info && token2.info) {
      let exchangeLimit = { ...INITIAL_MAX_EXCHANGE };
      console.log("maxSell exists: ", !!maxExchange.maxSell);

      maxExchange.maxSell ? (exchangeLimit = maxExchange) : (exchangeLimit = await getMaxExchange());

      const { maxSell, maxBuy } = exchangeLimit;

      if (Number(value) > Number(maxSell)) {
        console.log("Value > MaxSell");
        setToken2({ ...token2, value: maxBuy });
        setToken1({ ...token1, value: maxSell, percentage: new BigNumber(100) });
        setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.calcTrade));
      } else {
        const percentage = token1.balance.eq(0)
          ? new BigNumber(100)
          : new BigNumber(bnVal.div(token1.balance).multipliedBy(100));
        console.log("Value < MaxSell");
        setToken1({
          ...token1,
          value: bnVal,
          percentage,
        });
        updateOtherTokenValue(true, bnVal);
      }
    }
  }

  async function onPercToken1(val: string) {
    let bnVal = new BigNumber(val);
    let exchangeLimit;

    maxExchange.maxPercent ? (exchangeLimit = maxExchange) : (exchangeLimit = await getMaxExchange());

    const { maxPercent, maxBuy, maxSell } = exchangeLimit;

    if (bnVal.gte(maxPercent)) {
      setToken1({
        ...token1,
        value: maxSell,
        percentage: maxPercent,
      });
      setToken2({ ...token2, value: maxBuy });
      setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.calcTrade));
    } else {
      updateValueFromPercentage(true, val);
    }
  }

  async function dbUpdateToken2(value: string) {
    const bnVal = new BigNumber(value);
    //Setting state here allows for max to be persisted in the input
    setToken2({ ...token2, value: bnVal });
    if (token1.info && token2.info) {
      let exchangeLimit;

      maxExchange.maxBuy ? (exchangeLimit = maxExchange) : (exchangeLimit = await getMaxExchange());

      const { maxBuy, maxSell } = exchangeLimit;

      if (bnVal.gt(maxBuy)) {
        console.log("Value > MaxBuy");
        setToken2({ ...token2, value: maxBuy });
        setToken1({ ...token1, value: maxSell });
        setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.calcTrade));
      } else {
        console.log("Value < MaxBuy");
        setToken2({ ...token2, value: bnVal });
        updateOtherTokenValue(false, bnVal);
      }
    }
  }

  return (
    <>
      <div id="swapModal" className="flex my-3 w-full h-full items-center justify-center ">
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
              <div id="settingsModal" className="absolute top-10 right-0 max-w-sm">
                <OutsideClickHandler
                  onOutsideClick={() => {
                    setShowSettings(false);
                  }}
                >
                  <div className="bg-primary-900 rounded-lg border border-gray-700 p-4 w-full">
                    <p className="text-type-100">Transaction settings</p>
                    <div className="mt-2">
                      <p className="text-type-300 text-sm">Slippage tolerance</p>
                      <div className="grid grid-flow-col gap-2 items-center">
                        <div className="flex justify-between focus:border-secondary-500 bg-primary-700 rounded-lg items-center px-2 py-1">
                          <input
                            id="slippageInput"
                            type="number"
                            onChange={(e) => setSlippage(new BigNumber(e.target.value))}
                            value={slippage.dp(5).toString()}
                            className="text-lg bg-primary-700 outline-none rounded-l-lg w-32"
                          />
                          <p className="text-type-200 text-lg">%</p>
                        </div>
                        <div>
                          <Button
                            id="autoSlippageBtn"
                            onClick={() => setSlippage(new BigNumber(1))}
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
            perc={token1.percentage}
            onPerc={onPercToken1}
            otherToken={token2.info ? token2.info.symbol : ""}
            num={typeof token1.value === "string" ? token1.value : token1.value.dp(5).toString()}
            value={token1.info}
            balance={token1.balance}
            title={text.T_SWAP_FROM}
            pos={1}
            setToken={setToken}
            loading={token1.loading}
            updateNum={dbUpdateToken1}
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
              {token2.loading || token1.loading || bgLoading.includes(bgLoadingStates.calcTrade) ? (
                <MoonLoader size={25} color={"white"} />
              ) : (
                <IoSwapVertical size="30" className="text-gray-300" />
              )}
            </div>
          </div>
          <SwapInput
            perc={new BigNumber(0)}
            onPerc={() => {}}
            max={maxExchange.maxBuy}
            otherToken={token1.info ? token1.info.symbol : ""}
            num={typeof token2.value === "string" ? token2.value : token2.value.dp(5).toString()}
            value={token2.info}
            balance={token2.balance}
            title={text.T_SWAP_TO}
            pos={2}
            setToken={setToken}
            loading={token2.loading}
            updateNum={dbUpdateToken2}
          />

          {token1.info && token2.info && postExchange.isNaN && postExchange.gt(0) ? (
            <div className="my-4 p-2 bg-primary-800 flex justify-between text-type-400 text-sm rounded-lg">
              <p>Exchange rate</p>
              <p>
                1 {token1.info.symbol} = {postExchange.dp(5).toString()} {`${" "}${token2.info.symbol}`}
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
                if (btnProps.text === "Connect Wallet") {
                  handleConnect();
                } else {
                  setShowConfirmSwapModal(true);
                  getNeededApprovals();
                }
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
        slippage={slippage.dp(0).toString()}
      />
      <ConfirmModal
        show={showConfirmModal}
        close={() => setShowConfirmModal(false)}
        txs={getConfirmModalProperties()}
      />
      <TransactionDoneModal show={showTxDone} txHash={lastTxUrl} close={() => setShowTxDone(false)} />
    </>
  );
};

export default Swap;
