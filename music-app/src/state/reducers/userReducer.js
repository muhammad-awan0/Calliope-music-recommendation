const initialState = {
    userId: null,
    access_token: null
};

const userReducer = (state = initialState, action) => {
switch (action.type) {
    case 'SET_ID':
        return {
            ...state,
            userId: action.payload,
        };
    case 'SET_ACCESS_TOKEN': 
        return {
            ...state,
            access_token: action.payload
        };
    default:
        return state;
}
};

export default userReducer;
  