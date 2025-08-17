export interface AuthContextProps {
  token: string | null;
  id: string | null;
  status: string | null;
  setToken: (token: string | null) => void;
  setId: (id: string | null) => void;
  setStatus: (status: string | null) => void;
}
