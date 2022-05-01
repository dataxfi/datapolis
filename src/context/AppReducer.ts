const AppReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_TOKEN_1':
      return {
        ...state,
        token1: action.payload.token,
        token1Balance: action.payload.balance,
      };
    case 'SET_TOKEN_2':
      return {
        ...state,
        token2: action.payload.token,
        token2Balance: action.payload.balance,
      };
    case 'SWAP_TOKENS':
      return {
        ...state,
        token1: state.token2,
        token2: state.token1,
        token1Value: state.token2Value,
        token2Value: state.token1Value,
        token1Balance: state.token2Balance,
        token2Balance: state.token1Balance,
      };
    case 'SET_TOKEN_1_VALUE':
      return {
        ...state,
        token1Value: action.payload,
      };
    case 'SET_TOKEN_2_VALUE':
      return {
        ...state,
        token2Value: action.payload,
      };
    default:
      return state;
  }
};

export default AppReducer;
