import { AiOutlinePlus } from 'react-icons/ai';
import { useState, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { MoonLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import useLiquidityPos from '../hooks/useLiquidityPos';
import BigNumber from 'bignumber.js';
import { ITxDetails, IBtnProps } from '../utils/types';
import { getAllowance, getBaseToken } from '../hooks/useTokenList';
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
    ocean,
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
    console.log('base address is ', baseAddress);
  }, [baseAddress, web3]);

  useEffect(() => {
    console.log(tokenOut.info);

    if (tokenOut.info?.pool && ocean) { getBaseToken(tokenOut.info.pool, tokenOut.info.address, ocean).then(setBaseAddress); }
  }, [tokenOut.info?.pool, ocean]);

  useEffect(() => {
    if (!tokensCleared.current) return;
    if (tokenIn.info && tokenOut.info) {
      getMaxAndAllowance();
    }
  }, [tokenIn.info?.address, tokenOut.info?.address, tokensCleared, accountId]);

  useEffect(() => {
    if (tokenIn.info && !tokenOut.info && ocean && accountId) {
      ocean.getBalance(tokenIn.info.address, accountId).then((res) => {
        setTokenIn({ ...tokenIn, balance: new BigNumber(res) });
      });
    }
  }, [tokenIn.info?.address, accountId]);

  useEffect(() => {
    getMinAmountIn();
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
        text: 'Not Enough OCEAN Balance',
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
  }, [accountId, ocean, chainId, tokenOut, tokenIn.value, tokenIn.balance, loading, tokenIn.info, lastTx?.status]);

  async function getMaxStakeAmt() {
    if (tokenOut.info && ocean) {
      const max = new BigNumber(
        await ocean.getMaxStakeAmount(tokenOut.info.pool || '', ocean.config.default.oceanTokenAddress)
      ).dp(5);
      console.log('Max stake amount', max.toString());
      return max;
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
        if (tokenOut.info && accountId && chainId && ocean && config?.custom[chainId]) {
          getAllowance(
            ocean.config.default.oceanTokenAddress,
            accountId,
            config.custom[chainId].uniV2AdapterAddress,
            ocean
          ).then(async (res) => {
            if (!tokenIn.info) return;
            const balance = new BigNumber(await ocean.getBalance(tokenIn.info.address, accountId));
            setTokenIn({
              ...tokenIn,
              allowance: new BigNumber(res),
              balance,
              value: new BigNumber(0),
            });
          });
          if (tokenOut.info?.pool && tokenIn.info?.address && path && refAddress) {
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
      tokenOut.info?.pool &&
      tokenIn.info?.address &&
      path &&
      refAddress &&
      accountId &&
      chainId &&
      config?.custom[chainId].uniV2AdapterAddress &&
      web3 &&
      baseAddress
    ) {
      const stakeInfo: IStakeInfo = {
        meta: [tokenOut.info.pool, accountId, refAddress, config.custom[chainId].uniV2AdapterAddress],
        uints: ['0', '0', '1'],
        path: [baseAddress],
      };

      const basePostExchange = await stake?.calcTokenOutGivenPoolIn(stakeInfo);
      let postExchange = basePostExchange?.poolAmountOut;
      if (tokenIn.info.address !== config.default.oceanTokenAddress && basePostExchange) {
        const amountIn = await trade?.getAmountsIn(web3?.utils.toWei('1'), path);
        if (amountIn) postExchange = amountIn[0];
      }

      if (postExchange) setPostExchange(new BigNumber(postExchange));
    }
  }

  async function stakeHandler(preTxDetails: ITxDetails) {
    if (
      !tokenOut.info?.pool ||
      !chainId ||
      !ocean ||
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
        meta: [tokenOut.info.pool, accountId, refAddress, config.custom[chainId].uniV2AdapterAddress],
        uints: [sharesReceived.toString(), '0', tokenIn.value.toString()],
        path,
      };

      console.log(stakeInfo);

      const txReceipt =
        tokenIn.info?.address === config?.custom[chainId].nativeAddress ? await stake.stakeETHInDTPool(stakeInfo, accountId) : await stake.stakeTokenInDTPool(stakeInfo, accountId);

      setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });
      transactionTypeGA('stake');
      setImportPool(tokenOut.info.pool);
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
      tokenOut.info?.pool &&
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
        meta: [tokenOut.info.pool, accountId, refAddress, config.custom[chainId].uniV2AdapterAddress],
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
