import React, { useContext, useEffect, useState } from 'react';
import { BsArrowDown } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalState';
import UserMessage from './UserMessage';
import { MoonLoader, PulseLoader } from 'react-spinners';
import { DebounceInput } from 'react-debounce-input';
import useLiquidityPos from '../hooks/useLiquidityPos';
import BigNumber from 'bignumber.js';
import WrappedInput from './WrappedInput';
import { getAllowance } from '../hooks/useTokenList';
import { IPoolMetaData, ITxDetails } from '../@types/types';
import useAutoLoadToken from '../hooks/useAutoLoadToken';
import TokenSelect from './TokenSelect';
import { IMaxUnstake } from '@dataxfi/datax.js';
import MaxToolTip from './MaxToolTip';
import { transactionTypeGA } from '../context/Analytics';
import useClearTokens from '../hooks/useClearTokens';
import useTxHandler from '../hooks/useTxHandler';
import TxSettings from './TxSettings';
import usePathfinder from '../hooks/usePathfinder';
import { bn, calcSlippage, to5 } from '../utils/utils';
// import PositionBox from './PositionBox';

export default function Unstake() {
  const {
    chainId,
    accountId,
    singleLiquidityPos,
    setConfirmingTx,
    setShowTxDone,
    tokenOut,
    setTokenOut,
    setLastTx,
    lastTx,
    setSingleLiquidityPos,
    setSnackbarItem,
    setExecuteUnstake,
    executeUnstake,
    setExecuteUnlock,
    setTxApproved,
    setShowConfirmTxDetails,
    setBlurBG,
    stake,
    path,
    refAddress,
    config,
    trade,
    swapFee,
    setSwapFee,
    web3,
    baseMinExchange,
    spotSwapFee,
    meta,
    preTxDetails,
    slippage,
  } = useContext(GlobalContext);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnText, setBtnText] = useState('Enter Amount to Remove');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [sharesToRemove, setSharesToRemove] = useState<BigNumber>(new BigNumber(0));
  const [removePercent, setRemovePercent] = useState<BigNumber>(new BigNumber(0));
  const [calculating, setCalculating] = useState<boolean>(false);
  const [abortCalculation, setAbortCalculation] = useState<AbortController>(new AbortController());
  const [poolMetaData, setPoolMetaData] = useState<IPoolMetaData>();
  const [dataxFee, setDataxFee] = useState<string>();
  const [allowance, setAllowance] = useState<BigNumber>();
  const [minUnstakeAmt, setMinUnstakeAmt] = useState<BigNumber>();
  const [afterSlippage, setAfterSlippage] = useState<BigNumber>(new BigNumber(0));

  // Max possible amount of stake to remove
  const [maxUnstake, setMaxUnstake] = useState<IMaxUnstake>({
    maxTokenOut: new BigNumber(0),
    maxPoolTokensIn: new BigNumber(0),
    userPerc: new BigNumber(0),
  });
  const [baseAddress, setBaseAddress] = useState<string>('');

  // hooks
  // tokenIn.info?.pool update pool in useLiquidityPos hook below
  useLiquidityPos();
  useAutoLoadToken();
  useClearTokens();
  useTxHandler(
    unstake,
    executeUnstake,
    setExecuteUnlock,
    { shares: sharesToRemove, pool: poolMetaData, dataxFee, swapFee, tokenToUnlock: 'OPT', afterSlippage },
    allowance,
    sharesToRemove
  );
  usePathfinder(baseAddress, tokenOut.info?.address || '');

  useEffect(() => {
    if (singleLiquidityPos?.address && stake) {
      stake.getBaseToken(singleLiquidityPos.address).then(setBaseAddress);
    }
  }, [singleLiquidityPos?.address, stake]);

  useEffect(() => {
    if (singleLiquidityPos) {
      setPoolMetaData({
        baseToken: singleLiquidityPos.baseToken,
        datatoken: singleLiquidityPos.datatoken,
        address: singleLiquidityPos.address,
      });
    }
  }, [singleLiquidityPos]);

  useEffect(() => {
    if (!stake || !singleLiquidityPos || !accountId || !tokenOut.info?.address || !trade || !path || !config) return;
    getMaxUnstake(getNewSignal())
      .then((res: IMaxUnstake | void) => {
        if (res) {
          setMaxUnstake(res);
        }
      })
      .catch(console.error);

    const contractToAllow = config.custom.stakeRouterAddress;
    getAllowance(singleLiquidityPos.address, accountId, contractToAllow, stake).then(async (res) => {
      console.log('Token out allowance for contract ', singleLiquidityPos.address, contractToAllow, res);
      if (tokenOut.info?.address) {
        const tokenAddress =
          tokenOut.info.address.toLowerCase() === accountId.toLowerCase() ? undefined : tokenOut.info.address;
        const balance = await trade?.getBalance(accountId, false, tokenAddress);
        setTokenOut({ ...tokenOut, balance: new BigNumber(balance) });
        setAllowance(new BigNumber(res));
      }
    });
  }, [stake, singleLiquidityPos?.address, tokenOut.info?.address, accountId, trade, path?.length, config]);

  useEffect(() => {
    // token selected is base, set min to base min
    if (path && path.length === 1) {
      setMinUnstakeAmt(new BigNumber(baseMinExchange));
      return;
    }

    // token selected is not base, calculate base min
    if (path && path.length > 1 && web3) {
      trade?.getAmountsOut(baseMinExchange, path).then((res) => setMinUnstakeAmt(new BigNumber(res[res.length - 1])));
    }
  }, [path, web3, tokenOut.info?.address]);

  useEffect(() => {
    setInputDisabled(false);
    if (!stake || !singleLiquidityPos) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText('Loading Liquidity Information');
    } else if (!tokenOut.info) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText('Select a Token');
    } else if (path && path.length === 0) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText('Routing ...');
    } else if (singleLiquidityPos && Number(singleLiquidityPos.shares) === 0) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText('Not Enough Shares');
    } else if (lastTx && lastTx.txType === 'unstake' && lastTx.status === 'Pending') {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText('Processing Transaction ...');
    } else if (sharesToRemove.eq(0) || removePercent.eq(0) || tokenOut.value.eq(0)) {
      setBtnDisabled(true);
      setBtnText('Enter Amount to Remove');
    } else if (minUnstakeAmt && tokenOut.value.lt(minUnstakeAmt)) {
      setBtnDisabled(true);
      setBtnText(`Minimum Removal is ${minUnstakeAmt.toString()} ${tokenOut.info.symbol}`);
    } else if (allowance?.lt(sharesToRemove)) {
      setBtnDisabled(false);
      setBtnText(`Unlock ${singleLiquidityPos.baseToken.symbol}/${singleLiquidityPos.datatoken.symbol} Pool Tokens`);
    } else {
      setBtnDisabled(false);
      setBtnText('Withdrawal');
    }
  }, [
    tokenOut.value,
    lastTx?.txType,
    preTxDetails?.txType,
    singleLiquidityPos,
    maxUnstake,
    tokenOut.allowance,
    tokenOut.info?.address,
    stake,
    allowance,
  ]);

  async function getMaxUnstake(signal: AbortSignal): Promise<IMaxUnstake> {
    return new Promise<IMaxUnstake>(async (resolve, reject) => {
      signal.addEventListener('abort', (e) => {
        reject(new Error('aborted'));
      });
      if (!meta || !path?.length || !accountId || !stake || !spotSwapFee) return;
      try {
        const { maxTokenOut, maxPoolTokensIn, userPerc, dataxFee, refFee } = await stake.getUserMaxUnstake(
          meta,
          path,
          accountId,
          spotSwapFee
        );

        setDataxFee(to5(dataxFee));
        setSwapFee(to5(refFee));
        setMaxUnstake({
          maxTokenOut: new BigNumber(maxTokenOut),
          maxPoolTokensIn: new BigNumber(maxPoolTokensIn),
          userPerc: new BigNumber(userPerc),
        });
      } catch (error) {
        console.error(error);
      }
    });
  }

  let controller = new AbortController();
  function getNewSignal() {
    controller.abort();
    controller = new AbortController();
    return controller.signal;
  }

  const updateNum = async (val: string) => {
    if (!accountId || !stake || !refAddress || !config) return;
    abortCalculation.abort();
    const newController = new AbortController();
    const signal = newController.signal;
    setAbortCalculation(newController);
    setCalculating(true);

    try {
      return await new Promise(async (resolve, reject) => {
        signal.addEventListener('abort', () => {
          return reject(new Error('Aborted Calculation: User entered a new value.'));
        });
        if (val === '') val = '0';
        if (
          maxUnstake &&
          maxUnstake.maxTokenOut.gt(0) &&
          maxUnstake.maxPoolTokensIn.gt(0) &&
          stake &&
          singleLiquidityPos &&
          path &&
          meta &&
          spotSwapFee
        ) {
          // set remove percent to percInput initially before validation
          let percInput: BigNumber = new BigNumber(val);
          setRemovePercent(percInput);

          //if perc input <= zero then set everything to zero
          if (percInput.lte(0)) {
            setSharesToRemove(new BigNumber(0));
            setRemovePercent(new BigNumber(0));
            setTokenOut({ ...tokenOut, value: new BigNumber(0) });
            setCalculating(false);
            return resolve(0);
          }

          // if the perc input is >= 100 or user mac perc, set input to max
          if (percInput.gte(100) || percInput.gte(maxUnstake.userPerc)) {
            return maxUnstakeHandler();
          }

          const sharesAmtFromPerc = percInput.div(100).multipliedBy(singleLiquidityPos.shares).dp(5);
          console.log(sharesAmtFromPerc.toString());

          let { baseAmountOut, dataxFee, refFee } = await stake.calcTokenOutGivenPoolIn({
            meta,
            uints: [sharesAmtFromPerc.toString(), spotSwapFee, '0'],
            path,
          });

          const basePoolName = singleLiquidityPos?.baseToken.symbol;
          if (baseAmountOut && dataxFee && refFee) {
            const amountOutBN = bn(baseAmountOut);
            const minAmountOut = calcSlippage(amountOutBN, slippage, false);
            setAfterSlippage(minAmountOut);
            setSharesToRemove(sharesAmtFromPerc);
            setDataxFee(`${to5(dataxFee)} ${basePoolName}`);
            setSwapFee(`${to5(refFee)} ${basePoolName}`);
            setTokenOut({ ...tokenOut, value: amountOutBN });
          }

          setCalculating(false);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  async function maxUnstakeHandler() {
    console.log(
      maxUnstake.maxPoolTokensIn.toString(),
      maxUnstake.userPerc.toString(),
      maxUnstake.maxTokenOut.toString()
    );
    try {
      const minAmountOut = calcSlippage(maxUnstake.maxTokenOut, slippage, false);
      setAfterSlippage(minAmountOut);
      setSharesToRemove(maxUnstake.maxPoolTokensIn);
      setRemovePercent(maxUnstake.userPerc);
      setTokenOut({ ...tokenOut, value: maxUnstake.maxTokenOut });
    } catch (error) {
      console.error(error);
    } finally {
      setCalculating(false);
      setExecuteUnstake(false);
      setConfirmingTx(false);
    }
  }

  async function unstake(preTxDetails: ITxDetails) {
    if (!chainId || !singleLiquidityPos || !stake || !accountId || !preTxDetails || !meta || !path || !spotSwapFee) {
      // TODO: treat this conditional as an error and resolve whatever is falsy
      return;
    }

    setConfirmingTx(true);
    try {
      const minAmountOut = calcSlippage(tokenOut.value, slippage, false);
      setAfterSlippage(minAmountOut);
      const stakeInfo = {
        meta,
        path,
        uints: [sharesToRemove.toString(), spotSwapFee, minAmountOut.toString()],
      };

      console.log(stakeInfo);

      const txReceipt =
        tokenOut.info?.address.toLowerCase() === config?.custom.nativeAddress.toLowerCase()
          ? await stake.unstakeETHFromDTPool(stakeInfo, accountId)
          : await stake.unstakeTokenFromDTPool(stakeInfo, accountId);

      setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });
      transactionTypeGA('unstake');

      if (singleLiquidityPos && preTxDetails.shares) {
        const newShares = new BigNumber(singleLiquidityPos.shares).minus(preTxDetails.shares);
        setSingleLiquidityPos({ ...singleLiquidityPos, shares: newShares });
      }
    } catch (error: any) {
      console.error(error);
      setLastTx({ ...preTxDetails, status: 'Failure' });
      setSnackbarItem({ type: 'error', message: error.error.message, error });
      setConfirmingTx(false);
      setShowTxDone(false);
    } finally {
      setExecuteUnstake(false);
      setSharesToRemove(new BigNumber(0));
      setRemovePercent(new BigNumber(0));
      setTokenOut({ ...tokenOut, value: new BigNumber(0) });
      setTxApproved(false);
      setShowConfirmTxDetails(false);
      setBlurBG(false);
    }
  }

  return (
    <div className="absolute top-0 w-full h-full">
      {!accountId ? (
        <UserMessage message="Connect your wallet to continue." pulse={false} container={true} />
      ) : (
        <div className="flex w-full h-full items-center pt-16 px-2">
          <div id="removeStakeModal" className="w-107 mx-auto">
            <div className="mx-auto bg-black opacity-90 w-full rounded-lg p-3 hm-box">
              <div className="flex flex-row pb-2 justify-between">
                <div className="flex flex-row items-center ">
                  <img
                    src="https://gateway.pinata.cloud/ipfs/QmPQ13zfryc9ERuJVj7pvjCfnqJ45Km4LE5oPcFvS1SMDg/datatoken.png"
                    className="rounded-lg mr-2"
                    alt=""
                    width="40px"
                  />
                  <img
                    src="https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY"
                    className="rounded-lg mr-2"
                    alt=""
                    width="40px"
                  />
                  {singleLiquidityPos ? (
                    <p className="text-gray-100 text-sm md:text-lg">
                      {singleLiquidityPos.baseToken.symbol}/{singleLiquidityPos.datatoken.symbol}
                    </p>
                  ) : (
                    <PulseLoader color="white" size="4px" margin="5px" />
                  )}
                </div>
              </div>
              <div className="md:grid md:grid-cols-5 modalSelectBg p-2 rounded">
                <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                  <p className="text-gray-100">Amount to Unstake</p>
                </div>
                <div className="col-span-3 flex justify-between mt-3 md:mt-0 bg-black bg-opacity-70 rounded-lg p-1">
                  <div className="flex w-full items-center">
                    {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
                    <span className="text-2xl disabled:hover:text-gray-400 disabled:text-gray-400 focus:text-white focus:placeholder-gray-200 placeholder-gray-400 disabled:cursor-not-allowed">
                      <DebounceInput
                        id="unstakeAmtInput"
                        step="1"
                        debounceTimeout={500}
                        onChange={(e) => updateNum(e.target.value)}
                        onWheel={(event: React.MouseEvent<HTMLButtonElement>) => event.currentTarget.blur()}
                        onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
                        type="number"
                        className="h-full w-24 rounded-lg bg-black bg-opacity-0 outline-none  text-2xl px-1  text-right"
                        placeholder="0.00"
                        value={removePercent.dp(2).toString()}
                        disabled={inputDisabled}
                        element={WrappedInput}
                        max={maxUnstake?.userPerc.dp(5).toString()}
                        data-test-max-perc={maxUnstake?.userPerc.dp(5).toString()}
                      />
                      %
                    </span>
                  </div>
                  <div>
                    <p id="sharesDisplay" className="text-sm text-gray-400 whitespace-nowrap text-right">
                      {singleLiquidityPos
                        ? Number(singleLiquidityPos?.shares) === 0
                          ? 'Shares: 0'
                          : Number(singleLiquidityPos?.shares) > 0.001
                          ? `Shares: ${singleLiquidityPos?.shares.dp(5).toString()}`
                          : 'Shares: < 0.001'
                        : '. . .'}
                    </p>
                    <div className="text-sm text-gray-300 grid grid-flow-col justify-end gap-2 items-center">
                      <MaxToolTip />
                      <button
                        id="maxUnstakeBtn"
                        onClick={maxUnstakeHandler}
                        disabled={inputDisabled}
                        className="btn-dark btn-sm rounded-full text-xs"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 relative mt-6 mb-8">
                <div className="rounded-full border-black border-4 absolute -top-7 bg-trade-darkBlue w-10 h-10 flex items-center justify-center swap-center">
                  {calculating ? (
                    <MoonLoader size={25} color={'white'} />
                  ) : (
                    <BsArrowDown size="30px" className="text-gray-300 m-0 p-0" />
                  )}
                </div>
              </div>
              <TokenSelect
                max={maxUnstake.maxTokenOut}
                otherToken={singleLiquidityPos?.datatoken.symbol || ''}
                pos={2}
                setToken={setTokenOut}
                token={tokenOut}
                updateNum={updateNum}
              />
              {/* <PositionBox /> */}
              <div className="flex mt-4">
                {/* <div className="bg-gradient"></div> */}
                <button
                  id="executeUnstake"
                  onClick={() => setExecuteUnstake(true)}
                  className="txButton"
                  disabled={btnDisabled}
                >
                  {btnText}
                </button>
                <TxSettings />
              </div>
            </div>
            <div className="pt-3 pl-3">
              <Link
                id="remove-lp-link"
                to="/stake/list"
                className="text-gray-300 hover:text-gray-100 transition-colors"
              >
                {'<'} Back to liquidity position
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
