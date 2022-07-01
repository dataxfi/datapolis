import axios from 'axios';
import { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
/**
 * Uses datax pathfinder to find a swap path between tokens.
 * @param tokenIn
 * @param tokenOut
 */
export default function usePathfinder(tokenIn: string | undefined, tokenOut: string | undefined) {
  const { path, setPath, chainId, config, accountId, location } = useContext(GlobalContext);

  let controller = new AbortController();

  useEffect(() => {
    if (tokenIn && tokenOut && chainId && config) {
      console.log('Finding path for ' + tokenIn + ' ---> ' + tokenOut);
      // initially reset path on any change
      // if(path && (location === "/stake" && path[0] === this))
      setPath([]);


      if(tokenIn === accountId) tokenIn = config.custom.nativeAddress
      if(tokenOut === accountId) tokenOut = config.custom.nativeAddress

      axios
        .post('https://pathfinder-five.vercel.app/api/pathfinder/v2', {
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          chainId: chainId,
        })
        .then((res) => {
          console.log(res);
          const {
            data: { path },
          } = res;
          console.log(path);
          setPath(path);
        })
        .catch(() => {
          setPath(null);
        });
    }

    return () => {
      console.error("Aborting former request to pathfinder.")
      controller.abort();
      setPath([]);
    };
  }, [tokenIn, tokenOut]);
}


      // if (chainId === '4') {
      //   console.log('setting path');
      //   // DAI -> ETH -> OCEAN
      //   // setPath([
      //   //   '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
      //   //   '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      //   //   '0x8967bcf84170c91b0d24d4302c2376283b0b3a07',
      //   // ]);

      //   // // uni -> eth -> ocean
      //   // setPath([
      //   //   '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      //   //   '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      //   //   '0x8967bcf84170c91b0d24d4302c2376283b0b3a07',
      //   // ])
      //   // ETH -> DAI
      //   // setPath(['0xc778417E063141139Fce010982780140Aa0cD5Ab','0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735']);

      //   // OCEAN
      //   // setPath(['0x8967bcf84170c91b0d24d4302c2376283b0b3a07']);

      //   // ETH->OCEAN
      //   // setPath(['0xc778417E063141139Fce010982780140Aa0cD5Ab', '0x8967bcf84170c91b0d24d4302c2376283b0b3a07']);

      //   //OCEAN -> ETH
      //   // setPath(['0x8967bcf84170c91b0d24d4302c2376283b0b3a07', '0xc778417E063141139Fce010982780140Aa0cD5Ab']);

      //   // ocean -> eth -> uni
      //   // setPath([
      //   //   '0x8967bcf84170c91b0d24d4302c2376283b0b3a07',
      //   //   '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      //   //   '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      //   // ])
      //   return;
      // }