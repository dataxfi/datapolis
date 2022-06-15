import { IToken } from '@dataxfi/datax.js';
import { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
/**
 * Uses datax pathfinder to find a swap path between tokens. 
 * @param tokenIn 
 * @param tokenOut 
 */
export default function usePathfinder(tokenIn: string, tokenOut: string) {
  const { setPath, pathfinder, exactToken } = useContext(GlobalContext);

  useEffect(() => {
    console.log(tokenIn, tokenOut);
    if (pathfinder && tokenIn && tokenOut) {
      pathfinder
        .getTokenPath({
          tokenAddress: tokenIn,
          destinationAddress: tokenOut,
          IN: exactToken === 1,
        })
        .then((res) => {
          setPath(res);
          console.log(res);
        })
        .catch(console.error);
    }
  }, [pathfinder, tokenIn, tokenOut]);
}
