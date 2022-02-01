import { Link, useLocation } from "react-router-dom";
import { MdMenu, MdClose } from "react-icons/md";
import { useState, useEffect, useContext } from "react";
import { ReactComponent as Logo } from "../assets/datax-logo.svg";
import { GlobalContext } from "../context/GlobalState";
import Button from "./Button";
import PendingTxsIndicator from "./PendingTxsIndicator";

const MobileNavbar = ({
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
  const { accountId } = useContext(GlobalContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [walletBtnVis, setWalletBtnVis] = useState(false);

  function toggleMenu(state: boolean) {
    setMenuVisible(state);
  }

  const location = useLocation();

  useEffect(() => {
    toggleMenu(false);
  }, [location]);

  useEffect(() => {
    setWalletBtnVis(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return (
    <header id="mobileNavbar" className="flex flex-col" >
      <div className="flex lg:hidden justify-between items-center pt-2 border-gray-800 pr-4">
        <div className="flex flex-row justify-start">
          <Logo className="logo" style={{ height: "40px" }} />
        </div>
        <div className="flex">
          <PendingTxsIndicator />
          <div className="pl-5">
            {menuVisible ? (
              <button>
                <MdClose
                  onClick={() => toggleMenu(false)}
                  color="#ccc"
                  size="28"
                  className="z-20"
                />
              </button>
            ) : (
              <button>
                <MdMenu
                  onClick={() => toggleMenu(true)}
                  className="z-20"
                  color="#ccc"
                  size="28"
                />{" "}
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className={`w-full bg-primary-700 z-10  mb-5 absolute top-0 transform${
          menuVisible ? " translate-y-18" : " -translate-y-19"
        } transition duration-1000 border-t border-b lg:-translate-y-19`}
      >
        {links.map((link, idx) => {
          return (
            <Link
              onClick={() => toggleMenu(false)}
              to={link.link}
              className="hm-link product"
              key={`link${idx}`}
            >
              <div key={idx} className="py-1.5 px-8 hover:bg-primary-600">
                {link.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div
        className={`fixed bottom-0 left-0 w-full py-2 lg:hidden flex justify-center bg-background opacity-95 transform ${
          walletBtnVis ? "" : "translate-y-12"
        } transition duration-1000 z-10`}
      >
        <div className="flex flex-row w-full justify-between px-3">
          <div className="flex flex-row justify-center align-middle  w-full ">
            <div
              className={`flex flex-row bg-primary-900 ${
                accountId ? "pl-2" : ""
              }  pr-1 py-1 rounded-lg`}
            >
              {" "}
              <p className="text-xs self-center rounded-l-lg  mr-2 ">
                {accountId ? `${network}` : null}
              </p>
              <Button
                id={`${accountId ? "m-view-txs-btn" : "m-wallet-button"}`}
                text={`${accountId ? `${truncateId()}` : "Connect wallet"}`}
                onClick={() => handleModalOrConnect()}
                classes={`hm-btn text-xs  ${
                  accountId ? "px-1" : ""
                }py-1 bg-black`}
              />
            </div>
          </div>

          <MdClose
            onClick={() => setWalletBtnVis(false)}
            color="#ccc"
            size="28"
            className="mt-1"
          />
        </div>
      </div>
    </header>
  );
};

export default MobileNavbar;
