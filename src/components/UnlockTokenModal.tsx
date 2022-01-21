import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import { BiLockAlt, BiLockOpenAlt } from "react-icons/bi";
import { MdClose } from "react-icons/md";
export default function UnlockTokenModal({
  token,
  setToken,
  setShowConfrimSwapModal,
}: {
  token: any;
  setToken: Function;
  setShowConfrimSwapModal: Function;
}) {
  const { accountId, config, ocean, showUnlockTokenModal, setShowUnlockTokenModal, setShowConfirmTxModal } =
    useContext(GlobalContext);
  const [approving, setApproving] = useState<"approved" | "approving" | "pending">("pending");

  useEffect(() => {
    console.log(token);
  }, [token]);

  async function unlockTokens(amount: "perm" | "val") {
    // currently being passed tx amount in both scenarios
    if (ocean) {
      try {
        setApproving("approving");
        if (amount === "perm") {
          await ocean.approve(token.info.pool, config.default.routerAddress, token.value.toString(), accountId);
          setToken({ ...token, allowance: token.value.toString() });
        } else {
          await ocean.approve(token.info.pool, config.default.routerAddress, token.value.toString(), accountId);
          setToken({ ...token, allowance: token.value.toString() });
        }
        setApproving("approved");
        setShowUnlockTokenModal(false);
        setShowConfrimSwapModal(true);
      } catch (error) {
        console.error(error);
        setApproving("pending");
      }
    }
  }

  return showUnlockTokenModal && token.info ? (
    <div
      id="transactionDoneModal"
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:max-w-sm w-full z-20 shadow"
    >
      <div className="bg-primary-900 border items-center flex flex-col rounded-lg pb-8 pt-2 px-4 hm-box mx-3">
        <div className="flex w-full  justify-end">
          <MdClose
            id="closeTokenModalBtn"
            role="button"
            onClick={() => {
              setShowUnlockTokenModal(false);
            }}
            className="text-type-100 text-2xl"
          />
        </div>
        {approving === "pending" ? (
          <div className="pb-5">
            <BiLockAlt size="72px" className="text-green-400" />{" "}
          </div>
        ) : approving === "approving" ? (
            <div>
                <BiLockAlt className="text-green-400 animate-bounce" />
            </div>
        ) : (
          <BiLockOpenAlt className="text-green-400" />
        )}
        <h3 className="text-sm lg:text-2xl pb-5">Unlock {token.info.symbol}</h3>
        <p className="text-sm lg:text-base text-center pb-5">
          DataX contracts need your permission to spend {token.value.dp(5).toString()} {token.info.symbol}.
        </p>

        <button
          onClick={() => {
            unlockTokens("perm");
          }}
          className="w-full p-2 bg-primary-100 rounded mb-2 bg-opacity-20 hover:bg-opacity-40 hover:bg-primary-300 text-background-800"
        >
          Unlock Permenantly
        </button>
        <button
          onClick={() => {
            unlockTokens("val");
          }}
          className="w-full p-2 bg-primary-100 rounded mb-2 bg-opacity-20 hover:bg-opacity-40 hover:bg-primary-300 text-background-800"
        >
          Unlock this time only
        </button>
      </div>
    </div>
  ) : (
    <></>
  );
}
