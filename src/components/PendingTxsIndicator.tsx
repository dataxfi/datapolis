import { useContext } from "react";
import { RingLoader } from "react-spinners";
import { GlobalContext } from "../context/GlobalState";

export default function PendingTxsIndicator() {
  const { accountId, pendingTxs, setShowTxHistoryModal } =
    useContext(GlobalContext);

  return accountId && pendingTxs.length > 0 ? (
    <div
      onClick={() => setShowTxHistoryModal(true)}
      className="flex items-center capitalize border border-type-500 text-type-200 rounded-md pl-4 py-1 hm-box transition-all ease-in-out transform hover:bg-primary-400 hover:bg-opacity-20"
    >
      <div className="pr-3 flex flex-row items-center">
        {`${pendingTxs.length} Pending`}{" "}
        <div className="ml-2 w-5 h-5">
          <RingLoader size="24px" color="#f3c429" />
        </div>
      </div>{" "}
    </div>
  ) : null;
}
