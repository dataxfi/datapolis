import React, { useState, useContext } from 'react'
import TokenModal from './TokenModal'
import { BsChevronDown, BsBoxArrowUpRight } from 'react-icons/bs'
import { GlobalContext } from '../context/GlobalState'

const StakeSelect = ({value, setToken}: {value: Record<any, any> | null, setToken: Function}) => {

    const {config, accountId, handleConnect} = useContext(GlobalContext)

    const [showModal, setShowModal] = useState(false)

    const tokenSelected = (val: any) => {
        setToken(val)
        setShowModal(false)
    }

    function showTokenModal(){
        if(accountId){
            setShowModal(true)
        } else {
            handleConnect()
        }
    }

    return (
        <div>
            <div className="mt-4 bg-primary-800 p-4 rounded-lg">
                <div className="md:grid md:grid-cols-5">
                    <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                        { value ?
                            <img src={value.logoURI} className="w-14 h-14 rounded-md" alt="" /> :
                            <div className="w-14 h-14 rounded-md bg-background"></div>
                        }
                        <div role="button" tabIndex={0} onClick={() => {showTokenModal()}}>
                                { value ?
                                <span className="text-2xl text-type-200 font-bold grid grid-flow-col items-center gap-1">
                                    <span>{value.symbol}</span>
                                    <BsChevronDown className="text-type-200" size="16" />
                                </span> :
                                <p className="text-xs text-type-100 border-type-300 border rounded-full px-2 py-1 mt-1">Select token</p>          
                                }
                        </div>
                    </div>
                    <div className="col-span-3 mt-3 md:mt-0">
                        {
                            value ? 
                                <div>
                                    <p className="text-type-100 uppercase">{value.name}</p>
                                    <div className="grid grid-flow-col justify-start gap-4">
                                            <a href={config.default.explorerUri + '/address/' + value.pool} target="_blank" rel="noreferrer" className="text-white grid grid-flow-col items-center gap-2 justify-start border-b border-type-300">Pool <BsBoxArrowUpRight /> </a>
                                            <a href={config.default.explorerUri + '/address/' + value.address} target="_blank" rel="noreferrer" className="text-white grid grid-flow-col items-center gap-2 justify-start border-b border-type-300">Token <BsBoxArrowUpRight /> </a>
                                    </div>
                                </div> : <></>                         
                        }
                    </div>
                </div>
            {showModal ? <TokenModal onClick={tokenSelected} close={() => setShowModal(false)} /> : <></> }
            </div>
        </div>
    )
}

export default StakeSelect
