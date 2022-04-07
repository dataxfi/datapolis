import { useContext, useEffect, useState } from "react";
import { RingLoader } from "react-spinners";
import { GlobalContext } from "../context/GlobalState";

export default function PendingTxsIndicator() {
  const { accountId, pendingTxs, setShowTxHistoryModal, setPendingTxs, executeStake, executeUnstake, executeSwap } = useContext(GlobalContext);
  const [pending, setPending] = useState<number>(0);
  useEffect(() => {
    let count = 0;
    if (executeStake) count++;
    if (executeUnstake) count++;
    if (executeSwap) count++;
    setPending(count);
  }, [accountId, executeStake, executeUnstake, executeSwap]);

  return pending > 0 ? (
    <div
      onClick={() => {
        setShowTxHistoryModal(true);
      }}
      className="flex items-center capitalize border border-gray-500 text-gray-200 rounded-md pl-4 py-1 hm-box transition-all ease-in-out transform hover:bg-primary-400 hover:bg-opacity-20"
    >
      <div className="pr-3 flex flex-row items-center">
        {`${pending} Pending`}{" "}
        <div className="ml-2 w-5 h-5">
          <RingLoader size="24px" color="#f3c429" />
        </div>
      </div>{" "}
    </div>
  ) : null;
}
