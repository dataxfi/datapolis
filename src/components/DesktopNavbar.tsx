import React from 'react'
import { Link } from 'react-router-dom'
import Web3Provider from './Web3Provider'

const DesktopNavbar = ({links, text, wallet}: {links: Array<any>, text: Record<any, any>, wallet: string}) => {
    return (
             <div className="md:flex justify-between items-center py-4 border-b border-gray-800 pl-4 pr-2 hidden">
                <div className="grid grid-flow-col gap-8 items-center">
                    <img src="http://via.placeholder.com/42x42" className="h-10 w-10" alt="" />
                    {links.map((link, idx) => {
                        return <Link key={idx} to={link.link} className="hm-link hidden md:block">{link.name}</Link>    
                    })}
                </div>
                <div className="hidden md:block">
                    <Web3Provider buttonClasses="hm-btn hm-btn-light" />
                    {/* <Button text={wallet} classes="" onClick={() => connectToWallet()}></Button> */}
                </div>
            </div>
    )
}

export default DesktopNavbar
