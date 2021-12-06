import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faMediumM } from "@fortawesome/free-brands-svg-icons";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
export default function Footer() {
  return (
    <footer className="absolute bottom-0 pb-2 w-full justify-center z-0 mt-5">
      <div className="flex flex-col text-center">
        <ul className="inline-flex text-2xl justify-center">
          <li className="list-inline-item mr-2">
            <a href="https://twitter.com/dataX_fi">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
          </li>
          <li className="list-inline-item mr-2">
            <a href="https://discord.com/invite/b974xHrUGV">
              <FontAwesomeIcon icon={faDiscord} />
            </a>
          </li>
          <li className="list-inline-item mr-2">
            <a href="https://medium.com/datax-finance">
              <FontAwesomeIcon icon={faMediumM} />
            </a>
          </li>
          <li className="list-inline-item mr-2">
            <a href="https://t.me/datax_fi">
              <FontAwesomeIcon icon={faTelegram} />
            </a>
          </li>
          <li className="list-inline-item">
            <a href="https://github.com/dataxfi/">
              {" "}
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </li>
        </ul>
        <p>Copyright © DataX 2021</p>
      </div>
    </footer>
  );
}
