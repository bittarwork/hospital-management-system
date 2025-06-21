import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: "",
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          fontFamily: "Cairo, sans-serif",
          fontSize: "14px",
          borderRadius: "12px",
          padding: "12px 16px",
          direction: "rtl",
        },
        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: "#4caf50",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#4caf50",
          },
        },
        error: {
          duration: 4000,
          style: {
            background: "#f44336",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        },
        loading: {
          style: {
            background: "#2196f3",
          },
        },
      }}
    />
  </React.StrictMode>
);
