import { BsArrowDown, BsShuffle, BsX } from "react-icons/bs";
import { useContext, useEffect, useState } from "react";
import ConfirmSwapItem from "./ConfirmSwapItem";
import ConfirmSwapListItem from "./ConfirmSwapListItem";
import { GlobalContext } from "../context/GlobalState";
import BigNumber from "bignumber.js";
import OutsideClickHandler from "react-outside-click-handler";

export default function ConfirmTxDetailsModal() {
  const { ocean, token1, token2, setShowConfirmTxDetails, showConfirmTxDetails, preTxDetails, setLastTx, setShowConfirmModal, setSwapConfirmed, setBlurBG, setExecuteSwap } =
    useContext(GlobalContext);
  const [swapFee, setswapFee] = useState<BigNumber>(new BigNumber(0));
  const [minReceived, setMinReceived] = useState<BigNumber>(new BigNumber(0));

  useEffect(() => {
    if (showConfirmTxDetails && preTxDetails && preTxDetails.slippage) {
      const exchange: BigNumber = token2.value;
      const slip = new BigNumber(exchange).times(preTxDetails.slippage).div(100);
      const min = new BigNumber(exchange).minus(slip);
      setMinReceived(min);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token2.value, preTxDetails, preTxDetails?.slippage, showConfirmTxDetails]);

  useEffect(() => {
    if (showConfirmTxDetails) {
      if (ocean && token1.info && token1.value.gt(0) && token2.info) {
        (async () => {
          const pool = token1.info?.symbol === "OCEAN" ? token2.info?.pool : token1.info?.pool;
          if (!pool) return;
          const swapFee = new BigNumber(await ocean.calculateSwapFee(pool, token1.value.dp(5).toString()));
          setswapFee(swapFee);
        })();
      }
    }
  });

  function confirm() {
    setShowConfirmTxDetails(false);
    setShowConfirmModal(true);
    setLastTx(preTxDetails);
    setSwapConfirmed(true);
  }

  function close() {
    setExecuteSwap(false)
    setShowConfirmTxDetails(false);
    setBlurBG(false);
    setSwapConfirmed(false);
  }
  return showConfirmTxDetails ? (
    <div id="confirmSwapModal" className={`fixed center sm:max-w-md w-full z-30 shadow ${showConfirmTxDetails ? "block" : "hidden"}`}>
      <OutsideClickHandler onOutsideClick={close}>
        <div className="py-8 px-4 md:px-8 bg-black bg-opacity-95 border rounded-lg hm-box mx-3 md:mx-auto">
          <div className="flex justify-between items-center">
            <p className="text-gray-300 text-xl">Confirm swap</p>
            <BsX id="closeConfrimSwapModalbtn" onClick={close} role="button" size={28} />
          </div>
          <div className="mt-4">
            <ConfirmSwapItem pos={1} />
            <BsArrowDown className="ml-2 my-2 text-gray-300" size={24} />
            <ConfirmSwapItem pos={2} />
          </div>
          <div className="mt-6 flex justify-between">
            <p className="text-gray-400 text-sm">Exchange rate</p>
            <p id="confirmSwapModalSwapRate" className="text-gray-400 text-sm grid grid-flow-col items-center gap-2">
              1 {token1.info?.symbol} = {preTxDetails?.postExchange?.dp(5).toString()} {token2.info?.symbol}
              <BsShuffle size={12} />
            </p>
          </div>
          <div className="mt-4">
            {/* <ConfirmSwapListItem name="Route" value="ETH > KNC" /> */}
            <ConfirmSwapListItem name="Minimum received" value={minReceived.dp(5).toString()} />
            {/* <ConfirmSwapListItem name="Price impact" value="-0.62%" valueClass="text-green-500" /> */}
            <ConfirmSwapListItem name="Swap fee" value={swapFee.dp(5).toString() + " " + token1.info?.symbol} />
            <ConfirmSwapListItem name="DataX fee" value="0" />
            {/* <ConfirmSwapListItem name="DataX fee" value="0.000000006 ETH" /> */}
            <ConfirmSwapListItem name="Slippage tolerance" value={preTxDetails?.slippage + "%"} />
          </div>
          <div className="mt-4">
            <p className="text-gray-300 text-sm">
              You will receive at least {minReceived.dp(5).toString()} {token2.info?.symbol} or the transaction will revert.
            </p>
          </div>
          <div className="mt-4">
            <button id="confirmSwapModalBtn" onClick={confirm} className="px-4 py-2 text-lg w-full txButton rounded-lg">
              Confirm swap
            </button>
          </div>
        </div>
      </OutsideClickHandler>
    </div>
  ) : (
    <></>
  );
}
