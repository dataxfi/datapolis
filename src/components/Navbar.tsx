import {Link} from 'react-router-dom'
import Button from './Button'
const T_SWAP = 'Swap'
const T_POOL = 'Pool'
const T_CONNECT_WALLET = 'Connect to a wallet'

const Navbar = () => {

    return (
        <nav>
            <div className="flex justify-between py-4 border-b border-gray-800 pl-4 pr-2">
                <div className="grid grid-flow-col gap-8 items-center">
                    <img src="http://via.placeholder.com/42x42" className="h-10 w-10" alt="" />
                    <Link to="/swap" className="text-gray-300 hover:text-gray-50">{T_SWAP}</Link>
                    <Link to="/pool" className="text-gray-300 hover:text-gray-50">{T_POOL}</Link>
                </div>
                <div>
                    <Button text={T_CONNECT_WALLET} classes="bg-gray-800 text-gray-200 px-4 py-2 rounded hover:bg-gray-700"></Button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
