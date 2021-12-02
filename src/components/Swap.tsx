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
import { toFixed } from "../utils/equate";
// import { program } from "@babel/types"
// import { get } from "https"
import { addTxHistory, deleteRecentTxs } from "../utils/useTxHistory";

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
    setLastTxId,
    setShowSnackbar,
    pendingTxs,
    setPendingTxs,
  } = useContext(GlobalContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmSwapModal, setShowConfirmSwapModal] = useState(false);
  const [network, setNetwork] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTxDone, setShowTxDone] = useState(false);
  const [lastTxUrl, setLastTxUrl] = useState("");
  const [token1, setToken1] = useState<any>(INITIAL_TOKEN_STATE);
  const [token2, setToken2] = useState<any>(INITIAL_TOKEN_STATE);
  const [exactToken, setExactToken] = useState<number>(1);
  const [postExchange, setPostExchange] = useState<any>(null);
  const [slippage, setSlippage] = useState<number | string>(1);
  const [btnProps, setBtnProps] = useState<IBtnProps>({
    text: "Select Tokens",
    classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
    disabled: true,
  });
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
    } else if (config) {
      console.log("Known - ", config);
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

  async function swapTokens() {
    setToken1(token2);
    setToken2({ ...token1, loading: true });
    let exchange = await calculateExchange(true, token2.value);
    exchange = Number(toFixed(exchange));
    setPostExchange(exchange / token2.value);
    setToken2({ ...token1, value: exchange, loading: false });
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
        // setToken2({...token2, percentage: ''})
        updateOtherTokenValue(true, 100);
      } else {
        setToken2({ ...token2, percentage: "100", value: token2.balance });
        // setToken1({...token1, percentage: ''})
        updateOtherTokenValue(false, 100);
      }
    } else {
      if (fromToken) {
        const value = Number(toFixed(token1.balance * (perc / 100)));
        setToken1({
          ...token1,
          percentage: String(perc),
          value: value.toString(),
        });
        // setToken2({...token2, percentage: ''})
        updateOtherTokenValue(true, value.toString());
      } else {
        const value = Number(toFixed(token2.balance * (perc / 100)));
        setToken2({
          ...token2,
          percentage: String(perc),
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
        exchange = Number(toFixed(exchange));
        setPostExchange(exchange / inputAmount);
        setToken2({ ...token2, value: exchange, loading: false });
        setExactToken(1);
      } else {
        setToken1({ ...token1, loading: true });
        let exchange = await calculateExchange(from, inputAmount);
        exchange = Number(toFixed(exchange || 0));
        setPostExchange(inputAmount / exchange || 0);
        setToken1({ ...token1, value: exchange, loading: false });
        setExactToken(2);
      }
    }
  }

  // This is easily testable, if we someone writes tests for this in the future, it'll be great
  async function calculateExchange(from: boolean, amount: any) {
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
  }

  function isOCEAN(tokenAddress: string) {
    return (
      tokenAddress.toLowerCase() ===
      ocean.config.default.oceanTokenAddress.toLowerCase()
    );
  }


  async function makeTheSwap() {
    let txReceipt = null;
    let txDateId = null;
    setShowConfirmSwapModal(false);
    setShowConfirmModal(true);
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
            pendingTxs,
            setPendingTxs,
            setShowSnackbar,
            setLastTxId,
          });

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
            pendingTxs,
            setPendingTxs,
            setShowSnackbar,
            setLastTxId,
          });
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
            pendingTxs,
            setPendingTxs,
            setShowSnackbar,
            setLastTxId,
          });

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
            pendingTxs,
            setPendingTxs,
            setShowSnackbar,
            setLastTxId,
          });

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
            pendingTxs,
            setPendingTxs,
            setShowSnackbar,
            setLastTxId,
          });

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
            pendingTxs,
            setPendingTxs,
            setShowSnackbar,
            setLastTxId,
          });

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

        //if (showConfirmModal && txReceipt) {
          setShowConfirmModal(false);
          setShowTxDone(true);
          setLastTxUrl(
            config.default.explorerUri + "/tx/" + txReceipt.transactionHash
          );
        //}

        addTxHistory({
          chainId,
          setTxHistory,
          txHistory,
          accountId: String(accountId),
          token1,
          token2,
          txType: "DT to DT",
          slippage: (Number(slippage) / 100).toString(),
          txDateId,
          txHash: txReceipt.transactionHash,
          status: "indexing",
          pendingTxs,
          setPendingTxs,
          setShowSnackbar,
          setLastTxId,
        });
        setToken1(INITIAL_TOKEN_STATE);
        setToken2(INITIAL_TOKEN_STATE);
        setPostExchange(null);
        console.log(txReceipt);
      } else {
        setShowConfirmModal(false);
        console.log("User rejected transaction, or it failed in someway.");

        deleteRecentTxs({
          txDateId,
          setTxHistory,
          txHistory,
          accountId,
          chainId,
        });
      }
    } catch (error) {
      console.log("User rejected transaction, or it failed in someway.");
      deleteRecentTxs({
        txDateId,
        setTxHistory,
        txHistory,
        accountId,
        chainId,
      });
      setShowConfirmModal(false);
      console.log(error);
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
      <div className="flex my-3 w-full items-center justify-center md:h-3/4">
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
            updateNum={(value: number) => {
              setToken1({ ...token1, value });
              updateOtherTokenValue(true, value);
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
            updateNum={(value: number) => {
              setToken2({ ...token2, value });
              updateOtherTokenValue(false, value);
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
        confirm={() => makeTheSwap()}
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
