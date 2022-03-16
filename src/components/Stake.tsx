import { AiOutlinePlus } from "react-icons/ai";
import { useState, useContext, useEffect } from "react";
import { GlobalContext, INITIAL_TOKEN_STATE } from "../context/GlobalState";
import { MoonLoader } from "react-spinners";
import Button from "./Button";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import { Link } from "react-router-dom";
import useLiquidityPos from "../hooks/useLiquidityPos";
import BigNumber from "bignumber.js";
import UnlockTokenModal from "./UnlockTokenModal";
import { ITxDetails } from "../utils/types";
import { getAllowance } from "../hooks/useTokenList";
import { IBtnProps } from "../utils/types";
import useAutoLoadToken from "../hooks/useAutoLoadToken";
import TokenSelect from "./TokenSelect";
import PositionBox from "./PositionBox";
import DatasetDescription from "./DatasetDescription";

const INITIAL_BUTTON_STATE = {
  text: "Connect wallet",
  classes: "",
  disabled: false,
};

export default function Stake() {
  const {
    ocean,
    accountId,
    chainId,
    handleConnect,
    showConfirmModal,
    setShowConfirmModal,
    showTxDone,
    setShowTxDone,
    setShowUnlockTokenModal,
    token2,
    setToken2,
    token1,
    setToken1,
    setLastTx,
    lastTx,
    tokensCleared,
    showUnlockTokenModal,
    setSnackbarItem,
    showDescModal,
  } = useContext(GlobalContext);

  const [maxStakeAmt, setMaxStakeAmt] = useState<BigNumber>(new BigNumber(0));
  const [loading, setLoading] = useState(false);
  const [btnProps, setBtnProps] = useState<IBtnProps>(INITIAL_BUTTON_STATE);
  const [recentTxHash, setRecentTxHash] = useState("");
  const [importPool, setImportPool] = useState<string>();

  //hooks
  useLiquidityPos(importPool, setImportPool);
  useAutoLoadToken();

  useEffect(() => {
    if (token1.info && token2.info && tokensCleared.current) {
      getMaxAndAllowance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      return new BigNumber(
        await ocean.getMaxStakeAmount(token2.info.pool || "", ocean.config.default.oceanTokenAddress)
      ).dp(5);
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
          getAllowance(ocean.config.default.oceanTokenAddress, accountId, token2.info.pool || "", ocean).then(
            async (res) => {
              if (!token1.info) return;
              const balance = new BigNumber(await ocean.getBalance(token1.info.address, accountId));
              setToken1({
                ...token1,
                allowance: new BigNumber(res),
                balance,
                value: new BigNumber(0),
              });
            }
          );
      })
      .catch(console.error);
  }

  async function executeStake(preTxDetails: ITxDetails) {
    if (!token2.info || !chainId || !ocean || !accountId) return;
    try {
      setLoading(true);
      console.log(accountId, token2?.info?.pool, token1.value?.toString());
      const txReceipt = await ocean.stakeOcean(accountId, token2.info.pool || "", token1.value?.toString());

      if (txReceipt) {
        setLastTx({ ...preTxDetails, txReceipt, status: "Indexing" });
        setOceanBalance();
        if (token2.info) {
          setImportPool(token2.info.pool);
        }

        setRecentTxHash(ocean.config.default.explorerUri + "/tx/" + txReceipt.transactionHash);
        setShowConfirmModal(false);
      } else {
        throw new Error("Didn't receive a receipt.");
      }
    } catch (error: any) {
      setLastTx({ ...preTxDetails, status: "Failure" });
      setShowConfirmModal(false);
      setSnackbarItem({ type: "error", message: error.message });
      setToken1({ ...token1, value: new BigNumber(0) });
    } finally {
      setLoading(false);
      getMaxAndAllowance();
    }
  }

  async function setMaxStake() {
    if (!token2.info || !ocean) return;
    let maxStake: BigNumber | null;

    if (maxStakeAmt.gt(0)) {
      maxStake = maxStakeAmt;
    } else {
      maxStake = new BigNumber(
        await ocean.getMaxStakeAmount(token2.info.pool || "", ocean.config.default.oceanTokenAddress)
      );
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

  return (
    <>
      <DatasetDescription />
      <div
        className={`absolute top-1/2 left-1/2 transition-transform transform duration-500 ${
          showDescModal ? "translate-x-[10%]" : "-translate-x-1/2"
        } -translate-y-1/2 `}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div>
            <div
              id="stakeModal"
              className="lg:w-107 lg:mx-auto sm:mx-4 mx-3 bg-black bg-opacity-90 rounded-lg p-3 hm-box"
            >
              <TokenSelect
                max={maxStakeAmt}
                otherToken={"OCEAN"}
                pos={2}
                setToken={setToken2}
                token={token2}
                updateNum={() => {}}
              />
              <div className="px-4 relative mt-6 mb-10">
                <div className="rounded-full border-black border-4 absolute -top-7 bg-trade-darkBlue w-12 h-12 flex items-center justify-center swap-center">
                  {loading ? (
                    <MoonLoader size={25} color={"white"} />
                  ) : (
                    <AiOutlinePlus size="30" className="text-gray-300" />
                  )}
                </div>
              </div>
              <TokenSelect
                max={maxStakeAmt}
                otherToken={""}
                pos={1}
                setToken={setToken1}
                token={token1}
                updateNum={(num: string) => {
                  updateNum(num);
                }}
                onMax={setMaxStake}
              />
              <PositionBox loading={loading} setLoading={setLoading} />
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

        {showUnlockTokenModal ? (
          <UnlockTokenModal
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
              setLastTx(preTxDetails);
              executeStake(preTxDetails);
            }}
          />
        ) : (
          <></>
        )}

        <ConfirmModal
          show={showConfirmModal ? showConfirmModal : false}
          close={() => {
            setShowConfirmModal(false);
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
      </div>
    </>
  );
}
