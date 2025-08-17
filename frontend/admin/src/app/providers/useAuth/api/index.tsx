import { createContext, FC, ReactNode, useState } from "react";
import { AuthContextProps } from "../types/types";

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [id, setId] = useState<string | null>(localStorage.getItem("id"));
  const [status, setStatus] = useState<string | null>(
    localStorage.getItem("status")
  );

  return (
    <AuthContext.Provider
      value={{ token, setToken, id, setId, status, setStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};
