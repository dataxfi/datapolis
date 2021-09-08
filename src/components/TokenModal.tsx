import { MdClose } from 'react-icons/md'
import TokenItem from './TokenItem'
import { useEffect, useState, useContext } from 'react'
import HashLoader from 'react-spinners/HashLoader'
import ReactList from 'react-list'
import {GlobalContext} from '../context/GlobalState'
import { TokenList } from '@dataxfi/datax.js'

const text = {
    T_SELECT_TOKEN: 'Select a token'
}

const TokenModal = ({close, onClick, otherToken}: {close: Function, onClick: Function, otherToken?: string}) => {

    const { web3 } =  useContext(GlobalContext)
    const [response, setResponse] = useState<any>([]);
    const [tokens, setTokens] = useState<any>([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        // const url = 'https://gateway.pinata.cloud/ipfs/QmQi1sNZVP52urWq4TzLWx9dPRWNrvR4CUFgCEsocGkj5X'
        const tokenList = new TokenList(web3, '4', process.env.REACT_APP_PINATA_KEY || '', process.env.REACT_APP_PINATA_SECRET || '')
        const getTokenList = async() => {
            try {
                setError(false)
                setLoading(true)
                const res = await tokenList.fetchDataTokenList()
                setResponse(res.tokens.filter(t => t.symbol !== otherToken))
                setTokens(res.tokens.filter(t => t.symbol !== otherToken))
                setLoading(false)
            } catch (error) {
                console.log(error)
                setLoading(false)
                setError(true)
            }
        }
        
        getTokenList()
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tokenRenderer = (idx: number, key: string | number) => {
        return <TokenItem onClick={onClick} key={key} token={tokens[idx]} />
    }

    const searchToken = (val: string) => {
        if(val){
            setTokens(response.filter((t: any) => t.name.toLowerCase().indexOf(val.toLowerCase()) >= 0 || t.symbol.toLowerCase().indexOf(val.toLowerCase()) >= 0))
        } else {
            setTokens(response)
        }
        
    }

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full sm:max-w-sm">
                <div className="p-4 bg-background border-primary-500 border rounded-lg hm-box mx-3">
                    <div className="flex justify-between items-center">
                        <p className="mb-0 text-type-100 text-2xl">{text.T_SELECT_TOKEN}</p>
                        <MdClose role="button" onClick={() => {close()}} className="text-type-100 text-2xl" />
                    </div>
                    <div className="mt-4">
                        <input onChange={(e) => searchToken(e.target.value)} type="text" placeholder="Search token" className="px-4 py-2 h-full w-full rounded-lg bg-primary-900 text-base outline-none focus:placeholder-type-200 placeholder-type-400" />    
                    </div>
                    { loading ? <div className="flex justify-center my-4"><HashLoader size={28} color="white" loading={loading} /></div> : 
                              error ? <div className="text-white text-center my-4">There was an error loading the tokens</div>  :   
                              <div className="mt-4 overflow-y-scroll" style={{maxHeight: '60vh'}}>
                                  <ReactList itemRenderer={tokenRenderer} length={tokens.length} type="simple" />
                              </div>           
                    }
                </div>
        </div>
    )
}

export default TokenModal
