import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import { AuthProvider } from "./context/AuthProvider";  // ✅ penting

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>       {/* ✅ Mesti wrap App */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
