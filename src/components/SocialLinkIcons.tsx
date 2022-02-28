import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faDiscord, faMediumM, faGithub } from "@fortawesome/free-brands-svg-icons";
import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
export default function SocialLinkIcons({ effect }: { effect: "grow" | "color" }) {
  const style = `list-inline-item transition-all transform duration 200 hover:${
    effect === "grow" ? "scale-125" : "text-primary-300"
  }`;
  const { location } = useContext(GlobalContext);
  return (
    <>
      {" "}
      <li className={`${style} mr-${location === "/" ? "6" : "2"}`}>
        <a href="https://twitter.com/dataxfi" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faTwitter as IconDefinition} />
        </a>
      </li>
      <li className={`${style} mr-${location === "/" ? "6" : "2"}`}>
        <a title="Discord" href="https://discord.com/invite/b974xHrUGV" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faDiscord as IconDefinition} />
        </a>
      </li>
      <li className={`${style} mr-${location === "/" ? "6" : "2"}`}>
        <a title="Medium" href="https://medium.com/datax-finance" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faMediumM as IconDefinition} />
        </a>
      </li>
      <li className={`${style}`}>
        <a title="GitHub" href="https://github.com/dataxfi/" target="_blank" rel="noreferrer">
          {" "}
          <FontAwesomeIcon icon={faGithub as IconDefinition} />
        </a>
      </li>
    </>
  );
}
