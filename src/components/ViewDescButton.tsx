import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import { getDID } from "../hooks/useTokenDesc";

export default function ViewDescBtn() {
  const { setShowDescModal, token2, setT2DIDResponse, showDescModal } = useContext(GlobalContext);
  return (
    <button
      disabled={token2.info ? false : true}
      className={` text-gray-300 ${token2.info ? "hover:text-white" : ""}  disabled:cursor-not-allowed`}
      onClick={() => (showDescModal ? setShowDescModal(false) : getDID(setT2DIDResponse, setShowDescModal, token2))}
    >
      {"<"} Dataset Description
    </button>
  );
}
