import { FaAngleDoubleRight } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="w-full h-full absolute bg-dataXcity bg-cover bg-bottom">
      <div className="w-full h-full flex flex-col items-center justify-center px-56 text-center ">
        <div className="text-8xl font-montserrat font-extrabold text-shadow-bold">
          <h1>
            <span className="mr-4">DATA IS THE NEW</span>
            <span className="line-through text-yellow mr-4">OIL</span>
            <span className="font-grit wiggle">MONEY</span>
          </h1>
        </div>
        <p className="text-3xl text-shadow-light">
          DataX turns <span className="text-yellow">Data</span> data into{" "}
          <span className="font-grit underline">Programmable Money</span>{" "}
        </p>
        <Link to="/tradeX" className="flex items-center py-2 px-3 mt-10 border rounded bg-black bg-opacity-50 hover:border-black hover:bg-yellow hover:text-black transition-color duration-200">
          
          <p>Enter X-Nation</p>
          <FaAngleDoubleRight className="ml-2"/>
        </Link>
      </div>
    </div>
  );
}
