import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useContext } from 'react';

import { GlobalContext } from './context/GlobalState';

import UnsupportedNetwork from './components/UnsupportedNetwork';
import LiquidityPosition from './pages/LiquidityPosition';

import LandingPage from './pages/LandingPage';
import BigNumber from 'bignumber.js';
import Snackbar from  './components/Snackbar';
import Unstake from './components/Unstake';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Stake from './pages/Stake';
import Swap from './pages/Swap';
import WatchLocation from './components/WatchLocation';

BigNumber.config({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN, EXPONENTIAL_AT: 30 });

function App() {
  // some comment
  const { unsupportedNet, cookiesAllowed, location, bgOff, blurBG } = useContext(GlobalContext);

  document.getElementById('loader');

  useEffect(() => {
    document.getElementById('loadText')?.remove();
    document.getElementById('loadCenter')?.remove();
    document.getElementById('loader')?.remove();
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div
        className={`w-full h-full ${blurBG ? 'blur-none' : 'blur-none'} ${
          bgOff
            ? ''
            : location === '/trade'
            ? 'lg:absolute lg:bg-dataXtrade lg:bg-cover lg:bg-top'
            : location !== '/'
            ? 'lg:absolute lg:bg-dataXstake lg:bg-cover lg:bg-bottom'
            : ''
        }`}
      >
        <div className={`min-h-full relative overflow-hidden w-full ${blurBG ? 'bg-black bg-opacity-40' : ''}`}>
          {unsupportedNet ? (
            <UnsupportedNetwork />
          ) : (
            <Router>
              <WatchLocation/>
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/trade" element={<Swap />} />
                <Route path="/delicate" element={<Stake />} />
                <Route path="/stake/remove" element={<Unstake />} />
                <Route path="/stake/list" element={<LiquidityPosition />} />
              </Routes>
            </Router>
          )}
        </div>
        <Footer />
      </div>
      <Snackbar />
    </div>
  );
}

export default App;
