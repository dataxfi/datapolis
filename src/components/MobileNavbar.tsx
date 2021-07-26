import { Link } from 'react-router-dom'
import { MdMenu, MdClose } from 'react-icons/md'
import { useState } from 'react'
import Button from './Button'

const MobileNavbar = ({links, text, onClick}: {links: Array<any>, text: Record<any, any>, onClick: React.MouseEventHandler<HTMLButtonElement>}) => {

    const [menuVisible, setMenuVisible] = useState(false)

    function toggleMenu(state: boolean){
        setMenuVisible(state)
    }

    return (
        <div className="flex md:hidden justify-between items-center py-4 border-b border-gray-800 pl-4 pr-2">
            <div>
                <img src="http://via.placeholder.com/42x42" className="h-10 w-10" alt="" />
            </div>
            <div>
                { menuVisible ?
                    <button><MdClose onClick={() => toggleMenu(false)} color="#ccc" size="28" /></button> :
                    <button><MdMenu onClick={() => toggleMenu(true)} color="#ccc" size="28" /> </button>
                }
            </div>
        <div className="fixed bottom-0 left-0 w-full pb-4 md:hidden flex justify-center">
            <Button text={text.T_CONNECT_WALLET} classes="hm-btn hm-btn-light" onClick={onClick}></Button>
        </div>
        {menuVisible ? <div className="fixed w-full top-20 left-0 bg-black px-8">
        { links.map((link, idx) => {
                return <div key={idx} className="py-1.5"><Link to={link.link} className="hm-link">{link.name}</Link></div>
            }) }       
        </div> : <></> }
    </div>
    )
}

export default MobileNavbar
