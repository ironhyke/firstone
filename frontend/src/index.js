import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { HeartProvider } from "./contexts/HeartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <HeartProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </HeartProvider>
    </AuthProvider>
  </React.StrictMode>
);
