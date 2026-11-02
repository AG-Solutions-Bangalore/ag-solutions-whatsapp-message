import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import authReducer from "./authSlice";
const encryptor = encryptTransform({
  secretKey: import.meta.env.VITE_SECRET_KEY,
  onError: (error) => console.error("Encryption Error:", error),
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  transforms: [encryptor],
};

// Root Reducer
const rootReducer = combineReducers({
  auth: authReducer,
});

// Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create Redux Store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
