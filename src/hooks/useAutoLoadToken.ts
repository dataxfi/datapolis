import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalContext, INITIAL_TOKEN_STATE } from '../context/GlobalState';
import { getToken } from './useTokenList';
export default function useAutoLoadToken() {
  const { web3, chainId, setToken2, ocean, accountId } = useContext(GlobalContext);

  const url = useLocation();
  // loads token information when url has pool address
  useEffect(() => {
    const queryParams = new URLSearchParams(url.search);
    const pool = queryParams.get('pool');

    if (pool && web3 && chainId && ocean && accountId) {
      getToken(web3, chainId, pool, 'pool').then((info) => {
        if (info) {
          const token = { ...INITIAL_TOKEN_STATE, info };
          setToken2(token);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, web3, chainId, ocean, accountId]);
}
