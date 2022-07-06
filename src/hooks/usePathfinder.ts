import axios from 'axios';
import { useContext, useEffect, useRef } from 'react';
import { GlobalContext } from '../context/GlobalState';
/**
 * Uses datax pathfinder to find a swap path between tokens.
 * @param tokenIn
 * @param tokenOut
 */
export default function usePathfinder() {
  const { paths, setPaths, chainId, config, accountId, location, tokenIn, tokenOut, setPath } =
    useContext(GlobalContext);

  let controller = new AbortController();
  let lastLocation = useRef(location);
  useEffect(() => {
    console.log(tokenIn, tokenOut, chainId, config);
    if (tokenIn && tokenOut && chainId && config) {
      const pathsToOceanLink = 'https://pathfinder-five.vercel.app/api/storage/v2/pathsToOcean';
      const pathsFromOceanLink = 'https://pathfinder-five.vercel.app/api/storage/v2/pathsFromOcean';

      const getPaths = (link: string) =>
        axios
          .get(link)
          .then((res) => {
            // console.log(res);
            const {
              data: { paths },
            } = res;
            // console.log(paths);
            setPaths(paths);
          })
          .catch(() => {
            setPaths(null);
          });

      if (location === '/stake') {
        getPaths(pathsToOceanLink);
      } else {
        getPaths(pathsFromOceanLink);
      }
    }

    return () => {
      console.error('Aborting former request to pathfinder.');
      controller.abort();
      setPaths(null);
    };
  }, [location, tokenIn.info?.address, tokenOut.info?.address, chainId, config]);

  useEffect(() => {
    // console.log(tokenIn.info?.address, tokenOut.info?.address, paths);
    if (
      (location === '/stake' && (!tokenIn.info?.address || !tokenOut.info?.address)) ||
      (location === '/stake/remove' && !tokenOut.info?.address)
    ) {
      setPath(undefined);
    } else {
      let token;

      if (location === '/stake') {
        token = tokenIn.info?.address;
      } else {
        token = tokenOut.info?.address;
      }

      if (token === accountId) token = config?.custom.nativeAddress;

      // console.log('Paths', paths, 'token', token);

      if (paths && token) {
        const pathFound = paths[token.toLowerCase()];
        console.log(pathFound);
        if (pathFound) setPath(pathFound.path);
      }
    }
  }, [tokenIn.info?.address, tokenOut.info?.address, paths]);
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
