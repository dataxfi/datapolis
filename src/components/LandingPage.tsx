import { FaAngleDoubleRight, FaBook } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SocialLinkIcons from './SocialLinkIcons';
import BuiltWDataX from './BuiltWDataX';

export default function LandingPage() {
  return (
    <div className="w-full h-full absolute bg-dataXcity bg-cover bg-right mobileBgPosition lg:bg-bottom">
      <nav className="h-16 bg-black bg-opacity-10 flex justify-between items-center px-4 font-yantramanav">
        <div className="lg:w-auto font-spectral text-3xl">
          Datapolis
          <div className="px-2">
            <div className="w-full h-2px bg-yellow">
              <div className="w-1/4 h-2px" style={{ backgroundColor: '#e77f24' }} />
            </div>
          </div>
          <div className="w-full flex justify-end font-spectral text-xs pr-2">
            <p>Beta</p>
          </div>
        </div>
        <div className="lg:mr-6 flex justify-end lg:w-auto items-center">
          <a href="https://datax.fi" target="_blank" rel="noreferrer" className="mx-2 hover:text-yellow">
            About DataX
          </a>
        </div>
      </nav>
      <div className="w-full h-full flex flex-col items-center justify-center px-8 lg:px-56 pb-36 text-center">
        <div className="text-4xl lg:text-6xl xl:text-8xl font-yantramanav font-semibold text-shadow-bold">
          <h1>
            <span className="mr-4">Welcome to the New</span>
            <span className="text-yellow mr-4">DATA</span>
            Economy
          </h1>
        </div>
        <p className="text-xl  xl:text-3xl text-shadow-light mt-4 xl:mt-12 font-yantramanav">
          Datapolis is the world&apos;s first <span className="text-yellow">Data Nation</span>{' '}
        </p>
        <ul className="text-5xl py-4 inline-flex mt-4">
          <SocialLinkIcons effect="grow" />
        </ul>
        <ul className="inline-flex">
          <a href="" id="learnMoreLink" className="homeButton flex items-center py-2 ml-2 px-3">
            <FaBook className="mr-2" />
            <p>Learn More</p>
          </a>
          <Link to="/stake" id="enterDappLink" className="homeButton flex items-center py-2 ml-2 px-3">
            <p>Enter Datapolis</p>
            <FaAngleDoubleRight className="ml-2" />
          </Link>
        </ul>
        <div className="w-full absolute bottom-0 pl-4 pb-2">
          <BuiltWDataX />
        </div>
      </div>
    </div>
  );
}
