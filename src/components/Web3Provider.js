import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useEffect, useState } from "react";
import Button from "./Button";


export default function Web3Provider({buttonClasses}) {
    const [web3Modal, setWeb3Modal] = useState(null)
    const [accountId, setAccountId] = useState(null)
    const [chainId, setChainId] = useState(null)
    const [provider, setProvider] = useState(null)
    const [web3, setWeb3] = useState(null)
    const [buttonText, setButtonText] = useState('Connect to a wallet')


    useEffect(() => {
        async function init() {
          const web3Modal = new Web3Modal({
            network: 'mainnet', // optional
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
          web3Modal.clearCachedProvider()
        }
    
        init()
      }, [accountId, chainId, provider])


      async function handleConnect() {
        const provider = await web3Modal.connect()
        setProvider(provider)
        const _web3 = new Web3(provider)
        setWeb3(_web3)
        setAccountId((await _web3.eth.getAccounts())[0])
        setChainId(await _web3.eth.getChainId())
        setListeners(provider)
      }

    async function setListeners(provider) {
        provider.on('accountsChanged', (accounts) => {
          console.log(accounts)
          setAccountId(accounts[0])
        })
    
        // Subscribe to chainId change
        provider.on('chainChanged', (chainId) => {
          console.log(chainId)
          setChainId(chainId)
        })
    
        // Subscribe to provider connection
        provider.on('connect', (info) => {
          console.log('Connect event fired')
          web3.eth.getNetworkType((val) => {
            setButtonText(val)
          })
        })
    
        // Subscribe to provider disconnection
        provider.on('disconnect', (error) => {
          console.log(error)
          alert('Error occured while disconnecting wallet')
        })
      }

      return (
        <>
          <Button text={buttonText} classes={buttonClasses} onClick={() => handleConnect()}></Button>
        </>
      )
}