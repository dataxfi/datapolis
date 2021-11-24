import { AiOutlinePlus } from "react-icons/ai";
import StakeSelect from "./StakeSelect";
// import RemoveAmount from "./RemoveAmount"
// import PositionBox from "./PositionBox"
import { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import { PulseLoader } from "react-spinners";
import Button, { IBtnProps } from "./Button";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import { Link } from "react-router-dom";
// import LiquidityPosition from "./LiquidityPosition"

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
  const { ocean, accountId, chainId, handleConnect } =
    useContext(GlobalContext);
  const [token, setToken] = useState<any>(null);
  const [dtToOcean, setDtToOcean] = useState<any>(null);
  const [oceanToDt, setOceanToDt] = useState<any>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [oceanVal, setOceanVal] = useState("");
  const [poolLiquidity, setPoolLiquidity] = useState<IPoolLiquidity | null>(
    null
  );
  const [yourLiquidity, setYourLiquidity] = useState<IPoolLiquidity | null>(
    null
  );
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmLoader, setShowConfirmLoader] = useState(false);
  const [showTxDone, setShowTxDone] = useState(false);
  const [recentTxHash, setRecentTxHash] = useState("");
  const [perc, setPerc] = useState("");
  const [loadingStake, setLoadingStake] = useState(false);
  const [btnProps, setBtnProps] = useState<IBtnProps>(INITIAL_BUTTON_STATE);

  useEffect(() => {
    async function setOceanBalance() {
      if (accountId && ocean) {
        const OCEAN_ADDRESS =
          ocean.config.default.oceanTokenAddress.toLowerCase();
        setLoading(true);
        try {
          const balance = await ocean.getBalance(OCEAN_ADDRESS, accountId);
          setBalance(balance);
        } catch (error) {
          console.log("Error");
        }

        setLoading(false);
      }
    }

    setOceanBalance();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean, chainId]);

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
    } else if (!oceanVal) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Enter OCEAN Amount",
        disabled: true,
        classes: "bg-gray-800 text-gray-400 cursor-not-allowed",
      });
    } else if (Number(balance) === 0 || Number(oceanVal) > Number(balance)) {
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
        classes:
          "bg-primary-100 bg-opacity-20 hover:bg-opacity-40 text-background-800",
        text: "Stake",
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean, chainId, token, oceanVal, balance, loadingStake]);

  async function stakeX() {
    setLoadingStake(true);
    setShowConfirmLoader(true);
    const txReceipt = await ocean.stakeOcean(accountId, token.pool, oceanVal);
    console.log(txReceipt);
    setShowTxDone(true);
    setRecentTxHash(
      ocean.config.default.explorerUri + "/tx/" + txReceipt.transactionHash
    );
    setShowConfirmLoader(false);
    setLoadingStake(false);
  }

  async function setMaxStake() {
    if (!token) return;
    const maxAmount = await ocean.getMaxAddLiquidity(
      token.pool,
      ocean.config.default.oceanTokenAddress
    );
    console.log("Max Stake Amount - ", maxAmount);
    const val = parseFloat(maxAmount);
    if (!Number.isNaN(val)) {
      setOceanVal((val - 1).toFixed(5));
    } else {
      setPerc("");
      setOceanVal("");
    }
  }
  async function onPerc(val: any) {
    const perc = parseFloat(val);
    if (!Number.isNaN(val)) {
      setPerc(String(perc));
      setOceanVal(((balance * perc) / 100).toFixed(5));
    } else {
      setPerc("");
      setOceanVal("");
    }
  }

  async function updateNum(val: string) {
    setOceanVal(val);
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
      <div className="flex flex-col my-3 w-full items-center justify-center lg:h-3/4">
        <div className="max-w-2xl lg:mx-auto sm:mx-4 mx-3 bg-primary-900 w-full rounded-lg p-4 hm-box ">
          <div className="flex justify-between">
            <p className="text-xl">{text.T_STAKE}</p>
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
                      value={oceanVal}
                      onChange={(e) => updateNum(e.target.value)}
                      onWheel={(event) => event.currentTarget.blur()}
                      onKeyDown={(evt) =>
                        ["e", "E", "+", "-"].includes(evt.key) &&
                        evt.preventDefault()
                      }
                      type="number"
                      className="h-full w-full rounded-lg bg-primary-900 text-3xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400"
                      placeholder="0.0"
                    />
                    <div>
                      {balance ? (
                        <p className="text-sm text-type-400 whitespace-nowrap text-right">
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
                    {Number(oceanToDt).toFixed(5)} OCEAN per {token.symbol}
                  </p>
                  <p className="text-type-200 text-xs">
                    {Number(dtToOcean).toFixed(5)} {token.symbol} per OCEAN
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
                  <p className="text-type-200 text-xs">
                    {Number(poolLiquidity?.oceanAmount).toFixed(5)} OCEAN
                  </p>
                  <p className="text-type-200 text-xs">
                    {Number(poolLiquidity?.dtAmount).toFixed(5)} {token.symbol}
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
                  <p className="text-type-200 text-xs">
                    {Number(yourLiquidity?.oceanAmount).toFixed(5)} OCEAN
                  </p>
                  <p className="text-type-200 text-xs">
                    {Number(yourLiquidity?.dtAmount).toFixed(5)} {token.symbol}
                  </p>
                </div>
              ) : (
                <div> - </div>
              )}
            </div>
          </div>
          <Button
            text={btnProps.text}
            onClick={() => {
              btnProps.text === "Connect wallet" ? handleConnect() : stakeX();
            }}
            classes={"px-4 py-4 rounded-lg w-full mt-4 " + btnProps.classes}
            disabled={btnProps.disabled}
          />
          <div className="pt-3"><Link to="/stakeX/list"  className="text-gray-400 hover:text-gray-100 transition-colors">
            View your liquidity position {">"}
          </Link></div>
          
        </div>
      </div>

      <ConfirmModal
        show={showConfirmLoader}
        close={() => setShowConfirmLoader(false)}
        txs={
          token
            ? [
                `1. Approve StakeX to spend ${oceanVal} OCEAN`,
                `2. Stake ${oceanVal} OCEAN in ${token.symbol} pool`,
              ]
            : []
        }
      />
      <TransactionDoneModal
        show={showTxDone}
        txHash={recentTxHash}
        close={() => setShowTxDone(false)}
      />

      {/* <RemoveAmount />
      <PositionBox /> */}
      {/* <LiquidityPosition /> */}
    </>
  );
};

export default Stake;
