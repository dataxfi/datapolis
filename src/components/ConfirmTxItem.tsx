import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import useTokenImgSrc from '../hooks/useTokenImgSrc';
import BigNumber from 'bignumber.js';

export default function ConfirmTxItem({ pos }: { pos: 1 | 2 }) {
  const { token1, token2, location, preTxDetails } = useContext(GlobalContext);
  const [token] = useState(pos === 1 ? token1 : token2);
  const [imgSrc, setImgSrc] = useState(token.info?.logoURI);
  const [shares, setShares] = useState(new BigNumber(0));
  useTokenImgSrc(imgSrc, setImgSrc, token.info);

  const dtURI = 'https://gateway.pinata.cloud/ipfs/QmPQ13zfryc9ERuJVj7pvjCfnqJ45Km4LE5oPcFvS1SMDg/datatoken.png';
  const oceanURI = 'https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY';

  useEffect(() => {
    if (location === '/stake/remove' && preTxDetails?.shares) {
      setShares(preTxDetails?.shares);
    }
  }, [preTxDetails, location]);

  return (
    <div className="flex justify-between items-center">
      <div className="grid grid-flow-col items-center gap-4 justify-start">
        {location === '/stake/remove' && pos === 1 ? (
          <div className="flex">
            <img src={dtURI} className="rounded-lg w-10 mr-1" alt="" />
            <img src={oceanURI} className="rounded-lg w-10" alt="" />
          </div>
        ) : (
          <>
            <img src={imgSrc} className="rounded-lg w-10" alt="" />
          </>
        )}
        <p className="text-gray-100 text-lg">
          {location === '/stake/remove' && pos === 1 ? shares.dp(5).toString() : pos === 1 ? token1.value.dp(5).toString() : location === '/stake' ? preTxDetails?.shares?.dp(5).toString() : token2.value.dp(5).toString()}
        </p>
      </div>
      <p
        id={`confirmSwapItem${pos === 1 ? token1.info?.symbol : token2.info?.symbol}`}
        className="justify-self-end text-gray-100 text-lg pr-2"
      >
        {location === '/stake/remove' && pos === 1 ? 'Shares' : pos === 1 ? token1.info?.symbol : token2.info?.symbol}
        {location === '/stake' && pos === 2 ? '/OCEAN Shares' : ''}
      </p>
    </div>
  );
}
