import MobileNavbar from './MobileNavbar'
import DesktopNavbar from './DesktopNavbar'
// import { web3Network, checkAccounts } from '../utils'
// import { useEffect } from 'react'
// import { useState } from 'react'
// import Emitter from '../emitter'

const text = {
    T_SWAP: 'TradeX',
    T_STAKE: 'StakeX',
    T_CONNECT_WALLET: 'Connect to a wallet'
}

const Navbar = () => {

    const walletText = text.T_CONNECT_WALLET

    // const [walletText, setWalletText] = useState(text.T_CONNECT_WALLET)
    // const [accounts, setAccounts] = useState([])


    const links = [
        { name: text.T_SWAP, link: '/swap' },
        { name: text.T_STAKE, link: '/stake' },
    ]

    return (
        <nav>
            {/* Separating the UI logic because figuring out code reuse here will take more time. 
            i.e. It's not a simple cascade of columns to rows. There is a toggle and the connect to wallet 
            button is at the bottom */}
            <MobileNavbar links={links} text={text} wallet={walletText} />
            <DesktopNavbar links={links} text={text} wallet={walletText} />
        </nav>
    )
}

export default Navbar
