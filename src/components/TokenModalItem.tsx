import { TokenInfo } from "@dataxfi/datax.js/dist/TokenList";
import { BsArrowRight } from "react-icons/bs";
export default function TokenModalItem({
  token,
  onClick,
  dtks = false,
  setShow,
}: {
  dtks?: boolean;
  token: TokenInfo;
  onClick: Function;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      id={`${token.symbol}-btn`}
      className="px-2 py-1.5 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg cursor-pointer"
    >
      <div className="flex justify-between gap-2 items-center">
        <div onClick={() => onClick(token)} className="flex justify-start w-full items-center">
          <div className="mr-2">
            <img src={token.logoURI} className="rounded-lg w-8 h-8" alt="" loading="lazy" />
          </div>

          <div>
            <p className="text-lg text-gray-100">{token.symbol}</p>
            <p className="text-sm text-gray-200">{token.name}</p>
          </div>
        </div>
        {dtks ? (
          <button
            onClick={() => {
              if (setShow) setShow(true);
            }}
            className="p-2 rounded hover:bg-white hover:bg-opacity-25"
          >
            <BsArrowRight className="w-4" />
          </button>
        ) : (
          false
        )}
      </div>
    </div>
  );
}
