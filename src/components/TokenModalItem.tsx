import { ITokenInfo } from "@dataxfi/datax.js";
import {  useState } from "react";
import {  BsSlashCircle } from "react-icons/bs";
export default function TokenModalItem({
  token,
  onClick,
  dtks = false,
}: {
  dtks?: boolean;
  token: ITokenInfo;
  onClick: Function;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [imagFailed, setImageFailed] = useState(false);

  return (
    <div
      id={`${token.symbol}-btn`}
      className="px-2 py-1.5 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg cursor-pointer"
    >
      <div onClick={() => onClick(token)} className="flex justify-start w-full items-center">
        <div className="mr-2">
          {imagFailed ? (
            <BsSlashCircle className="w-8 h-8 text-gray-600"/>
          ) : (
            <img
              src={token.logoURI}
              onError={() => {
                setImageFailed(true);
              }}
              className="rounded-lg w-8 h-8"
              alt=""
              loading="lazy"
            />
          )}
        </div>

        <div>
          <p className="text-lg text-gray-100">{token.symbol}</p>
          <p className="text-sm text-gray-200">{token.name}</p>
        </div>
      </div>
    </div>
  );
}
