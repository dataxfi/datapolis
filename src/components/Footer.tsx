import { useEffect, useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faDiscord, faMediumM, faGithub } from "@fortawesome/free-brands-svg-icons";
import { FaBook, FaDotCircle } from "react-icons/fa";
import { getCommitInfo } from "../utils/gitInfo";
import { GlobalContext } from "../context/GlobalState";
import SocialLinkIcons from "./SocialLinkIcons";

export default function Footer() {
  const { web3 } = useContext(GlobalContext);
  console.log(web3);
  const [blockNo, setBlockNo] = useState(0);

  useEffect(() => {
    async function getBlockNumber() {
      if (web3) setBlockNo(await web3.eth.getBlockNumber());
    }
    getBlockNumber();
  }, [web3]);

  return (
    <footer className="absolute bottom-0 pb-2 w-full mt-5">
      <div className="flex flex-col text-center">
        <ul className="inline-flex text-2xl justify-center">
          <SocialLinkIcons />
          <li className="list-inline-item ml-2 self-center">
            <a title="DataX Docs" href="https://docs.datax.fi" target="_blank" rel="noreferrer">
              <FaBook size="26px" />
            </a>
          </li>
        </ul>
        <div className="flex flex-row justify-between px-3">
          <p className="w-auto lg:w-1/3 lg:flex hidden text-xs">{getCommitInfo()} </p>
          <p className="w-full lg:w-1/3">Copyright © DataX 2021</p>
          <div className="lg:flex items-center justify-end hidden text-green-400 w-auto lg:w-1/3 text-xs">
            <p className="pr-2">{blockNo > 0 ? blockNo : ""}</p>
            {/* className="animate-ping" */}
            <FaDotCircle size="12px"  />
          </div>
        </div>
      </div>
    </footer>
  );
}
