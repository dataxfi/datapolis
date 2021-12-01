import React from "react";
import { BsCheckCircle, BsX } from "react-icons/bs";

const Snackbar = ({
  show,
  token1,
  token2,
  onClose,
  txHash,
}: {
  show: boolean;
  token1: any;
  token2: any;
  onClose: Function;
  txHash: string;
}) => {
  console.log(show, token1, token2, onClose, txHash);

  if (!show) return null;
  return (
    <div className="max-w-xs fixed md:top-8 md:right-8 w-full mx-auto bg-primary-800 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="grid grid-flow-col gap-4 items-center">
          <BsCheckCircle size="24" className="text-green-400" />
          <div>
            <p className="text-type-100 text-sm">
              {/* Swap {token1.value} {token1.info.symbol} for {token2.value}{" "}
              {token2.info.symbol} */}
            </p>
            <p className="text-type-300 text-sm">
              <a target="_blank" rel="noreferrrer" href={txHash}>
                View on explorer
              </a>
            </p>
          </div>
        </div>
        <div>
          <BsX
            role="button"
            color="white"
            onClick={() => {
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Snackbar;
