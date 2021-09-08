import React, {useContext} from 'react'
import { Link } from 'react-router-dom'
// import { Config } from '@dataxfi/datax.js'
import {ReactComponent as Logo} from '../assets/logo.svg';
import Button from './Button'
import {GlobalContext} from '../context/GlobalState'

const DesktopNavbar = ({links, text, wallet}: {links: Array<any>, text: Record<any, any>, wallet: string}) => {

    const { handleConnect, buttonText, chainId, config } = useContext(GlobalContext)

    return (
             <div className="md:flex justify-between items-center py-4 border-gray-800 pl-4 pr-2 hidden">
                <div className="grid grid-flow-col gap-8 items-center">
                    <Logo className="logo"/>
                    {links.map((link, idx) => {
                        return <Link key={idx} to={link.link} className="hm-link hidden md:block product">{link.name}</Link>    
                    })}
                </div>
                <div className="hidden md:block">
                    <h3>{config ? config.getNetwork(String(chainId)) : "Unknown"}</h3>
                </div>
                <div className="hidden md:block">
                    <Button text={buttonText} onClick={() => handleConnect()} classes="hm-btn hm-btn-light" />
                </div>
            </div>
    )
}

export default DesktopNavbar
