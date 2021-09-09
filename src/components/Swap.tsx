import SwapInput from "./SwapInput"
import { IoSwapVertical } from "react-icons/io5"
import {MdTune} from 'react-icons/md'
import { useState, useContext } from "react"
import {GlobalContext} from '../context/GlobalState'
import Button from "./Button"
import OutsideClickHandler from 'react-outside-click-handler'
import ConfirmSwapModal from "./ConfirmSwapModal"
import ConfirmModal from "./ConfirmModal"
import TransactionDoneModal from "./TransactionDoneModal"

const text = {
    T_SWAP: 'TradeX',
    T_SWAP_FROM: 'You are selling',
    T_SWAP_TO: 'You are buying'
}

const INITIAL_TOKEN_STATE = {info: null, value: '', balance: ''}

const Swap = () => {

    const { handleConnect, accountId, ocean } =  useContext(GlobalContext)
    const [showSettings, setShowSettings] = useState(false)
    const [show, setShow] = useState(false)
    const [showConfirmLoader, setShowConfirmLoader] = useState(false)
    const [showTxDone, setShowTxDone] = useState(false)
    const [token1, setToken1] = useState<any>(INITIAL_TOKEN_STATE)
    const [token2, setToken2] = useState<any>(INITIAL_TOKEN_STATE)
    const [exactToken, setExactToken] = useState<number>(1)
    const [postExchange, setPostExchange] = useState<any>(null)
    const [slippage, setSlippage] = useState<number | string>(1);


    const setToken = async (info: Record<any, any>, pos: number) => {
        const balance = await ocean.getBalance(info.address, accountId)
        if(pos === 1){
            setToken1({...token1, info, balance})
            updateOtherTokenValue(true, token1.value)
        } else if (pos === 2){
            setToken2({...token2, info, balance})
            updateOtherTokenValue(false, token2.value)
        }
    }

    function swapTokens() {
        setToken1(token2)
        setToken2(token1)
        calculateExchange(true, token1.value)
    }

    async function updateOtherTokenValue(fromToken1: boolean, inputAmount: number) {
        if(token1.info && token2.info){
          if(fromToken1){
            setToken2({...token2, loading: true})
            let exchange = await calculateExchange(fromToken1, inputAmount)
            exchange = Number(Number(exchange).toFixed(6))
            setPostExchange((exchange/inputAmount))
            setToken2({...token2, value: exchange, loading: false})
            setExactToken(1)
          } else {
            setToken1({...token1, loading: true})
            let exchange = await calculateExchange(fromToken1, inputAmount)
            exchange = Number(Number(exchange || 0).toFixed(6))
            setPostExchange((inputAmount/exchange) || 0)
            setToken1({...token1, value: exchange, loading: false})
            setExactToken(2)
          }
        }
    }

    // This is easily testable, if we someone writes tests for this in the future, it'll be great
    async function calculateExchange(fromToken1: boolean, amount:number){
      
        if(token1.info.symbol === 'OCEAN'){
          if(fromToken1){
            return await ocean.getDtReceived(token2.info.pool, amount)
          } else {
            return await ocean.getOceanNeeded(token2.info.pool, amount)
          }
        }
  
        if(token2.info.symbol === 'OCEAN'){
          if(fromToken1){
            return await ocean.getOceanReceived(token1.info.pool, amount)
          } else {
            return await ocean.getDtNeeded(token1.info.pool, amount)
          }
        }
  
        if(fromToken1){
          return await ocean.getDtReceivedForExactDt(amount.toString(), token1.info.pool, token2.info.pool)
        } else {
          return await ocean.getDtNeededForExactDt(amount.toString(), token1.info.pool, token2.info.pool)
        }
  
      }    



    async function makeTheSwap(){
        let txReceipt = null
        setShow(false)
        setShowConfirmLoader(true)
        try {
            if(token1?.info.symbol === 'OCEAN'){
                if(exactToken === 1){
                    console.log('exact ocean to dt')
                    console.log(accountId, token2.info.pool.toString(), token2.value.toString(), token1.value.toString())
                    txReceipt = await ocean.swapExactOceanToDt(accountId, token2.info.pool.toString(), token2.value.toString(), token1.value.toString())
                } else {
                    console.log('ocean to exact dt')
                    console.log(accountId, token2.info.pool, token2.value.toString(), token1.value.toString())
                    txReceipt = await ocean.swapOceanToExactDt(accountId, token2.info.pool, token2.value.toString(), token1.value.toString())
                }
            }
            else if(token2.info.symbol === 'OCEAN'){
                if(exactToken === 1){
                    console.log('exact dt to ocean')
                    txReceipt = await ocean.swapExactDtToOcean(accountId, token1.info.pool, token1.value.toString(), token2.value.toString())
                } else {
                    // Error: Throws not enough datatokens
                    console.log('dt to exact ocean')
                    console.log(accountId, token1.info.pool, token2.value.toString(), token1.value.toString())
                    txReceipt = await ocean.swapDtToExactOcean(accountId, token1.info.pool, token2.value.toString(), token1.value.toString())
                }
            } else {
                if(exactToken === 1){
                    console.log('exact dt to dt')
                    console.log(accountId, token1.info.address, token2.info.address, token2.value.toString(), token1.value.toString(), token1.info.pool, token2.info.pool, null, (Number(slippage)/100).toString())
                    txReceipt = await ocean.swapExactDtToDt(accountId, token1.info.address, token2.info.address, token2.value.toString(), token1.value.toString(), token1.info.pool, token2.info.pool, null, (Number(slippage)/100).toString())
                } else {
                    console.log('dt to exact dt')
                    console.log(accountId, token1.info.address, token2.info.address, token2.value.toString(), token1.value.toString(), token1.info.pool, token2.info.pool, null, (Number(slippage)/100).toString())
                    txReceipt = await ocean.swapDtToExactDt(accountId, token1.info.address, token2.info.address, token2.value.toString(), token1.value.toString(), token1.info.pool, token2.info.pool, null, (Number(slippage)/100).toString())
                }
            }
            if(txReceipt){
                setShowConfirmLoader(false)
                setShowTxDone(true)
                setToken1(INITIAL_TOKEN_STATE)
                setToken2(INITIAL_TOKEN_STATE)
                setPostExchange(null)
                console.log(txReceipt)   
            } else {
                setShowConfirmLoader(false)
            }
        
        } catch (error: any) {
            setShowConfirmLoader(false)
            console.log(error)
        }
    }

    return (
        <>
            <div className="flex mt-16 w-full items-center mb-20">
                <div className="max-w-2xl md:mx-auto sm:mx-4 mx-3 bg-primary-900 w-full rounded-lg p-4 box">
                    <div className="flex justify-between relative">
                        <p className="text-xl">{ text.T_SWAP }</p>
                        <div className="grid grid-flow-col gap-2 items-center">
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
                                                    <input type="number" onChange={(e) => setSlippage(e.target.value || '')} value={slippage} className="text-lg bg-primary-700 outline-none rounded-l-lg w-32"  />
                                                    <p className="text-type-200 text-lg">%</p>
                                                </div>
                                                <div>
                                                    <Button onClick={() => setSlippage(1)} text="Auto" classes="text-type-300 p-2 bg-primary-800 rounded-lg" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </OutsideClickHandler>
                            </div>
                        : <></>                        
                        }

                    </div>
                    <SwapInput otherToken={token2.info ? token2.info.symbol : ''} num={token1.value} value={token1.info} balance={token1.balance} title={text.T_SWAP_FROM} pos={1} setToken={setToken} updateNum={(value: number) => { setToken1({...token1, value}); updateOtherTokenValue(true, value) } } loading={token1.loading} />
                    <div className="px-4 relative my-12">
                        <div onClick={() => {swapTokens()}} role="button" tabIndex={0} className="rounded-full border-black border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center">
                            <IoSwapVertical size="30" className="text-gray-300" />
                        </div>
                    </div>
                    <SwapInput otherToken={token1.info ? token1.info.symbol : ''} num={token2.value} value={token2.info} balance={token2.balance} title={text.T_SWAP_TO} pos={2} setToken={setToken} updateNum={(value: number) => { setToken2({...token2, value}); updateOtherTokenValue(false, value) }} loading={token2.loading}  />

                    {
                        token1.info && token2.info && !Number.isNaN(postExchange) && Number(postExchange) !== 0 ?
                        <div className="my-4 p-2 bg-primary-800 flex justify-between text-type-400 text-sm rounded-lg">
                            <p>Exchange rate</p>
                            <p>1 {token1.info.symbol} = {Number(postExchange).toLocaleString('en', {maximumFractionDigits: 4})} {token2.info.symbol}</p>
                        </div> : <></>
                    }

                    {
                        !accountId ?
                        <div className="mt-4">
                            <Button text="Connect Wallet" onClick={() => handleConnect()} classes="px-4 py-4 rounded-lg bg-primary-100 bg-opacity-20 hover:bg-opacity-40 w-full text-background-800" />
                        </div> : <></>                    
                    }

                    {
                        accountId && !(token1.info && token2.info) ?
                        <div className="mt-4">
                            <Button text="Select Tokens" disabled={true} classes="px-4 py-4 rounded-lg bg-gray-800 w-full text-gray-400 cursor-not-allowed" />
                        </div> : <></>                    
                    }

                    {
                        accountId && token1.info && token2.info && !(token1.value || token2.value) ?
                        <div className="mt-4">
                            <Button text="Enter Token Amount" disabled={true} classes="px-4 py-4 rounded-lg bg-gray-800 w-full text-gray-400 cursor-not-allowed" />
                        </div> : <></>                    
                    }
                    {
                        accountId && token1.info && token2.info && token1.value && token2.value && token1.balance && Number(token1.balance) >= Number(token1.value)  ?
                        <div className="mt-4">
                            <Button onClick={() => setShow(true)} text="Swap" classes="px-4 py-4 rounded-lg bg-primary-100 bg-opacity-20 hover:bg-opacity-40 w-full text-background-800" />
                        </div>
                        : accountId && (token1.value || token2.value) && !(token1.loading || token2.loading!) ? 
                        <div className="mt-4">
                            <Button onClick={() => setShow(true)} text="Insufficient balance" disabled={true} classes="px-4 py-4 rounded-lg bg-gray-800 w-full text-gray-400 cursor-not-allowed" />
                         </div> : <></>
                    }

                </div>
            </div>
            
            <ConfirmSwapModal close={() => setShow(false)} confirm={() => makeTheSwap()} show={show} token1={token1} token2={token2} postExchange={postExchange} slippage={slippage} />
            <ConfirmModal show={showConfirmLoader} close={() => setShowConfirmLoader(false)} token1={token1} token2={token2} />
            <TransactionDoneModal show={showTxDone} close={() => setShowTxDone(false)} />
        </>
    )
}

export default Swap
