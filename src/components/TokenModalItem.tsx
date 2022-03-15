import { ITokenInfo } from "@dataxfi/datax.js";
import { BsArrowRight } from "react-icons/bs";
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
  return (
    <div
      id={`${token.symbol}-btn`}
      className="px-2 py-1.5 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg cursor-pointer"
    >
      <div onClick={() => onClick(token)} className="flex justify-start w-full items-center">
        <div className="mr-2">
          <img src={token.logoURI} className="rounded-lg w-8 h-8" alt="" loading="lazy" />
        </div>

        <div>
          <p className="text-lg text-gray-100">{token.symbol}</p>
          <p className="text-sm text-gray-200">{token.name}</p>
        </div>
      </div>
    </div>
  );
}
