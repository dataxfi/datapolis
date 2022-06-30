import { AiOutlinePlus } from 'react-icons/ai';
import { useState, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { MoonLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import useLiquidityPos from '../hooks/useLiquidityPos';
import BigNumber from 'bignumber.js';
import { ITxDetails, IBtnProps, IPoolMetaData } from '../@types/types';
import useAutoLoadToken from '../hooks/useAutoLoadToken';
import TokenSelect from './TokenSelect';
import PositionBox from './PositionBox';
import DatasetDescription from './DTDescriptionModal';
import ViewDescBtn from './ViewDescButton';
import { transactionTypeGA } from '../context/Analytics';
import useClearTokens from '../hooks/useClearTokens';
import useTxHandler from '../hooks/useTxHandler';
import TxSettings from './TxSettings';
import { IStakeInfo } from '@dataxfi/datax.js/dist/@types/stake';
import usePathfinder from '../hooks/usePathfinder';
import { getToken } from '../hooks/useTokenList';
import { calcSlippage, to5, BtnManager, INITIAL_BUTTON_STATE } from '../utils/utils';
import { ITokenInfo } from '@dataxfi/datax.js';

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
    slippage,
    trade,
    path,
    web3,
    swapFee,
    spotSwapFee,
    setSwapFee,
    baseMinExchange,
    meta,
    executeUnlock,
  } = useContext(GlobalContext);

  const [maxStakeAmt, setMaxStakeAmt] = useState<BigNumber>(new BigNumber(0));
  const [sharesReceived, setSharesReceived] = useState<BigNumber>(new BigNumber(0));
  const [loading, setLoading] = useState(false);
  const [btnProps, setBtnProps] = useState<IBtnProps>(INITIAL_BUTTON_STATE);
  const [importPool, setImportPool] = useState<string>();
  const [baseToken, setBaseToken] = useState<ITokenInfo>();
  const [dataxFee, setDataxFee] = useState<string>();
  const [minStakeAmt, setMinStakeAmt] = useState<BigNumber>();
  const [poolMetaData, setPoolMetaData] = useState<IPoolMetaData>();
  const [afterSlippage, setAfterSlippage] = useState<BigNumber>(new BigNumber(0));
  // hooks
  useLiquidityPos(importPool, setImportPool);
  useAutoLoadToken();
  useClearTokens();
  useTxHandler(stakeHandler, executeStake, setExecuteStake, {
    shares: sharesReceived,
    dataxFee,
    swapFee,
    pool: poolMetaData,
    tokenToUnlock: tokenOut.info?.symbol,
    afterSlippage,
  });
  usePathfinder(tokenIn.info?.address || '', baseToken?.address);

  useEffect(() => {
    if (
      baseToken &&
      web3 &&
      chainId &&
      config &&
      accountId &&
      poolMetaData?.address.toLowerCase() !== baseToken.address.toLowerCase()
    ) {
      getToken(web3, chainId, baseToken.address, 'exchange', config, accountId).then((res) => {
        if (res && tokenOut.info)
          setPoolMetaData({
            baseToken: res,
            datatoken: tokenOut.info,
            address: tokenOut.info.pools[0].id,
          });
      });
    }
  }, [tokenOut.info?.address, baseToken, web3, chainId, config]);

  useEffect(() => {
    if (tokenOut.info?.pools[0].id && stake && web3 && config && chainId && accountId) {
      stake.getBaseToken(tokenOut.info?.pools[0].id).then((address) => {
        getToken(web3, chainId, address, 'exchange', config, accountId).then(setBaseToken);
      });
    }
  }, [tokenOut.info?.pools, stake]);

  useEffect(() => {
    if (!tokensCleared.current) return;
    if (tokenIn.info && tokenOut.info && path) {
      getMaxAndAllowance();
    }
  }, [tokenIn.info?.address, tokenOut.info?.address, tokensCleared, accountId, path?.length]);

  useEffect(() => {
    if (tokenIn.info && trade && accountId) {
      const tokenAddress =
        tokenIn.info.address.toLowerCase() === accountId.toLowerCase() ? undefined : tokenIn.info.address;
      trade.getBalance(accountId, false, tokenAddress).then((res) => {
        setTokenIn({ ...tokenIn, balance: new BigNumber(res) });
      });
    }
  }, [tokenIn.info?.address, accountId]);

  useEffect(() => {
    if (path && path?.length > 0) {
      if (path && web3) {
        trade?.getAmountsIn(baseMinExchange, path).then((res) => setMinStakeAmt(new BigNumber(res[0])));
      }
    }
  }, [tokenIn.info?.address]);

  useEffect(() => {
    const btnManager = new BtnManager(setBtnProps);
    if (!accountId) {
      btnManager.updateBtn();
    } else if (!tokenOut.info) {
      btnManager.updateBtn('Select a Pool', true);
    } else if (!tokenIn.info) {
      btnManager.updateBtn('Select a Token', true);
    } else if (path && path?.length === 0) {
      btnManager.updateBtn('Routing...', true);
    } else if (!path) {
      btnManager.updateBtn('Insufficient Liquidity', true);
    } else if (!tokenIn.value || tokenIn.value.eq(0)) {
      btnManager.updateBtn('Enter Stake Amount', true);
    } else if (tokenIn.balance?.eq(0) || (tokenIn.balance && tokenIn.value.gt(tokenIn.balance))) {
      btnManager.updateBtn(`Not Enough ${tokenIn.info?.symbol} Balance`, true);
    } else if (lastTx?.status === 'Pending' && (executeStake || executeUnlock)) {
      btnManager.updateBtn('Processing Transaction...', true);
    } else if (minStakeAmt && tokenIn.value.isLessThan(minStakeAmt)) {
      btnManager.updateBtn(`Minimum Stake is ${minStakeAmt} ${tokenIn.info?.symbol}`, true);
    } else if (tokenIn.allowance?.lt(tokenIn.value)) {
      btnManager.updateBtn(`Unlock ${tokenIn.info?.symbol}`, false);
    } else {
      btnManager.updateBtn('Stake', false, btnProps);
    }
  }, [
    accountId,
    chainId,
    tokenOut,
    tokenIn.value,
    tokenIn.balance,
    loading,
    tokenIn.info,
    lastTx?.status,
    path?.length,
    path,
  ]);

  async function getMaxAndAllowance() {
    if (stake && tokenOut.info?.pools[0] && accountId && path) {
      const usingETH = accountId.toLowerCase() === tokenIn.info?.address.toLowerCase();
      console.log(usingETH);
      stake
        ?.getUserMaxStake(tokenOut.info?.pools[0].id, accountId, path, usingETH)
        .then((res) => {
          console.log('Max stake is', res?.toString());
          if (res) {
            setMaxStakeAmt(new BigNumber(res));
          }
        })
        .then(() => {
          if (tokenIn.info?.address && tokenOut.info && config?.custom && trade) {
            if (tokenIn.info.address.toLowerCase() === accountId.toLowerCase()) {
              setTokenIn({
                ...tokenIn,
                allowance: new BigNumber(config.extra.maxUint256),
              });
            } else {
              stake
                .getAllowance(tokenIn.info?.address, accountId, config.custom.stakeRouterAddress)
                .then(async (res) => {
                  if (!tokenIn.info) return;
                  setTokenIn({
                    ...tokenIn,
                    allowance: new BigNumber(res),
                    value: new BigNumber(0),
                  });
                });
            }
          }
        })
        .catch(console.error);
    }
  }

  async function stakeHandler(preTxDetails: ITxDetails) {
    if (!accountId || !stake || !path || preTxDetails?.txType !== 'stake' || !meta || !spotSwapFee) {
      return;
    }
    // TODO: treat this conditional as an error and resolve whatever is falsy, could be a hook

    try {
      setLoading(true);

      const minAmountOut = calcSlippage(new BigNumber(sharesReceived), slippage, false);
      setAfterSlippage(minAmountOut);
      console.log('min amount out after slippage', minAmountOut);
      const stakeInfo: IStakeInfo = {
        meta,
        path,
        uints: [tokenIn.value.toString(), spotSwapFee, minAmountOut.toString()],
      };

      console.log(stakeInfo);

      const txReceipt =
        tokenIn.info?.address === accountId
          ? await stake.stakeETHInDTPool(stakeInfo, accountId)
          : await stake.stakeTokenInDTPool(stakeInfo, accountId);

      setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });
      transactionTypeGA('stake');
      setImportPool(tokenOut.info?.pools[0].id);
    } catch (error: any) {
      console.error(error);
      setLastTx({ ...preTxDetails, status: 'Failure' });
      setSnackbarItem({ type: 'error', message: error.message, error });
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
    console.log('Calling calc function with new input value', val);
    // initially set state to value to persist the max if the user continuously tries to enter over the max (or balance)
    setTokenIn({ ...tokenIn, value: new BigNumber(val) });
    if (!val) {
      setTokenIn({ ...tokenIn, value: new BigNumber(0) });
      return;
    }

    val = new BigNumber(val);
    if (val.lte(0)) return;

    if (
      tokenOut.info &&
      tokenIn.info &&
      val &&
      path &&
      chainId &&
      config &&
      accountId &&
      refAddress &&
      trade &&
      web3 &&
      baseToken
    ) {
      let amountIn = val.toString();

      if (tokenIn.info.address.toLowerCase() !== baseToken.address.toLowerCase()) {
        console.log('Getting base amount in from:', amountIn);
        const amountsOut = await trade.getAmountsOut(amountIn, path);
        const bn = new BigNumber(amountsOut[amountsOut.length - 1]);
        amountIn = bn.toString();
      }

      console.log('base amount in', amountIn);

      const stakeInfo: IStakeInfo = {
        meta: [tokenOut.info.pools[0].id, accountId, refAddress, config.custom.uniV2AdapterAddress],
        uints: [amountIn, '0', '0'],
        path: [baseToken.address],
      };

      try {
        const calcResponse = await stake?.calcPoolOutGivenTokenIn(stakeInfo);
        console.log(calcResponse);
        if (calcResponse) {
          const { poolAmountOut, dataxFee, refFee } = calcResponse;
          if (poolAmountOut) setSharesReceived(new BigNumber(poolAmountOut));
          const minAmountOut = calcSlippage(new BigNumber(poolAmountOut), slippage, false);
          setAfterSlippage(minAmountOut);
          setDataxFee(`${to5(dataxFee)} ${baseToken.symbol}`);
          setSwapFee(`${to5(refFee)} ${baseToken.symbol}`);
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
