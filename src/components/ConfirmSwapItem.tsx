import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import useTokenImgSrc from '../hooks/useTokenImgSrc';

const ConfirmSwapItem = ({ pos }: { pos: 1 | 2 }) => {
  const { token1, token2 } = useContext(GlobalContext);
  const [token] = useState(pos === 1 ? token1 : token2);
  const [imgSrc, setImgSrc] = useState(token.info?.logoURI);
  useTokenImgSrc(setImgSrc, token.info);

  return (
    <div className="flex justify-between items-center">
      <div className="grid grid-flow-col items-center gap-4 justify-start">
        <img src={imgSrc} className="rounded-lg w-10" alt="" />

        <p className="text-gray-100 text-lg">{token.value.dp(5).toString()}</p>
      </div>
      <p id={`confirmSwapItem${token.info?.symbol}`} className="justify-self-end text-gray-100 text-lg pr-2">
        {token.info?.symbol}
      </p>
    </div>
  );
};

export default ConfirmSwapItem;
