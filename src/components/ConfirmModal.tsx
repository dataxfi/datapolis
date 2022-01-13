import { BsX } from "react-icons/bs";
import Loader from "./Loader";


const ConfirmModal = ({
  show,
  close,
  txs,
}: {
  show: boolean;
  close: Function;
  txs: Array<string>;
}) => {
  if (!show) {
    return null;
  } else
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:max-w-sm w-full z-30 ">
        <div className="bg-primary-900 p-4 rounded-lg border padding mx-3 shadow hm-box">
          <div className="flex justify-end">
            <BsX
              onClick={() => {
                close();
              }}
              role="button"
              size="28"
              className="text-type-200 text-right"
              id="closeConfrimModalBtn"
            />
          </div>
          <div className="flex items-center justify-center">
            <Loader size={48} />
          </div>
          <div className="text-center">
            <p id={`confirmTxLength-${txs.length}`} className="text-type-100 text-lg mt-2">
              You will have to confirm {txs.length} transaction(s)
            </p>
            {txs.map((tx: string, index: number) => (
              <div key={`index${index}`} className="flex flex-row">
                <p className="text-type-200  text-left mt-2 mr-2">{`${
                  index + 1
                }.`}</p>
                <p className="text-type-200  text-left mt-2">{tx}</p>
              </div>
            ))}
            <p className="mt-8 text-type-400 text-sm">
              Confirm this transaction in your wallet
            </p>
          </div>
        </div>
      </div>
    );
};

export default ConfirmModal;
