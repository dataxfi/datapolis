import React, {createContext, PropsWithChildren, useReducer} from "react";
import AppReducer from './AppReducer'

const initialState: any = {
    token1: null,
    token2: null
}

export const GlobalContext  = createContext(initialState)

export const GlobalProvider = ({ children }: {children: PropsWithChildren<{}>}) => {
    const [state, dispatch]: [any, Function] = useReducer(AppReducer, initialState)
    

    function setToken1(token: Record<any, any>){
        dispatch({
            type: 'SET_TOKEN_1',
            payload: token
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

    return (<GlobalContext.Provider value={{token1: state.token1, token2: state.token2, setToken1, setToken2, swapTokens}} >
        { children }
    </GlobalContext.Provider>)
}