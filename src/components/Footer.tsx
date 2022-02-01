import { useEffect, useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faDiscord, faMediumM, faGithub } from "@fortawesome/free-brands-svg-icons";
import { FaBook, FaDotCircle } from "react-icons/fa";
import { getCommitInfo } from "../utils/gitInfo";
import { GlobalContext } from "../context/GlobalState";

export default function Footer() {
  const { web3, location } = useContext(GlobalContext);
  console.log(web3);
  const [blockNo, setBlockNo] = useState(0);

  useEffect(() => {
    async function getBlockNumber() {
      if (web3) setBlockNo(await web3.eth.getBlockNumber());
    }
    getBlockNumber();
  }, [web3]);

  return (
    <footer className={`${location === "/stakeX/list"? "" : "absolute bottom-0"}  pb-2 w-full mt-5`}>
      <div className="flex flex-col text-center">
        <ul className="inline-flex text-2xl justify-center">
          <li className="list-inline-item mr-2">
            <div title="Twitter">
              <a href="https://twitter.com/dataX_fi" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>
          </li>
          <li className="list-inline-item mr-2">
            <div title="Discord">
              <a href="https://discord.com/invite/b974xHrUGV" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faDiscord} />
              </a>
            </div>
          </li>
          <li className="list-inline-item mr-2">
            <div title="Medium">
              <a href="https://medium.com/datax-finance" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faMediumM} />
              </a>
            </div>
          </li>
          <li className="list-inline-item mr-2 self-center">
            <div title="DataX Docs">
              <a href="https://docs.datax.fi" target="_blank" rel="noreferrer">
                <FaBook size="26px" />
              </a>
            </div>
          </li>
          <li className="list-inline-item">
            <div title="GitHub">
              <a href="https://github.com/dataxfi/" target="_blank" rel="noreferrer">
                {" "}
                <FontAwesomeIcon icon={faGithub} />
              </a>
            </div>
          </li>
        </ul>
        <div className="flex flex-row justify-between px-3">
          <p className="w-auto lg:w-1/3 lg:flex hidden text-xs">{getCommitInfo()} </p>
          <p className="w-full lg:w-1/3">Copyright © DataX 2021</p>
          <div className="lg:flex items-center justify-end hidden text-green-400 w-auto lg:w-1/3 text-xs">
            <p className="pr-2">{blockNo > 0? blockNo: ""}</p>
            <FaDotCircle size="12px"/>
          </div>
        </div>
      </div>
    </footer>
  );
}
