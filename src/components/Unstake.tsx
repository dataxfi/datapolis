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
import { IPoolMetaData, ITxDetails } from '../utils/types';
import useAutoLoadToken from '../hooks/useAutoLoadToken';
import TokenSelect from './TokenSelect';
import { IMaxUnstake } from '@dataxfi/datax.js';
import MaxToolTip from './MaxToolTip';
import { transactionTypeGA } from '../context/Analytics';
import useClearTokens from '../hooks/useClearTokens';
import useTxHandler from '../hooks/useTxHandler';
import TxSettings from './TxSettings';
import useCalcSlippage from '../hooks/useCalcSlippage';
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
  } = useContext(GlobalContext);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnText, setBtnText] = useState('Enter Amount to Remove');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [sharesToRemove, setSharesToRemove] = useState<BigNumber>(new BigNumber(0));
  const [removePercent, setRemovePercent] = useState<BigNumber>(new BigNumber(0));
  const [calculating, setCalculating] = useState<boolean>(false);
  const [postExchange, setPostExchange] = useState<BigNumber>(new BigNumber(0));
  const [abortCalculation, setAbortCalculation] = useState<AbortController>(new AbortController());
  const [poolMetaData, setPoolMetaData] = useState<IPoolMetaData>();

  // Max possible amount of stake to remove
  const [maxUnstake, setMaxUnstake] = useState<IMaxUnstake>({
    base: new BigNumber(0),
    shares: new BigNumber(0),
    userPerc: new BigNumber(0),
  });
  const [baseAddress, setBaseAddress] = useState<string>('');

  // hooks
  // tokenIn.info?.pool update pool in useLiquidityPos hook below
  useLiquidityPos();
  useAutoLoadToken();
  useClearTokens();
  useTxHandler(unstake, executeUnstake, setExecuteUnlock, { shares: sharesToRemove, postExchange, pool: poolMetaData });
  useCalcSlippage(sharesToRemove);

  useEffect(() => {
    if (singleLiquidityPos?.address && stake) {
      stake.getBaseToken(singleLiquidityPos.address).then(setBaseAddress);
    }
  }, [tokenOut.info?.pools[0].id, stake]);

  useEffect(() => {
    if (singleLiquidityPos) {
      setPoolMetaData({
        baseToken: singleLiquidityPos.token1Info,
        otherToken: singleLiquidityPos.token2Info,
        address: singleLiquidityPos.address,
      });
    }
  }, [singleLiquidityPos]);

  async function getMaxUnstake(signal: AbortSignal): Promise<IMaxUnstake> {
    return new Promise<IMaxUnstake>(async (resolve, reject) => {
      signal.addEventListener('abort', (e) => {
        reject(new Error('aborted'));
      });

      try {
        // .98 is a fix for the MAX_OUT_RATIO error from the contract
        if (
          !stake ||
          !singleLiquidityPos ||
          !singleLiquidityPos.address ||
          !refAddress ||
          !config ||
          !path ||
          !accountId
        )
          return;
        const stakeAmt: BigNumber = new BigNumber(
          await stake.getMaxUnstakeAmount(singleLiquidityPos.address, baseAddress)
        ).multipliedBy(0.98);

        const calcOut = await stake.calcPoolOutGivenTokenIn({
          meta: [singleLiquidityPos.address, accountId, refAddress, config.custom.uniV2AdapterAddress],
          uints: ['0', '0', stakeAmt.toString()],
          path,
        });

        let shareAmt: BigNumber;
        if (calcOut.poolAmountOut) {
          shareAmt = new BigNumber(calcOut.poolAmountOut);
          const userPerc: BigNumber = shareAmt.div(Number(singleLiquidityPos.shares)).multipliedBy(100);
          resolve({ base: stakeAmt, shares: shareAmt, userPerc });
        }
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

  useEffect(() => {
    if (stake && singleLiquidityPos && accountId && tokenOut.info) {
      getMaxUnstake(getNewSignal())
        .then((res: IMaxUnstake | void) => {
          if (res) {
            setMaxUnstake(res);
          }
        })
        .catch(console.error);

      getAllowance(tokenOut.info.address, accountId, singleLiquidityPos.address || '', stake).then((res) => {
        setTokenOut({ ...tokenOut, allowance: new BigNumber(res) });
      });
    }

    // if (singleLiquidityPos?.address) {
    //   stake
    //     ?.getstakeRemovedforPoolShares(singleLiquidityPos.address, '1')
    //     .then((res) => setPostExchange(new BigNumber(res)))
    //     .catch(console.error);
    // }
  }, [stake, singleLiquidityPos?.address, tokenOut.info?.address, accountId]);

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
    } else if (singleLiquidityPos && Number(singleLiquidityPos.shares) === 0) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText('Not Enough Shares');
    } else if (lastTx && lastTx.txType === 'unstake' && lastTx.status === 'Pending') {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText('Processing Transaction ...');
    } else if (sharesToRemove.eq(0) || removePercent.eq(0)) {
      setBtnDisabled(true);
      setBtnText('Enter Amount to Remove');
    } else if (tokenOut.value.lt(0.01)) {
      setBtnDisabled(true);
      setBtnText('Minimum Removal is .01 stake');
    } else if (tokenOut.allowance?.lt(tokenOut.value)) {
      setBtnDisabled(false);
      setBtnText(`Unlock ${tokenOut.info?.symbol}`);
    } else {
      setBtnDisabled(false);
      setBtnText('Withdrawal');
    }
  }, [tokenOut.value, lastTx, singleLiquidityPos, maxUnstake, tokenOut.allowance, tokenOut.info?.address, stake]);

  const updateNum = async (val: string) => {
    abortCalculation.abort();
    const newController = new AbortController();
    const signal = newController.signal;
    setAbortCalculation(newController);
    setCalculating(true);

    try {
      return await new Promise(async (resolve, reject) => {
        signal.addEventListener('abort', () => {
          console.error('Aborted calculation');
          return reject(new Error('User entered a new value.'));
        });
        if (val === '') val = '0';
        let max: IMaxUnstake | void;

        maxUnstake?.base.gt(0) ? (max = maxUnstake) : (max = await getMaxUnstake(getNewSignal()));

        if (max && max.base.gt(0) && max.shares.gt(0) && stake && singleLiquidityPos && path) {
          // set remove percent to percInput initially before validation
          let percInput: BigNumber = new BigNumber(val);
          setRemovePercent(percInput);

          //if perc input is <= to zero set everything to zero
          if (percInput.lte(0)) {
            setSharesToRemove(new BigNumber(0));
            setRemovePercent(new BigNumber(0));
            setTokenOut({ ...tokenOut, value: new BigNumber(0) });
            setCalculating(false);
            return resolve(0);
          }

          // if the perc input is >= 100 set input to 100
          if (percInput.gte(100)) {
            val = '100';
            percInput = new BigNumber(100);
            setRemovePercent(new BigNumber(100));
          }

          // calculate the amount of shares to unstake from perc input

          // let calcUserTotalStakeOut = await stake.calcTokenOutGivenPoolIn({
          //   meta: [singleLiquidityPos.address, accountId, refAddress, config?.custom.uniV2AdapterAddress],
          //   uints: ["0", "0", singleLiquidityPos.shares.toString()],
          //   path,
          // });

          // const userTotalStakedstake: BigNumber = new BigNumber(calcUserTotalStakeOut.poolAmountOut || 0);

          // const stakeFromPerc: BigNumber = userTotalStakedstake.times(percInput).div(100);

          // const calcSharesNeededForPercInput : BigNumber = await stake.calcPoolInGivenTokenOut(){

          // }
          // const sharesNeeded = new BigNumber(
          //   await stake.getPoolSharesRequiredToUnstake(
          //     singleLiquidityPos.address,
          //     stake.config.default.stakeTokenAddress,
          //     stakeFromPerc.toFixed(18)
          //   )
          // );

          // if (max?.base?.gt(stakeFromPerc)) {
          //   setSharesToRemove(sharesNeeded);
          //   setRemovePercent(new BigNumber(val));
          //   setTokenOut({ ...tokenOut, value: stakeFromPerc });
          //   resolve(stakeFromPerc);
          // } else {
          //   setSharesToRemove(max.shares);
          //   setRemovePercent(max.base.div(userTotalStakedstake).times(100));
          //   setTokenOut({ ...tokenOut, value: max.base });
          //   resolve(max.base);
          // }

          setCalculating(false);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  async function maxUnstakeHandler() {
    if (!stake || !singleLiquidityPos) return;
    setCalculating(true);
    const max: IMaxUnstake | void = maxUnstake?.base.gt(0) ? maxUnstake : await getMaxUnstake(getNewSignal());

    try {
      // const userTotalStakedstake: BigNumber = new BigNumber(
      //   await stake.getstakeRemovedforPoolShares(singleLiquidityPos.address, singleLiquidityPos.shares.toString())
      // );
      // // find whether user staked stakes is greater or lesser than max unstake
      // if (userTotalStakedstake.gt(max?.base)) {
      //   setSharesToRemove(max.shares);
      //   setRemovePercent(max.base.div(userTotalStakedstake).times(100));
      //   setTokenOut({ ...tokenOut, value: max.base });
      // } else {
      //   const sharesNeeded = new BigNumber(
      //     await stake.getPoolSharesRequiredToUnstake(
      //       singleLiquidityPos.address,
      //       stake.config.default.stakeTokenAddress,
      //       userTotalStakedstake.toFixed(18)
      //     )
      //   );
      //   setSharesToRemove(sharesNeeded);
      //   setRemovePercent(new BigNumber(100));
      //   setTokenOut({ ...tokenOut, value: userTotalStakedstake });
      // }
    } catch (error) {
      console.error(error);
    } finally {
      setCalculating(false);
      setExecuteUnstake(false);
      setConfirmingTx(false);
    }
  }

  async function unstake(preTxDetails: ITxDetails) {
    if (!chainId || !singleLiquidityPos || !stake || !accountId || !preTxDetails || !tokenOut.info) {
      // TODO: treat this conditional as an error and resolve whatever is falsy
      return;
    }

    setConfirmingTx(true);
    try {
      // TODO: fix this ship

      // const txReceipt = await stake.unstakestake(
      //   accountId,
      //   singleLiquidityPos.address,
      //   tokenOut.value.dp(5).toString(),
      //   singleLiquidityPos.shares.toString()
      // );

      // setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });
      transactionTypeGA('unstake');
      if (singleLiquidityPos && preTxDetails.shares) {
        const newShares = new BigNumber(singleLiquidityPos.shares).minus(preTxDetails.shares);
        setSingleLiquidityPos({ ...singleLiquidityPos, shares: newShares });
      }
    } catch (error: any) {
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
      ) : singleLiquidityPos ? (
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
                      {singleLiquidityPos.token2Info.symbol}/{singleLiquidityPos.token1Info.symbol}
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
                        onClick={() => {
                          maxUnstakeHandler();
                        }}
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
                max={maxUnstake.base}
                otherToken={singleLiquidityPos?.token2Info.symbol}
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
      ) : (
        <></>
      )}
    </div>
  );
}
