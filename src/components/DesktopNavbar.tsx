import React from 'react'
import Button from './Button'
import { Link } from 'react-router-dom'

const DesktopNavbar = ({links, text, onClick}: {links: Array<any>, text: Record<any, any>, onClick: React.MouseEventHandler<HTMLButtonElement>}) => {
    return (
             <div className="md:flex justify-between items-center py-4 border-b border-gray-800 pl-4 pr-2 hidden">
                <div className="grid grid-flow-col gap-8 items-center">
                    <img src="http://via.placeholder.com/42x42" className="h-10 w-10" alt="" />
                    {links.map((link, idx) => {
                        return <Link key={idx} to={link.link} className="hm-link hidden md:block">{link.name}</Link>    
                    })}
                </div>
                <div className="hidden md:block">
                    <Button text={text.T_CONNECT_WALLET} classes="hm-btn hm-btn-light" onClick={onClick}></Button>
                </div>
            </div>
    )
}

export default DesktopNavbar
