import { ITokenInfo } from '@dataxfi/datax.js';
import { useContext, useState } from 'react';
import { BsSlashCircle } from 'react-icons/bs';
import { GlobalContext } from '../context/GlobalState';
import useTokenImgSrc from '../hooks/useTokenImgSrc';
import TokenImage from './TokenImage';
export default function TokenModalItem({ token, onClick }: { token: ITokenInfo; onClick: Function }) {
  const { tokenIn, tokenOut } = useContext(GlobalContext);
  const [imgSrc, setImgSrc] = useState(token.logoURI);
  useTokenImgSrc(setImgSrc, token);

  return token.symbol === tokenIn.info?.symbol || token.symbol === tokenOut.info?.symbol ? (
    <></>
  ) : (
    <div
      id={`${token.symbol}-btn`}
      className="px-2 py-1.5 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg cursor-pointer"
    >
      <div onClick={() => onClick(token)} className="flex justify-start w-full items-center">
        <div className="mr-2">
          <TokenImage className="rounded-lg w-8 h-8" imgSrc={imgSrc || ''} />
        </div>

        <div>
          <p className="text-lg text-gray-100">{token.symbol}</p>
          <p className="text-sm text-gray-200">{token.name}</p>
        </div>
      </div>
    </div>
  );
}
