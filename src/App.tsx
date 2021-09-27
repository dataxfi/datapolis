import Navbar from "./components/Navbar"
import { BrowserRouter as Router, Route } from "react-router-dom"
import Swap from "./components/Swap"
import Stake from "./components/Stake"
import LiquidityPosition from "./components/LiquidityPosition"

import { GlobalProvider } from "./context/GlobalState"
import RemoveAmount from "./components/RemoveAmount"
// import LiquidityPosition from "./components/LiquidityPosition";
// import TransactionDoneModal from "./components/TransactionDoneModal";
// import Snackbar from "./components/Snackbar";
// import CreatePoolModal from "./components/CreatePoolModal";
// import ConfirmModal from "./components/ConfirmModal";
// import TransactionDoneModal from "./components/TransactionDoneModal";
// import ConfirmSwapModal from "./components/ConfirmSwapModal";

function App() {
  return (
    <>
      <GlobalProvider>
        <Router>
          <Navbar />
          <Route path="/" exact component={Swap} />
          <Route path="/stakeX" exact component={Stake} />
          <Route path="/stakeX/remove" exact component={RemoveAmount} />
          <Route path="/stakeX/list" exact component={LiquidityPosition} />
          {/* <Snackbar text="Approve LINK" onClose={() => {}} /> */}
          {/* <CreatePoolModal /> */}
          {/* <ConfirmModal /> */}
          {/* <TransactionDoneModal show={true} close={() => {}} /> */}
           {/*<LiquidityPosition />*/}
           {/*<RemoveAmount />*/}
          {/* <ConfirmSwapModal /> */}
        </Router>
      </GlobalProvider>
    </>
  )
}

export default App
