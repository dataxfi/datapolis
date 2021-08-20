import SwapInput from "./SwapInput"
import { IoSwapVertical } from "react-icons/io5"
import {MdLocalGasStation, MdTune} from 'react-icons/md'
import { useEffect, useState, useContext } from "react"
import {GlobalContext} from '../context/GlobalState'
import axios from 'axios'
import Button from "./Button"
import OutsideClickHandler from 'react-outside-click-handler'

const text = {
    T_SWAP: 'Swap',
    T_SWAP_FROM: 'Swap from',
    T_SWAP_TO: 'Swap to'
}


const Swap = () => {

    const { token1, token2, setToken1, setToken2, swapTokens, handleConnect, buttonText, token1Value, token2Value, setToken1Value, setToken2Value, accountId } =  useContext(GlobalContext)
    const [gasPrice, setGasPrice] = useState(0)
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {

        console.log('Fetching gas prices')

        const getGasPrice = async () => {
            const res = await axios.get(`https://ethgasstation.info/api/ethgasAPI.json?api-key=${process.env.REACT_ENV_DEFI_PULSE}`)
            setGasPrice(parseFloat(res.data.average)/10)
        }

        getGasPrice()

    }, []);

    const setToken = (token: Record<any, any>, num: number) => {
        if(num === 1){
            setToken1(token)
        } else if (num === 2){
            setToken2(token)
        }
    }


    return (
            <div className="flex mt-16 w-full items-center mb-20">
                <div className="max-w-2xl mx-auto bg-primary-900 w-full rounded-lg p-4">
                    <div className="flex justify-between relative">
                        <p className="text-xl">{ text.T_SWAP }</p>
                        <div className="grid grid-flow-col gap-2 items-center">
                            {gasPrice > 0 ? 
                            <div role="button" className="grid grid-flow-col items-center gap-1 hover:bg-primary-700 rounded-lg px-2 py-1.5">
                                <MdLocalGasStation size="24" style={{color: '#7CFF6B'}} />
                                <p className="text-green-500">{gasPrice}</p>
                            </div> : <div></div> }
                            <div onClick={() => setShowSettings(!showSettings)} className="hover:bg-primary-700 px-1.5 py-1.5 rounded-lg" role="button">
                                <MdTune role="button" size="24" />
                            </div>
                        </div>
                        {
                            showSettings ?                
                            <div className="absolute top-10 right-0 max-w-sm">
                                <OutsideClickHandler onOutsideClick={() => {
                                    setShowSettings(false)
                                }}>                                      
                                    <div className="bg-primary-900 rounded-lg p-4 w-full">
                                        <p className="text-type-100">Transaction settings</p>
                                        <div className="mt-2">
                                            <p className="text-type-300 text-sm">Slippage tolerance</p>
                                            <div className="grid grid-flow-col gap-2 items-center">
                                                <div className="flex justify-between focus:border-secondary-500 bg-primary-700 rounded-lg items-center px-2 py-1">
                                                    <input type="number" className="text-lg bg-primary-700 outline-none rounded-l-lg w-32"  />
                                                    <p className="text-type-200 text-lg">%</p>
                                                </div>
                                                <div>
                                                    <Button text="Auto" classes="text-type-300 p-2 bg-primary-800 rounded-lg" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-type-300 text-sm">Transaction deadline</p>
                                            <div className="grid grid-flow-col gap-2 items-center">
                                                <div className="focus:border-secondary-500 bg-primary-700 rounded-lg px-2 py-1">
                                                        <input type="number" className="text-lg bg-primary-700 outline-none rounded-l-lg w-32"  />
                                                </div>
                                                <p className="text-type-200">minutes</p>
                                            </div>
                                        </div>
                                    </div>
                                </OutsideClickHandler>
                            </div>
                        : <></>                        
                        }

                    </div>
                    <SwapInput num={token1Value} value={token1} title={text.T_SWAP_FROM} pos={1} setToken={setToken} updateNum={(val: number) => setToken1Value(val)} />
                    <div className="px-4 relative my-12">
                        <div onClick={() => {swapTokens()}} role="button" tabIndex={0} className="rounded-full border-black border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center">
                            <IoSwapVertical size="30" className="text-gray-300" />
                        </div>
                    </div>
                    <SwapInput num={token2Value} value={token2} title={text.T_SWAP_TO} pos={2} setToken={setToken} updateNum={(val: number) => setToken2Value(val)}  />

                    { accountId ? 
                    <></> :  <div className="mt-4">
                            <Button text={buttonText} onClick={() => handleConnect()} classes="px-4 py-4 rounded-lg bg-secondary-500 bg-opacity-20 hover:bg-opacity-40 w-full text-secondary-400" />
                        </div>
                    }

                </div>
            </div>
    )
}

export default Swap
