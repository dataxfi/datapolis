import { useContext, useEffect } from 'react';
import { GlobalContext, INITIAL_TOKEN_STATE } from '../context/GlobalState';

export default function useClearTokens() {
  const { setTokenIn, setTokenOut, selectTokenPos } = useContext(GlobalContext);
  useEffect(() => {
    setTokenIn(INITIAL_TOKEN_STATE);
    setTokenOut(INITIAL_TOKEN_STATE);
    selectTokenPos.current = null;
  }, []);
}
