import { useContext, useEffect, useState } from 'react';
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
import { ITxDetails } from '../utils/types';
import useAutoLoadToken from '../hooks/useAutoLoadToken';
import TokenSelect from './TokenSelect';
import { IMaxUnstake } from '@dataxfi/datax.js';
import MaxToolTip from './MaxToolTip';
import { transactionTypeGA } from '../context/Analytics';

export default function Unstake() {
  const {
    chainId,
    accountId,
    singleLiquidityPos,
    ocean,
    setShowConfirmModal,
    setShowTxDone,
    setShowUnlockTokenModal,
    token1,
    token2,
    setToken1,
    setLastTx,
    lastTx,
    setSingleLiquidityPos,
    setSnackbarItem,
    setBlurBG,
    setExecuteUnstake,
    executeUnstake,
    setPreTxDetails,
    setExecuteUnlock,
    showUnlockTokenModal,
  } = useContext(GlobalContext);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnText, setBtnText] = useState('Enter Amount to Remove');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [shares, setShares] = useState<BigNumber>(new BigNumber(0));
  const [calculating, setCalculating] = useState<boolean>(false);
  // Max possible amount of OCEAN to remove
  const [maxUnstake, setMaxUnstake] = useState<IMaxUnstake>({
    OCEAN: new BigNumber(0),
    shares: new BigNumber(0),
    userPerc: new BigNumber(0),
  });

  async function getMaxUnstake(signal: AbortSignal): Promise<IMaxUnstake> {
    return new Promise<IMaxUnstake>(async (resolve, reject) => {
      signal.addEventListener('abort', (e) => {
        reject(new Error('aborted'));
      });

      try {
        // .98 is a fix for the MAX_OUT_RATIO error from the contract
        if (!ocean || !singleLiquidityPos || !singleLiquidityPos.address) return;
        const oceanAmt: BigNumber = new BigNumber(
          await ocean.getMaxUnstakeAmount(singleLiquidityPos.address, ocean.config.default.oceanTokenAddress)
        ).multipliedBy(0.98);

        const shareAmt: BigNumber = new BigNumber(
          await ocean.getPoolSharesRequiredToUnstake(
            singleLiquidityPos.address,
            ocean.config.default.oceanTokenAddress,
            oceanAmt.toFixed(18)
          )
        );

        const userPerc: BigNumber = shareAmt.div(Number(singleLiquidityPos.shares)).multipliedBy(100);
        resolve({ OCEAN: oceanAmt, shares: shareAmt, userPerc });
      } catch (error) {
        console.error(error);
      }
    });
  }

  // hooks
  useLiquidityPos(token1.info?.pool);
  useAutoLoadToken();

  let controller = new AbortController();
  function getNewSignal() {
    controller.abort();
    controller = new AbortController();
    return controller.signal;
  }

  useEffect(() => {
    console.log(token1, token2);

    if (ocean && singleLiquidityPos && accountId && token1.info && token2.info) {
      getMaxUnstake(getNewSignal())
        .then((res: IMaxUnstake | void) => {
          if (res) {
            setMaxUnstake(res);
            console.log('Max unstake amount set at:', { ocean: res.OCEAN.toString(), shares: res.shares.toString() });
          }
        })
        .catch(console.error);

      getAllowance(token1.info.address, accountId, token2.info.pool || '', ocean).then((res) => {
        setToken1({ ...token1, allowance: new BigNumber(res) });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, singleLiquidityPos, token1.info, token2.info, accountId]);

  useEffect(() => {
    setInputDisabled(false);
    console.log(token1.info, token2.info);

    if (!ocean || !singleLiquidityPos) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText('Loading Liquidity Information');
    } else if (!token1.info) {
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
    } else if (shares.eq(0) || token1.percentage.eq(0)) {
      setBtnDisabled(true);
      setBtnText('Enter Amount to Remove');
    } else if (token1.value.lt(0.01)) {
      setBtnDisabled(true);
      setBtnText('Minimum Removal is .01 OCEAN');
    } else if (token1.allowance?.lt(token1.value)) {
      setBtnDisabled(false);
      setBtnText(`Unlock ${token1.info?.symbol}`);
    } else {
      setBtnDisabled(false);
      setBtnText('Withdrawal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1.value, lastTx, singleLiquidityPos, maxUnstake, token1.allowance, token1.info, token2.info, ocean]);

  useEffect(() => {
    if (showUnlockTokenModal && token1.allowance?.gt(token1.value)) {
      setBlurBG(false);
      setShowUnlockTokenModal(false);
      setExecuteUnstake(true);
    }
  }, [token1.allowance]);

  useEffect(() => {
    if (!accountId || !token1.info || !token2.info) return;
    if (token1.allowance?.lt(token1.value)) {
      setPreTxDetails({
        txDateId: Date.now().toString(),
        accountId,
        status: 'Pending',
        token1,
        token2,
        txType: 'approve',
        shares,
      });
      setExecuteUnstake(false);
      setExecuteUnlock(true);
      setShowUnlockTokenModal(true);
      setBlurBG(true);
    } else if (executeUnstake) {
      setShowConfirmModal(true);
      const preTxDetails: ITxDetails = {
        txDateId: Date.now().toString(),
        accountId,
        status: 'Pending',
        token1,
        token2,
        txType: 'unstake',
        shares,
      };
      setPreTxDetails(preTxDetails);
      setLastTx(preTxDetails);
      handleUnstake(preTxDetails);
      setShowConfirmModal(true);
      setBlurBG(true);
    }
  }, [executeUnstake]);

  const updateNum = async (val: string) => {
    setCalculating(true);
    if (val === '') val = '0';
    let max: IMaxUnstake | void;

    maxUnstake?.OCEAN.gt(0) ? (max = maxUnstake) : (max = await getMaxUnstake(getNewSignal()));
    console.log(val, max.OCEAN.toString(), max.shares.toString());

    try {
      if (max && max.OCEAN.gt(0) && max.shares.gt(0) && ocean && singleLiquidityPos) {
        let percInput: BigNumber = new BigNumber(val);
        setToken1({ ...token1, percentage: percInput });
        if (percInput.lte(0)) {
          console.log('a');

          setShares(new BigNumber(0));
          setToken1({ ...token1, value: new BigNumber(0), percentage: new BigNumber(0) });
          return;
        }

        if (percInput.gte(100)) {
          val = '100';
          console.log('b');

          percInput = new BigNumber(100);
          setToken1({ ...token1, percentage: new BigNumber(100) });
        }

        if (percInput.gt(0) && percInput.lte(100)) setToken1({ ...token1, percentage: percInput });

        const userTotalStakedOcean: BigNumber = new BigNumber(
          await ocean.getOceanRemovedforPoolShares(singleLiquidityPos.address, singleLiquidityPos.shares.toString())
        );

        const oceanFromPerc: BigNumber = userTotalStakedOcean.times(percInput).div(100);

        const sharesNeeded = new BigNumber(
          await ocean.getPoolSharesRequiredToUnstake(
            singleLiquidityPos.address,
            ocean.config.default.oceanTokenAddress,
            oceanFromPerc.toFixed(18)
          )
        );

        console.log('User shares from percentage', sharesNeeded);
        if (max?.OCEAN?.gt(oceanFromPerc)) {
          setShares(sharesNeeded);
          setToken1({ ...token1, value: oceanFromPerc, percentage: new BigNumber(val) });
        } else {
          setShares(max.shares);
          setToken1({ ...token1, value: max.OCEAN, percentage: max.OCEAN.div(userTotalStakedOcean).times(100) });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCalculating(false);
    }
  };

  async function maxUnstakeHandler() {
    if (!ocean || !singleLiquidityPos) return;
    setCalculating(true);
    const max: IMaxUnstake | void = maxUnstake?.OCEAN.gt(0) ? maxUnstake : await getMaxUnstake(getNewSignal());
    console.log('Max unstake amount set at:', { ocean: max.OCEAN.toString(), shares: max.shares.toString() });

    try {
      const userTotalStakedOcean: BigNumber = new BigNumber(
        await ocean.getOceanRemovedforPoolShares(singleLiquidityPos.address, singleLiquidityPos.shares.toString())
      );

      console.log('Total user shares in ocean', userTotalStakedOcean);
      // find whether user staked oceans is greater or lesser than max unstake
      if (userTotalStakedOcean.gt(max?.OCEAN)) {
        console.log('setting to max max');

        setShares(max.shares);
        setToken1({ ...token1, value: max.OCEAN, percentage: max.OCEAN.div(userTotalStakedOcean).times(100) });
      } else {
        console.log('setting to userMAx ');

        const sharesNeeded = new BigNumber(
          await ocean.getPoolSharesRequiredToUnstake(
            singleLiquidityPos.address,
            ocean.config.default.oceanTokenAddress,
            userTotalStakedOcean.toFixed(18)
          )
        );

        setShares(sharesNeeded);
        setToken1({ ...token1, value: userTotalStakedOcean, percentage: new BigNumber(100) });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCalculating(false);
      setExecuteUnstake(false);
      setShowConfirmModal(false);
    }
  }

  async function handleUnstake(preTxDetails: ITxDetails) {
    if (!chainId || !singleLiquidityPos || !ocean || !accountId || !preTxDetails || !token1.info || !token2.info) { return; }

    setShowConfirmModal(true);
    console.log(
      `Unstaking from pool ${singleLiquidityPos.address}, ${
        singleLiquidityPos.shares
      } shares for ${token1.value?.toFixed(5)} OCEAN`
    );

    try {
      const txReceipt = await ocean.unstakeOcean(
        accountId,
        singleLiquidityPos.address,
        token1.value.dp(5).toString(),
        singleLiquidityPos.shares.toString()
      );

      setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });
      transactionTypeGA('unstake');
      if (singleLiquidityPos && preTxDetails.shares) {
        const newShares = new BigNumber(singleLiquidityPos.shares).minus(preTxDetails.shares);
        setSingleLiquidityPos({ ...singleLiquidityPos, shares: newShares });
      }
    } catch (error: any) {
      setLastTx({ ...preTxDetails, status: 'Failure' });
      setSnackbarItem({ type: 'error', message: error.message });
      setShowConfirmModal(false);
      setShowTxDone(false);
    } finally {
      setExecuteUnstake(false);
      setShares(new BigNumber(0));
      setToken1({ ...token1, value: new BigNumber(0), percentage: new BigNumber(0) });
    }
  }

  return (
    <div className="absolute top-0 w-full h-full">
      {!accountId ? (
        <UserMessage message="Connect your wallet to continue." pulse={false} container={true} />
      ) : token2.info ? (
        <div className="flex w-full h-full items-center pt-16 px-2">
          <div id="removeStakeModal" className="w-107 mx-auto">
            <div className="mx-auto bg-black opacity-90 w-full rounded-lg p-3 hm-box">
              <div className="flex flex-row pb-2 justify-between">
                <div className="flex flex-row">
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
                  {singleLiquidityPos
                    ? (
                    <p className="text-gray-100 text-sm md:text-lg">{token2.info.symbol}/OCEAN</p>
                      )
                    : (
                    <PulseLoader color="white" size="4px" margin="5px" />
                      )}
                </div>
              </div>
              <div className="md:grid md:grid-cols-5 modalSelectBg p-2 rounded">
                <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                  <p className="text-gray-100">Amount to unstake</p>
                </div>
                <div className="col-span-3 flex justify-between mt-3 md:mt-0 bg-black bg-opacity-70 rounded-lg p-1">
                  <div className="flex w-full items-center">
                    {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
                    <span className={'text-2xl hover:text-white focus-within:text-white text-primary-400'}>
                      <DebounceInput
                        id="unstakeAmtInput"
                        step="1"
                        debounceTimeout={500}
                        onChange={(e) => updateNum(e.target.value)}
                        onWheel={(event: React.MouseEvent<HTMLButtonElement>) => event.currentTarget.blur()}
                        onKeyDown={(evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
                        type="number"
                        className="h-full w-24 rounded-lg bg-black  focus:text-white bg-opacity-0 text-2xl px-1 outline-none focus:placeholder-gray-200 placeholder-gray-400 text-right"
                        placeholder="0.00"
                        value={token1.percentage?.dp(2).toString()}
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
                  {calculating
                    ? (
                    <MoonLoader size={25} color={'white'} />
                      )
                    : (
                    <BsArrowDown size="30px" className="text-gray-300 m-0 p-0" />
                      )}
                </div>
              </div>
              <TokenSelect
                max={maxUnstake.OCEAN}
                otherToken={token2.info.symbol}
                pos={1}
                setToken={setToken1}
                token={token1}
                updateNum={updateNum}
              />
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
