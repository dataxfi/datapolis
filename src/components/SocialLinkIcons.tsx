import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faDiscord, faMediumM, faGithub } from "@fortawesome/free-brands-svg-icons";
export default function SocialLinkIcons() {
  return (
    <>
      {" "}
      <li className="list-inline-item mr-2">
        <a href="https://twitter.com/dataX_fi" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faTwitter} />
        </a>
      </li>
      <li className="list-inline-item mr-2">
        <a title="Discord" href="https://discord.com/invite/b974xHrUGV" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faDiscord} />
        </a>
      </li>
      <li className="list-inline-item mr-2">
        <a title="Medium" href="https://medium.com/datax-finance" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faMediumM} />
        </a>
      </li>

      <li className="list-inline-item">
        <a title="GitHub" href="https://github.com/dataxfi/" target="_blank" rel="noreferrer">
          {" "}
          <FontAwesomeIcon icon={faGithub} />
        </a>
      </li>
    </>
  );
}
