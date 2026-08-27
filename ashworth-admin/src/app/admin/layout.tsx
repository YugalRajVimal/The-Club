import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar
        newestOnTop
        closeOnClick
        theme="light"
        toastClassName="!bg-white !text-[#3A3530] !rounded-lg !border !border-[#E5E1D8] !shadow-md !font-sans !text-sm"
      />
    </AdminAuthProvider>
  );
}
