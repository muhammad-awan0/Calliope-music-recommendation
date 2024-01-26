export const setAccessToken = (access_token) => {
    return {
        type: 'SET_ACCESS_TOKEN',
        payload: access_token,
    };
};