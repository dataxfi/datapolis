import { useContext } from "react";
import { MdInfoOutline } from "react-icons/md";
import { GlobalContext } from "../context/GlobalState";

export default function MaxToolTip() {
  const { location } = useContext(GlobalContext);

  const stakeToolTip = "Max stake or unstake is your total balance of tokens or shares, respectively, and is never more than 1/3 of the pool liquidity. ";
  const exchangeToolTip = "Max exchange amounts are determined by AMMs to mitigate dramatic fluctuation of token values.";

  return (
    <div className="relative group z-10">
      <MdInfoOutline className="w-3" />
      <div className="absolute border rounded bg-trade-darkBlue top-0 left-4 w-max max-w-[200px] p-2 hidden group-hover:block">
        <p>{location === "/trade" ? exchangeToolTip : stakeToolTip}</p>
      </div>
    </div>
  );
}
