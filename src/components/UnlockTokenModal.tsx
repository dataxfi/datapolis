import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import { BiLockAlt, BiLockOpenAlt } from "react-icons/bi";
import { MdClose } from "react-icons/md";
import BigNumber from "bignumber.js";
import { getTokenVal, isOCEAN, IToken } from "./Swap";

export type approvalStates = "approved" | "approving" | "pending";

export default function UnlockTokenModal({
  token1,
  token2,
  setToken,
  nextFunction,
  remove,
}: {
  token1: IToken;
  token2: IToken;
  setToken: Function;
  nextFunction: Function;
  remove?: boolean;
}) {
  const { accountId, config, ocean, showUnlockTokenModal, setShowUnlockTokenModal } = useContext(GlobalContext);
  const [approving, setApproving] = useState<approvalStates>("pending");
  const [t1BN, setT1BN] = useState<BigNumber>(new BigNumber(0));
  useEffect(() => {
    const { t1BN } = getTokenVal(token1, token1);
    setT1BN(t1BN);
  }, [token1]);

  async function unlockTokens(amount: "perm" | "once") {
    // currently being passed tx amount in both scenarios
    if (ocean) {
      let pool;
      let address;

      if(remove){
        pool = token1.info.pool
        address = token1.info.tokenAddress
      } else if (isOCEAN(token1.info.address, ocean)) {
        pool = token2.info.pool;
        address = token1.info.address;
      } else if (isOCEAN(token2.info.address, ocean)) {
        pool = token1.info.pool;
        address = token1.info.address;
      } else {
        pool = config.default.routerAddress;
        address = token1.info.address;
      }

      try {
        setApproving("approving");
        if (amount === "perm") {
          await ocean.approve(address, pool, new BigNumber(18e10).toString(), accountId);
          remove ? setToken(new BigNumber(18e10)) : setToken({ ...token1, allowance: new BigNumber(18e10) });
        } else {
          await ocean.approve(address, pool, token1.value.toString(), accountId);
          remove ? setToken(new BigNumber(token1.value)) : setToken({ ...token1, allowance: token1.value });
        }
        setApproving("approved");
        setShowUnlockTokenModal(false);
        nextFunction();
      } catch (error) {
        console.error(error);
        setApproving("pending");
      }
    }
  }

  return showUnlockTokenModal && token1.info ? (
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
          <div className="pb-5">
            <BiLockAlt size="72px" className="text-green-400 animate-bounce" />
          </div>
        ) : (
          <BiLockOpenAlt size="72px" className="text-green-400" />
        )}
        <h3 className="text-sm lg:text-2xl pb-5">Unlock {token1.info.symbol}</h3>
        <p className="text-sm lg:text-base text-center pb-5">
          DataX contracts need your permission to spend {t1BN.dp(5).toString()} {remove? "shares" : token1.info.symbol}.
        </p>

        <button
          id="perm-unlock-btn"
          onClick={() => {
            unlockTokens("perm");
          }}
          className="w-full p-2 bg-primary-100 rounded mb-2 bg-opacity-20 hover:bg-opacity-40 hover:bg-primary-300 text-background-800"
        >
          Unlock Permenantly
        </button>
        <button
          id="unlock-once-btn"
          onClick={() => {
            unlockTokens("once");
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
