import { useContext, useEffect, useState } from "react";
import { MoonLoader, RingLoader } from "react-spinners";
import { GlobalContext } from "../context/GlobalState";

export default function PendingTxsIndicator() {
  const { accountId, setShowTxHistoryModal, executeStake, executeUnstake, executeSwap, showConfirmTxDetails, executeUnlock, approving } = useContext(GlobalContext);
  const [pending, setPending] = useState<number>(0);
  const [render, setRender] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<0 | 100>(0);
  useEffect(() => {
    let count = 0;
    if (executeStake) count++;
    if (executeUnstake) count++;
    if (executeUnlock && approving === "approving") count++;
    if (executeSwap && !showConfirmTxDetails) count++;
    setPending(count);
  }, [accountId, executeStake, executeUnstake, executeSwap, executeUnlock, showConfirmTxDetails, approving]);

  useEffect(() => {
    if (pending && !render) {
      setRender(true);
      setTimeout(() => {
        setOpacity(100);
      }, 250);
    }

    if (!pending && render) {
      setOpacity(0);
      setTimeout(() => {
        setRender(false);
      }, 250);
    }
  }, [pending, render]);

  return render ? (
    <div
      onClick={() => {
        setShowTxHistoryModal(true);
      }}
      className={`btn-dark flex items-center capitalize border border-gray-500 text-gray-200 rounded-md pl-4 py-1 hm-box transition-opacity opacity-${opacity} duration-300`}
    >
      <div className="flex flex-row items-center">
        <p className="mr-2">{`${pending > 0 ? pending : 1} Pending`}</p>
        <MoonLoader size="15px" color="#f3c429" />
      </div>{" "}
    </div>
  ) : (
    <></>
  );
}
