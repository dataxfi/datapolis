import SwapInput from "./SwapInput"
import { IoSwapVertical } from "react-icons/io5"
import {MdTune} from 'react-icons/md'
import { useEffect, useState, useContext } from "react"
import {GlobalContext} from '../context/GlobalState'
import Button from "./Button"
import OutsideClickHandler from 'react-outside-click-handler'
import ConfirmSwapModal from "./ConfirmSwapModal"
import ConfirmModal from "./ConfirmModal"
import TransactionDoneModal from "./TransactionDoneModal"
import { Config } from "@dataxfi/datax.js"

const text = {
    T_SWAP: 'TradeX',
    T_SWAP_FROM: 'Swap from',
    T_SWAP_TO: 'Swap to'
}


const Swap = () => {

    const { token1, token2, setToken1, setToken2, swapTokens, handleConnect, buttonText, token1Value, token2Value, setToken1Value, setToken2Value, accountId, token1Balance, token2Balance, postExchange, loadingExchange, slippage, setSlippage, loadingToken1Val, loadingToken2Val, exactToken, ocean } =  useContext(GlobalContext)
    const [showSettings, setShowSettings] = useState(false)
    const [show, setShow] = useState(false)
    const [showConfirmLoader, setShowConfirmLoader] = useState(false)
    const [showTxDone, setShowTxDone] = useState(false)

    // useEffect(() => {
    //     if(showConfirmLoader){
    //         setShow(false)
    //         setTimeout(() => {
    //             setShowConfirmLoader(false)
    //             setShowTxDone(true)
    //         }, 3000);
    //     }
    // }, [showConfirmLoader]);

    // useEffect(() => {

    //     const getGasPrice = async () => {
    //         const res = await axios.get(`https://ethgasstation.info/api/ethgasAPI.json?api-key=${process.env.REACT_ENV_DEFI_PULSE}`)
    //         setGasPrice(parseFloat(res.data.average)/10)
    //     }

    //     getGasPrice()

    // }, []);

    const setToken = (token: Record<any, any>, pos: number) => {
        if(pos === 1){
            setToken1(token)
        } else if (pos === 2){
            setToken2(token)
        }
    }

    async function makeTheSwap(){
        let txReceipt = null
        setShow(false)
        setShowConfirmLoader(true)
        try {
            if(token1.symbol === 'OCEAN'){
                if(exactToken === 1){
                    console.log('exact ocean to dt')
                    console.log(accountId, token2.pool.toString(), token2Value.toString(), token1Value.toString())
                    txReceipt = await ocean.swapExactOceanToDt(accountId, token2.pool.toString(), token2Value.toString(), token1Value.toString())
                } else {
                    console.log('ocean to exact dt')
                    // await ocean.swapOceantoExactDt(accountId, token2.pool, token1Value)
                }
            } 
            else if(token2.symbol === 'OCEAN'){
                if(exactToken === 1){
                    console.log('exact dt to ocean')
                    // await ocean.swapExactDtToOcean(accountId, token1.pool, token2Value, token1Balance)
                } else {
                    console.log('dt to exact ocean')
                    // await ocean.swapDtToExactOcean(accountId, token1.pool, token2Value, token1Value)
                }
            } else {
                if(exactToken === 1){
                    console.log('exact dt to dt')
                    // await ocean.swapExactDtToDt(accountId, token1.address, token2.address, token2Value, token1Value, token1.pool, token2.pool, proxyAddress, slippage)
                } else {
                    console.log('dt to exact dt')
                    // await ocean.swapDtToExactDt(accountId, token1.address, token2.address, token2Value, token1Value, token1.pool, token2.pool, proxyAddress, slippage)
                }
            }            
        } catch (error) {
            console.log(error)
        }

        setShowConfirmLoader(false)
        setShowTxDone(true)
        console.log(txReceipt)
    }

    return (
        <>
            <div className="flex mt-16 w-full items-center mb-20">
                <div className="max-w-2xl mx-auto bg-primary-900 w-full rounded-lg p-4">
                    <div className="flex justify-between relative">
                        <p className="text-xl">{ text.T_SWAP }</p>
                        <div className="grid grid-flow-col gap-2 items-center">
                            {/* {gasPrice > 0 ? 
                            <div role="button" className="grid grid-flow-col items-center gap-1 hover:bg-primary-700 rounded-lg px-2 py-1.5">
                                <MdLocalGasStation size="24" style={{color: '#7CFF6B'}} />
                                <p className="text-green-500">{gasPrice}</p>
                            </div> : <div></div> } */}
                            <div onClick={() => setShowSettings(true)} className="hover:bg-primary-700 px-1.5 py-1.5 rounded-lg" role="button">
                                <MdTune size="24" />
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
                                                    <input type="number" onChange={(e) => setSlippage(e.target.value)} value={slippage} className="text-lg bg-primary-700 outline-none rounded-l-lg w-32"  />
                                                    <p className="text-type-200 text-lg">%</p>
                                                </div>
                                                <div>
                                                    <Button onClick={() => setSlippage(1)} text="Auto" classes="text-type-300 p-2 bg-primary-800 rounded-lg" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="mt-4">
                                            <p className="text-type-300 text-sm">Transaction deadline</p>
                                            <div className="grid grid-flow-col gap-2 items-center">
                                                <div className="focus:border-secondary-500 bg-primary-700 rounded-lg px-2 py-1">
                                                        <input type="number" className="text-lg bg-primary-700 outline-none rounded-l-lg w-32"  />
                                                </div>
                                                <p className="text-type-200">minutes</p>
                                            </div>
                                        </div> */}
                                    </div>
                                </OutsideClickHandler>
                            </div>
                        : <></>                        
                        }

                    </div>
                    <SwapInput num={token1Value} value={token1} balance={token1Balance} title={text.T_SWAP_FROM} pos={1} setToken={setToken} updateNum={(val: number) => setToken1Value(val)} loading={loadingToken1Val} />
                    <div className="px-4 relative my-12">
                        <div onClick={() => {swapTokens()}} role="button" tabIndex={0} className="rounded-full border-black border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center">
                            <IoSwapVertical size="30" className="text-gray-300" />
                        </div>
                    </div>
                    <SwapInput num={token2Value} value={token2} balance={token2Balance} title={text.T_SWAP_TO} pos={2} setToken={setToken} updateNum={(val: number) => setToken2Value(val)} loading={loadingToken2Val}  />

                    {
                        token1 && token2 && !loadingExchange && !Number.isNaN(postExchange) ?
                        <div className="my-4 p-2 bg-primary-800 flex justify-between text-type-400 text-sm rounded-lg">
                            <p>Exchange rate</p>

                            {
                            loadingExchange ? <p>...</p> :
                            <p>1 {token1.symbol} = {Number(postExchange).toLocaleString('en', {maximumFractionDigits: 4})} {token2.symbol}</p>
                            }
                        </div> : <></>
                    }

                    {
                        !accountId ?
                        <div className="mt-4">
                            <Button text={buttonText} onClick={() => handleConnect()} classes="px-4 py-4 rounded-lg bg-secondary-500 bg-opacity-20 hover:bg-opacity-40 w-full text-secondary-400" />
                        </div> : <></>                    
                    }

                    {
                        accountId && token1 && token2 && token1Value && token2Value && token1Balance && Number(token1Balance) >= Number(token1Value)  ?
                        <div className="mt-4">
                            <Button onClick={() => setShow(true)} text="Swap" classes="px-4 py-4 rounded-lg bg-secondary-500 bg-opacity-20 hover:bg-opacity-40 w-full text-secondary-400" />
                        </div>
                        : accountId && (token1Value || token2Value) ? 
                        <div className="mt-4">
                            <Button onClick={() => setShow(true)} text="Insufficient balance" disabled={true} classes="px-4 py-4 rounded-lg bg-gray-800 w-full text-gray-400 cursor-not-allowed" />
                         </div> : <></>
                    }

                </div>
            </div>
            
            <ConfirmSwapModal show={show} close={() => setShow(false)} confirm={() => makeTheSwap()} />
            <ConfirmModal show={showConfirmLoader} close={() => setShowConfirmLoader(false)} />
            <TransactionDoneModal show={showTxDone} close={() => setShowTxDone(false)} />
        </>
    )
}

export default Swap
