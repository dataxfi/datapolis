import { FaAngleDoubleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaBook } from "react-icons/fa";
import SocialLinkIcons from "./SocialLinkIcons";

export default function LandingPage() {
  return (
    <div className="w-full h-full absolute bg-dataXcity bg-cover bg-right mobileBgPosition lg:bg-bottom">
      <div className="w-full h-full flex flex-col items-center justify-center px-8 lg:px-56 text-center">
        <div className="text-4xl lg:text-6xl xl:text-8xl font-montserrat font-extrabold text-shadow-bold">
          <h1>
            <span className="mr-4">DATA IS THE NEW</span>
            <span className="line-through text-yellow mr-4">OIL</span>
            <span className="font-grit wiggle">MONEY</span>
          </h1>
        </div>
        <p className="text-xl  xl:text-3xl text-shadow-light mt-4 xl:mt-12">
          DataX turns <span className="text-yellow">Data</span> into{" "}
          <span className="font-grit underline">Programmable Money</span>{" "}
        </p>
        <ul className="text-5xl py-4 inline-flex mt-4">
          <SocialLinkIcons effect="grow" margin="6"/>
        </ul>
        <ul className="inline-flex">
          <a href="https://docs.datax.fi" id="learnMoreLink" className="homeButton flex items-center py-2 ml-2 px-3">
            <FaBook className="mr-2" />
            <p>Learn More</p>
          </a>
          <Link to="/trade" id="enterDappLink" className="homeButton flex items-center py-2 ml-2 px-3">
            <p>Enter X-Nation</p>
            <FaAngleDoubleRight className="ml-2" />
          </Link>
        </ul>
      </div>
    </div>
  );
}
