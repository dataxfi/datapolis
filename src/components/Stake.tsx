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
import { IStakeInfo } from '@dataxfi/datax.js/dist/@types/stake';
import usePathfinder from '../hooks/usePathfinder';
import { getContractToAllow } from './UnlockTokenModal';

const INITIAL_BUTTON_STATE = {
  text: 'Connect wallet',
  classes: '',
  disabled: false,
};

export default function Stake() {
  const {
    accountId,
    chainId,
    setConfirmingTx,
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
    setShowConfirmTxDetails,
    setTxApproved,
    stake,
    refAddress,
    config,
    // slippage,
    trade,
    path,
    web3,
    poolDetails,
    swapFee,
    spotSwapFee,
    setSwapFee,
    baseMinExchange,
  } = useContext(GlobalContext);

  const [maxStakeAmt, setMaxStakeAmt] = useState<BigNumber>(new BigNumber(0));
  const [sharesReceived, setSharesReceived] = useState<BigNumber>(new BigNumber(0));
  const [loading, setLoading] = useState(false);
  const [btnProps, setBtnProps] = useState<IBtnProps>(INITIAL_BUTTON_STATE);
  const [importPool, setImportPool] = useState<string>();
  const [baseAddress, setBaseAddress] = useState<string>('');
  const [dataxFee, setDataxFee] = useState<string>();
  const [minStakeAmt, setMinStakeAmt] = useState<BigNumber>();

  // hooks
  useLiquidityPos(importPool, setImportPool);
  useAutoLoadToken();
  useClearTokens();
  useTxHandler(stakeHandler, executeStake, setExecuteStake, {
    shares: sharesReceived,
    dataxFee,
    swapFee,
  });
  useCalcSlippage(sharesReceived);
  usePathfinder(tokenIn.info?.address || '', baseAddress);

  useEffect(() => {
    console.log('Base address is ', baseAddress);
  }, [baseAddress, web3]);

  useEffect(() => {
    if (tokenOut.info?.pools[0].id && stake) {
      stake.getBaseToken(tokenOut.info?.pools[0].id).then(setBaseAddress);
    }
  }, [tokenOut.info?.pools[0].id, stake]);

  useEffect(() => {
    if (!tokensCleared.current) return;
    if (tokenIn.info && tokenOut.info && path) {
      getMaxAndAllowance();
    }
  }, [tokenIn.info?.address, tokenOut.info?.address, tokensCleared, accountId, path?.length]);

  useEffect(() => {
    if (tokenIn.info && !tokenOut.info && trade && accountId) {
      trade.getBalance(tokenIn.info.address, accountId).then((res) => {
        setTokenIn({ ...tokenIn, balance: new BigNumber(res) });
      });
    }
  }, [tokenIn.info?.address, accountId]);

  useEffect(() => {
    if (tokenIn.info?.address) {
      if (path && web3) {
        trade?.getAmountsIn(baseMinExchange, path).then((res) => setMinStakeAmt(new BigNumber(res[0])));
      }
    }
  }, [tokenIn.info?.address]);

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
        text: `Not Enough ${tokenIn.info?.symbol} Balance`,
        disabled: true,
      });
    } else if (lastTx?.status === 'Pending') {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: 'Processing Transaction...',
        disabled: true,
      });
    } else if (minStakeAmt && tokenIn.value.isLessThan(minStakeAmt)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: `Minimum Stake is ${minStakeAmt} ${tokenIn.info?.symbol}`,
        disabled: true,
      });
    } else if (tokenIn.allowance?.lt(tokenIn.value)) {
      setBtnProps({
        ...btnProps,
        text: `Unlock ${tokenIn.info?.symbol}`,
        disabled: false,
      });
    } else {
      setBtnProps({
        ...btnProps,
        disabled: false,
        text: 'Stake',
      });
    }
  }, [accountId, chainId, tokenOut, tokenIn.value, tokenIn.balance, loading, tokenIn.info, lastTx?.status]);

  async function getMaxStakeAmt() {
    if (stake && tokenOut.info?.pools[0] && tokenIn.info?.address && path)
      try {
        const maxStakeAmt = await stake?.getMaxStakeAmount(tokenOut.info?.pools[0].id, tokenIn.info?.address, path);
        if (maxStakeAmt) return new BigNumber(maxStakeAmt);
      } catch (error) {
        console.error(error);
      }
  }

  async function getMaxAndAllowance() {
    getMaxStakeAmt()
      .then((res: BigNumber | void | undefined) => {
        console.log('Max stake is', res?.toString());
        if (res) {
          setMaxStakeAmt(res);
        }
      })
      .then(() => {
        if (
          tokenIn.info?.address &&
          tokenOut.info &&
          accountId &&
          chainId &&
          config &&
          config?.custom &&
          stake &&
          trade
        ) {
          const contractToAllow = getContractToAllow(baseAddress, tokenIn.info.address, config);
          if (contractToAllow)
            stake.getAllowance(tokenIn.info?.address, accountId, contractToAllow).then(async (res) => {
              console.log('Allowance response for contract', res, 'for' + contractToAllow);
              if (!tokenIn.info) return;
              const balance = new BigNumber(await trade.getBalance(tokenIn.info.address, accountId));
              setTokenIn({
                ...tokenIn,
                allowance: new BigNumber(res),
                balance,
                value: new BigNumber(0),
              });
            });
        }
      })
      .catch(console.error);
  }

  async function stakeHandler(preTxDetails: ITxDetails) {
    if (
      !tokenOut.info?.pools[0].id ||
      !chainId ||
      !accountId ||
      !tokenIn.info?.address ||
      !refAddress ||
      !config ||
      !stake ||
      !trade ||
      !path ||
      !preTxDetails ||
      preTxDetails.txType !== 'stake' ||
      !web3
    ) {
      return;
    }
    // TODO: treat this conditional as an error and resolve whatever is falsy, could be a hook

    try {
      setLoading(true);

      // ? calcSlippage(new BigNumber(amountOutBase), slippage, 1)
      const stakeInfo: IStakeInfo = {
        meta: [tokenOut.info?.pools[0].id, accountId, refAddress, config.custom.uniV2AdapterAddress],
        uints: [sharesReceived.toString(), spotSwapFee, tokenIn.value.toString()],
        path,
      };

      console.log(stakeInfo);

      const txReceipt =
        tokenIn.info?.address === config?.custom.nativeAddress
          ? await stake.stakeETHInDTPool(stakeInfo, accountId)
          : await stake.stakeTokenInDTPool(stakeInfo, accountId);

      setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });
      transactionTypeGA('stake');
      setImportPool(tokenOut.info?.pools[0].id);
    } catch (error: any) {
      console.error(error);
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
      setTxApproved(false);
    }
  }

  async function setMaxStake() {
    if (!tokenOut.info?.pools[0].id || !stake || !maxStakeAmt) return;
    console.log(maxStakeAmt.toString());
    if (maxStakeAmt.isNaN()) {
      setTokenIn({ ...tokenIn, value: new BigNumber(0) });
      setSharesReceived(new BigNumber(0));
      setDataxFee('0');
      setSwapFee('0');
    } else {
      if (tokenIn.balance?.lt(maxStakeAmt)) {
        updateNum(tokenIn.balance);
      } else {
        updateNum(maxStakeAmt);
      }
    }
  }

  async function updateNum(val: string | BigNumber) {
    // initially set state to value to persist the max if the user continuously tries to enter over the max (or balance)
    setTokenIn({ ...tokenIn, value: new BigNumber(val) });
    if (!val) {
      setTokenIn({ ...tokenIn, value: new BigNumber(0) });
      return;
    }

    val = new BigNumber(val);
    console.log(val.toString());

    // if (maxStakeAmt) {
    //   if (tokenIn.balance.lt(val)) {
    //     setTokenIn({ ...tokenIn, value: tokenIn.balance });
    //   } else if (maxStakeAmt.lt(val)) {
    //     setTokenIn({ ...tokenIn, value: maxStakeAmt });
    //   }
    // }

    if (
      tokenOut.info?.pools[0].id &&
      tokenIn.info?.address &&
      val &&
      path &&
      chainId &&
      config &&
      accountId &&
      refAddress &&
      trade &&
      web3
    ) {
      let amountIn = val.toString();

      if (tokenIn.info.address.toLowerCase() !== baseAddress.toLowerCase()) {
        console.log('Getting base amount in from:', amountIn);
        const amountsOut = await trade.getAmountsOut(amountIn, path);
        const bn = new BigNumber(amountsOut[amountsOut.length - 1]);
        amountIn = bn.toString();
      }

      console.log('Amount out', amountIn);

      const stakeInfo: IStakeInfo = {
        meta: [tokenOut.info?.pools[0].id, accountId, refAddress, config.custom.uniV2AdapterAddress],
        uints: ['0', '0', amountIn],
        path: [baseAddress],
      };

      const basePoolName = poolDetails?.baseToken.symbol;
      try {
        const calcResponse = await stake?.calcPoolOutGivenTokenIn(stakeInfo);
        console.log(calcResponse);
        if (calcResponse) {
          const { poolAmountOut, dataxFee, refFee } = calcResponse;
          if (poolAmountOut) setSharesReceived(new BigNumber(poolAmountOut));
          setDataxFee(`${new BigNumber(dataxFee).dp(5).toString()} ${basePoolName}`);
          setSwapFee(`${new BigNumber(Number(refFee)).dp(5).toString()} ${basePoolName}`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <>
      <DatasetDescription />
      <div
        className={`absolute w-full max-w-[32rem] top-1/2 left-1/2 transition-transform transform duration-500 ${
          showDescModal && tokenOut.info?.pools[0].id ? 'translate-x-full 2lg:translate-x-[10%]' : '-translate-x-1/2'
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
