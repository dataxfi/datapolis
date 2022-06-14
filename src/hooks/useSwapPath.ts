import { IToken } from '@dataxfi/datax.js';
import { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function useSwapPath(tokenIn: IToken, tokenOut: IToken) {
  const { pathfinder, exactToken } = useContext(GlobalContext);

  useEffect(() => {
    console.log(tokenIn.info?.address, tokenOut.info?.address);
    if (pathfinder && tokenIn.info?.address && tokenOut.info?.address) {
      pathfinder
        .getTokenPath({
          tokenAddress: tokenIn.info.address,
          destinationAddress: tokenOut.info.address,
          IN: exactToken === 1,
        })
        .then(console.log);
      // setPath
    }
  }, [pathfinder, tokenIn.info?.address, tokenOut.info?.address]);
}
