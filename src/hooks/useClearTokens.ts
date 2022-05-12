import { useContext, useEffect } from 'react';
import { GlobalContext, INITIAL_TOKEN_STATE } from '../context/GlobalState';

export default function useClearTokens() {
  const { setToken1, setToken2, selectTokenPos } = useContext(GlobalContext);
  useEffect(() => {
    setToken1(INITIAL_TOKEN_STATE);
    setToken2(INITIAL_TOKEN_STATE);
    selectTokenPos.current = null;
  }, []);
}
