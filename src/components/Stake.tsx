import { AiOutlinePlus } from "react-icons/ai";
import StakeSelect from "./StakeSelect";
// import PositionBox from "./PositionBox"
import { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import { PulseLoader } from "react-spinners";
import Button, { IBtnProps } from "./Button";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import { Link, useLocation, useHistory } from "react-router-dom";
import getTokenList from "../utils/tokenListUtils";
import UserMessageModal, { userMessage } from "./UserMessageModal";
import { toFixed5, toFixed18 } from "../utils/equate";
import { addTxHistory, deleteRecentTxs } from "../utils/txHistoryUtils";
import { getLocalPoolData, updateSingleStakePool } from "../utils/stakedPoolsUtils";
import usePTxManager from "../hooks/usePTxManager";
import useTxModalToggler from "../hooks/useTxModalToggler";
import errorMessages from "../utils/errorMessages";
import useCurrentPool from "../hooks/useCurrentPool";

const text = {
  T_STAKE: "StakeX",
  T_SELECT_TOKEN: "Select token",
};

interface IPoolLiquidity {
  dtAmount: string;
  oceanAmount: string;
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
  } = useContext(GlobalContext);
  const [token, setToken] = useState<any>(null);
  const [dtToOcean, setDtToOcean] = useState<any>(null);
  const [oceanToDt, setOceanToDt] = useState<any>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [oceanValInput, setOceanValInput] = useState<string | number>("");
  const [oceanValToStake, setOceanValToStake] = useState<string | number>();
  const [txReceipt, setTxReceipt] = useState<any | null>(null);
  const [balance, setBalance] = useState<any>(null);
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
  const [yourLiquidity, setYourLiquidity] = useState<IPoolLiquidity | null>(null);
  const [maxStakeAmt, setMaxStakeAmt] = useState<number>();
  const location = useLocation();
  const history = useHistory();

  //hooks
  usePTxManager(lastTxId);
  useTxModalToggler(txReceipt);
  useCurrentPool(poolAddress, setPoolAddress);

  async function getMaxStakeAmt() {
    if (ocean && token) {
      return await ocean.getMaxStakeAmount(token.pool, ocean.config.default.oceanTokenAddress);
    }
  }

  async function setOceanBalance() {
    if (accountId && ocean) {
      const OCEAN_ADDRESS = ocean.config.default.oceanTokenAddress.toLowerCase();
      setLoading(true);
      try {
        const balance = await ocean.getBalance(OCEAN_ADDRESS, accountId);
        setBalance(balance);
      } catch (error) {
        console.error("Error when trying to fetch Balance");
      }

      setLoading(false);
    }
  }

  useEffect(() => {
    getMaxStakeAmt()
      .then((res: string) => setMaxStakeAmt(Number(res)))
      .catch(console.error);
    setOceanValInput(0);
    setOceanValToStake(0);
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
    setOceanValInput(0);
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
        text: "Select a token",
        disabled: true,
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
      });
    } else if (!oceanValToStake) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Enter OCEAN Amount",
        disabled: true,
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
      });
    } else if (Number(balance) === 0 || Number(oceanValToStake) > Number(balance)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Not enough OCEAN balance",
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
        stakeAmt: oceanValToStake,
      });
      setLastTxId(txDateId);
      const txReceipt = await ocean.stakeOcean(accountId, token.pool, oceanValToStake);

      if (txReceipt) {
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
          stakeAmt: oceanValToStake,
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
        setOceanValInput("");
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
      setOceanValInput("");
    }
  }

  async function setMaxStake() {
    if (!token) return;
    console.log(ocean);
    const maxAmount = await ocean.getMaxStakeAmount(token.pool, ocean.config.default.oceanTokenAddress);
    console.log("Max Stake Amount - ", maxAmount);
    const val = parseFloat(maxAmount);
    if (!Number.isNaN(val)) {
      if (Number(balance) < val) {
        setOceanValInput(toFixed5(balance));
        setOceanValToStake(toFixed18(balance));
      } else {
        setOceanValInput(toFixed5(val - 1));
        setOceanValToStake(toFixed18(val - 1));
      }
    } else {
      //setPerc("");
      setOceanValInput("");
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

  async function updateNum(val: string | number) {
    if (!val) {
      setOceanValToStake(0);
      setOceanValInput("");
      return;
    }
    if (maxStakeAmt) {
      if (maxStakeAmt < val) {
        setOceanValInput(toFixed5(maxStakeAmt));
        setOceanValToStake(toFixed18(maxStakeAmt));
      } else {
        setOceanValInput(toFixed5(val));
        setOceanValToStake(toFixed18(val));
      }
    }
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
      setOceanToDt(res1);
      setDtToOcean(res2);
      const [res4, res5] = await Promise.all([
        ocean.getTokensRemovedforPoolShares(val.pool, String(myPoolShares)),
        ocean.getTokensRemovedforPoolShares(val.pool, String(totalPoolShares)),
      ]);
      setYourLiquidity(res4);
      setPoolLiquidity(res5);
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
                <AiOutlinePlus size="30" className="text-gray-300" />
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
                    {/* <p className="text-xs text-type-100 border-type-300 border rounded-full px-2 py-1 mt-1">Select token</p>           */}
                  </div>
                </div>
                <div className="col-span-3 mt-3 md:mt-0">
                  <div className="h-full w-full rounded-lg bg-primary-900 text-3xl p-2">
                    <div className="flex justify-between items-center">
                      {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
                      <input
                        id="stakeAmtInput"
                        value={oceanValInput}
                        onChange={(e) => updateNum(e.target.value)}
                        onWheel={(event) => event.currentTarget.blur()}
                        onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                        type="number"
                        className="h-full w-full rounded-lg bg-primary-900 text-3xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400"
                        placeholder="0.0"
                      />
                      <div>
                        {balance ? (
                          <p id="oceanBalance" className="text-sm text-type-400 whitespace-nowrap text-right">
                            Balance:{" "}
                            {Number(balance).toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })}
                          </p>
                        ) : (
                          <></>
                        )}
                        {loading ? (
                          <div className="text-center">
                            <PulseLoader color="white" size="4px" margin="5px" />
                          </div>
                        ) : balance ? (
                          <div className="text-sm text-type-300 grid grid-flow-col justify-end gap-2">
                            <Button
                              onClick={() => {
                                setMaxStake();
                              }}
                              id="maxStake"
                              text="Max Stake"
                              classes="px-2 py-0 border border-type-300 rounded-full text-xs"
                            />
                          </div>
                        ) : (
                          <></>
                        )}
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
                  <div>
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
                  <div>
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
                  <div>
                    <p className="text-type-200 text-xs">{toFixed5(yourLiquidity?.oceanAmount)} OCEAN</p>
                    <p className="text-type-200 text-xs">
                      {toFixed5(yourLiquidity?.dtAmount)} {token.symbol}
                    </p>
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
            ? [`Approve StakeX to spend ${oceanValInput} OCEAN`, `Stake ${oceanValInput} OCEAN in ${token.symbol} pool`]
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
