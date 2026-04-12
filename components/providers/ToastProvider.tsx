// components/providers/ToastProvider.tsx
"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={2000}
      theme="dark"
      style={{ zIndex: 9999 }}
    />
  );
}
