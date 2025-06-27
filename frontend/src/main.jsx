import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for all toasts
          className: "",
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            fontFamily: "Cairo, Inter, sans-serif",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "12px",
          },
          // Success toasts
          success: {
            style: {
              background: "#10b981",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#10b981",
            },
          },
          // Error toasts
          error: {
            style: {
              background: "#ef4444",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#ef4444",
            },
          },
          // Loading toasts
          loading: {
            style: {
              background: "#3b82f6",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#3b82f6",
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
