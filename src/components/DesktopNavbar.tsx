import { useContext } from "react";
import { Link } from "react-router-dom";
// import { Config } from '@dataxfi/datax.js'
import { ReactComponent as Logo } from "../assets/logo-test.svg";
import Button from "./Button";
import { GlobalContext } from "../context/GlobalState";
import PendingTxsIndicator from "./PendingTxsIndicator";

const DesktopNavbar = ({
  links,
  text,
  wallet,
  truncateId,
  network,
  handleModalOrConnect,
}: {
  links: Array<any>;
  text: Record<any, any>;
  wallet: string;
  truncateId: Function;
  network: string;
  handleModalOrConnect: Function;
}) => {
  const { accountId, buttonText } = useContext(GlobalContext);

  return (
    <header id="desktopNavBar" className="lg:flex justify-between items-center py-4 border-gray-800 pl-4 pr-2 hidden">
      <div className="grid grid-flow-col gap-8 items-center">
        <Logo className="logo" style={{ height: "40px" }} />
        {links.map((link, idx) => {
          return (
            <Link
              id={`${link.name}-link`}
              key={idx}
              to={link.link}
              className="hm-link hidden md:block product"
            >
              {link.name}
            </Link>
          );
        })}
      </div>
      <div className="grid grid-flow-col gap-4 items-center">
        <PendingTxsIndicator />
        <div className="hidden md:block capitalize border border-type-500 text-type-200 rounded-md px-4 py-1 hm-box ">
          <h3>{network}</h3>
        </div>
        <div className="hidden md:block">
          <Button
            id={`${accountId ? "d-view-txs-btn" : "d-wallet-button"}`}
            text={accountId ? truncateId() : buttonText}
            onClick={() => handleModalOrConnect()}
            classes="hm-btn hm-btn-light hm-box border border-type-500"
          />
        </div>
      </div>
    </header>
  );
};

export default DesktopNavbar;
