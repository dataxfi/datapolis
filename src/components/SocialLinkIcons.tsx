import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faDiscord, faMediumM, faGithub } from "@fortawesome/free-brands-svg-icons";
export default function SocialLinkIcons({effect, margin}:{effect: "grow" | "color", margin: string}) {

  const style = `list-inline-item transition-all transform duration 200 hover:${effect === "grow" ?"scale-125" : "text-primary-300"}`

  return (
    <>
      {" "}
      <li className={`${style} mr-${margin}`}>
        <a href="https://twitter.com/dataX_fi" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faTwitter} />
        </a>
      </li>
      <li className={`${style} mr-${margin}`}>
        <a title="Discord" href="https://discord.com/invite/b974xHrUGV" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faDiscord} />
        </a>
      </li>
      <li className={`${style} mr-${margin}`}>
        <a title="Medium" href="https://medium.com/datax-finance" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faMediumM} />
        </a>
      </li>

      <li className={`${style}`}>
        <a title="GitHub" href="https://github.com/dataxfi/" target="_blank" rel="noreferrer">
          {" "}
          <FontAwesomeIcon icon={faGithub} />
        </a>
      </li>
    </>
  );
}
