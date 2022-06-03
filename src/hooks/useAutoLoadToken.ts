import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalContext, INITIAL_TOKEN_STATE } from '../context/GlobalState';
import { getToken } from './useTokenList';
export default function useAutoLoadToken() {
  const { web3, chainId, setTokenOut, ocean, accountId, setTokenIn, location } =
    useContext(GlobalContext);

  const url = useLocation();
  useEffect(() => {
    // cannot use useSearchParams() here
    const queryParams = new URLSearchParams(url.search);
    const pool = queryParams.get('pool');
    const inAddress = queryParams.get('in');
    const outAddress = queryParams.get('out');

    function setToken(address: string, isPool: boolean, pos: 1 | 2) {
      if (!web3 || !chainId || !ocean || !accountId) return;
      getToken(web3, chainId, address, isPool ? 'pool' : 'exchange').then((info) => {
        if (info) {
          const token = { ...INITIAL_TOKEN_STATE, info };
          pos === 1 ? setTokenIn(token) : setTokenOut(token);
        }
      });
    }

    if (pool && location === '/stake') {
      setToken(pool, true, 2);
    }

    if (inAddress) {
      setToken(inAddress, false, 1);
    }

    if (outAddress) {
      setToken(outAddress, false, 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3, chainId, ocean, location, accountId]);
}
