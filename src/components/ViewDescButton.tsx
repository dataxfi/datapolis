import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import { getDID } from "../hooks/useTokenDesc";

export default function ViewDescBtn() {
  const { setShowDescModal, token2, setT2DIDResponse, showDescModal, t2DIDResponse } = useContext(GlobalContext);
  return (
    <button
      id="viewDescButton"
      disabled={token2.info ? false : true}
      className={` text-gray-300 ${token2.info ? "hover:text-white" : ""}  disabled:cursor-not-allowed`}
      onClick={() =>
        t2DIDResponse
          ? setShowDescModal(!showDescModal)
          : getDID(setT2DIDResponse, token2).then(() => {
              setShowDescModal(true);
            })
      }
    >
      {"<"} Dataset Description
    </button>
  );
}
