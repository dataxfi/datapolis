import TokenSelect from './TokenSelect';
import { IoSwapVertical } from 'react-icons/io5';
import { useState, useContext, useEffect } from 'react';
import { GlobalContext, placeHolderOrContent } from '../context/GlobalState';
import { MoonLoader } from 'react-spinners';
import BigNumber from 'bignumber.js';
import { getAllowance } from '../hooks/useTokenList';
import { IBtnProps } from '../utils/types';
import { IMaxExchange } from '@dataxfi/datax.js';
import DatasetDescription from './DTDescriptionModal';
import ViewDescBtn from './ViewDescButton';
import { transactionTypeGA } from '../context/Analytics';
import useClearTokens from '../hooks/useClearTokens';
import useAutoLoadToken from '../hooks/useAutoLoadToken';
import useTxHandler from '../hooks/useTxHandler';
import TxSettings from './TxSettings';
import useCalcSlippage from '../hooks/useCalcSlippage';

const INITIAL_MAX_EXCHANGE: IMaxExchange = {
  maxBuy: new BigNumber(0),
  maxSell: new BigNumber(0),
  maxPercent: new BigNumber(0),
  postExchange: new BigNumber(0),
};

export default function Swap() {
  const {
    accountId,
    ocean,
    chainId,
    config,
    setShowUnlockTokenModal,
    tokenIn,
    setTokenIn,
    tokenOut,
    setTokenOut,
    setLastTx,
    tokensCleared,
    setSnackbarItem,
    showDescModal,
    setBlurBG,
    executeSwap,
    setExecuteSwap,
    preTxDetails,
    showUnlockTokenModal,
    setTxApproved,
    swapFee,
    setSwapFee,
    afterSlippage,
    executeUnlock,
    slippage,
    setShowConfirmTxDetails,
    exactToken,
    setExactToken,
  } = useContext(GlobalContext);

  const [postExchange, setPostExchange] = useState<BigNumber>(new BigNumber(0));
  const [btnProps, setBtnProps] = useState<IBtnProps>({
    text: 'Select Tokens',
    disabled: true,
  });

  const [percLoading, setPercLoading] = useState(false);
  const [maxExchange, setMaxExchange] = useState<IMaxExchange>(INITIAL_MAX_EXCHANGE);

  useClearTokens();
  useAutoLoadToken();
  useTxHandler(swap, executeSwap, setExecuteSwap, { slippage, postExchange });
  useCalcSlippage();

  useEffect(() => {
    getButtonProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenIn, tokenOut, accountId, executeSwap, executeUnlock]);

  let controller = new AbortController();
  useEffect(() => {
    if (!tokensCleared.current) return;
    try {
      if (tokenIn.info && tokenOut.info && accountId && ocean) {
        updateBalance(tokenIn.info.address)
          .then((balance) => {
            if (!balance) return;
            if (tokenIn.info && tokenOut.info && ocean.isOCEAN(tokenIn.info.address)) {
              getAllowance(tokenIn.info.address, accountId, tokenOut.info.pool || '', ocean).then((res) => {
                setTokenIn({
                  ...tokenIn,
                  allowance: new BigNumber(res),
                  balance,
                  value: new BigNumber(0),
                  percentage: new BigNumber(0),
                });
              });
            } else if (tokenIn.info && tokenOut.info && ocean.isOCEAN(tokenOut.info.address)) {
              getAllowance(tokenIn.info.address, accountId, tokenIn.info.pool || '', ocean).then((res) => {
                setTokenIn({
                  ...tokenIn,
                  allowance: new BigNumber(res),
                  balance,
                  value: new BigNumber(0),
                  percentage: new BigNumber(0),
                });
              });
            } else if (tokenIn.info) {
              getAllowance(tokenIn.info.address, accountId, config?.default.routerAddress, ocean).then((res) => {
                setTokenIn({
                  ...tokenIn,
                  allowance: new BigNumber(res),
                  balance,
                  value: new BigNumber(0),
                  percentage: new BigNumber(0),
                });
              });
            }

            return balance;
          })
          .then((balance) => {
            controller.abort();
            // eslint-disable-next-line react-hooks/exhaustive-deps
            controller = new AbortController();
            const signal = controller.signal;
            setMaxExchange(INITIAL_MAX_EXCHANGE);
            // console.log(balance?.toString());

            let updatedToken1;
            balance ? (updatedToken1 = { ...tokenIn, balance }) : (updatedToken1 = tokenIn);

            ocean
              .getMaxExchange(updatedToken1, tokenOut, signal)
              .then((res: IMaxExchange | void) => {
                if (res) {
                  setMaxExchange(res);
                }
              })
              .catch(console.error);
          });
      }

      if (tokenOut.info) {
        updateBalance(tokenOut.info.address).then((balance) => {
          if (balance) setTokenOut({ ...tokenOut, balance, value: new BigNumber(0) });
        });
      }

      if (tokenIn.info && !tokenOut.info) {
        updateBalance(tokenIn.info.address).then((balance) => {
          if (balance) setTokenIn({ ...tokenIn, balance, value: new BigNumber(0) });
        });
      }
    } catch (error) {
      console.error(error);
    }

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenIn.info, tokenOut.info, ocean, accountId]);

  useEffect(() => {
    if (showUnlockTokenModal && tokenIn.allowance?.gt(tokenIn.value)) {
      setBlurBG(false);
      setShowUnlockTokenModal(false);
      setExecuteSwap(true);
    }
  }, [tokenIn.allowance]);

  useEffect(() => {
    if (ocean && tokenIn.info && tokenIn.value.gt(0) && tokenOut.info) {
      (async () => {
        const pool = tokenIn.info?.symbol === 'OCEAN' ? tokenOut.info?.pool : tokenIn.info?.pool;
        if (!pool) return;
        const swapFee = new BigNumber(await ocean.calculateSwapFee(pool, tokenIn.value.dp(5).toString()));
        setSwapFee(swapFee);
      })();
    }
  });

  async function updateBalance(address: string) {
    if (!ocean || !accountId) return;
    return new BigNumber(await ocean.getBalance(address, accountId));
  }

  async function swapTokens() {
    setTokenIn({ ...tokenOut, info: tokenOut.info });
    setTokenOut({ ...tokenIn, info: tokenIn.info });
  }

  function updateValueFromPercentage(value: string) {
    // max case is handled in onPerc for tokenIn
    const perc = new BigNumber(value);
    if (perc.isNaN()) {
      setTokenIn({ ...tokenIn, percentage: new BigNumber(0) });
    } else if (perc.gte(100)) {
      setTokenIn({ ...tokenIn, percentage: new BigNumber(100), value: tokenIn?.balance });
      setTokenOut({ ...tokenOut, percentage: new BigNumber(0) });
      updateOtherTokenValue(true, new BigNumber(100));
    } else {
      const value: BigNumber = tokenIn.balance.multipliedBy(perc).div(100).dp(5);
      setTokenIn({ ...tokenIn, percentage: perc, value });
      updateOtherTokenValue(true, value);
    }
  }

  async function updateOtherTokenValue(from: boolean, inputAmount: BigNumber) {
    if (tokenIn?.info && tokenOut?.info && ocean) {
      if (from) {
        setTokenOut({ ...tokenOut, loading: true });
        const exchange = await ocean.calculateExchange(from, inputAmount, tokenIn, tokenOut);
        setPostExchange(exchange.div(inputAmount));
        setTokenOut({ ...tokenOut, value: exchange, loading: false });
        setExactToken(1);
      } else {
        setTokenIn({ ...tokenIn, loading: true });
        const exchange = await ocean.calculateExchange(from, inputAmount, tokenIn, tokenOut);
        setPostExchange(inputAmount.div(exchange));
        setTokenIn({ ...tokenIn, value: exchange, loading: false });
        setExactToken(2);
      }
    }
  }

  async function swap() {
    let txReceipt = null;
    if (!preTxDetails || preTxDetails.txType !== 'swap') return;
    const decSlippage = slippage.div(100).dp(5);
    if (!chainId || !tokenOut.info || !tokenIn.info || !accountId || !ocean || !config) return;
    try {
      if (ocean.isOCEAN(tokenIn.info.address)) {
        if (exactToken === 1) {
          // console.log('exact ocean to dt');
          // console.log(accountId, tokenOut.info.pool.toString(), tokenOut.value.toString(), tokenIn.value.toString());
          txReceipt = await ocean.swapExactOceanToDt(
            accountId,
            tokenOut.info.pool || '',
            tokenOut.value.dp(5).toString(),
            tokenIn.value.dp(5).toString(),
            decSlippage.toString()
          );
        } else {
          // console.log('ocean to exact dt');
          txReceipt = await ocean.swapExactOceanToDt(
            accountId,
            tokenOut.info.pool || '',
            tokenOut.value.dp(5).toString(),
            tokenIn.value.dp(5).toString(),
            decSlippage.toString()
          );
        }
      } else if (ocean.isOCEAN(tokenOut.info.address)) {
        if (exactToken === 1) {
          // console.log('exact dt to ocean');
          // console.log(accountId, tokenIn.info.pool, tokenOut.value.toString(), tokenIn.value.toString());
          txReceipt = await ocean.swapExactDtToOcean(
            accountId,
            tokenIn.info.pool || '',
            tokenOut.value.dp(5).toString(),
            tokenIn.value.dp(5).toString(),
            decSlippage.toString()
          );
        } else {
          // Error: Throws not enough datatokens
          // console.log('dt to exact ocean');
          // console.log(accountId, tokenIn.info.pool, tokenOut.value.toString(), tokenIn.value.toString());
          txReceipt = await ocean.swapExactDtToOcean(
            accountId,
            tokenIn.info.pool || '',
            tokenOut.value.dp(5).toString(),
            tokenIn.value.dp(5).toString(),
            decSlippage.toString()
          );
        }
      } else {
        if (exactToken === 1) {
          // console.log('exact dt to dt');
          // console.log(accountId,tokenIn.info.address,tokenOut.info.address,t2Val,t1Val,tokenIn.info.pool,tokenOut.info.pool,config.default.routerAddress,decSlippage);
          txReceipt = await ocean.swapExactDtToDt(
            accountId,
            tokenIn.info.address,
            tokenOut.info.address,
            tokenOut.value.dp(5).toString(),
            tokenIn.value.dp(5).toString(),
            tokenIn.info.pool || '',
            tokenOut.info.pool || '',
            config.default.routerAddress,
            decSlippage.toString()
          );
        } else {
          // console.log('dt to exact dt');
          // console.log(accountId,tokenIn.info.address,tokenOut.info.address,t2Val, t1Val,tokenIn.info.pool,tokenOut.info.pool,config.default.routerAddress,decSlippage)
          txReceipt = await ocean.swapExactDtToDt(
            accountId,
            tokenIn.info.address,
            tokenOut.info.address,
            tokenOut.value.dp(5).toString(),
            tokenIn.value.dp(5).toString(),
            tokenIn.info.pool || '',
            tokenOut.info.pool || '',
            config.default.routerAddress,
            decSlippage.toString()
          );
        }
      }
      if (txReceipt) {
        transactionTypeGA('Trade');
        setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });
        setPostExchange(new BigNumber(0));
      }
    } catch (error: any) {
      setLastTx({ ...preTxDetails, status: 'Failure' });
      setSnackbarItem({ type: 'error', message: error.error.message, error });
    } finally {
      setBlurBG(false);
      setExecuteSwap(false);
      setTxApproved(false);
      setShowConfirmTxDetails(false);
    }
  }

  function getButtonProperties() {
    if (!accountId) {
      setBtnProps({
        text: 'Connect Wallet',
        disabled: false,
      });
    }

    if (accountId && !(tokenIn?.info && tokenOut?.info)) {
      setBtnProps({
        text: 'Select Tokens',
        disabled: true,
      });
    }

    if ((accountId && tokenIn?.info && tokenOut?.info && tokenIn.value.eq(0)) || !tokenOut.value.eq(0)) {
      setBtnProps({
        text: 'Enter Token Amount',
        disabled: true,
      });
    }
    if (executeSwap || executeUnlock) {
      setBtnProps({
        text: 'Processing Transaction...',
        disabled: true,
      });
      return;
    }

    if (accountId && tokenIn?.info && tokenOut?.info && tokenIn.value.gt(0) && tokenIn.value.gt(0)) {
      if (tokenIn.balance.lt(tokenIn.value)) {
        setBtnProps({
          text: `Not Enough ${tokenIn.info.symbol}`,
          disabled: true,
        });
      } else if (
        ocean &&
        ((ocean.isOCEAN(tokenIn.info.address) && tokenIn.value.lt(0.01) && tokenIn.value.gt(0)) ||
          (ocean.isOCEAN(tokenOut.info.address) && tokenOut.value.lt(0.01) && tokenOut.value.gt(0)))
      ) {
        setBtnProps({
          text: 'Minimum trade is .01 OCEAN',
          disabled: true,
        });
      } else if (tokenIn.value.lt(0.001) && tokenIn.value.gt(0)) {
        setBtnProps({
          text: `Minimum trade is .001 ${tokenIn.info.symbol}`,
          disabled: true,
        });
      } else if (tokenOut.value.lt(0.001) && tokenOut.value.gt(0)) {
        setBtnProps({
          text: `Minimum trade is .001 ${tokenOut.info.symbol}`,
          disabled: true,
        });
      } else if (tokenIn.allowance?.lt(tokenIn.value)) {
        setBtnProps({
          text: `Unlock ${tokenIn.info.symbol}`,
          disabled: false,
        });
      } else if (tokenIn.balance.dp(5).gte(tokenIn.value) && !tokenIn.balance.eq(0)) {
        setBtnProps({
          text: 'Swap',
          disabled: false,
        });
      }
    }
  }

  async function dbUpdateToken1(value: string) {
    if (!ocean) return;
    setExactToken(1);
    const bnVal = new BigNumber(value);
    // Setting state here allows for max to be persisted in the input
    setTokenIn({ ...tokenIn, value: bnVal });
    if (tokenIn?.info && tokenOut?.info) {
      let exchangeLimit = INITIAL_MAX_EXCHANGE;

      maxExchange.maxSell.gt(0) ? (exchangeLimit = maxExchange) : (exchangeLimit = await ocean.getMaxExchange(tokenIn, tokenOut));

      const { maxSell, maxBuy, maxPercent } = exchangeLimit;

      if (bnVal.gt(maxSell) && tokenIn.balance.gte(0.00001)) {
        setTokenOut({ ...tokenOut, value: maxBuy });
        setTokenIn({ ...tokenIn, value: maxSell, percentage: maxPercent });
      } else {
        const percentage =
          tokenIn.balance.lt(0.00001) && bnVal.gt(0) ? new BigNumber(100) : new BigNumber(bnVal.div(tokenIn.balance).multipliedBy(100));
        setTokenIn({
          ...tokenIn,
          value: bnVal,
          percentage,
        });
        updateOtherTokenValue(true, bnVal);
      }
    }
  }

  async function onPercToken1(val: string) {
    if (!ocean) return;
    setExactToken(1);
    setPercLoading(true);
    if (val === '') val = '0';
    const bnVal = new BigNumber(val);
    let exchangeLimit = INITIAL_MAX_EXCHANGE;

    maxExchange.maxPercent.gt(0) ? (exchangeLimit = maxExchange) : (exchangeLimit = await ocean.getMaxExchange(tokenIn, tokenOut));

    const { maxPercent, maxBuy, maxSell, postExchange } = exchangeLimit;

    if (bnVal.gte(maxPercent) && tokenIn?.balance.gte(0.00001)) {
      setTokenIn({
        ...tokenIn,
        value: maxSell,
        percentage: maxPercent,
      });
      setTokenOut({ ...tokenOut, value: maxBuy });
      setPostExchange(postExchange);
    } else {
      updateValueFromPercentage(val);
    }
    setPercLoading(false);
  }

  async function dbUpdateToken2(value: string) {
    if (!ocean) return;
    setExactToken(2);
    const bnVal = new BigNumber(value);
    // Setting state here allows for max to be persisted in the input
    setTokenOut({ ...tokenOut, value: bnVal });
    if (tokenIn?.info && tokenOut?.info) {
      let exchangeLimit;

      maxExchange.maxBuy.gt(0) ? (exchangeLimit = maxExchange) : (exchangeLimit = await ocean.getMaxExchange(tokenIn, tokenOut));
      const { maxBuy, maxSell } = exchangeLimit;

      if (bnVal.gt(maxBuy) && tokenIn.balance.gte(0.00001)) {
        setTokenOut({ ...tokenOut, value: maxBuy });
        setTokenIn({ ...tokenIn, value: maxSell });
        setPostExchange(postExchange);
      } else {
        setTokenOut({ ...tokenOut, value: bnVal });
        updateOtherTokenValue(false, bnVal);
      }
    }
  }

  const detailsConditional = !!(tokenIn.info?.symbol && postExchange.gt(0) && tokenOut.info?.symbol);

  return (
    <>
      <DatasetDescription />
      <div
        className={`absolute w-full max-w-[32rem] top-1/2 left-1/2 transition-transform transform duration-500 ${
          showDescModal && tokenOut.info?.pool ? 'translate-x-[125%] 2lg:translate-x-0' : '-translate-x-1/2'
        } -translate-y-1/2`}
      >
        <div className="sm:mx-4 mx-3">
          <div className="flex mt-6 w-full h-full items-center justify-center">
            <div id="swapModal" className="lg:w-107 bg-black bg-opacity-90 rounded-lg p-3 hm-box">
              <TokenSelect
                setToken={setTokenIn}
                token={tokenIn}
                max={maxExchange.maxSell}
                onPerc={onPercToken1}
                onMax={() => onPercToken1('100')}
                otherToken={tokenOut?.info ? tokenOut.info.symbol : ''}
                pos={1}
                updateNum={dbUpdateToken1}
              />
              <div className="px-4 relative mt-6 mb-10">
                <div
                  id="swapTokensBtn"
                  onClick={swapTokens}
                  role="button"
                  tabIndex={0}
                  className="rounded-full border-black bg-opacity-100 border-4 absolute -top-7 bg-trade-darkBlue hover:bg-gray-600 transition-colors duration-200 w-12 h-12 flex swap-center items-center justify-center"
                >
                  {tokenOut?.loading || tokenIn?.loading || percLoading ? (
                    <MoonLoader size={25} color={'white'} />
                  ) : (
                    <IoSwapVertical size="30" className="text-gray-300" />
                  )}
                </div>
              </div>
              <TokenSelect
                setToken={setTokenOut}
                token={tokenOut}
                max={maxExchange.maxBuy}
                otherToken={tokenIn.info ? tokenIn.info.symbol : ''}
                pos={2}
                updateNum={dbUpdateToken2}
              />

              <ul
                className={`my-4 p-2 bg-black border border-city-blue border-opacity-50 transition-opacity ${
                  tokenOut?.loading || tokenIn?.loading || percLoading ? 'bg-opacity-10 text-gray-400' : 'bg-opacity-25 text-gray-300'
                } flex flex-col justify-between text-sm rounded-lg`}
              >
                <li key="exchangeRate" className="flex justify-between my-1">
                  <p>Exchange rate</p>
                  {placeHolderOrContent(
                    <p className={`${tokenOut?.loading || tokenIn?.loading || percLoading ? 'blur-xs' : ''}`}>
                      1 {tokenIn.info?.symbol} = {postExchange.dp(5).toString()} {`${' '}${tokenOut.info?.symbol}`}
                    </p>,
                    '40%',
                    detailsConditional
                  )}
                </li>
                <li key="swapFee" className="flex justify-between my-1">
                  <p>Swap Fee</p>
                  {placeHolderOrContent(
                    <p className={`${tokenOut?.loading || tokenIn?.loading || percLoading ? 'blur-xs' : ''}`}>
                      {swapFee?.dp(5).toString() + ' ' + tokenIn.info?.symbol}
                    </p>,
                    '25%',
                    detailsConditional
                  )}
                </li>{' '}
                <li key="afterSlippage" className="flex justify-between my-1">
                  <p>{exactToken === 1 ? 'Minimum Received' : 'Maximum Spent'}</p>
                  {placeHolderOrContent(
                    <p className={`${tokenOut?.loading || tokenIn?.loading || percLoading ? 'blur-xs' : ''}`}>
                      {afterSlippage?.dp(5).toString() + ' ' + tokenOut.info?.symbol}
                    </p>,
                    '30%',
                    detailsConditional
                  )}
                </li>
              </ul>

              <div className="mt-4 flex">
                <button
                  id="executeTradeBtn"
                  onClick={() => {
                    setExecuteSwap(true);
                  }}
                  className="txButton"
                  disabled={btnProps.disabled || tokenOut.loading || tokenIn.loading || percLoading}
                >
                  {btnProps.text}
                </button>
                <TxSettings />
              </div>
            </div>
          </div>
          <ViewDescBtn />
        </div>
      </div>
    </>
  );
}
