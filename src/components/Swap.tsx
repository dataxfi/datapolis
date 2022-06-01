import TokenSelect from './TokenSelect';
import { IoSwapVertical } from 'react-icons/io5';
import { useState, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { MoonLoader } from 'react-spinners';
import BigNumber from 'bignumber.js';
import { getAllowance } from '../hooks/useTokenList';
import { IBtnProps } from '../utils/types';
import { IMaxExchange } from '@dataxfi/datax.js';
import DatasetDescription from './DTDescriptionModal';
import ViewDescBtn from './ViewDescButton';
import { transactionTypeGA } from '../context/Analytics';
import { Collapse } from 'react-collapse';
import useClearTokens from '../hooks/useClearTokens';
import useAutoLoadToken from '../hooks/useAutoLoadToken';
import useTxHandler from '../hooks/useTxHandler';
import TxSettings from './TxSettings';
import useMinReceived from '../hooks/useMinReceived';

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
    token1,
    setToken1,
    token2,
    setToken2,
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
    minReceived,
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
  useMinReceived();

  useEffect(() => {
    getButtonProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1, token2, accountId, executeSwap, executeUnlock]);

  let controller = new AbortController();
  useEffect(() => {
    if (!tokensCleared.current) return;
    try {
      if (token1.info && token2.info && accountId && ocean) {
        updateBalance(token1.info.address)
          .then((balance) => {
            if (!balance) return;
            if (token1.info && token2.info && ocean.isOCEAN(token1.info.address)) {
              getAllowance(token1.info.address, accountId, token2.info.pool || '', ocean).then((res) => {
                setToken1({
                  ...token1,
                  allowance: new BigNumber(res),
                  balance,
                  value: new BigNumber(0),
                  percentage: new BigNumber(0),
                });
              });
            } else if (token1.info && token2.info && ocean.isOCEAN(token2.info.address)) {
              getAllowance(token1.info.address, accountId, token1.info.pool || '', ocean).then((res) => {
                setToken1({
                  ...token1,
                  allowance: new BigNumber(res),
                  balance,
                  value: new BigNumber(0),
                  percentage: new BigNumber(0),
                });
              });
            } else if (token1.info) {
              getAllowance(token1.info.address, accountId, config?.default.routerAddress, ocean).then((res) => {
                setToken1({
                  ...token1,
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
            balance ? (updatedToken1 = { ...token1, balance }) : (updatedToken1 = token1);

            ocean
              .getMaxExchange(updatedToken1, token2, signal)
              .then((res: IMaxExchange | void) => {
                if (res) {
                  setMaxExchange(res);
                }
              })
              .catch(console.error);
          });
      }

      if (token2.info) {
        updateBalance(token2.info.address).then((balance) => {
          if (balance) setToken2({ ...token2, balance, value: new BigNumber(0) });
        });
      }

      if (token1.info && !token2.info) {
        updateBalance(token1.info.address).then((balance) => {
          if (balance) setToken1({ ...token1, balance, value: new BigNumber(0) });
        });
      }
    } catch (error) {
      console.error(error);
    }

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1.info, token2.info, ocean, accountId]);

  useEffect(() => {
    if (showUnlockTokenModal && token1.allowance?.gt(token1.value)) {
      setBlurBG(false);
      setShowUnlockTokenModal(false);
      setExecuteSwap(true);
    }
  }, [token1.allowance]);

  useEffect(() => {
    if (ocean && token1.info && token1.value.gt(0) && token2.info) {
      (async () => {
        const pool = token1.info?.symbol === 'OCEAN' ? token2.info?.pool : token1.info?.pool;
        if (!pool) return;
        const swapFee = new BigNumber(await ocean.calculateSwapFee(pool, token1.value.dp(5).toString()));
        setSwapFee(swapFee);
      })();
    }
  });

  async function updateBalance(address: string) {
    if (!ocean || !accountId) return;
    return new BigNumber(await ocean.getBalance(address, accountId));
  }

  async function swapTokens() {
    setToken1({ ...token2, info: token2.info });
    setToken2({ ...token1, info: token1.info });
  }

  function updateValueFromPercentage(value: string) {
    // max case is handled in onPerc for token1
    const perc = new BigNumber(value);
    if (perc.isNaN()) {
      setToken1({ ...token1, percentage: new BigNumber(0) });
    } else if (perc.gte(100)) {
      setToken1({ ...token1, percentage: new BigNumber(100), value: token1?.balance });
      setToken2({ ...token2, percentage: new BigNumber(0) });
      updateOtherTokenValue(true, new BigNumber(100));
    } else {
      const value: BigNumber = token1.balance.multipliedBy(perc).div(100).dp(5);
      setToken1({ ...token1, percentage: perc, value });
      updateOtherTokenValue(true, value);
    }
  }

  async function updateOtherTokenValue(from: boolean, inputAmount: BigNumber) {
    if (token1?.info && token2?.info && ocean) {
      if (from) {
        setToken2({ ...token2, loading: true });
        const exchange = await ocean.calculateExchange(from, inputAmount, token1, token2);
        setPostExchange(exchange.div(inputAmount));
        setToken2({ ...token2, value: exchange, loading: false });
        setExactToken(1);
      } else {
        setToken1({ ...token1, loading: true });
        const exchange = await ocean.calculateExchange(from, inputAmount, token1, token2);
        setPostExchange(inputAmount.div(exchange));
        setToken1({ ...token1, value: exchange, loading: false });
        setExactToken(2);
      }
    }
  }

  async function swap() {
    let txReceipt = null;
    if (!preTxDetails || preTxDetails.txType !== 'swap') return;
    const decSlippage = slippage.div(100).dp(5);
    if (!chainId || !token2.info || !token1.info || !accountId || !ocean || !config) return;
    try {
      if (ocean.isOCEAN(token1.info.address)) {
        if (exactToken === 1) {
          // console.log('exact ocean to dt');
          // console.log(accountId, token2.info.pool.toString(), token2.value.toString(), token1.value.toString());
          txReceipt = await ocean.swapExactOceanToDt(
            accountId,
            token2.info.pool || '',
            token2.value.dp(5).toString(),
            token1.value.dp(5).toString(),
            decSlippage.toString()
          );
        } else {
          // console.log('ocean to exact dt');
          txReceipt = await ocean.swapExactOceanToDt(
            accountId,
            token2.info.pool || '',
            token2.value.dp(5).toString(),
            token1.value.dp(5).toString(),
            decSlippage.toString()
          );
        }
      } else if (ocean.isOCEAN(token2.info.address)) {
        if (exactToken === 1) {
          // console.log('exact dt to ocean');
          // console.log(accountId, token1.info.pool, token2.value.toString(), token1.value.toString());
          txReceipt = await ocean.swapExactDtToOcean(
            accountId,
            token1.info.pool || '',
            token2.value.dp(5).toString(),
            token1.value.dp(5).toString(),
            decSlippage.toString()
          );
        } else {
          // Error: Throws not enough datatokens
          // console.log('dt to exact ocean');
          // console.log(accountId, token1.info.pool, token2.value.toString(), token1.value.toString());
          txReceipt = await ocean.swapExactDtToOcean(
            accountId,
            token1.info.pool || '',
            token2.value.dp(5).toString(),
            token1.value.dp(5).toString(),
            decSlippage.toString()
          );
        }
      } else {
        if (exactToken === 1) {
          // console.log('exact dt to dt');
          // console.log(accountId,token1.info.address,token2.info.address,t2Val,t1Val,token1.info.pool,token2.info.pool,config.default.routerAddress,decSlippage);
          txReceipt = await ocean.swapExactDtToDt(
            accountId,
            token1.info.address,
            token2.info.address,
            token2.value.dp(5).toString(),
            token1.value.dp(5).toString(),
            token1.info.pool || '',
            token2.info.pool || '',
            config.default.routerAddress,
            decSlippage.toString()
          );
        } else {
          // console.log('dt to exact dt');
          // console.log(accountId,token1.info.address,token2.info.address,t2Val, t1Val,token1.info.pool,token2.info.pool,config.default.routerAddress,decSlippage)
          txReceipt = await ocean.swapExactDtToDt(
            accountId,
            token1.info.address,
            token2.info.address,
            token2.value.dp(5).toString(),
            token1.value.dp(5).toString(),
            token1.info.pool || '',
            token2.info.pool || '',
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

    if (accountId && !(token1?.info && token2?.info)) {
      setBtnProps({
        text: 'Select Tokens',
        disabled: true,
      });
    }

    if ((accountId && token1?.info && token2?.info && token1.value.eq(0)) || !token2.value.eq(0)) {
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

    if (accountId && token1?.info && token2?.info && token1.value.gt(0) && token1.value.gt(0)) {
      if (token1.balance.lt(token1.value)) {
        setBtnProps({
          text: `Not Enough ${token1.info.symbol}`,
          disabled: true,
        });
      } else if (
        ocean &&
        ((ocean.isOCEAN(token1.info.address) && token1.value.lt(0.01) && token1.value.gt(0)) ||
          (ocean.isOCEAN(token2.info.address) && token2.value.lt(0.01) && token2.value.gt(0)))
      ) {
        setBtnProps({
          text: 'Minimum trade is .01 OCEAN',
          disabled: true,
        });
      } else if (token1.value.lt(0.001) && token1.value.gt(0)) {
        setBtnProps({
          text: `Minimum trade is .001 ${token1.info.symbol}`,
          disabled: true,
        });
      } else if (token2.value.lt(0.001) && token2.value.gt(0)) {
        setBtnProps({
          text: `Minimum trade is .001 ${token2.info.symbol}`,
          disabled: true,
        });
      } else if (token1.allowance?.lt(token1.value)) {
        setBtnProps({
          text: `Unlock ${token1.info.symbol}`,
          disabled: false,
        });
      } else if (token1.balance.dp(5).gte(token1.value) && !token1.balance.eq(0)) {
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
    setToken1({ ...token1, value: bnVal });
    if (token1?.info && token2?.info) {
      let exchangeLimit = INITIAL_MAX_EXCHANGE;

      maxExchange.maxSell.gt(0) ? (exchangeLimit = maxExchange) : (exchangeLimit = await ocean.getMaxExchange(token1, token2));

      const { maxSell, maxBuy, maxPercent } = exchangeLimit;

      if (bnVal.gt(maxSell) && token1.balance.gte(0.00001)) {
        setToken2({ ...token2, value: maxBuy });
        setToken1({ ...token1, value: maxSell, percentage: maxPercent });
      } else {
        const percentage =
          token1.balance.lt(0.00001) && bnVal.gt(0) ? new BigNumber(100) : new BigNumber(bnVal.div(token1.balance).multipliedBy(100));
        setToken1({
          ...token1,
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

    maxExchange.maxPercent.gt(0) ? (exchangeLimit = maxExchange) : (exchangeLimit = await ocean.getMaxExchange(token1, token2));

    const { maxPercent, maxBuy, maxSell, postExchange } = exchangeLimit;

    if (bnVal.gte(maxPercent) && token1?.balance.gte(0.00001)) {
      setToken1({
        ...token1,
        value: maxSell,
        percentage: maxPercent,
      });
      setToken2({ ...token2, value: maxBuy });
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
    setToken2({ ...token2, value: bnVal });
    if (token1?.info && token2?.info) {
      let exchangeLimit;

      maxExchange.maxBuy.gt(0) ? (exchangeLimit = maxExchange) : (exchangeLimit = await ocean.getMaxExchange(token1, token2));
      const { maxBuy, maxSell } = exchangeLimit;

      if (bnVal.gt(maxBuy) && token1.balance.gte(0.00001)) {
        setToken2({ ...token2, value: maxBuy });
        setToken1({ ...token1, value: maxSell });
        setPostExchange(postExchange);
      } else {
        setToken2({ ...token2, value: bnVal });
        updateOtherTokenValue(false, bnVal);
      }
    }
  }

  return (
    <>
      <DatasetDescription />
      <div
        className={`absolute w-full max-w-[32rem] top-1/2 left-1/2 transition-transform transform duration-500 ${
          showDescModal && token2.info?.pool ? 'translate-x-[125%] 2lg:translate-x-0' : '-translate-x-1/2'
        } -translate-y-1/2`}
      >
        <div className="sm:mx-4 mx-3">
          <div className="flex mt-6 w-full h-full items-center justify-center">
            <div id="swapModal" className="lg:w-107 bg-black bg-opacity-90 rounded-lg p-3 hm-box">
              <TxSettings />
              <TokenSelect
                setToken={setToken1}
                token={token1}
                max={maxExchange.maxSell}
                onPerc={onPercToken1}
                onMax={() => onPercToken1('100')}
                otherToken={token2?.info ? token2.info.symbol : ''}
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
                  {token2?.loading || token1?.loading || percLoading ? (
                    <MoonLoader size={25} color={'white'} />
                  ) : (
                    <IoSwapVertical size="30" className="text-gray-300" />
                  )}
                </div>
              </div>
              <TokenSelect
                setToken={setToken2}
                token={token2}
                max={maxExchange.maxBuy}
                otherToken={token1.info ? token1.info.symbol : ''}
                pos={2}
                updateNum={dbUpdateToken2}
              />

              <Collapse
                isOpened={
                  !!(token1?.info && token2?.info && token1.value.gt(0) && token2.value.gt(0) && postExchange.gt(0))
                }
              >
                <div
                  className={`my-4 p-2 bg-black border border-city-blue border-opacity-50 transition-opacity ${
                    token2?.loading || token1?.loading || percLoading ? 'bg-opacity-10 text-gray-400' : 'bg-opacity-25 text-gray-300'
                  } flex flex-col justify-between text-sm rounded-lg`}
                >
                  <div className="flex justify-between my-1">
                    <p>Exchange rate</p>
                    <p className={`${token2?.loading || token1?.loading || percLoading ? 'blur-xs' : ''}`}>
                      1 {token1.info?.symbol} = {postExchange.dp(5).toString()} {`${' '}${token2.info?.symbol}`}
                    </p>
                  </div>
                  <div className="flex justify-between my-1">
                    <p>Swap Fee</p>
                    <p className={`${token2?.loading || token1?.loading || percLoading ? 'blur-xs' : ''}`}>
                      {swapFee?.dp(5).toString() + ' ' + token1.info?.symbol}
                    </p>
                  </div>{' '}
                  <div className="flex justify-between my-1">
                    <p>{exactToken === 1 ? 'Minimum Received' : 'Maximum Spent'}</p>
                    <p className={`${token2?.loading || token1?.loading || percLoading ? 'blur-xs' : ''}`}>
                      {minReceived?.dp(5).toString() + ' ' + token2.info?.symbol}
                    </p>
                  </div>
                </div>
              </Collapse>

              <div className="mt-4">
                <button
                  id="executeTradeBtn"
                  onClick={() => {
                    setExecuteSwap(true);
                  }}
                  className="txButton"
                  disabled={btnProps.disabled || token2.loading || token1.loading || percLoading}
                >
                  {btnProps.text}
                </button>
              </div>
            </div>
          </div>
          <ViewDescBtn />
        </div>
      </div>
    </>
  );
}
