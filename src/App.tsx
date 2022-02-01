import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Swap from "./components/Swap";
import Stake from "./components/Stake";
import LiquidityPosition from "./components/LiquidityPosition";
import CookiesModal from "./components/CookiesModal";
import RemoveAmount from "./components/RemoveAmount";
import { useEffect, useContext } from "react";
import { initializeGA } from "./context/Analytics";
import UnsupportedNetwork from "./components/UnsupportedNetwork";
import { GlobalContext } from "./context/GlobalState";
import DisclaimerModal from "./components/DisclaimerModal";
import TxHistoryModal from "./components/TxsHistoryModal";
import Footer from "./components/Footer";
import NotificationArea from "./components/NotificationArea";
import usePTxInitializer from "./hooks/usePTxInitializer";
import BigNumber from "bignumber.js";
import LandingPage from "./components/LandingPage";
BigNumber.config({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN, EXPONENTIAL_AT: 18 });

//import "./stars.css"
function App() {
  const { unsupportedNet, showDisclaimer, cookiesAllowed, location } = useContext(GlobalContext);

  document.getElementById("loader");

  useEffect(() => {
    console.log(location);
  }, [location]);

  usePTxInitializer();
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
          location === "/tradeX"
            ? "absolute bg-dataXtrade bg-cover bg-top"
            : location !== "/"
            ? "absolute bg-dataXstake bg-cover bg-bottom"
            : "relative"
        }`}
      >
        <div className={`min-h-full relative overflow-hidden w-full`}>
          {unsupportedNet ? (
            <UnsupportedNetwork />
          ) : (
            <Router>
              <Navbar />
              {showDisclaimer ? (
                <DisclaimerModal />
              ) : (
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/tradeX" element={<Swap />} />
                  <Route path="/stakeX" element={<Stake />} />
                  <Route path="/stakeX/remove" element={<RemoveAmount />} />
                  <Route path="/stakeX/list" element={<LiquidityPosition />} />
                </Routes>
              )}
            </Router>
          )}
          {cookiesAllowed === null ? <CookiesModal /> : null}
          <NotificationArea />
          <TxHistoryModal />
        </div>
      </div>
    </div>
  );
}

export default App;
