import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { BiLockAlt, BiLockOpenAlt } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import BigNumber from 'bignumber.js';
import { getAllowance } from '../hooks/useTokenList';
import CenterModal from './CenterModal';

export default function UnlockTokenModal() {
  const {
    accountId,
    config,
    ocean,
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
    if (accountId && ocean && pool && address) {
      id = setInterval(
        () =>
          getAllowance(address, accountId, pool, ocean).then((res) => {
            const allowance = new BigNumber(res);
            if (allowance.gte(tokenIn.value)) {
              setExecuteUnlock(false);
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
  }, [address, accountId, pool, ocean]);

  async function unlockTokens(amount: 'perm' | 'once') {
    if (!preTxDetails) return;
    setApproving('approving');
    setLastTx({ ...preTxDetails, status: 'Pending' });

    if (ocean) {
      let pool: string = '';
      let address: string = '';

      if (tokenIn.info && tokenOut.info && ocean.isOCEAN(tokenIn.info.address)) {
        pool = tokenOut.info.pool || '';
        address = tokenIn.info.address;
      } else if (tokenIn.info && tokenOut.info && ocean.isOCEAN(tokenOut.info.address)) {
        pool = tokenIn.info.pool || '';
        address = tokenIn.info.address;
      } else if (tokenIn.info) {
        pool = config?.default.routerAddress;
        address = tokenIn.info.address;
      }

      try {
        if (!accountId || (lastTx?.txType === 'unstake' && !lastTx?.shares)) return;
        let txReceipt;
        if (amount === 'perm') {
          txReceipt = await ocean.approve(address, pool, new BigNumber(18e10).toString(), accountId);
          setTokenIn({ ...tokenIn, allowance: new BigNumber(18e10) });
        } else {
          txReceipt = await ocean.approve(address, pool, tokenIn.value.plus(0.001).toString(), accountId);
          setTokenIn({ ...tokenIn, allowance: tokenIn.value.plus(0.001) });
        }

        setLastTx({ ...preTxDetails, txReceipt, status: 'Indexing' });

        setApproving('approved');
        setPool(pool);
        setAddress(address);
      } catch (error: any) {
        if (lastTx) setLastTx({ ...lastTx, status: 'Failure' });
        setSnackbarItem({ type: 'error', message: error.error.message, error });
        setShowUnlockTokenModal(false);
        setExecuteUnlock(false);
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

  return tokenIn.info && preTxDetails && showUnlockTokenModal && executeUnlock ? (
    location !== '/moo' ? (
      <CenterModal id="transactionDoneModal" onOutsideClick={close} className="sm:max-w-sm w-full z-30 shadow">
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
          <h3 className="text-sm lg:text-2xl pb-5">Unlock {tokenIn.info.symbol}</h3>
          <p className="text-sm lg:text-base text-center pb-5">
            DataX needs your permission to spend{' '}
            {location === remove ? preTxDetails.shares?.dp(5).toString() : tokenIn.value.dp(5).toString()}{' '}
            {location === remove ? 'shares' : tokenIn.info.symbol}.
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
    )
  ) : (
    <></>
  );
}
