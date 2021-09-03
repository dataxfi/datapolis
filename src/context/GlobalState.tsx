import Web3 from "web3";
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
    token2Value: '',
    token1Balance: null,
    token2Balance: null
}

export const GlobalContext  = createContext(initialState)

export const GlobalProvider = ({ children }: {children: PropsWithChildren<{}>}) => {
    const NETWORK = 'mainnet'
    const [state, dispatch]: [any, Function] = useReducer(AppReducer, initialState)
    const [web3Modal, setWeb3Modal] = useState<Core | null>(null)
    const [accountId, setAccountId] = useState<string | null>(null)
    const [chainId, setChainId] = useState<number | null>(null)
    const [provider, setProvider] = useState(null)
    const [web3, setWeb3] = useState<Web3 | null>(null)
    const [buttonText, setButtonText] = useState<string | undefined>('Connect to a wallet')
    const [ocean, setOcean] = useState<any>(null)
    const [postExchange, setPostExchange] = useState<any>(null)
    const [loadingExchange, setLoadingExchange] = useState<any>(null)
    const [slippage, setSlippage] = useState<number>(1)
    const [loadingToken1Val, setLoadingToken1Val] = useState<boolean>(false)
    const [loadingToken2Val, setLoadingToken2Val] = useState<boolean>(false)
    const [exactToken, setExactToken] = useState<number>(1)
    

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

          setWeb3Modal(web3Modal)

          const provider = await web3Modal?.connect()
          setProvider(provider)

          // This is required to get the token list
          const web3 = new Web3(provider)
          setWeb3(web3)

          web3Modal.clearCachedProvider()
          setupAccountAndListeners()

          // This is required to do wallet-specific functions
          const ocean = new Ocean(web3, '4')
          setOcean(ocean)

        }
    
        init()
      }, [accountId, chainId, provider])

      useEffect(() => {
        updateOtherTokenValue(true, state.token1Value)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [state?.token1?.symbol]);

      // Set default exchange rate
      // useEffect(() => {
      //   async function setExchangeRate(){
      //     setLoadingExchange(true)
      //     if(state.token1 && state.token2){
      //       const exchange = await ocean.getDtReceivedForExactDt("1", state.token1.pool, state.token2.pool)
      //       setPostExchange(exchange)
      //     } else {
      //       console.log('Did not find this')
      //     }
      //     setLoadingExchange(false)
      // }
      // setExchangeRate()
      // }, [state.token1, state.token2, ocean]);

      async function handleConnect() {
        web3Modal?.clearCachedProvider()
        await web3Modal?.toggleModal()
        setupAccountAndListeners()
      }

    async function setupAccountAndListeners(){
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


    async function setToken1(token: Record<any, any>){
      const balance = await ocean.getBalance(token.address, accountId)  
        dispatch({
            type: 'SET_TOKEN_1',
            payload: {token, balance}
        })

        updateOtherTokenValue(true, state.token1Value)

    }

    function setToken1Value(value: number, triggerUpdate = true){
      dispatch({
          type: 'SET_TOKEN_1_VALUE',
          payload: value
      })

      if(triggerUpdate){
        updateOtherTokenValue(true, value || 0)
      }
    }

    async function setToken2(token: Record<any, any>){
      const balance = await ocean.getBalance(token.address, accountId)      
        dispatch({
            type: 'SET_TOKEN_2',
            payload: {token, balance}
        })

        updateOtherTokenValue(false, state.token2Value)
    }

    function setToken2Value(value: number, triggerUpdate = true){
      dispatch({
          type: 'SET_TOKEN_2_VALUE',
          payload: value
      })

      if(triggerUpdate){
        updateOtherTokenValue(false, value || 0)
      }

    }

    function swapTokens(){
        dispatch({
            type: 'SWAP_TOKENS'
        })
    }



    async function updateOtherTokenValue(fromToken1: boolean, inputAmount: number) {
      if(state.token1 && state.token2){     
        if(fromToken1){
          setLoadingToken2Val(true)
          let exchange = await calculateExchange(fromToken1, inputAmount)
          exchange = Number(Number(exchange).toFixed(6))
          setToken2Value(exchange, false)
          setPostExchange((exchange/inputAmount))
          setLoadingToken2Val(false)
          setExactToken(1)
        } else {
          setLoadingToken1Val(true)
          let exchange = await calculateExchange(fromToken1, inputAmount)
          exchange = Number(Number(exchange || 0).toFixed(6))
          setToken1Value(exchange || 0, false)
          setPostExchange((inputAmount/exchange) || 0)
          setLoadingToken1Val(false)
          setExactToken(2)
        }
      }
    }

    async function calculateExchange(fromToken1: boolean, amount:number){
      
      if(state.token1.symbol === 'OCEAN'){
        if(fromToken1){
          return await ocean.getDtReceived(state.token2.pool, amount)
        } else {
          return await ocean.getOceanNeeded(state.token2.pool, amount)
        }
      }

      if(state.token2.symbol === 'OCEAN'){
        if(fromToken1){
          return await ocean.getOceanReceived(state.token1.pool, amount)
        } else {
          return await ocean.getDtNeeded(state.token1.pool, amount)
        }
      }

      if(fromToken1){
        return await ocean.getDtReceivedForExactDt(amount.toString(), state.token1.pool, state.token2.pool)
      } else {
        return await ocean.getDtNeededForExactDt(amount.toString(), state.token1.pool, state.token2.pool)
      }

    }


    return (<GlobalContext.Provider value={{token1: state.token1, token2: state.token2, token1Balance: state.token1Balance, token2Balance: state.token2Balance, setToken1, setToken2, setToken1Value, setToken2Value, token1Value: state.token1Value, token2Value: state.token2Value, swapTokens, handleConnect, buttonText, accountId, chainId, provider, web3, ocean, network: NETWORK, postExchange, loadingExchange, slippage, setSlippage, loadingToken1Val, loadingToken2Val, exactToken}} >
        { children }
    </GlobalContext.Provider>)
}