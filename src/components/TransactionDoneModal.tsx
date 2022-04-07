import { BsCheckCircle, BsX } from "react-icons/bs";
import OutsideClickHandler from "react-outside-click-handler";

const TransactionDoneModal = ({ show, txHash, close }: { show: boolean; txHash: string; close: Function }) => {
  if (!show) return null;
  return (
    <div
      id="transactionDoneModal"
      className="fixed center sm:max-w-sm w-full z-20 shadow"
    >
      <OutsideClickHandler
        onOutsideClick={() => {
          close()
        }}
      >
        <div className="bg-black bg-opacity-90 border rounded-lg pb-8 p-4 hm-box mx-3">
          <div className="flex justify-end">
            <BsX
              id="transactionDoneModalCloseBtn"
              onClick={() => close()}
              size={28}
              className="text-gray-200"
              role="button"
            />
          </div>

          <div className="mt-4 flex justify-center">
            <BsCheckCircle size={56} className="text-city-blue" />
          </div>
          <div>
            <p className="text-center text-gray-100 text-lg">Transaction Processed</p>
            <p className="text-blue-400 text-center mt-1">
              <a id="transactionLink" target="_blank" rel="noreferrer" className="text-city-blue" href={txHash}>
                View on explorer
              </a>
            </p>
          </div>
        </div>
      </OutsideClickHandler>
    </div>
  );
};

export default TransactionDoneModal;
