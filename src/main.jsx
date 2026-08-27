import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AUTH_LOGOUT_EVENT } from "./utils/authEvents";
import { clearAuthState } from "./redux/slice/authSlice";

window.addEventListener(AUTH_LOGOUT_EVENT, () => {
  store.dispatch(clearAuthState());
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ThemeProvider>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </ThemeProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
