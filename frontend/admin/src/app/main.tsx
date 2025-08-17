import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "normalize.css";
import "./styles/global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./providers/useAuth";
import { appRouter } from "./providers/router/appRouter";
import { queryClient } from "./providers/Query/queryProvider";
import { ToastProvider } from "./providers/ToastProvider";
import { ModalProvider } from "@/features/modalOpen";
import { DropdownProvider } from "@/shared/ui/Select/model/DropdownContext";
import { ToastShelf } from "@/widgets/ToastShelf";
import { ModalController } from "@/features/modalOpen/lib/ModelContoller";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ModalProvider>
            <DropdownProvider>
              <ToastShelf />
              <ModalController />
              <RouterProvider router={appRouter} />
            </DropdownProvider>
          </ModalProvider>
        </ToastProvider>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
