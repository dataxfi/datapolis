import { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
/**
 * Uses datax pathfinder to find a swap path between tokens.
 * @param tokenIn
 * @param tokenOut
 */
export default function usePathfinder(tokenIn: string, tokenOut: string) {
  const { setPath, pathfinder, exactToken, chainId } = useContext(GlobalContext);

  useEffect(() => {
    if (pathfinder && tokenIn && tokenOut) {
      if (chainId === '4') {
        console.log('setting path');
        // DAI -> ETH -> OCEAN
        // setPath([
        //   '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
        //   '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        //   '0x8967bcf84170c91b0d24d4302c2376283b0b3a07',
        // ]);

        // // uni -> eth -> ocean
        // setPath([
        //   '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        //   '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        //   '0x8967bcf84170c91b0d24d4302c2376283b0b3a07',
        // ])
        // ETH -> DAI
        // setPath(['0xc778417E063141139Fce010982780140Aa0cD5Ab','0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735']);

        // OCEAN
        // setPath(['0x8967bcf84170c91b0d24d4302c2376283b0b3a07']);

        // ETH->OCEAN
        // setPath(['0xc778417E063141139Fce010982780140Aa0cD5Ab', '0x8967bcf84170c91b0d24d4302c2376283b0b3a07']);

        //OCEAN -> ETH
        // setPath(['0x8967bcf84170c91b0d24d4302c2376283b0b3a07', '0xc778417E063141139Fce010982780140Aa0cD5Ab']);

        // ocean -> eth -> uni
        setPath([
          '0x8967bcf84170c91b0d24d4302c2376283b0b3a07',
          '0xc778417E063141139Fce010982780140Aa0cD5Ab',
          '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        ])
        return;
      }

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
