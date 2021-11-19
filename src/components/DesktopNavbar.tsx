import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
// import { Config } from '@dataxfi/datax.js'
import { ReactComponent as Logo } from "../assets/logo-beta.svg";
import Button from "./Button";
import { GlobalContext } from "../context/GlobalState";

const DesktopNavbar = ({
  links,
  text,
  wallet,
  truncateId
}: {
  links: Array<any>;
  text: Record<any, any>;
  wallet: string;
  truncateId: Function
}) => {
  const { handleConnect, chainId, config, accountId, buttonText } =
    useContext(GlobalContext);

  function dispNet() {
    if (config) {
      const network = config.getNetwork(String(chainId));
      if (network !== "unknown") return network;
      return "⚠ Unknown";
    }
    return "⚠ Unknown";
  }

  return (
    <header className="lg:flex justify-between items-center py-4 border-gray-800 pl-4 pr-2 hidden">
      <div className="grid grid-flow-col gap-8 items-center">
        <Logo className="logo" style={{height:"40px"}} />
        {links.map((link, idx) => {
          return (
            <Link
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
        <div className="hidden md:block capitalize border border-type-500 text-type-200 rounded-md px-4 py-1 hm-box ">
          <h3>{dispNet()}</h3>
        </div>
        <div className="hidden md:block">
          <Button
            text={
              accountId
                ? truncateId()
                : buttonText
            }
            onClick={() => handleConnect()}
            classes="hm-btn hm-btn-light hm-box border border-type-500"
          />
        </div>
      </div>
    </header>
  );
};

export default DesktopNavbar;
