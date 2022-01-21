import { AiOutlinePlus } from "react-icons/ai";
import StakeSelect from "./StakeSelect";
// import PositionBox from "./PositionBox"
import { useState, useContext, useEffect } from "react";
import { bgLoadingStates, GlobalContext, removeBgLoadingState } from "../context/GlobalState";
import { MoonLoader, PulseLoader } from "react-spinners";
import Button, { IBtnProps } from "./Button";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import { Link, useLocation, useHistory } from "react-router-dom";
import getTokenList from "../utils/tokenUtils";
import UserMessageModal, { userMessage } from "./UserMessageModal";
import { toFixed5, toFixed18 } from "../utils/equate";
import { addTxHistory, deleteRecentTxs } from "../utils/txHistoryUtils";
import { getLocalPoolData, updateSingleStakePool } from "../utils/stakedPoolsUtils";
import usePTxManager from "../hooks/usePTxManager";
import useTxModalToggler from "../hooks/useTxModalToggler";
import errorMessages from "../utils/errorMessages";
import useCurrentPool from "../hooks/useCurrentPool";
import BigNumber from "bignumber.js";
import { DebounceInput } from "react-debounce-input";
import WrappedInput from "./WrappedInput";
const text = {
  T_STAKE: "StakeX",
  T_SELECT_TOKEN: "Select token",
};

interface IPoolLiquidity {
  dtAmount: BigNumber;
  oceanAmount: BigNumber;
}

const INITIAL_BUTTON_STATE = {
  text: "Connect wallet",
  classes: "bg-gray-800 text-gray-400",
  disabled: false,
};

const Stake = () => {
  const {
    ocean,
    accountId,
    chainId,
    handleConnect,
    currentTokens,
    currentStakeToken,
    web3,
    setTokenResponse,
    setCurrentTokens,
    txHistory,
    setTxHistory,
    showConfirmModal,
    setShowConfirmModal,
    showTxDone,
    setShowTxDone,
    setAllStakedPools,
    notifications,
    setNotifications,
    bgLoading,
    setBgLoading,
  } = useContext(GlobalContext);
  const [token, setToken] = useState<any>(null);
  const [dtToOcean, setDtToOcean] = useState<any>(null);
  const [oceanToDt, setOceanToDt] = useState<any>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  //value in input field (to 5 decimal)
  // const [oceanValInput, setOceanValInput] = useState<string | null>(null);
  //value stored from input (to 18 decimal)
  const [oceanValToStake, setOceanValToStake] = useState<BigNumber>(new BigNumber(0));
  const [txReceipt, setTxReceipt] = useState<any | null>(null);
  const [balance, setBalance] = useState<BigNumber>(new BigNumber(0));
  const [loading, setLoading] = useState(false);
  const [loadingStake, setLoadingStake] = useState(false);
  const [recentTxHash, setRecentTxHash] = useState("");
  const [btnProps, setBtnProps] = useState<IBtnProps>(INITIAL_BUTTON_STATE);
  const [userMessage, setUserMessage] = useState<userMessage | false>(false);
  const [poolAddress, setPoolAddress] = useState<string>("");
  //very last transaction
  const [lastTxId, setLastTxId] = useState<any>(null);
  const [oceanToken, setOceanToken] = useState<any>({
    symbol: "OCEAN",
    name: "Ocean Token",
    decimals: 18,
    logoURI: "https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY",
    tags: ["oceantoken"],
  });
  //const [perc, setPerc] = useState("");
  const [poolLiquidity, setPoolLiquidity] = useState<IPoolLiquidity | null>(null);
  const [yourLiquidity, setYourLiquidity] = useState<BigNumber>(new BigNumber(0));
  const [yourShares, setYourShares] = useState<BigNumber>(new BigNumber(0));
  const [maxStakeAmt, setMaxStakeAmt] = useState<BigNumber>(new BigNumber(0));
  const location = useLocation();
  const history = useHistory();

  //hooks
  usePTxManager(lastTxId);
  useTxModalToggler(txReceipt);
  useCurrentPool(poolAddress, setPoolAddress);

  async function getMaxStakeAmt() {
    return new BigNumber(await ocean.getMaxStakeAmount(token.pool, ocean.config.default.oceanTokenAddress)).dp(5);
  }

  async function setOceanBalance() {
    if (accountId && ocean) {
      const OCEAN_ADDRESS = ocean.config.default.oceanTokenAddress.toLowerCase();
      setLoading(true);
      try {
        const balance = new BigNumber(await ocean.getBalance(OCEAN_ADDRESS, accountId));
        setBalance(balance);
      } catch (error) {
        console.error("Error when trying to fetch Balance");
      }

      setLoading(false);
    }
  }

  useEffect(() => {
    if (ocean && token) {
      getMaxStakeAmt()
        .then((res: BigNumber) => {
          setMaxStakeAmt(res);
          if (oceanValToStake?.gt(1)) {
            updateNum(oceanValToStake, res);
          }
        })
        .catch(console.error);
    }
    // setOceanValInput(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, token]);

  useEffect(() => {
    if (ocean)
      setOceanToken({
        ...oceanToken,
        chainId: chainId,
        address: ocean.config.default.oceanTokenAddress,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, currentTokens]);

  // custom hook??
  useEffect(() => {
    if (txReceipt) {
      console.log("A succesful txReceipt has been set in StakeX\n", txReceipt);
      if (showConfirmModal) {
        setShowConfirmModal(false);
        setShowTxDone(true);
      }
    }
    setOceanBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txReceipt]);

  useEffect(() => {
    setToken(null);
    setOceanValToStake(new BigNumber(0));
    // setOceanValInput(null);
    getTokenList({
      chainId,
      web3,
      setTokenResponse,
      setCurrentTokens,
      accountId,
      otherToken: oceanToken.symbol,
    });

    setOceanBalance();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean, chainId]);

  useEffect(() => {
    // regular expresssions and URLSearchParams are not supported IE
    const queryParams = new URLSearchParams(location.search);
    const poolAddress = queryParams.get("pool");

    if (poolAddress && accountId) {
      setUserMessage({
        type: "message",
        message: (
          <p>
            Loading your token <PulseLoader color="gray" size="4px" margin="3px" />
          </p>
        ),
        link: null,
      });
    }

    if (accountId && currentTokens) {
      if (currentStakeToken) {
        updateToken(currentStakeToken);
        setUserMessage(false);
      } else if (poolAddress && currentTokens.length > 0) {
        const currentToken = currentTokens.find((token: { pool: string }) => token.pool === poolAddress);
        if (!currentToken) {
          setUserMessage({
            type: "error",
            message: "Couldn't preload token",
            link: null,
          });
          history.push("/stakeX");
        } else {
          updateToken(currentToken);
          setUserMessage(false);
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTokens, accountId]);

  useEffect(() => {
    if (!loadingStake) {
      updateToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingStake]);

  useEffect(() => {
    if (!accountId) {
      setBtnProps(INITIAL_BUTTON_STATE);
    } else if (!token) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Select a Token",
        disabled: true,
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
      });
    } else if (!oceanValToStake || oceanValToStake.eq(0)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Enter OCEAN Amount",
        disabled: true,
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
      });
    } else if (balance?.eq(0) || (balance && oceanValToStake.gt(balance))) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Not Enough OCEAN Balance",
        disabled: true,
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
      });
    } else if (loadingStake) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Processing Transaction...",
        disabled: true,
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
      });
    } else if (oceanValToStake.isLessThan(0.01)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Minimum Stake is .01 OCEAN",
        disabled: true,
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
      });
    } else {
      setBtnProps({
        disabled: false,
        classes: "bg-primary-100 bg-opacity-20 hover:bg-opacity-40 text-background-800",
        text: "Stake",
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean, chainId, token, oceanValToStake, balance, loadingStake]);

  async function stakeX() {
    let txDateId;

    try {
      setLoadingStake(true);
      txDateId = addTxHistory({
        chainId,
        setTxHistory,
        txHistory,
        accountId: String(accountId),
        token1: token,
        token2: oceanToken,
        txType: "stake",
        status: "pending",
        stakeAmt: oceanValToStake?.toFixed(5),
      });
      setLastTxId(txDateId);
      const txReceipt = await ocean.stakeOcean(accountId, token.pool, oceanValToStake?.toString());

      if (txReceipt) {
        setOceanValToStake(new BigNumber(0));
        setTxReceipt(txReceipt);
        addTxHistory({
          chainId,
          setTxHistory,
          txHistory,
          accountId: String(accountId),
          token1: token,
          token2: oceanToken,
          txType: "stake",
          txDateId,
          txHash: txReceipt.transactionHash,
          status: "indexing",
          stakeAmt: oceanValToStake?.toFixed(5),
          txReceipt,
        });

        updateSingleStakePool({
          ocean,
          accountId,
          localData: JSON.parse(getLocalPoolData(accountId, chainId) || "") || [],
          poolAddress: token.pool,
          setAllStakedPools,
        });

        setRecentTxHash(ocean.config.default.explorerUri + "/tx/" + txReceipt.transactionHash);
        setLoadingStake(false);
        setShowConfirmModal(false);
        // setOceanValInput(null);
      } else {
        throw new Error("Didn't receive a receipt.");
      }
    } catch (error: any) {
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
      setLoadingStake(false);
      setShowConfirmModal(false);
      // setOceanValInput(null);
      setOceanValToStake(new BigNumber(0));
    }
  }

  async function setMaxStake() {
    if (!token) return;
    console.log(ocean);
    let maxStake: BigNumber | null;
    maxStakeAmt
      ? (maxStake = maxStakeAmt)
      : (maxStake = new BigNumber(await ocean.getMaxStakeAmount(token.pool, ocean.config.default.oceanTokenAddress)));
    console.log("Max Stake Amount - ", maxStake.toFixed(18));
    if (maxStake.isNaN()) {
      setOceanValToStake(new BigNumber(0));
    } else {
      console.log(2);
      if (balance?.lt(maxStake)) {
        setOceanValToStake(balance.dp(5));
      } else {
        setOceanValToStake(maxStake.dp(5).minus(1));
      }
    }
  }

  // async function onPerc(val: any) {
  //   const perc = parseFloat(val);
  //   if (!Number.isNaN(val)) {
  //     setPerc(String(perc));
  //     setOceanVal(toFixed((balance * perc) / 100));
  //   } else {
  //     setPerc("");
  //     setOceanVal("");
  //   }
  // }

  async function updateNum(val: string | BigNumber, max?: BigNumber) {
    //initially set state to value to persist the max if the user continuously tries to enter over the max (or balance)
    setOceanValToStake(new BigNumber(val));
    if (!val) {
      setOceanValToStake(new BigNumber(0));
      return;
    }
    val = new BigNumber(val);

    if (!max) {
      maxStakeAmt.gt(0) ? (max = maxStakeAmt) : (max = await getMaxStakeAmt());
    }

    if (max) {
      if (balance.lt(val)) {
        setOceanValToStake(balance.dp(5));
      } else if (max.minus(1).lt(val)) {
        setOceanValToStake(max.dp(5).minus(1));
      } else {
        setOceanValToStake(val);
      }
    }
    setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.calcTrade));
  }

  async function updateToken(val: any) {
    setToken(val);
    if (val) {
      setLoadingRate(true);
      const [res1, res2, myPoolShares, totalPoolShares] = await Promise.all([
        ocean.getOceanPerDt(val.pool),
        ocean.getDtPerOcean(val.pool),
        ocean.getMyPoolSharesForPool(val.pool, accountId),
        ocean.getTotalPoolShares(val.pool),
      ]);
      setYourShares(new BigNumber(myPoolShares));
      setOceanToDt(res1);
      setDtToOcean(res2);

      setYourLiquidity(new BigNumber(await ocean.getOceanRemovedforPoolShares(val.pool, myPoolShares)));
      setPoolLiquidity(await ocean.getTokensRemovedforPoolShares(val.pool, String(totalPoolShares)));
      setLoadingRate(false);
    }
  }

  return (
    <>
      <div className="flex flex-col my-3 w-full items-center justify-center lg:h-3/4 px-4">
        <div>
          <div className="max-w-2xl lg:mx-auto bg-primary-900 w-full rounded-lg p-4 phm-box ">
            <div className="flex justify-between">
              <p className="text-xl">{text.T_STAKE}</p>
              {userMessage && userMessage.type === "error" ? (
                <UserMessageModal
                  message={userMessage.message}
                  pulse={true}
                  container={false}
                  timeout={{ showState: setUserMessage, time: 5000 }}
                />
              ) : userMessage && userMessage.type === "message" ? (
                <UserMessageModal message={userMessage.message} pulse={true} container={false} timeout={null} />
              ) : null}
            </div>
            <StakeSelect
              value={token}
              setToken={(val: any) => {
                updateToken(val);
              }}
            />
            <div className="px-4 relative my-12">
              <div className="rounded-full border-primary-900 border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center swap-center">
                {loading ? (
                  <MoonLoader size={25} color={"white"} />
                ) : (
                  <AiOutlinePlus size="30" className="text-gray-300" />
                )}
              </div>
            </div>
            <div className="mt-4 bg-primary-800 p-4 rounded-lg">
              <div className="md:grid md:grid-cols-5">
                <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                  <img
                    src="https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY"
                    className="w-14 h-14 rounded-md"
                    alt=""
                  />
                  <div>
                    <p className="text-xs text-type-200">Token</p>
                    <span className="xs:text-sm sm:text-2xl text-type-200 font-bold grid grid-flow-col items-center gap-1">
                      <span className="text-sm sm:text-lg">OCEAN</span>
                    </span>
                  </div>
                </div>
                <div className="col-span-3 mt-3 md:mt-0">
                  <div className="h-full w-full rounded-lg bg-primary-900 text-3xl p-2">
                    <div className="flex justify-between items-center">
                      {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
                      <DebounceInput
                        id="stakeAmtInput"
                        debounceTimeout={500}
                        value={oceanValToStake?.toString() || ""}
                        onChange={(e) => updateNum(e.target.value)}
                        onWheel={(event: any) => event.currentTarget.blur()}
                        onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                        type="number"
                        className={`h-full w-full rounded-lg bg-primary-900 text-3xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400 ${
                          token ? "text-white" : "text-gray-500"
                        }`}
                        placeholder="0.0"
                        disabled={!token}
                        element={WrappedInput}
                      />
                      <div>
                        <p id="oceanBalance" className="text-sm text-type-400 whitespace-nowrap text-right">
                          Balance: {balance ? balance.toFixed(3) : "-"}
                        </p>

                        <div className="text-sm text-type-300 grid grid-flow-col justify-end gap-2">
                          <Button
                            onClick={() => {
                              setMaxStake();
                            }}
                            id="maxStake"
                            text="Max Stake"
                            classes={`px-2 py-0 lg:w-20 border rounded-full text-xs ${
                              balance?.isNaN() || balance?.eq(0) || !accountId
                                ? "text-gray-600 border-gray-600"
                                : "border-type-300"
                            }`}
                            disabled={balance && accountId ? false : true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 border border-type-600 mt-4 rounded-lg p-2 justify-center">
              <div className="my-1">
                <p className="text-type-300 text-xs">Swap Rate</p>
                {token && oceanToDt && dtToOcean && !loadingRate ? (
                  <div id="swapRate">
                    <p className="text-type-200 text-xs">
                      {toFixed5(oceanToDt)} OCEAN per {token.symbol}
                    </p>
                    <p className="text-type-200 text-xs">
                      {toFixed5(dtToOcean)} {token.symbol} per OCEAN
                    </p>
                  </div>
                ) : (
                  <div> - </div>
                )}
              </div>
              <div className="my-1">
                <p className="text-type-300 text-xs">Pool liquidity</p>
                {token && poolLiquidity && !loadingRate ? (
                  <div id="poolLiquidity">
                    <p className="text-type-200 text-xs">{toFixed5(poolLiquidity?.oceanAmount)} OCEAN</p>
                    <p className="text-type-200 text-xs">
                      {toFixed5(poolLiquidity?.dtAmount)} {token.symbol}
                    </p>
                  </div>
                ) : (
                  <div> - </div>
                )}
              </div>
              <div className="my-1">
                <p className="text-type-300 text-xs">Your liquidity</p>
                {token && yourLiquidity && !loadingRate ? (
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
                if (btnProps.text === "Connect wallet") {
                  handleConnect();
                }
                {
                  setShowConfirmModal(true);
                  stakeX();
                }
              }}
              classes={"px-4 py-4 rounded-lg w-full mt-4 " + btnProps.classes}
              disabled={btnProps.disabled}
            />
          </div>
          <div className="pt-3 pl-3">
            <Link id="lpLink" to="/stakeX/list" className="text-gray-300 hover:text-gray-100 transition-colors">
              View your stake positions {">"}
            </Link>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={showConfirmModal}
        close={() => setShowConfirmModal(false)}
        txs={
          token
            ? [
                `Approve StakeX to spend ${oceanValToStake?.decimalPlaces(5).toString()} OCEAN`,
                `Stake ${oceanValToStake?.decimalPlaces(5).toString()} OCEAN in ${token.symbol} pool`,
              ]
            : []
        }
      />
      <TransactionDoneModal show={showTxDone} txHash={recentTxHash} close={() => setShowTxDone(false)} />

      {userMessage && userMessage.type === "alert" ? (
        <UserMessageModal
          message={userMessage}
          pulse={false}
          container={false}
          timeout={{ showState: setUserMessage, time: 5000 }}
        />
      ) : null}
      {/* <PositionBox />  */}
    </>
  );
};

export default Stake;
