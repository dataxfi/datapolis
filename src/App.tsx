import Navbar from "./components/Navbar";
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Swap from './components/Swap'
import Stake from './components/Stake'

import {GlobalProvider} from './context/GlobalState'

function App() {
  return (
    <>
    <GlobalProvider>
      <Router>
        <Navbar />
        <Route path='/swap' component={Swap} />
        <Route path='/stake' component={Stake} />
      </Router>
    </GlobalProvider>
    </>
  );
}

export default App;
