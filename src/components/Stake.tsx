import { AiOutlinePlus } from "react-icons/ai"
// import { useEffect, useState, useContext } from "react"
// import {GlobalContext} from '../context/GlobalState'
import StakeSelect from "./StakeSelect"
// import RemoveAmount from "./RemoveAmount"
// import PositionBox from "./PositionBox"
import { useState, useContext, useEffect } from "react"
import { GlobalContext } from "../context/GlobalState"
import { PulseLoader } from "react-spinners"
import Button from "./Button"

const text = {
  T_STAKE: "StakeX",
  T_SELECT_TOKEN: "Select token"
}

interface IPoolLiquidity {
  dtAmount: string,
  oceanAmount: string
}

const Stake = () => {

  const {ocean, accountId} = useContext(GlobalContext)
  const [token, setToken] = useState<any>(null);
  const [dtToOcean, setDtToOcean] = useState<any>(null)
  const [oceanToDt, setOceanToDt] = useState<any>(null)
  const [loadingRate, setLoadingRate] = useState(false)
  const [oceanVal, setOceanVal] = useState('')
  const [poolLiquidity, setPoolLiquidity] = useState<IPoolLiquidity | null>(null)
  const [yourLiquidity, setYourLiquidity] = useState<IPoolLiquidity | null>(null)
  const [balance, setBalance] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [perc, setPerc] = useState('')

  useEffect(() => {
    const OCEAN_ADDRESS = '0x8967bcf84170c91b0d24d4302c2376283b0b3a07'

    async function setOceanBalance(){
      if(accountId && ocean){
        setLoading(true)
        const balance = await ocean.getBalance(OCEAN_ADDRESS, accountId)
        setBalance(balance)
        setLoading(false)
      }
    }

    setOceanBalance()

  }, [accountId, ocean]);

  async function onPerc(val: any){
    const perc = parseFloat(val)
    if(!Number.isNaN(val)){
      setPerc(String(perc))
      setOceanVal((balance * perc / 100).toFixed(5))
    } else {
      setPerc('')
      setOceanVal('')
    }
  }

  async function updateNum(val: string) {
    setOceanVal(val)
  }

  async function updateToken(val: any){
    setToken(val)
    if(val){
      setLoadingRate(true)
      const [res1, res2, myPoolShares, totalPoolShares] = await Promise.all([ocean.getOceanPerDt(val.pool), ocean.getDtPerOcean(val.pool), ocean.getMyPoolSharesForPool(val.pool, accountId), ocean.getTotalPoolShares(val.pool)]) 
      setOceanToDt(res1)
      setDtToOcean(res2)
      const [res4, res5] = await Promise.all([ocean.getTokensRemovedforPoolShares(val.pool, String(myPoolShares)), ocean.getTokensRemovedforPoolShares(val.pool, String(totalPoolShares))])
      setYourLiquidity(res4)
      setPoolLiquidity(res5)
      setLoadingRate(false)
    }
  }

  return (
    <>
      <div className="flex mt-16 w-full items-center mb-20">
        <div className="max-w-2xl mx-auto bg-primary-900 w-full rounded-lg p-4 hm-box">
          <div className="flex justify-between">
            <p className="text-xl">{text.T_STAKE}</p>
          </div>
          <StakeSelect value={token} setToken={(val: any) => {updateToken(val)} } />
          <div className="px-4 relative my-12">
            <div className="rounded-full border-primary-900 border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center swap-center">
              <AiOutlinePlus size="30" className="text-gray-300" />
            </div>
          </div>
          <div className="mt-4 bg-primary-800 p-4 rounded-lg">
            <div className="md:grid md:grid-cols-5">
              <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                <img
                  src='https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY'
                  className="w-14 h-14 rounded-md"
                  alt=""
                />
                <div>
                  <p className="text-xs text-type-200">Token</p>
                  <span className="text-2xl text-type-200 font-bold grid grid-flow-col items-center gap-1">
                    <span>OCEAN</span>
                  </span>
                  {/* <p className="text-xs text-type-100 border-type-300 border rounded-full px-2 py-1 mt-1">Select token</p>           */}
                </div>
              </div>
              <div className="col-span-3 mt-3 md:mt-0">
              <div className="h-full w-full rounded-lg bg-primary-900 text-3xl p-2">
                    <div className="flex justify-between items-center">                
                      {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
                      <input
                        value={oceanVal}
                        onChange={e => updateNum(e.target.value)}
                        onWheel={event => event.currentTarget.blur()}
                        onKeyDown={evt =>
                          ["e", "E", "+", "-"].includes(evt.key) &&
                          evt.preventDefault()
                        }
                        type="number"
                        className="h-full w-full rounded-lg bg-primary-900 text-3xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400"
                        placeholder="0.0"
                      />
                      <div>
                            {
                                balance ?
                                <p className="text-sm text-type-400 whitespace-nowrap text-right">
                                    Balance: {Number(balance).toLocaleString(undefined, {maximumFractionDigits: 4})}
                                </p> : <></>
                            }
                            {
                                loading ? 
                                <div className="text-center">
                                    <PulseLoader color="white" size="4px" margin="5px" /> 
                                </div>
                                : 
                                balance ?
                                <div className="text-sm text-type-300 grid grid-flow-col justify-end gap-2">
                                    <Button onClick={() => {onPerc(100)}} text="Max" classes="px-2 py-0 border border-type-300 rounded-full text-xs" />
                                    <input value={perc} type="number" onChange={(e) => {onPerc(e.target.value)}} className="text-xs text-type-200 placeholder-gray-500 bg-primary-700 py-1 rounded px-1 w-12 outline-none" placeholder="%" />
                                </div> : <></>
                            }
                        </div>
                      </div>
                    </div>
              </div>
            </div>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-3 border border-type-600 mt-4 rounded-lg p-4 justify-center">
              <div>
                <p className="text-type-300 text-xs">Swap Rate</p>
                { token && oceanToDt && dtToOcean && !loadingRate ?
                <div>
                  <p className="text-type-200 text-xs">{Number(oceanToDt).toFixed(5)} OCEAN per {token.symbol}</p>
                  <p className="text-type-200 text-xs">{Number(dtToOcean).toFixed(5)} {token.symbol} per OCEAN</p>
                </div>
                  : <div> - </div>
                }
              </div>
              <div>
                <p className="text-type-300 text-xs">Pool liquidity</p>
                {
                  token && poolLiquidity && !loadingRate ?
                  <div>
                <p className="text-type-200 text-xs">{Number(poolLiquidity?.oceanAmount).toFixed(5)} OCEAN</p>
                <p className="text-type-200 text-xs">{Number(poolLiquidity?.dtAmount).toFixed(5)} {token.symbol}</p>
                  </div>  :
                  <div> - </div>
                }
              </div>
              <div>
                <p className="text-type-300 text-xs">Your liquidity</p>
                {
                  token && yourLiquidity && !loadingRate ?
                  <div>
                    <p className="text-type-200 text-xs">{Number(yourLiquidity?.oceanAmount).toFixed(5)} OCEAN</p>
                    <p className="text-type-200 text-xs">{Number(yourLiquidity?.dtAmount).toFixed(5)} {token.symbol}</p>
                  </div> :
                  <div> - </div>
                }
              </div>
          </div>
        </div>
      </div>
      {/* <RemoveAmount />
      <PositionBox /> */}
    </>
  )
}

export default Stake
