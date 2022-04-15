import { useContext } from "react";
import { Link } from "react-router-dom";
// import { Config } from '@dataxfi/datax.js'
import { GlobalContext } from "../context/GlobalState";
import PendingTxsIndicator from "./PendingTxsIndicator";
import { INavText } from "../utils/types";

const DesktopNavbar = ({
  links,
  truncateId,
  network,
  handleModalOrConnect,
}: {
  links: Array<{ name: string; link: string }>;
  text: INavText;
  wallet: string;
  truncateId: Function;
  network: JSX.Element;
  handleModalOrConnect: Function;
}) => {
  const { accountId, buttonText, bgOff } = useContext(GlobalContext);

  return (
    <header id="desktopNavBar" className={`lg:flex flex-col bg-black ${bgOff ? "bg-opacity-0" : "bg-opacity-25"} justify-between items-center p-2 border-gray-800 hidden`}>
      <div className="flex justify-between w-full pl-4 pr-2">
        <div className="grid grid-flow-col gap-8 items-center  ">
          <Link to={"/"} className="w-1/3 lg:w-auto font-spectral text-3xl">
            Datapolis
            <div className="px-2">
              <div className="w-full h-2px bg-yellow">
                <div className="w-1/4 h-2px" style={{ backgroundColor: "#e77f24" }} />
              </div>
            </div>
            <div className="w-full flex justify-end font-spectral text-xs pr-2">
              <p>Beta</p>
            </div>
          </Link>
          {links.map((link, idx) => {
            return (
              <Link id={`${link.name}-link`} key={idx} to={link.link} className="hm-link hidden md:block product">
                {/* <div className={`w-1 h-3.5 bg-blue-500 rounded-full ${location.toLowerCase().includes(link.name.toLowerCase())? "" : "hidden"}`}/> */}
                {link.name}
              </Link>
            );
          })}
        </div>
        <div className="grid grid-flow-col gap-4 items-center">
          <PendingTxsIndicator />
          <div className="hidden md:block capitalize btn-dark rounded">
            <h3>{network}</h3>
          </div>
          <div className="hidden md:block">
            <button
              id={`${accountId ? "d-view-txs-btn" : "d-wallet-button"}`}
              onClick={() => handleModalOrConnect()}
              className="btn-dark hm-box rounded"
            >{accountId ? truncateId() : buttonText}</button>
          </div>
        </div>
      </div>
      {/* <div className="w-full h-5 mt-3">
        <div className="h-full w-109 lpGrad m-auto" />
      </div> */}
    </header>
  );
};

export default DesktopNavbar;
