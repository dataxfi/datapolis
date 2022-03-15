import { useContext } from "react";
import { MdInfoOutline } from "react-icons/md";
import { GlobalContext } from "../context/GlobalState";

export default function MaxToolTip() {
  const { location } = useContext(GlobalContext);
  const stakeToolTip =
    "Max stake is the lesser value of either 1/3 of the current pool liquidity or your total balance.";
  const unstakeToolTip =
    "Max stake removal is the lesser value of either 1/3 of the current pool liquidity or your total shares.";
  const exchangeToolTip = "The max exchange for a token pair is the lesser value of half the reserve for either token.";

  return (
    <div className="relative group z-10">
      <MdInfoOutline className="w-3" />
      <div className="absolute border rounded bg-trade-darkBlue bottom-50 left-4 w-max max-w-[200px] p-2 hidden group-hover:block">
        <p>{location === "/trade" ? exchangeToolTip : location === "/stake" ? stakeToolTip : unstakeToolTip}</p>
      </div>
    </div>
  );
}
