import { ITokenInfo } from '@dataxfi/datax.js';
import { useState } from 'react';
import { BsSlashCircle } from 'react-icons/bs';
export default function CommonToken({
  token,
  index,
  onClick,
}: {
  token: ITokenInfo;
  index: number;
  onClick: Function;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <li key={`common${index}`} className="rounded mx-1 my-1 py-2px bg-city-blue bg-opacity-25 hover:bg-opacity-40">
      <button
        className="flex px-2 items-center"
        onClick={() => {
          onClick(token);
        }}
      >
        {imgFailed ? (
          <BsSlashCircle className="w-5 h-5 text-gray-600 mr-1" />
        ) : (
          <img
            src={token.logoURI}
            onError={() => {
              setImgFailed(true);
            }}
            className="rounded-lg w-5 h-5 mr-1"
            alt=""
            loading="lazy"
          />
        )}
        <p>{token.symbol}</p>
      </button>
    </li>
  );
}
