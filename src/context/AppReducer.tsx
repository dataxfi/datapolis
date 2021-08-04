const AppReducer = (state: any, action: any) => {
    switch(action.type){
        case 'SET_TOKEN_1':
            return {
                ...state,
                token1: action.payload
            }
        case 'SET_TOKEN_2':
            return {
                ...state,
                token2: action.payload
            }
        case 'SWAP_TOKENS':
            return {
                ...state,
                token1: state.token2,
                token2: state.token1
            }
        default: return state
    }
}

export default AppReducer