import MobileNavbar from './MobileNavbar'
import DesktopNavbar from './DesktopNavbar'

const text = {
    T_SWAP: 'Swap',
    T_POOL: 'Pool',
    T_CONNECT_WALLET: 'Connect to a wallet'
}


const Navbar = () => {

    const links = [
        { name: text.T_SWAP, link: '/swap' },
        { name: text.T_POOL, link: '/pool' },
    ]

    const walletConnectionHandler = () => {
        console.log('Ask to connect wallet')
    }

    return (
        <nav>
            {/* Separating the UI logic because figuring out code reuse here will take more time. 
            i.e. It's not a simple cascade of columns to rows. There is a toggle and the connect to wallet 
            button is at the bottom */}
            <MobileNavbar links={links} text={text} onClick={walletConnectionHandler} />
            <DesktopNavbar links={links} text={text} onClick={walletConnectionHandler} />
        </nav>
    )
}

export default Navbar
