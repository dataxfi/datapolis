import axios from 'axios';
import { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
/**
 * Uses datax pathfinder to find a swap path between tokens.
 * @param tokenIn
 * @param tokenOut
 */
export default function usePathfinder(tokenIn: string | undefined, tokenOut: string | undefined) {
  const { setPath, exactToken, chainId } = useContext(GlobalContext);

  let controller = new AbortController();

  useEffect(() => {
    if (tokenIn && tokenOut && chainId) {
      console.log('Finding path for ' + tokenIn + ' ---> ' + tokenOut);
      // initially reset path on any change
      setPath(undefined);
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
        // setPath([
        //   '0x8967bcf84170c91b0d24d4302c2376283b0b3a07',
        //   '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        //   '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        // ])
        return;
      }
      axios
        .post('https://pathfinder-five.vercel.app/api/pathfinder/v2', {
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          chainId: chainId,
        })
        .then((res) => {
          console.log(res)
          const {
            data: { path },
          } = res;
          console.log(path);
          setPath(path);
        });
    }

    return () => {
      controller.abort();
      setPath(undefined);
    };
  }, [tokenIn, tokenOut]);
}
