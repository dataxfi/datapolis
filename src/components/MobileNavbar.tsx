import { Link, useLocation } from 'react-router-dom'
import { MdMenu, MdClose } from 'react-icons/md'
import { useState, useEffect, useContext } from 'react'
import {ReactComponent as Logo} from '../assets/logo.svg';
import { GlobalContext } from '../context/GlobalState'
import Button from './Button'

const MobileNavbar = ({links, text, wallet}: {links: Array<any>, text: Record<any, any>, wallet: string}) => {
    
    const {buttonText, handleConnect} = useContext(GlobalContext)
    const [menuVisible, setMenuVisible] = useState(false)

    function toggleMenu(state: boolean){
        setMenuVisible(state)
    }

    const location = useLocation()

    useEffect(() => {
        toggleMenu(false)
    }, [location]);

    return (
        <div className="flex md:hidden justify-between items-center py-4 border-gray-800 pl-4 pr-2">
            <div>
                <Logo className="logo"/>
            </div>
            <div>
                { menuVisible ?
                    <button><MdClose onClick={() => toggleMenu(false)} color="#ccc" size="28" /></button> :
                    <button><MdMenu onClick={() => toggleMenu(true)} color="#ccc" size="28" /> </button>
                }
            </div>
        <div className="fixed bottom-0 left-0 w-full py-2 md:hidden flex justify-center bg-background">
            <Button text={buttonText} onClick={() => handleConnect()} classes="hm-btn hm-btn-light" />
            {/* <Button text={wallet} classes="hm-btn hm-btn-light" onClick={() => connectToWallet()}></Button> */}
        </div>
        {menuVisible ? <div className="fixed w-full top-20 left-0 bg-primary-900 px-8">
        { links.map((link, idx) => {
                return <div key={idx} className="py-1.5"><Link onClick={() => toggleMenu(false)} to={link.link} className="hm-link product">{link.name}</Link></div>
            }) }
        </div> : <></> }
    </div>
    )
}

export default MobileNavbar
