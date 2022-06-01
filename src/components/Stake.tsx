import { AiOutlinePlus } from 'react-icons/ai';
import { useState, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { MoonLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import useLiquidityPos from '../hooks/useLiquidityPos';
import BigNumber from 'bignumber.js';
import { ITxDetails, IBtnProps } from '../utils/types';
import { getAllowance } from '../hooks/useTokenList';
import useAutoLoadToken from '../hooks/useAutoLoadToken';
import TokenSelect from './TokenSelect';
import PositionBox from './PositionBox';
import DatasetDescription from './DTDescriptionModal';
import ViewDescBtn from './ViewDescButton';
import { transactionTypeGA } from '../context/Analytics';
import useClearTokens from '../hooks/useClearTokens';
import useTxHandler from '../hooks/useTxHandler';
import TxSettings from './TxSettings';
import useCalcSlippage from '../hooks/useCalcSlippage';

const INITIAL_BUTTON_STATE = {
  text: 'Connect wallet',
  classes: '',
  disabled: false,
};

export default function Stake() {
  const {
    ocean,
    accountId,
    chainId,
    setConfirmingTx,
    setShowUnlockTokenModal,
    tokenOut,
    setTokenOut,
    tokenIn,
    setTokenIn,
    setLastTx,
    lastTx,
    tokensCleared,
    setSnackbarItem,
    showDescModal,
    executeStake,
    setExecuteStake,
    setBlurBG,
    showUnlockTokenModal,
    setShowConfirmTxDetails,
  } = useContext(GlobalContext);

  const [maxStakeAmt, setMaxStakeAmt] = useState<BigNumber>(new BigNumber(0));
  const [postExchange, setPostExchange] = useState<BigNumber>(new BigNumber(0));
  const [sharesReceived, setSharesReceived] = useState<BigNumber>(new BigNumber(0));
  const [loading, setLoading] = useState(false);
  const [btnProps, setBtnProps] = useState<IBtnProps>(INITIAL_BUTTON_STATE);
  const [importPool, setImportPool] = useState<string>();

  // hooks
  useLiquidityPos(importPool, setImportPool);
  useAutoLoadToken();
  useClearTokens();
  useTxHandler(stake, executeStake, setExecuteStake, { shares: sharesReceived, postExchange });
  useCalcSlippage(sharesReceived);

  useEffect(() => {
    if (!tokensCleared.current) return;
    if (tokenIn.info && tokenOut.info) {
      getMaxAndAllowance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenIn.info, tokenOut.info, tokensCleared, accountId]);

  useEffect(() => {
    if (tokenIn.info && !tokenOut.info && ocean && accountId) {
      ocean.getBalance(tokenIn.info.address, accountId).then((res) => {
        setTokenIn({ ...tokenIn, balance: new BigNumber(res) });
      });
    }
  }, [tokenIn.info, accountId]);

  useEffect(() => {
    if (!accountId) {
      setBtnProps(INITIAL_BUTTON_STATE);
    } else if (!tokenOut.info) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: 'Select a Token',
        disabled: true,
      });
    } else if (!tokenIn.value || tokenIn.value.eq(0)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: 'Enter Stake Amount',
        disabled: true,
      });
    } else if (tokenIn.balance?.eq(0) || (tokenIn.balance && tokenIn.value.gt(tokenIn.balance))) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: 'Not Enough OCEAN Balance',
        disabled: true,
      });
    } else if (lastTx?.status === 'Pending') {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: 'Processing Transaction...',
        disabled: true,
      });
    } else if (tokenIn.value.isLessThan(0.01)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: 'Minimum Stake is .01 OCEAN',
        disabled: true,
      });
    } else if (tokenIn.allowance?.lt(tokenIn.value)) {
      setBtnProps({
        ...btnProps,
        text: 'Unlock OCEAN',
        disabled: false,
      });
    } else {
      setBtnProps({
        ...btnProps,
        disabled: false,
        text: 'Stake',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean, chainId, tokenOut, tokenIn.value, tokenIn.balance, loading, tokenIn.info, lastTx?.status]);

  useEffect(() => {
    if (showUnlockTokenModal && tokenIn.allowance?.gt(tokenIn.value)) {
      setBlurBG(false);
      setShowUnlockTokenModal(false);
      setExecuteStake(true);
    }
  }, [tokenIn.allowance]);

  async function getMaxStakeAmt() {
    if (tokenOut.info && ocean) {
      return new BigNumber(
        await ocean.getMaxStakeAmount(tokenOut.info.pool || '', ocean.config.default.oceanTokenAddress)
      ).dp(5);
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
        if (tokenOut.info && accountId && chainId && ocean) {
          getAllowance(ocean.config.default.oceanTokenAddress, accountId, tokenOut.info.pool || '', ocean).then(
            async (res) => {
              if (!tokenIn.info) return;
              const balance = new BigNumber(await ocean.getBalance(tokenIn.info.address, accountId));
              setTokenIn({
                ...tokenIn,
                allowance: new BigNumber(res),
                balance,
                value: new BigNumber(0),
              });
            }
          );
          if (tokenOut.info?.pool && tokenIn.info?.address) {
            ocean?.getSharesReceivedForTokenIn(tokenOut.info?.pool, tokenIn.info?.address, '1').then((res) => {
              setPostExchange(new BigNumber(res).dp(5));
            });
          }
        }
      })
      .catch(console.error);
  }

  async function stake(preTxDetails: ITxDetails) {
    if (!tokenOut.info?.pool || !chainId || !ocean || !accountId) return;
    if (!preTxDetails || preTxDetails.txType !== 'stake') return;

    try {
      setLoading(true);
      const txReceipt = await ocean.stakeOcean(accountId, tokenOut.info.pool || '', tokenIn.value?.toString());

      setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });
      transactionTypeGA('stake');
      setImportPool(tokenOut.info.pool);
    } catch (error: any) {
      setLastTx({ ...preTxDetails, status: 'Failure' });
      setSnackbarItem({ type: 'error', message: error.error.message, error });
      setConfirmingTx(false);
      setTokenIn({ ...tokenIn, value: new BigNumber(0) });
      setBlurBG(false);
    } finally {
      setLoading(false);
      setConfirmingTx(false);
      setExecuteStake(false);
      setBlurBG(false);
      setShowConfirmTxDetails(false);
    }
  }

  async function setMaxStake() {
    if (!tokenOut.info || !ocean) return;
    let maxStake: BigNumber | null;

    if (maxStakeAmt.gt(0)) {
      maxStake = maxStakeAmt;
    } else {
      maxStake = new BigNumber(
        await ocean.getMaxStakeAmount(tokenOut.info.pool || '', ocean.config.default.oceanTokenAddress)
      );
    }
    if (maxStake.isNaN()) {
      setTokenIn({ ...tokenIn, value: new BigNumber(0) });
    } else {
      if (tokenIn.balance?.lt(maxStake)) {
        setTokenIn({ ...tokenIn, value: tokenIn.balance });
      } else {
        setTokenIn({ ...tokenIn, value: maxStake.dp(5).minus(1) });
      }
    }
  }

  async function updateNum(val: string | BigNumber, max?: BigNumber) {
    // initially set state to value to persist the max if the user continuously tries to enter over the max (or balance)
    setTokenIn({ ...tokenIn, value: new BigNumber(val) });
    if (!val) {
      setTokenIn({ ...tokenIn, value: new BigNumber(0) });
      return;
    }
    val = new BigNumber(val);

    if (!max) {
      maxStakeAmt.gt(0) ? (max = maxStakeAmt) : (max = await getMaxStakeAmt());
    }

    if (max) {
      if (tokenIn.balance.lt(val)) {
        setTokenIn({ ...tokenIn, value: tokenIn.balance.dp(5) });
      } else if (max.minus(1).lt(val)) {
        setTokenIn({ ...tokenIn, value: max.dp(5).minus(1) });
      } else {
        setTokenIn({ ...tokenIn, value: new BigNumber(val) });
      }
    }

    if (tokenOut.info?.pool && tokenIn.info?.address && val) {
      const sharesReceived = await ocean?.getSharesReceivedForTokenIn(
        tokenOut.info?.pool,
        tokenIn.info?.address,
        val.toString()
      );
      if (sharesReceived) setSharesReceived(new BigNumber(sharesReceived));
    }
  }

  return (
    <>
      <DatasetDescription />
      <div
        className={`absolute w-full max-w-[32rem] top-1/2 left-1/2 transition-transform transform duration-500 ${
          showDescModal && tokenOut.info?.pool ? 'translate-x-full 2lg:translate-x-[10%]' : '-translate-x-1/2'
        } -translate-y-1/2 `}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="lg:mx-auto sm:mx-4 mx-3">
            <div id="stakeModal" className="lg:w-107  bg-black bg-opacity-90 rounded-lg p-3 hm-box">
              <TokenSelect
                max={maxStakeAmt}
                otherToken={'OCEAN'}
                pos={2}
                setToken={setTokenOut}
                token={tokenOut}
                updateNum={() => {}}
              />
              <div className="px-4 relative mt-6 mb-10">
                <div className="rounded-full border-black border-4 absolute -top-7 bg-trade-darkBlue w-12 h-12 flex items-center justify-center swap-center">
                  {loading ? (
                    <MoonLoader size={25} color={'white'} />
                  ) : (
                    <AiOutlinePlus size="30" className="text-gray-300" />
                  )}
                </div>
              </div>
              <TokenSelect
                max={maxStakeAmt}
                otherToken={''}
                pos={1}
                setToken={setTokenIn}
                token={tokenIn}
                updateNum={(num: string) => {
                  updateNum(num);
                }}
                onMax={setMaxStake}
              />
              <PositionBox loading={loading} setLoading={setLoading} />
              <div className="flex mt-3">
                <button
                  id="executeStake"
                  onClick={() => setExecuteStake(true)}
                  className="txButton"
                  disabled={btnProps.disabled}
                >
                  {btnProps.text}
                </button>
                <TxSettings />
              </div>
            </div>
            <div className="flex justify-between">
              <ViewDescBtn />
              <Link id="lpLink" to="/stake/list" className="text-gray-300 hover:text-gray-100 transition-colors">
                Your stake positions {'>'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
