import Web3 from "web3";
// @ts-ignore  
import { Ocean, TokenList, Config } from "@dataxfi/datax.js";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import React, {createContext, PropsWithChildren, useEffect, useReducer, useState} from "react";
import AppReducer from './AppReducer'
import Core from "web3modal";

const initialState: any = {
    token1: null,
    token1Value: '',
    token2: null,
    token2Value: ''
}

export const GlobalContext  = createContext(initialState)

export const GlobalProvider = ({ children }: {children: PropsWithChildren<{}>}) => {
    const [state, dispatch]: [any, Function] = useReducer(AppReducer, initialState)
    const [web3Modal, setWeb3Modal] = useState<Core | null>(null)
    const [accountId, setAccountId] = useState<string | null>(null)
    const [chainId, setChainId] = useState<number | null>(null)
    const [provider, setProvider] = useState(null)
    const [web3, setWeb3] = useState<Web3 | null>(null)
    const [buttonText, setButtonText] = useState<string | undefined>('Connect to a wallet')
    const [ocean, setOcean] = useState<any>(null)
    //const buttonText = 'Connect to a wallet'
    

    useEffect(() => {
        async function init() {
          const web3Modal = new Web3Modal({
            // network: 'ropsten', // optional
            cacheProvider: false, // optional
            theme: 'dark',
            providerOptions: {
                walletconnect: {
                    package: WalletConnectProvider, // required
                    options: {
                    infuraId: process.env.REACT_APP_INFURA_ID // required
                    }
                },
            }, // required
          })

          const provider = await web3Modal?.connect()
          setProvider(provider)          
          const web3 = new Web3(provider)
          setWeb3(web3)
          const ocean = new Ocean(web3, 'ropsten')
          setOcean(ocean)
          console.log(ocean)
  
          setWeb3Modal(web3Modal)
          web3Modal.clearCachedProvider()
        }
    
        init()
      }, [accountId, chainId, provider])

      async function handleConnect() {
        web3Modal?.clearCachedProvider()
        // const provider = await web3Modal?.connect()
        // setProvider(provider)
        // const _web3 = new Web3(provider)
        // setWeb3(_web3)
        if(web3){
          setAccountId((await web3.eth.getAccounts())[0])
          setButtonText(accountId ? accountId?.toString() : 'Connect to a wallet')
          setChainId(await web3.eth.getChainId())
          setListeners(provider)
        }
      }

    async function setListeners(provider: any) {
        provider.on('accountsChanged', (accounts: any) => {
          console.log('Accounts changed to - ', accounts[0])
          console.log('Connected Accounts - ', JSON.stringify(accounts))
          setAccountId(accounts[0])
        })
    
        // Subscribe to chainId change
        provider.on('chainChanged', (chainId: any) => {
          console.log('ChainID changed to - ', chainId)
          setChainId(chainId)
        })
    
        // Subscribe to provider connection
        provider.on('connect', (info: any) => {
          console.log('Connect event fired')
        })
    
        // Subscribe to provider disconnection
        provider.on('disconnect', (error: any) => {
          console.log(error)
          alert('Error occured while disconnecting wallet')
        })
      }


    function setToken1(token: Record<any, any>){
        dispatch({
            type: 'SET_TOKEN_1',
            payload: token
        })
    }

    function setToken1Value(value: number){
      dispatch({
          type: 'SET_TOKEN_1_VALUE',
          payload: value
      })
    } 
    
    function setToken2Value(value: number){
      dispatch({
          type: 'SET_TOKEN_2_VALUE',
          payload: value
      })
    }     

    function setToken2(token: Record<any, any>){
        dispatch({
            type: 'SET_TOKEN_2',
            payload: token
        })
    }

    function swapTokens(){
        dispatch({
            type: 'SWAP_TOKENS'
        })
    }

    return (<GlobalContext.Provider value={{token1: state.token1, token2: state.token2, setToken1, setToken2, setToken1Value, setToken2Value, token1Value: state.token1Value, token2Value: state.token2Value, swapTokens, handleConnect, buttonText, accountId, chainId, provider}} >
        { children }
    </GlobalContext.Provider>)
}