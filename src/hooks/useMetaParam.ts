import { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function useMetaParam() {
  const { setMeta, config, location, singleLiquidityPos, tokenIn, accountId, refAddress } = useContext(GlobalContext);

  useEffect(() => {
    if (!config || !accountId || !refAddress) return;
    let pool = tokenIn.info?.pools[0].id || '';
    let adapter = config.custom.uniV2AdapterAddress;

    if (location === '/stake/remove' && singleLiquidityPos) {
      pool = singleLiquidityPos?.address;
    }

    setMeta([pool, accountId, refAddress, adapter]);
  }, [config, location, singleLiquidityPos, tokenIn, accountId, refAddress]);
}
