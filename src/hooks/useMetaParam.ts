import { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function useMetaParam() {
  const { setMeta, config, location, singleLiquidityPos, tokenIn, accountId, refAddress, tokenOut } =
    useContext(GlobalContext);

  useEffect(() => {
    if (!config || !accountId || !refAddress) return;
    let pool;
    let adapter = config.custom.uniV2AdapterAddress;

    switch (location) {
      case '/stake/remove':
        if (singleLiquidityPos) {
          pool = singleLiquidityPos?.address;
        }
        break;

      default:
        if (tokenOut.info) {
          pool = tokenOut.info?.pools[0]?.id;
        }
        break;
    }
 
    if (pool) setMeta([pool, accountId, refAddress, adapter]);
  }, [config, location, singleLiquidityPos, tokenIn, accountId, refAddress]);
}
