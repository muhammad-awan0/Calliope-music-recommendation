import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './reducers/userReducer';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['userId', 'access_token'], // In this example, we persist the 'user' reducer
  };

const persistedReducer = persistReducer(persistConfig, userReducer);
export const store = createStore(
    persistedReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
export const persistor = persistStore(store);