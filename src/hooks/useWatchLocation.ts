import { useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { GlobalContext, INITIAL_TOKEN_STATE } from '../context/GlobalState';
import BigNumber from 'bignumber.js';
import useLiquidityPos from './useLiquidityPos';

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
  } = useContext(GlobalContext);
  const currentLocation = useLocation();
  const lastLocation = useRef(currentLocation);
  const [, setSearchParams] = useSearchParams();

  useLiquidityPos(importPool, setImportPool);

  useEffect(() => {
    setLocation(currentLocation.pathname);
  }, [currentLocation]);

  useEffect(() => {
    switch (currentLocation.pathname) {
      case '/stake/remove':
      case '/stake':
        if (tokenOut.info?.pool || tokenIn.info?.address) {
          setSearchParams({ pool: tokenOut.info?.pool || '', in: tokenIn.info?.address || '' }, { replace: true });
        }
        break;
      default:
        if (tokenIn.info || tokenOut.info) {
          setSearchParams({ in: tokenIn.info?.address || '', out: tokenOut.info?.address || '' }, { replace: true });
        }
        break;
    }
  }, [tokenIn.info?.address, tokenOut.info?.address]);

  useEffect(() => {
    if (currentLocation.pathname !== lastLocation.current.pathname) {
      tokensCleared.current = false;
      setSearchParams({});
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation.pathname, tokenIn.info, tokenOut.info]);

  const initialAccount = useRef(accountId);
  const navigate = useNavigate();
  useEffect(() => {
    if (
      initialAccount.current &&
      accountId !== initialAccount.current &&
      currentLocation.pathname === '/stake/remove'
    ) {
      navigate('/stake/list');
    }
    initialAccount.current = accountId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTx]);
}
