import { FaAngleDoubleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { faTwitter, faDiscord, faMediumM, faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaBook } from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className="w-full h-full absolute bg-dataXcity bg-cover bg-bottom">
      <div className="w-full h-full flex flex-col items-center justify-center px-56 text-center">
        <div className="text-8xl font-montserrat font-extrabold text-shadow-bold">
          <h1>
            <span className="mr-4">DATA IS THE NEW</span>
            <span className="line-through text-yellow mr-4">OIL</span>
            <span className="font-grit wiggle">MONEY</span>
          </h1>
        </div>
        <p className="text-3xl text-shadow-light mt-12">
          DataX turns <span className="text-yellow">Data</span> data into{" "}
          <span className="font-grit underline">Programmable Money</span>{" "}
        </p>
        <ul className="text-5xl py-4 inline-flex">
          <li key="landing-twitter" title="Twitter">
            <FontAwesomeIcon icon={faTwitter} className="mr-6 transform transition hover:scale-125" />
          </li>
          <li key="landing-discord" title="Discord">
            {" "}
            <FontAwesomeIcon icon={faDiscord} className="mr-6 transform transition hover:scale-125" />
          </li>
          <li key="landing-medium" title="Medium">
            {" "}
            <FontAwesomeIcon icon={faMediumM} className="mr-6 transform transition hover:scale-125" />
          </li>
          <li key="landing-github" title="GitHub">
            {" "}
            <FontAwesomeIcon icon={faGithub} className=" transition transform hover:scale-125" />
          </li>
        </ul>
        <ul className="inline-flex">
          <a
            href="https://docs.datax.fi"
            className="flex items-center py-2 px-3 border rounded bg-black bg-opacity-50 hover:border-black hover:bg-yellow hover:text-black transition-color duration-200"
          >
            <FaBook className="mr-2" />
            <p>Learn More</p>
          </a>
        <Link
          to="/tradeX"
          className="flex items-center py-2 ml-2 px-3 border rounded bg-black bg-opacity-50 hover:border-black hover:bg-yellow hover:text-black transition-color duration-200"
        >
          <p>Enter X-Nation</p>
          <FaAngleDoubleRight className="ml-2" />
        </Link>
        </ul>
      </div>
    </div>
  );
}
