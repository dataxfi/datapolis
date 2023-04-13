import { useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { GlobalContext, INITIAL_TOKEN_STATE } from '../context/GlobalState';
import BigNumber from 'bignumber.js';

import { bn } from '../utils/utils';

// work around for being able to use useLocation globaly without a conditionaly rendered component

export default function useWatchLocation() {
  const {
    setLocation,
    tokenOut,
    tokensCleared,
    accountId,
    confirmingTx,
    setConfirmingTx,
    setShowTxDone,
    lastTx,
    setTokenIn,
    tokenIn,
    setTokenOut,
    location,
    setT2DIDResponse,
    importPool,
    setImportPool,
    setExactToken,
    chainId,
    setBalanceTokenIn,
    setBalanceTokenOut,
  } = useContext(GlobalContext);
  const currentLocation = useLocation();
  const lastLocation = useRef(currentLocation);
  const [searchParams, setSearchParams] = useSearchParams();



  useEffect(() => {
    setLocation(currentLocation.pathname);
    if (currentLocation.pathname === '/stake/list') {
      setTokenIn(INITIAL_TOKEN_STATE);
      setTokenOut(INITIAL_TOKEN_STATE);
      setBalanceTokenIn(bn(0));
      setBalanceTokenOut(bn(0));
    }
  }, [currentLocation]);

  function switchOnPathParams() {
    if (!chainId) return;
    const chainInParams = searchParams.get('on');
    if (chainInParams && chainInParams !== chainId) return setSearchParams({});
    switch (currentLocation.pathname) {
      case '/stake/remove':
        if (tokenOut.info?.address) {
          const pool = searchParams.get('pool');
          setSearchParams({ on: chainId, pool: pool || '', out: tokenOut.info?.address || '' }, { replace: true });
        }
        break;
      case '/stake':
        if (tokenOut.info?.pools[0].id || tokenIn.info?.address) {
          setSearchParams(
            { on: chainId, pool: tokenOut.info?.pools[0].id || '', in: tokenIn.info?.address || '' },
            { replace: true }
          );
        }
        break;
      case '/stake/list':
        setSearchParams({});
        break;
      default:
        if (tokenIn.info || tokenOut.info) {
          setSearchParams(
            { on: chainId, in: tokenIn.info?.address || '', out: tokenOut.info?.address || '' },
            { replace: true }
          );
        }
        break;
    }
  }

  useEffect(() => {
    if (currentLocation.pathname !== lastLocation.current.pathname) {
      tokensCleared.current = false;
    }

    if (currentLocation.pathname === '/trade') {
      if (!tokenIn.info && !tokenOut.info) {
        tokensCleared.current = true;
        lastLocation.current = currentLocation;
      }
    } else if (!tokenOut.info) {
      tokensCleared.current = true;
      lastLocation.current = currentLocation;
    }

    if (tokensCleared && currentLocation.pathname === lastLocation.current.pathname) {
      switchOnPathParams();
    }
  }, [currentLocation.pathname, tokenIn.info?.address, tokenOut.info?.address, chainId]);

  const initialAccount = useRef(accountId);
  const navigate = useNavigate();
  useEffect(() => {
    if (
      (initialAccount.current &&
        accountId !== initialAccount.current &&
        currentLocation.pathname === '/stake/remove') ||
      (currentLocation.pathname === '/stake/remove' && !searchParams.get('pool'))
    ) {
      navigate('/stake/list');
    }
    initialAccount.current = accountId;
  }, [accountId]);

  useEffect(() => {
    if (lastTx && lastTx.status === 'Indexing' && lastTx.txType !== 'approve') {
      if (confirmingTx) {
        setConfirmingTx(false);
        setShowTxDone(true);
      }
      if (location === '/stake/remove') {
        setTokenIn({ ...tokenIn, value: new BigNumber(0), percentage: new BigNumber(0) });
        setExactToken(2);
      } else if (location === '/trade' || location === '/stake') {
        setTokenIn(INITIAL_TOKEN_STATE);
        setTokenOut(INITIAL_TOKEN_STATE);
        setT2DIDResponse(undefined);
        setExactToken(1);
      } else if (location === '/stake/list') {
        setTokenIn(INITIAL_TOKEN_STATE);
        setTokenOut(INITIAL_TOKEN_STATE);
        setBalanceTokenIn(bn(0));
        setBalanceTokenOut(bn(0));
      }
    }
  }, [lastTx]);
}
