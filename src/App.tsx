import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Swap from "./components/Swap";
import Stake from "./components/Stake";
import LiquidityPosition from "./components/LiquidityPosition";
import CookiesModal from "./components/CookiesModal";
import Unstake from "./components/Unstake";
import { useEffect, useContext } from "react";
import { initializeGA } from "./context/Analytics";
import UnsupportedNetwork from "./components/UnsupportedNetwork";
import { GlobalContext } from "./context/GlobalState";
import DisclaimerModal from "./components/DisclaimerModal";
import TxHistoryModal from "./components/TxHistoryModal";
import Footer from "./components/Footer";
import SnackbarArea from "./components/SnackbarArea";
import BigNumber from "bignumber.js";
import LandingPage from "./components/LandingPage";
import WatchLocation from "./components/WatchLocation";
import useTxHistory from "./hooks/useTxHistory";
BigNumber.config({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN, EXPONENTIAL_AT: 18 });

//import "./stars.css"
function App() {
  const { unsupportedNet, showDisclaimer, cookiesAllowed, location, bgOff } = useContext(GlobalContext);

  document.getElementById("loader");
  useTxHistory()

  useEffect(() => {
    if (cookiesAllowed) {
      initializeGA();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookiesAllowed]);

  useEffect(() => {
    document.getElementById("loadText")?.remove();
    document.getElementById("loadCenter")?.remove();
    document.getElementById("loader")?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full relative">
      <div
        className={`w-full h-full ${
          bgOff ? "" :
          location === "/trade"
            ? "lg:absolute lg:bg-dataXtrade lg:bg-cover lg:bg-top"
            : location !== "/"
            ? "lg:absolute lg:bg-dataXstake lg:bg-cover lg:bg-bottom"
            : ""
        }`}
      >
        <div className={`min-h-full relative overflow-hidden w-full`}>
          {unsupportedNet ? (
            <UnsupportedNetwork />
          ) : (
            <Router>
              <WatchLocation />
              {location !== "/" ? <Navbar /> : null}
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/trade" element={<Swap />} />
                <Route path="/stake" element={<Stake />} />
                <Route path="/stake/remove" element={<Unstake />} />
                <Route path="/stake/list" element={<LiquidityPosition />} />
              </Routes>
            </Router>
          )}
          {cookiesAllowed === null ? <CookiesModal /> : null}
          {showDisclaimer ? <DisclaimerModal /> : null}
          <SnackbarArea />
          <TxHistoryModal />
          {location !== "/" ? <Footer /> : null}
        </div>
      </div>
    </div>
  );
}

export default App;
