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
  } = useContext(GlobalContext);

  const [maxStakeAmt, setMaxStakeAmt] = useState<BigNumber>(new BigNumber(0));
  const [postExchange, setPostExchange] = useState<BigNumber>(new BigNumber(0));
  const [sharesReceived, setSharesReceived] = useState<BigNumber>(new BigNumber(0));
  const [loading, setLoading] = useState(false);
  const [btnProps, setBtnProps] = useState<IBtnProps>(INITIAL_BUTTON_STATE);
  const [importPool, setImportPool] = useState<string>();
  const [baseAddress, setBaseAddress] = useState<string>('');
  const [, setDataxFee] = useState<string>();
  const [, setRefFee] = useState<string>();
  const [minStakeAmt, setMinStakeAmt] = useState<BigNumber>();

  // hooks
  useLiquidityPos(importPool, setImportPool);
  useAutoLoadToken();
  useClearTokens();
  useTxHandler(stakeHandler, executeStake, setExecuteStake, { shares: sharesReceived, postExchange });
  useCalcSlippage(sharesReceived);
  usePathfinder(tokenIn.info?.address || '', baseAddress);

  useEffect(() => {
    console.log('Base address is ', baseAddress);
  }, [baseAddress, web3]);

  useEffect(() => {
    // console.log(tokenOut.info);

    if (tokenOut.info?.pools[0].id && stake) {
      stake.getBaseToken(tokenOut.info?.pools[0].id).then(setBaseAddress);
    }
  }, [tokenOut.info?.pools[0].id, stake]);

  useEffect(() => {
    if (!tokensCleared.current) return;
    console.log('max stake useEffect conditional', !!tokenIn.info, !!tokenOut.info, !!path);
    if (tokenIn.info && tokenOut.info && path) {
      console.log('Getting max stake');
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
    if (tokenIn.info?.address && tokenOut.info?.address) getMinAmountIn();
  }, [tokenIn.info?.address, tokenOut.info?.address]);

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
    console.log('Can get max stake', !!tokenOut.info, !!stake, !!path);
    if (tokenOut.info && stake && path) {
      const max = new BigNumber(await stake.getMaxStakeAmount(tokenOut.info?.pools[0].id, baseAddress)).dp(5);
      console.log('token in is base', tokenIn.info?.address.toLowerCase() === baseAddress.toLowerCase());
      if (tokenIn.info?.address.toLowerCase() === baseAddress.toLowerCase()) return max;

      const maxIn = await trade?.getAmountsIn(maxStakeAmt.toString(), path);
      if (maxIn) return new BigNumber(maxIn[0]);
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
          stake.getAllowance(tokenIn.info?.address, accountId, config.custom.stakeRouterAddress).then(async (res) => {
            console.log('Allowance response', res);
            if (!tokenIn.info) return;
            const balance = new BigNumber(await trade.getBalance(tokenIn.info.address, accountId));
            setTokenIn({
              ...tokenIn,
              allowance: new BigNumber(res),
              balance,
              value: new BigNumber(0),
            });
          });
          if (tokenOut.info?.pools[0].id && tokenIn.info?.address && path && refAddress) {
            getPostExchange();
          }
        }
      })
      .catch(console.error);
  }

  async function getMinAmountIn() {
    if (path && web3) {
      const minAmtIn = await trade?.getAmountsIn(web3?.utils.toWei('0.01'), path);
      if (minAmtIn) setMinStakeAmt(new BigNumber(minAmtIn[0]));
    }
  }

  async function getPostExchange() {
    if (
      tokenOut.info?.pools[0].id &&
      tokenIn.info?.address &&
      path &&
      refAddress &&
      accountId &&
      chainId &&
      config?.custom.uniV2AdapterAddress &&
      web3 &&
      baseAddress
    ) {
      const stakeInfo: IStakeInfo = {
        meta: [tokenOut.info?.pools[0].id, accountId, refAddress, config.custom.uniV2AdapterAddress],
        uints: ['0', '0', '1'],
        path: [baseAddress],
      };

      const basePostExchange = await stake?.calcTokenOutGivenPoolIn(stakeInfo);
      let postExchange = basePostExchange?.poolAmountOut;
      console.log("Base post exchange", basePostExchange)
      if (tokenIn.info.address.toLowerCase() !== baseAddress.toLowerCase() && !!basePostExchange) {
        // use 1 (wei) because the amount needed to get 1 of the base token is what is used in post exchange 
        const amountIn = await trade?.getAmountsIn(web3?.utils.toWei('1'), path);
        if (amountIn) postExchange = amountIn[0];
      }

      if (postExchange) setPostExchange(new BigNumber(postExchange));
    }
  }

  async function stakeHandler(preTxDetails: ITxDetails) {
    console.log(
      tokenOut,
      chainId,
      accountId,
      tokenIn.info?.address,
      refAddress,
      config,
      stake,
      trade,
      path,
      preTxDetails,
      preTxDetails.txType,
      web3
    );
    console.log(
      !tokenOut.info?.pools[0].id,
      !chainId,
      !accountId,
      !tokenIn.info?.address,
      !refAddress,
      !config,
      !stake,
      !trade,
      !path,
      !preTxDetails,
      preTxDetails.txType !== 'stake',
      !web3
    );

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
        uints: [sharesReceived.toString(), '0', tokenIn.value.toString()],
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

    if (maxStakeAmt.isNaN()) {
      setTokenIn({ ...tokenIn, value: new BigNumber(0) });
    } else {
      if (tokenIn.balance?.lt(maxStakeAmt)) {
        setTokenIn({ ...tokenIn, value: tokenIn.balance });
      } else {
        setTokenIn({ ...tokenIn, value: maxStakeAmt.dp(5).minus(1) });
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

    // if (!max) {
    //   maxStakeAmt.gt(0) ? (max = maxStakeAmt) : (max = await getMaxStakeAmt());
    // }

    // if (max) {
    //   if (tokenIn.balance.lt(val)) {
    //     setTokenIn({ ...tokenIn, value: tokenIn.balance.dp(5) });
    //   } else if (max.minus(1).lt(val)) {
    //     setTokenIn({ ...tokenIn, value: max.dp(5).minus(1) });
    //   } else {
    //     setTokenIn({ ...tokenIn, value: new BigNumber(val) });
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
      const valInWei = web3.utils.toWei(val.toString());
      let amountOut = valInWei;

      if (tokenIn.info.address.toLowerCase() !== baseAddress.toLowerCase()) {
        console.log('Getting base amount in.');
        const amountsOut = await trade.getAmountsOut(val.toString(), path);
        const bn = new BigNumber(amountsOut[amountsOut.length - 1]);
        amountOut = bn.toPrecision();
      }

      console.log('Amount out', amountOut);

      const stakeInfo: IStakeInfo = {
        meta: [tokenOut.info?.pools[0].id, accountId, refAddress, config.custom.uniV2AdapterAddress],
        uints: ['0', '0', val.toString()],
        path,
      };

      try {
        const calcResponse = await stake?.calcPoolOutGivenTokenIn(stakeInfo);
        console.log(calcResponse);
        const fromWei = (amt: string) => web3.utils.fromWei(amt);
        if (calcResponse) {
          const { poolAmountOut, dataxFee, refFee } = calcResponse;
          setSharesReceived(new BigNumber(fromWei(poolAmountOut)));
          setDataxFee(fromWei(dataxFee));
          setRefFee(fromWei(refFee));
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
