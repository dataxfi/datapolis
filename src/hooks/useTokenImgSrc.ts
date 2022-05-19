import { ITokenInfo } from '@dataxfi/datax.js';
import React, { SetStateAction, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function useTokenImgSrc(setState:React.Dispatch<SetStateAction<string | undefined>>, token: ITokenInfo) {
  const { chainId } = useContext(GlobalContext);

  useEffect(() => {
    if (chainId === '1285') {
      setState(
          `https://raw.githubusercontent.com/solarbeamio/solarbeam-tokenlist/main/assets/moonriver/${token.address}/logo.png`
      );
    }
  }, [chainId]);
}
