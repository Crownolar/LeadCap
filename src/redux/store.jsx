import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../redux/slice/authSlice";
import samplesReducer from "./slice/samplesSlice";
import userReducer from "./slice/userSlice";
import { combineReducers } from "redux";
import heavyMetalReducer from "./slice/heavyMetalSlice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  samples: samplesReducer,
  users: userReducer,
  heavyMetal: heavyMetalReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
