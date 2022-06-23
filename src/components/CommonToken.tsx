import { ITokenInfo } from '@dataxfi/datax.js';
import { useState } from 'react';
import { BsSlashCircle } from 'react-icons/bs';
import useTokenImgSrc from '../hooks/useTokenImgSrc';
import TokenImage from './TokenImage';
export default function CommonToken({
  token,
  index,
  onClick,
}: {
  token: ITokenInfo;
  index: number;
  onClick: Function;
}) {
  const [imgSrc, setImgSrc] = useState(token.logoURI);
  useTokenImgSrc(setImgSrc, token);
  return (
    <li key={`common${index}`} className="rounded mx-1 my-1 py-2px bg-city-blue bg-opacity-25 hover:bg-opacity-40">
      <button
        className="flex px-2 items-center"
        onClick={() => {
          onClick(token);
        }}
      >
        <TokenImage imgSrc={imgSrc || ''} className="rounded-lg w-5 h-5 mr-1" />
        <p>{token.symbol}</p>
      </button>
    </li>
  );
}
