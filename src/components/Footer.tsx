import { useEffect, useState, useContext } from "react";
import { FaBook, FaDotCircle } from "react-icons/fa";
import { getCommitInfo } from "../utils/gitInfo";
import { GlobalContext } from "../context/GlobalState";
import SocialLinkIcons from "./SocialLinkIcons";
import { ReactComponent as DataXLogo } from "../assets/datax-logo.svg";

export default function Footer() {
  const { web3 } = useContext(GlobalContext);
  // console.log(web3);
  const [blockNo, setBlockNo] = useState(0);

  useEffect(() => {
    async function getBlockNumber() {
      if (web3) setBlockNo(await web3.eth.getBlockNumber());
    }
    getBlockNumber();
  }, [web3]);

  return (
    <footer className="absolute bottom-0 pb-2 w-full mt-5 hidden lg:block">
      <div className="flex flex-col text-center">
        <ul className="inline-flex text-2xl justify-center">
          <SocialLinkIcons effect="color" />
          <li className="list-inline-item ml-2 self-center hover:text-primary-300">
            <a title="DataX Docs" href="https://docs.datax.fi" target="_blank" rel="noreferrer">
              <FaBook size="26px" />
            </a>
          </li>
        </ul>
        <div className="flex flex-row justify-between px-3">
          <div className="flex w-1/3 justify-between items-center">
            <p className="w-auto lg:flex hidden text-xs">{getCommitInfo()} </p>

          </div>
          <div className="flex w-1/3 justify-center">
          <div className="flex">
            <p className="pr-2">Built with</p>
            <a target="_blank" href="https://datax.fi"><DataXLogo className="h-6"/></a>
            
            </div>
            <p> | Copyright © DataX 2022</p>
          </div>
          <div className="lg:flex lg:w-1/3 items-center justify-end hidden text-green-400 w-auto text-xs grow">
            <p className="pr-2">{blockNo > 0 ? blockNo : ""}</p>
            {/* className="animate-ping" */}
            <FaDotCircle size="12px" />
          </div>
        </div>
      </div>
    </footer>
  );
}
