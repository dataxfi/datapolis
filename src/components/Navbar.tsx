import {Link} from 'react-router-dom'
import Button from './Button'
const T_SWAP = 'Swap'
const T_POOL = 'Pool'
const T_CONNECT_WALLET = 'Connect to a wallet'

const Navbar = () => {

    const walletConnectionHandler = () => {
        console.log('Ask to connect wallet')
    }

    return (
        <nav>
            <div className="flex justify-between py-4 border-b border-gray-800 pl-4 pr-2">
                <div className="grid grid-flow-col gap-8 items-center">
                    <img src="http://via.placeholder.com/42x42" className="h-10 w-10" alt="" />
                    <Link to="/swap" className="hm-link">{T_SWAP}</Link>
                    <Link to="/pool" className="hm-link">{T_POOL}</Link>
                </div>
                <div>
                    <Button text={T_CONNECT_WALLET} classes="hm-btn hm-btn-light" onClick={walletConnectionHandler}></Button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
