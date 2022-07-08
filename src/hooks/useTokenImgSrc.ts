import { ITokenInfo } from '@dataxfi/datax.js';
import React, { SetStateAction, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { oceanTokens } from './useTokenList';

export default function useTokenImgSrc(
  setState: React.Dispatch<SetStateAction<string | undefined>>,
  token: ITokenInfo | null
) {
  const { chainId, tokenIn, tokenOut } = useContext(GlobalContext);

  useEffect(() => {
    // set ocean logoURI
    for (const info of Object.values(oceanTokens)) {
      if (info.address.toLowerCase() === token?.address.toLowerCase()) {
        setState('https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY');
        return;
      }
    }

    setState(token?.logoURI);

    // // or set solarbeam uris
    // if (chainId === '1285') {
    //   setState(
    //     `https://raw.githubusercontent.com/solarbeamio/solarbeam-tokenlist/main/assets/moonriver/${token?.address}/logo.png`
    //   );
    // }
  }, [token?.address, tokenIn.info?.address, tokenOut.info?.address]);
}
