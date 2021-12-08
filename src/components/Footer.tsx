import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faDiscord,
  faMediumM,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { ReactComponent as DataXIconGrey150 } from "../assets/DataXIconGrey150.svg";
export default function Footer() {
  return (
    <footer className="absolute bottom-0 pb-2 w-full justify-center z-0 mt-5">
      <div className="flex flex-col text-center">
        <ul className="inline-flex text-2xl justify-center">
          <li className="list-inline-item mr-2">
            <a
              href="https://twitter.com/dataX_fi"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon
                icon={faTwitter}
                className="transition duration-250 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              />
            </a>
          </li>
          <li className="list-inline-item mr-2">
            <a
              href="https://discord.com/invite/b974xHrUGV"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon
                icon={faDiscord}
                className="transition duration-250 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              />
            </a>
          </li>
          <li className="list-inline-item mr-2">
            <a
              href="https://medium.com/datax-finance"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon
                icon={faMediumM}
                className="transition duration-250 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              />
            </a>
          </li>
          <li className="list-inline-item mr-2 self-center">
            <a
              href="https://datax.gitbook.io/datax/"
              target="_blank"
              rel="noreferrer"
            >
              <DataXIconGrey150
                className="self-center pb-0.5 transition duration-250 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                style={{ height: "28px" }}
              />
            </a>
          </li>
          <li className="list-inline-item">
            <a
              href="https://github.com/dataxfi/"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              <FontAwesomeIcon
                icon={faGithub}
                className="transition duration-250 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              />
            </a>
          </li>
        </ul>
        <p>Copyright © DataX 2021</p>
      </div>
    </footer>
  );
}
