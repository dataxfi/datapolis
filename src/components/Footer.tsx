import { useEffect, useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faDiscord,
  faMediumM,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { FaBook } from "react-icons/fa";
import { getCommitInfo } from '../utils/gitInfo'
import { GlobalContext } from "../context/GlobalState";
import Web3 from "web3";

export default function Footer() {

  const { web3 } = useContext(GlobalContext);
  console.log(web3)
  const [blockNo, setBlockNo] = useState(0)

  useEffect(() => {
    async function getBlockNumber() {
      if (web3) setBlockNo(await web3.eth.getBlockNumber())
    }
    getBlockNumber()
  }, [web3])

  return (
    <footer className="absolute bottom-0 pb-2 w-full justify-center z-0 mt-5">
      <div className="flex flex-col text-center">
        <ul className="inline-flex text-2xl justify-center">
          <li className="list-inline-item mr-2">
            <div title="Twitter">
              <a
                href="https://twitter.com/dataX_fi"
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>
          </li>
          <li className="list-inline-item mr-2">
            <div title="Discord">
              <a
                href="https://discord.com/invite/b974xHrUGV"
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faDiscord} />
              </a>
            </div>
          </li>
          <li className="list-inline-item mr-2">
            <div title="Medium">
              <a
                href="https://medium.com/datax-finance"
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faMediumM} />
              </a>
            </div>
          </li>
          <li className="list-inline-item mr-2 self-center">
            <div title="DataX Docs">
              <a
                href="https://docs.datax.fi"
                target="_blank"
                rel="noreferrer"
              >
                <FaBook size="26px" />
              </a>
            </div>
          </li>
          <li className="list-inline-item">
            <div title="GitHub">
              <a
                href="https://github.com/dataxfi/"
                target="_blank"
                rel="noreferrer"
              >
                {" "}
                <FontAwesomeIcon icon={faGithub} />
              </a>
            </div>
          </li>
        </ul>
        <p>Copyright © DataX 2021</p>
        <p>commit {getCommitInfo()} </p>
        <p>block {blockNo}</p>
      </div>
    </footer>
  );
}
