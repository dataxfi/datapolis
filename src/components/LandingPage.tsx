import { FaAngleDoubleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaBook } from "react-icons/fa";
import SocialLinkIcons from "./SocialLinkIcons";

export default function LandingPage() {
  return (
    <div className="w-full h-full absolute bg-dataXcity bg-cover bg-right mobileBgPosition lg:bg-bottom">
      <nav className="h-16 bg-black bg-opacity-30 flex justify-between items-center px-4 font-yantramanav">
        <div className="w-1/3 lg:w-auto font-spectral text-3xl">
          Datapolis
          <div className="px-2">
            <div className="w-full h-2px bg-yellow">
              <div className="w-1/4 h-2px" style={{ backgroundColor: "#e77f24" }} />
            </div>
          </div>
        </div>
        <div className="lg:mr-6 flex justify-end lg:w-auto items-center">
          <a href="https://docs.datax.fi" className="mx-2 hover:text-yellow">
            About Datapolis
          </a>
          <div className="w-2px h-9 bg-yellow rounded-full" />
          <a href="" className="mx-2 hover:text-yellow">
            Developers
          </a>
        </div>
      </nav>
      <div className="w-full h-full flex flex-col items-center justify-center px-8 lg:px-56 text-center">
        <div className="text-4xl lg:text-6xl xl:text-8xl font-yantramanav font-semibold text-shadow-bold">
          <h1>
            <span className="mr-4">WELCOME TO THE NEW</span>
            <span className="text-yellow mr-4">DATA</span>
            ECONOMY
          </h1>
        </div>
        <p className="text-xl  xl:text-3xl text-shadow-light mt-4 xl:mt-12 font-yantramanav">
          Datapolis is the world first <span className="text-yellow">Data</span> union.{" "}
        </p>
        <ul className="text-5xl py-4 inline-flex mt-4">
          <SocialLinkIcons effect="grow" margin="6" />
        </ul>
        <ul className="inline-flex">
          <a href="https://docs.datax.fi" id="learnMoreLink" className="homeButton flex items-center py-2 ml-2 px-3">
            <FaBook className="mr-2" />
            <p>Learn More</p>
          </a>
          <Link to="/trade" id="enterDappLink" className="homeButton flex items-center py-2 ml-2 px-3">
            <p>Enter Datapolis</p>
            <FaAngleDoubleRight className="ml-2" />
          </Link>
        </ul>
      </div>
    </div>
  );
}
