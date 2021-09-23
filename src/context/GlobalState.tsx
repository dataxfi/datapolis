import Web3 from "web3";
import { Ocean, Config } from "@dataxfi/datax.js";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import React, {createContext, PropsWithChildren, useEffect, useState} from "react";
import Core from "web3modal";

const initialState: any = {}
const CONNECT_TEXT = "Connect Wallet"

export const GlobalContext  = createContext(initialState)

export const GlobalProvider = ({ children }: {children: PropsWithChildren<{}>}) => {
    const NETWORK = 'mainnet'
    // const [state, dispatch]: [any, Function] = useReducer(AppReducer, initialState)
    const [web3Modal, setWeb3Modal] = useState<Core | null>(null)
    const [accountId, setAccountId] = useState<string | null>(null)
    const [chainId, setChainId] = useState<number | undefined>(undefined)
    const [provider, setProvider] = useState(null)
    const [web3, setWeb3] = useState<Web3 | null>(null)
    const [ocean, setOcean] = useState<Ocean | null>(null)
    const [config, setConfig] = useState<any>(null)

    const [buttonText, setButtonText] = useState<string | undefined>(CONNECT_TEXT)
    

    useEffect(() => {
        async function init() {
          const web3Modal = new Web3Modal({
            network: 'mainnet', // optional
            cacheProvider: true, // optional
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

        }
    
        init()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [web3, chainId])

      // async function setupWeb3AndOcean(){
      //   const provider = await web3Modal?.connect()
      //   setProvider(provider)

      //   // This is required to get the token list
      //   const web3 = new Web3(provider)
      //   setWeb3(web3)
      // }

      async function handleConnect() {
         const provider = await web3Modal?.connect()
          setProvider(provider)

          // This is required to get the token list
          const web3 = new Web3(provider)
          console.log("Web3")
          console.log(web3)
          setWeb3(web3)
          let accounts = await web3.eth.getAccounts()
          console.log("Pre Account Id - ", accounts[0])
          setAccountId(accounts[0])

          console.log("Account Id - ", accountId)
          setButtonText(accounts.length ? accounts[0] : CONNECT_TEXT)
          let _chainId = parseInt(String(await web3.eth.getChainId()))
          setChainId(_chainId)


          setListeners(provider, web3)
          
          // This is required to do wallet-specific functions
          const ocean = new Ocean(web3, String(_chainId))
          setOcean(ocean)
          console.log("chainID - ", chainId)
          console.log("Pre chainID - ", _chainId)
          const config =  new Config(web3, String(_chainId))
          setConfig(config)
      }

    async function setListeners(provider: any, web3: Web3) {
        provider.on('accountsChanged', (accounts: any) => {
          console.log('Accounts changed to - ', accounts[0])
          console.log('Connected Accounts - ', JSON.stringify(accounts))
          setAccountId(accounts[0])
          setButtonText(accounts.length && accounts[0] !== "" ? accounts[0] : CONNECT_TEXT)
        })
    
        // Subscribe to chainId change
        provider.on('chainChanged', (chainId: any) => {
          console.log(chainId)
          console.log("Chain changed to ", parseInt(chainId))
          setChainId(parseInt(chainId))
          const config =  new Config(web3, String(parseInt(chainId)))
          setConfig(config)
          setOcean(new Ocean(web3, String(parseInt(chainId))))
        })
    
        // Subscribe to provider connection
        provider.on('connect', (info: { chainId: number }) => {
          console.log('Connect event fired')
          console.log(info)
        })
    
        // Subscribe to provider disconnection
        provider.on('disconnect', (error: { code: number; message: string }) => {
          console.log(error)
        })
      }

    return (<GlobalContext.Provider value={{ handleConnect, buttonText, accountId, chainId, provider, web3, ocean, network: NETWORK, config}} >
        { children }
    </GlobalContext.Provider>)
}