import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import useTokenImgSrc from '../hooks/useTokenImgSrc';

export default function ConfirmTxItem({ pos }: { pos: 1 | 2 }) {
  const { token1, token2, location, preTxDetails } = useContext(GlobalContext);
  const [token] = useState(pos === 1 ? token1 : token2);
  const [imgSrc, setImgSrc] = useState(token.info?.logoURI);
  useTokenImgSrc(imgSrc, setImgSrc, token.info);

  return (
    <div className="flex justify-between items-center">
      <div className="grid grid-flow-col items-center gap-4 justify-start">
        <img src={imgSrc} className="rounded-lg w-10" alt="" />

        <p className="text-gray-100 text-lg">
          {pos === 1 ? token1.value.dp(5).toString() : location === '/stake' ? preTxDetails?.shares?.dp(5).toString() : token2.value.dp(5).toString()}
        </p>
      </div>
      <p
        id={`confirmSwapItem${pos === 1 ? token1.info?.symbol : token2.info?.symbol}`}
        className="justify-self-end text-gray-100 text-lg pr-2"
      >
        {pos === 1 ? token1.info?.symbol : token2.info?.symbol}
        {location === '/stake' && pos === 2 ? '/OCEAN Shares' : ''}
      </p>
    </div>
  );
}
