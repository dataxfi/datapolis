import MobileNavbar from "./MobileNavbar";
import DesktopNavbar from "./DesktopNavbar";
import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
// import { web3Network, checkAccounts } from '../utils'
// import { useEffect } from 'react'
// import { useState } from 'react'
// import Emitter from '../emitter'

const text = {
  T_SWAP: "TradeX",
  T_STAKE: "StakeX",
  T_CONNECT_WALLET: "Connect to a wallet",
};

const Navbar = () => {
  const walletText = text.T_CONNECT_WALLET;

  // const [walletText, setWalletText] = useState(text.T_CONNECT_WALLET)
  // const [accounts, setAccounts] = useState([])

  const links = [
    { name: text.T_SWAP, link: "/" },
    { name: text.T_STAKE, link: "/stakeX" },
  ];

  const { buttonText } = useContext(GlobalContext);

  function truncateId() {
    return (buttonText.substring(0, 5) +
      "..." +
      buttonText.substring(buttonText.length - 4, buttonText.length))
  }

  return (
    <nav>
      {/* Separating the UI logic because figuring out code reuse here will take more time. 
            i.e. It's not a simple cascade of columns to rows. There is a toggle and the connect to wallet 
            button is at the bottom */}
      <MobileNavbar
        links={links}
        text={text}
        wallet={walletText}
        truncateId={truncateId}
      />
      <DesktopNavbar
        links={links}
        text={text}
        wallet={walletText}
        truncateId={truncateId}
      />
    </nav>
  );
};

export default Navbar;
