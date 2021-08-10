import {AiOutlinePlus} from 'react-icons/ai'
// import { useEffect, useState, useContext } from "react"
// import {GlobalContext} from '../context/GlobalState'
import StakeSelect from "./StakeSelect"
import RemoveAmount from './RemoveAmount'
import PositionBox from './PositionBox'

const text = {
    T_STAKE: 'Stake',
    T_SELECT_TOKEN: 'Select token'
}


const Swap = () => {

    // const { token1, token2, setToken1, setToken2, swapTokens, handleConnect, buttonText, token1Value, token2Value, setToken1Value, setToken2Value, accountId } =  useContext(GlobalContext)
    // const [gasPrice, setGasPrice] = useState(0)

    // useEffect(() => {

    //     console.log('Fetching gas prices')

    //     const getGasPrice = async () => {
    //         const res = await axios.get(`https://ethgasstation.info/api/ethgasAPI.json?api-key=${process.env.REACT_ENV_DEFI_PULSE}`)
    //         setGasPrice(parseFloat(res.data.average)/10)
    //     }

    //     getGasPrice()

    // }, []);

    // const setToken = (token: Record<any, any>, num: number) => {
    //     if(num === 1){
    //         setToken1(token)
    //     } else if (num === 2){
    //         setToken2(token)
    //     }
    // }

    const updateNum = (val: string) => {
        console.log('Update token val')
    }


    return (
        <>
        <div className="flex mt-16 w-full items-center mb-20">
            <div className="max-w-2xl mx-auto bg-primary-900 w-full rounded-lg p-4">
                <div className="flex justify-between">
                    <p className="text-xl">{ text.T_STAKE }</p>
                </div>
                <StakeSelect value={null} />
                <div className="px-4 relative my-12">
                    <div className="rounded-full border-primary-900 border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center">
                        <AiOutlinePlus size="30" className="text-gray-300" />
                    </div>
                </div>
                <div className="mt-4 bg-primary-800 p-4 rounded-lg">
                <div className="md:grid md:grid-cols-5">
                    <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                        <img src="https://via.placeholder.com/42x42" className="w-14 h-14 rounded-md" alt="" />
                        <div>
                                <p className="text-xs text-type-200">Token</p>
                                <span className="text-2xl text-type-200 font-bold grid grid-flow-col items-center gap-1">
                                    <span>OCEAN</span>
                                </span>
                                {/* <p className="text-xs text-type-100 border-type-300 border rounded-full px-2 py-1 mt-1">Select token</p>           */}
                                
                        </div>
                    </div>
                    <div className="col-span-3 mt-3 md:mt-0">
                        {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
                        <input onChange={(e) => updateNum(e.target.value)} onWheel={ event => event.currentTarget.blur() } onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} type="number" className="h-full w-full rounded-lg bg-primary-900 text-3xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400" placeholder="0.0" />
                    </div>
                </div>                    
                </div>
                <div className="border border-type-600 mt-4 rounded-lg p-4">
                    <p className="text-type-200 text-xs">
                        500.342 OCEAN per TREPEL
                    </p>
                    <p className="text-type-200 text-xs">
                        0.001242 TREPEL per OCEAN
                    </p>                    
                </div>
            </div>
        </div>
        <RemoveAmount />     
        <PositionBox />   
        </>
    )
}

export default Swap
