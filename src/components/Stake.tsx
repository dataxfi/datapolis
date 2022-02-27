import { AiOutlinePlus } from "react-icons/ai";
import StakeSelect from "./StakeSelect";
import { useState, useContext, useEffect, useRef } from "react";
import { GlobalContext, INITIAL_TOKEN_STATE } from "../context/GlobalState";
import { MoonLoader } from "react-spinners";
import Button from "./Button";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import { Link } from "react-router-dom";
import UserMessage from "./UserMessage";
import { toFixed5 } from "../utils/equate";
import { getLocalPoolData, updateSingleStakePool } from "../utils/stakedPoolsUtils";
import useTxModalToggler from "../hooks/useTxModalToggler";
import errorMessages from "../utils/errorMessages";
import useLiquidityPos from "../hooks/useLiquidityPos";
import BigNumber from "bignumber.js";
import { DebounceInput } from "react-debounce-input";
import WrappedInput from "./WrappedInput";
import UnlockTokenModal from "./UnlockTokenModal";
import { IToken, ITxDetails, IUserMessage } from "../utils/types";
import { getAllowance, getToken } from "../hooks/useTokenList";
import { IPoolLiquidity, IBtnProps } from "../utils/types";
import { getTokenVal, isOCEAN } from "./Swap";
import useAutoLoadToken from "../hooks/useAutoLoadToken";
import useWatchLocation from "../hooks/useWatchLocation";

const INITIAL_BUTTON_STATE = {
  text: "Connect wallet",
  classes: "",
  disabled: false,
};

const Stake = () => {
  const {
    ocean,
    accountId,
    chainId,
    handleConnect,
    txHistory,
    setTxHistory,
    showConfirmModal,
    setShowConfirmModal,
    showTxDone,
    setShowTxDone,
    setAllStakedPools,
    notifications,
    setNotifications,
    setShowUnlockTokenModal,
    token2,
    setToken2,
    token1,
    setToken1,
    web3,
    setLastTx,
    lastTx,
    tokensCleared,
  } = useContext(GlobalContext);
  const [dtToOcean, setDtToOcean] = useState<any>(null);
  const [oceanToDt, setOceanToDt] = useState<any>(null);
  const [txReceipt, setTxReceipt] = useState<any | null>(null);
  const [recentTxHash, setRecentTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [btnProps, setBtnProps] = useState<IBtnProps>(INITIAL_BUTTON_STATE);
  const [userMessage, setUserMessage] = useState<IUserMessage | false>(false);
  //very last transaction
  const [lastTxId, setLastTxId] = useState<any>(null);
  const [poolLiquidity, setPoolLiquidity] = useState<IPoolLiquidity | null>(null);
  const [yourLiquidity, setYourLiquidity] = useState<BigNumber>(new BigNumber(0));
  const [yourShares, setYourShares] = useState<BigNumber>(new BigNumber(0));
  const [maxStakeAmt, setMaxStakeAmt] = useState<BigNumber>(new BigNumber(0));

  //hooks
  // useTxModalToggler(txReceipt, setTxReceipt);
  useLiquidityPos();
  useAutoLoadToken();

  useEffect(() => {
    if (!chainId || !web3 || !ocean || !accountId || !tokensCleared.current) return;
    if (token2.info && !isOCEAN(token2.info.address, ocean)) {
      updateToken(token2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, chainId, web3, ocean, accountId, token2.info, tokensCleared]);

  useEffect(() => {
    if (token1.info && token2.info && tokensCleared.current) {
      getMaxAndAllowance();
    }
  }, [token1.info, token2.info, tokensCleared, accountId]);

  useEffect(() => {
    if (!accountId) {
      setBtnProps(INITIAL_BUTTON_STATE);
    } else if (!token2.info) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Select a Token",
        disabled: true,
      });
    } else if (!token1.value || token1.value.eq(0)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Enter OCEAN Amount",
        disabled: true,
      });
    } else if (token1.balance?.eq(0) || (token1.balance && token1.value.gt(token1.balance))) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Not Enough OCEAN Balance",
        disabled: true,
      });
    } else if (lastTx?.status === "Pending") {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Processing Transaction...",
        disabled: true,
      });
    } else if (token1.value.isLessThan(0.01)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Minimum Stake is .01 OCEAN",
        disabled: true,
      });
    } else if (token1.allowance?.lt(token1.value)) {
      setBtnProps({
        ...btnProps,
        text: "Unlock OCEAN",
        disabled: false,
      });
    } else {
      setBtnProps({
        ...btnProps,
        disabled: false,
        text: "Stake",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean, chainId, token2, token1.value, token1.balance, loading, token1.info, lastTx?.status]);

  async function getMaxStakeAmt() {
    if (token2.info && ocean)
      return new BigNumber(await ocean.getMaxStakeAmount(token2.info.pool, ocean.config.default.oceanTokenAddress)).dp(
        5
      );
  }

  async function setOceanBalance() {
    if (accountId && ocean) {
      const OCEAN_ADDRESS = ocean.config.default.oceanTokenAddress.toLowerCase();
      setLoading(true);
      try {
        const balance = new BigNumber(await ocean.getBalance(OCEAN_ADDRESS, accountId));
        setToken1({ ...token1, balance });
      } catch (error) {
        console.error("Error when trying to fetch Balance");
      } finally {
        setLoading(false);
      }
    }
  }

  async function getMaxAndAllowance() {
    getMaxStakeAmt()
      .then((res: BigNumber | void) => {
        if (res) {
          setMaxStakeAmt(res);
        }
      })
      .then(() => {
        if (token2.info && accountId && chainId && ocean)
          getAllowance(ocean.config.default.oceanTokenAddress, accountId, token2.info.pool, ocean).then(async (res) => {
            if (!token1.info) return;
            const balance = new BigNumber(await ocean.getBalance(token1.info.address, accountId));
            setToken1({
              ...token1,
              allowance: new BigNumber(res),
              balance,
              value: new BigNumber(0)
            });
          });
      })
      .catch(console.error);
  }

  async function executeStake(preTxDetails: ITxDetails) {
    if (!token2.info || !chainId || !txHistory || !ocean || !accountId) return;
    try {
      setLoading(true);
      console.log(accountId, token2?.info?.pool, token1.value?.toString());
      const txReceipt = await ocean.stakeOcean(accountId, token2.info.pool, token1.value?.toString());

      if (txReceipt) {
        setLastTx({ ...preTxDetails, txReceipt, status: "Indexing" });

        setOceanBalance();
        setTxReceipt(txReceipt);
        if (token2.info) {
          const json = JSON.parse(getLocalPoolData(accountId, chainId) || "[]");
          updateSingleStakePool({
            ocean,
            accountId,
            localData: json,
            poolAddress: token2.info.pool,
            setAllStakedPools,
          });
        }

        setRecentTxHash(ocean.config.default.explorerUri + "/tx/" + txReceipt.transactionHash);
        setShowConfirmModal(false);
      } else {
        throw new Error("Didn't receive a receipt.");
      }
    } catch (error: any) {
      setLastTx({ ...preTxDetails, txReceipt, status: "Failure" });
      console.error(error);
      if (notifications) {
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
      }
      setShowConfirmModal(false);
      setToken1({ ...token1, value: new BigNumber(0) });
    } finally {
      setLoading(false);
      getMaxAndAllowance()
    }
  }

  async function setMaxStake() {
    if (!token2.info || !ocean) return;
    let maxStake: BigNumber | null;

    if (maxStakeAmt.gt(0)) {
      maxStake = maxStakeAmt;
    } else {
      maxStake = new BigNumber(await ocean.getMaxStakeAmount(token2.info.pool, ocean.config.default.oceanTokenAddress));
    }
    console.log("Max Stake Amount - ", maxStake.toFixed(18));
    if (maxStake.isNaN()) {
      setToken1({ ...token1, value: new BigNumber(0) });
    } else {
      console.log(2);
      if (token1.balance?.lt(maxStake)) {
        setToken1({ ...token1, value: token1.balance });
      } else {
        setToken1({ ...token1, value: maxStake.dp(5).minus(1) });
      }
    }
  }

  async function updateNum(val: string | BigNumber, max?: BigNumber) {
    //initially set state to value to persist the max if the user continuously tries to enter over the max (or balance)

    setToken1({ ...token1, value: new BigNumber(val) });
    if (!val) {
      setToken1({ ...token1, value: new BigNumber(0) });
      return;
    }
    val = new BigNumber(val);

    if (!max) {
      maxStakeAmt.gt(0) ? (max = maxStakeAmt) : (max = await getMaxStakeAmt());
    }

    if (max) {
      if (token1.balance.lt(val)) {
        setToken1({ ...token1, value: token1.balance.dp(5) });
      } else if (max.minus(1).lt(val)) {
        setToken1({ ...token1, value: max.dp(5).minus(1) });
      } else {
        setToken1({ ...token1, value: new BigNumber(val) });
      }
    }
  }

  async function updateToken(token: IToken) {
    if (!accountId || !ocean) return;
    try {
      if (!token.info?.pool) throw new Error("Pool attribute is missing from token.");
      setLoading(true);
      const { pool } = token.info;
      setToken2(token);
      const [res1, res2, myPoolShares, totalPoolShares] = await Promise.all([
        ocean?.getOceanPerDt(pool),
        ocean?.getDtPerOcean(pool),
        ocean?.getMyPoolSharesForPool(pool, accountId),
        ocean?.getTotalPoolShares(pool),
      ]);
      setYourShares(new BigNumber(myPoolShares));
      setOceanToDt(res1);
      setDtToOcean(res2);

      setYourLiquidity(new BigNumber(await ocean.getOceanRemovedforPoolShares(pool, myPoolShares)));
      const { dtAmount, oceanAmount } = await ocean.getTokensRemovedforPoolShares(pool, String(totalPoolShares));
      setPoolLiquidity({ dtAmount: new BigNumber(dtAmount), oceanAmount: new BigNumber(oceanAmount) });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-full absolute top-0">
      <div className="flex h-full w-full items-center justify-center">
        <div>
          <div
            id="stakeModal"
            className="lg:w-107 lg:mx-auto sm:mx-4 mx-3 bg-black bg-opacity-90 rounded-lg p-3 hm-box"
          >
            <div className="flex justify-between">
              {userMessage && userMessage.type === "error" ? (
                <UserMessage
                  message={userMessage.message}
                  pulse={true}
                  container={false}
                  timeout={{ showState: setUserMessage, time: 5000 }}
                />
              ) : userMessage && userMessage.type === "message" ? (
                <UserMessage message={userMessage.message} pulse={true} container={false} timeout={null} />
              ) : null}
            </div>
            <StakeSelect />
            <div className="px-4 relative mt-6 mb-10">
              <div className="rounded-full border-black border-4 absolute -top-7 bg-trade-darkBlue w-12 h-12 flex items-center justify-center swap-center">
                {loading ? (
                  <MoonLoader size={25} color={"white"} />
                ) : (
                  <AiOutlinePlus size="30" className="text-gray-300" />
                )}
              </div>
            </div>
            <div className="modalSelectBg p-2 rounded-lg">
              <div className="md:grid md:grid-cols-5">
                <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                  <img
                    src="https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY"
                    className="w-10 h-10 rounded-md"
                    alt=""
                  />
                  <div>
                    <p className="text-xs text-type-200">Token</p>
                    <span className="xs:text-sm sm:text-2xl text-type-200 font-bold grid grid-flow-col items-center gap-1">
                      <span className="text-sm sm:text-lg">OCEAN</span>
                    </span>
                  </div>
                </div>
                <div className="col-span-3 mt-3 md:mt-0 bg-black bg-opacity-70 rounded-lg p-1">
                  <div className="flex justify-between items-center">
                    {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
                    <DebounceInput
                      id="stakeAmtInput"
                      debounceTimeout={500}
                      value={token1.value?.toString() || ""}
                      onChange={(e) => updateNum(e.target.value)}
                      onWheel={(event: any) => event.currentTarget.blur()}
                      onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                      type="number"
                      className={`w-full rounded-lg mr-1 bg-black bg-opacity-0 text-2xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400 ${
                        token2 ? "text-white" : "text-gray-500"
                      }`}
                      placeholder="0.0"
                      disabled={!token2}
                      element={WrappedInput}
                    />
                    <div>
                      <p id="oceanBalance" className="text-sm text-type-400 whitespace-nowrap text-right mb-1">
                        Balance: {token1.balance ? token1.balance.dp(3).toString() : "-"}
                      </p>

                      <div className="text-sm text-type-300 grid grid-flow-col justify-end gap-2">
                        <Button
                          onClick={() => {
                            setMaxStake();
                          }}
                          id="maxStake"
                          text="Max Stake"
                          classes={`px-2 py-0 lg:w-20 border rounded-full text-xs ${
                            token1.balance.isNaN() || token1.balance.eq(0) || !accountId || !token2.info
                              ? "text-gray-600 border-gray-600"
                              : "border-type-300 hover:bg-primary-600"
                          }`}
                          disabled={token1.balance && accountId && token2.info ? false : true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border border-type-600 mt-4 rounded-lg p-2 w-full">
              <div className="my-1 mr-4">
                <p className="text-type-300 text-xs">Swap Rate</p>
                {token2.info && oceanToDt && dtToOcean && !loading ? (
                  <div id="swapRate">
                    <p className="text-type-200 text-xs">
                      {toFixed5(oceanToDt)} OCEAN per {token2.info.symbol}
                    </p>
                    <p className="text-type-200 text-xs">
                      {toFixed5(dtToOcean)} {token2.info.symbol} per OCEAN
                    </p>
                  </div>
                ) : (
                  <div> - </div>
                )}
              </div>
              <div className="my-1 mr-4">
                <p className="text-type-300 text-xs">Pool liquidity</p>
                {token2.info && poolLiquidity && !loading ? (
                  <div id="poolLiquidity">
                    <p className="text-type-200 text-xs">{toFixed5(poolLiquidity?.oceanAmount)} OCEAN</p>
                    <p className="text-type-200 text-xs">
                      {toFixed5(poolLiquidity?.dtAmount)} {token2.info.symbol}
                    </p>
                  </div>
                ) : (
                  <div> - </div>
                )}
              </div>
              <div className="my-1">
                <p className="text-type-300 text-xs">Your liquidity</p>
                {token2.info && yourLiquidity && !loading ? (
                  <div id="yourLiquidity">
                    <p className="text-type-200 text-xs">{yourShares.dp(5).toString()} Shares</p>
                    <p className="text-type-200 text-xs">{yourLiquidity.dp(5).toString()} OCEAN</p>
                  </div>
                ) : (
                  <div> - </div>
                )}
              </div>
            </div>
            <Button
              id="executeStake"
              text={btnProps.text}
              onClick={() => {
                if (btnProps.text === "Connect wallet" || !accountId) {
                  handleConnect();
                } else {
                  if (token1.allowance?.lt(token1.value)) {
                    const preTxDetails: ITxDetails = {
                      accountId,
                      status: "Pending",
                      token1,
                      token2,
                      txDateId: Date.now().toString(),
                      txType: "approve",
                    };
                    console.log(token1);
                    setLastTx(preTxDetails);
                    setShowUnlockTokenModal(true);
                  } else {
                    setShowConfirmModal(true);
                    const preTxDetails: ITxDetails = {
                      accountId,
                      status: "Pending",
                      token1,
                      token2,
                      txDateId: Date.now().toString(),
                      txType: "stake",
                    };

                    setLastTx(preTxDetails);
                    executeStake(preTxDetails);
                  }
                }
              }}
              classes="p-2 rounded-lg w-full mt-4 txButton"
              disabled={btnProps.disabled}
            />
          </div>
          <div className="pt-3 pl-6 lg:pl-3">
            <Link id="lpLink" to="/stake/list" className="text-gray-300 hover:text-gray-100 transition-colors">
              View your stake positions {">"}
            </Link>
          </div>
        </div>
      </div>

      <UnlockTokenModal
        setToken={setToken1}
        nextFunction={() => {
          setShowConfirmModal(true);
          if (!accountId) return;
          const preTxDetails: ITxDetails = {
            accountId,
            status: "Pending",
            token1,
            token2,
            txDateId: Date.now().toString(),
            txType: "stake",
          };
          executeStake(preTxDetails);
        }}
      />

      <ConfirmModal
        show={showConfirmModal ? showConfirmModal : false}
        close={() => {
          if (setShowConfirmModal) setShowConfirmModal(false);
        }}
        txs={token2.info ? [`Stake ${token1.value?.toString()} OCEAN in ${token2.info.symbol} pool`] : []}
      />

      <TransactionDoneModal
        show={showTxDone ? showTxDone : false}
        txHash={recentTxHash}
        close={() => {
          setShowTxDone(false);
          setToken2(INITIAL_TOKEN_STATE);
          setToken1({ ...token1, value: new BigNumber(0) });
        }}
      />

      {userMessage && userMessage.type === "alert" ? (
        <UserMessage
          message={userMessage}
          pulse={false}
          container={false}
          timeout={{ showState: setUserMessage, time: 5000 }}
        />
      ) : null}
      {/* <PositionBox />  */}
    </div>
  );
};

export default Stake;
