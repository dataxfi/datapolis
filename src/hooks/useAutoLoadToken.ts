import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalContext, INITIAL_TOKEN_STATE } from '../context/GlobalState';
import { getToken } from './useTokenList';
export default function useAutoLoadToken() {
  const { web3, chainId, setTokenOut, accountId, setTokenIn, location, config } = useContext(GlobalContext);

  const url = useLocation();
  useEffect(() => {
    // cannot use useSearchParams() here
    const queryParams = new URLSearchParams(url.search);
    const pool = queryParams.get('pool');
    const inAddress = queryParams.get('in');
    const outAddress = queryParams.get('out');

    function setToken(address: string, isPool: boolean, pos: 1 | 2) {
      console.log('Can set token?', !!web3 , !!chainId, !!accountId);
      console.log(web3, chainId, accountId);
      if (web3 && chainId && accountId && config)
        getToken(web3, chainId, address, isPool ? 'pool' : 'exchange', config ).then((info) => {
          console.log("Info found", info)
          if (info) {
            const token = { ...INITIAL_TOKEN_STATE, info };
            pos === 1 ? setTokenIn(token) : setTokenOut(token);
          }
        });
    }

    console.log('Will autoload pool?', pool && location === '/stake');
    if (pool && location === '/stake') {
      setToken(pool, true, 2);
    }

    if (inAddress) {
      setToken(inAddress, false, 1);
    }

    if (outAddress) {
      setToken(outAddress, false, 2);
    }
  }, [web3, chainId, location, accountId]);
}
