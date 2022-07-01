import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { BiLockAlt, BiLockOpenAlt } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import BigNumber from 'bignumber.js';
import { getAllowance } from '../hooks/useTokenList';
import CenterModal from './CenterModal';
import { Config } from '@dataxfi/datax.js';

export default function UnlockTokenModal() {
  const {
    accountId,
    config,
    setShowUnlockTokenModal,
    setSnackbarItem,
    lastTx,
    tokenIn,
    tokenOut,
    setLastTx,
    setTokenIn,
    location,
    showUnlockTokenModal,
    setExecuteStake,
    setExecuteSwap,
    setExecuteUnstake,
    setBlurBG,
    preTxDetails,
    executeUnlock,
    setExecuteUnlock,
    approving,
    setApproving,
    chainId,
    stake,
    trade,
    singleLiquidityPos,
  } = useContext(GlobalContext);
  const [pool, setPool] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const remove = '/stake/remove';

  useEffect(() => {
    if (showUnlockTokenModal) setApproving('pending');
  }, [showUnlockTokenModal]);

  // Set up the interval.
  useEffect(() => {
    let delay: number | null = 1500;
    let id: NodeJS.Timeout;
    if (accountId && pool && address && stake) {
      id = setInterval(
        () =>
          getAllowance(address, accountId, pool, stake).then((res) => {
            const txAmount =
              location === '/stake/remove' && preTxDetails?.shares ? preTxDetails?.shares : tokenIn.value;
            const allowance = new BigNumber(res);
            if (allowance.gte(txAmount)) {
              setExecuteUnlock(false);
              setShowUnlockTokenModal(false);
              setPool(null);
              setAddress(null);
              setBlurBG(false);
              delay = null;
            }
          }),
        delay
      );
    }
    return () => clearInterval(id);
  }, [address, accountId, pool, stake]);

  async function unlockTokens(amount: 'perm' | 'once') {
    console.log(!preTxDetails, !chainId, !config?.custom, !trade, !tokenIn.info?.address, singleLiquidityPos?.address);
    if (
      !preTxDetails ||
      !chainId ||
      !config?.custom ||
      !trade ||
      (!tokenIn.info?.address && !singleLiquidityPos?.address)
    )
      return;
    setApproving('approving');
    setLastTx({ ...preTxDetails, status: 'Pending' });

    if (stake) {
      let spender: string = '';
      let address: string = '';

      if (location !== '/trade' && tokenOut.info) {
        console.log('Getting base address in unlock token modal');
        const poolForBaseToken =
          location === '/stake/remove' ? singleLiquidityPos?.address : tokenOut.info?.pools[0].id;
        if (!poolForBaseToken) return;
        const baseAddress = await stake.getBaseToken(poolForBaseToken);
        console.log('Base address in unlock token modal', baseAddress);

        let contractToAllow = config.custom.stakeRouterAddress;

        const addressToApprove = location === '/stake/remove' ? singleLiquidityPos?.address : tokenIn.info?.address;
        if (contractToAllow && addressToApprove) {
          console.log('token in address, and contract to allow', contractToAllow, contractToAllow);
          address = addressToApprove;
          spender = contractToAllow;
        }
      }

      const approveTokenDecimals = location === '/stake/remove' ? 18 : tokenIn.info?.decimals;
      try {
        if (!accountId || (lastTx?.txType === 'unstake' && !lastTx?.shares)) return;
        let txReceipt;
        if (amount === 'perm') {
          //TODO:Make this max uint 256
          txReceipt = await trade.approve(
            address,
            accountId,
            new BigNumber(18e10).toString(),
            spender,
            false,
            approveTokenDecimals
          );
          setTokenIn({ ...tokenIn, allowance: new BigNumber(18e10) });
        } else {
          const txAmount = location === '/stake/remove' ? preTxDetails.shares : tokenIn.value;
          if (txAmount)
            txReceipt = await trade.approve(
              address,
              accountId,
              txAmount.plus(0.001).toString(),
              spender,
              false,
              approveTokenDecimals
            );
          setTokenIn({ ...tokenIn, allowance: tokenIn.value.plus(0.001) });
        }
        if (typeof txReceipt !== 'string') setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });
        setApproving('approved');
        setPool(spender);
        setAddress(address);
      } catch (error: any) {
        console.error('Caught error : unlock token', error);
        setShowUnlockTokenModal(false);
        setExecuteUnlock(false);
        if (lastTx) setLastTx({ ...lastTx, status: 'Failure' });
        let message = error.message;
        if (error?.error?.message.includes('Failed to check'))
          message = 'Failed to check for transaction receipt. Check the transaction in your wallet.';
        setSnackbarItem({ type: 'error', message, error });
        switchOnLocation(false);
        setBlurBG(false);
      }
    }
  }

  function switchOnLocation(setExecute: boolean) {
    switch (location) {
      case '/trade':
        setExecuteSwap(setExecute);
        break;
      case '/stake':
        setExecuteStake(setExecute);
        break;
      case '/stake/remove':
        setExecuteUnstake(setExecute);
        break;
    }
  }

  function close() {
    setBlurBG(false);
    setShowUnlockTokenModal(false);
    switchOnLocation(false);
    if (approving === 'pending') {
      setExecuteUnlock(false);
    }
  }

  // console.log(preTxDetails, showUnlockTokenModal, executeUnlock);
  return preTxDetails && showUnlockTokenModal ? (
    <CenterModal id="unlockTokenModal" onOutsideClick={close} className="sm:max-w-sm w-full z-30 shadow">
      <div className="bg-black border items-center flex flex-col rounded-lg pb-8 pt-2 px-4 hm-box mx-3">
        <div className="flex w-full  justify-end">
          <button onClick={close}>
            <MdClose id="closeTokenModalBtn" className="text-gray-100 text-2xl" />
          </button>
        </div>
        <div className="pb-5">
          {approving === 'pending' ? (
            <BiLockAlt size="72px" className="text-city-blue" />
          ) : approving === 'approving' ? (
            <BiLockAlt size="72px" className="text-city-blue animate-bounce" />
          ) : (
            <BiLockOpenAlt size="72px" className="text-city-blue animate-bounce" />
          )}
        </div>
        <h3 className="text-sm lg:text-2xl pb-5">Unlock {tokenIn.info?.symbol || preTxDetails?.tokenToUnlock}</h3>
        <p className="text-sm lg:text-base text-center pb-5">
          DataX needs your permission to spend{' '}
          {location === remove ? preTxDetails.shares?.dp(5).toString() : tokenIn.value.dp(5).toString()}{' '}
          {location === remove ? 'OPT' : tokenIn.info?.symbol}.
        </p>

        <button
          id="perm-unlock-btn"
          onClick={() => {
            unlockTokens('perm');
          }}
          className="w-full p-2 rounded-lg mb-2 bg-opacity-20 txButton"
          disabled={!!(approving === 'approving' || pool || address)}
        >
          Unlock Permanently
        </button>
        <button
          id="unlock-once-btn"
          onClick={() => {
            unlockTokens('once');
          }}
          disabled={!!(approving === 'approving' || pool || address)}
          className="w-full p-2 rounded-lg mb-2 bg-opacity-20 txButton"
        >
          Unlock this time only
        </button>
      </div>
    </CenterModal>
  ) : (
    <div className="mt-4">
      <button
        id="confirmSwapModalBtn"
        onClick={() => {
          unlockTokens('once');
        }}
        className="px-4 py-2 text-lg w-full txButton rounded-lg"
      >
        Confirm swap
      </button>
    </div>
  );
}
