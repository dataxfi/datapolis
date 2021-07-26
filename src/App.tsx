import Navbar from "./components/Navbar";
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Swap from './components/Swap'
import Pool from './components/Pool'

function App() {
  return (
    <>
    <Router>
      <Navbar />
      <Route path='/swap' component={Swap} />
      <Route path='/pool' component={Pool} />
    </Router>
    </>
  );
}

export default App;
