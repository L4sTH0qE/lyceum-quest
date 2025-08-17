import { useAuth } from "@/app/providers/useAuth/api/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CustomQueryProps, LoginResponse, PossibleData } from "./types/types";

export const BASE_URL = "https://api.darkony.ru";

export const useCustomGetQuery = <T extends PossibleData>({
  query,
  options,
}: CustomQueryProps<T>) => {
  const { token } = useAuth();

  const fetchData = async (): Promise<T> => {
    const response = await axios.get(`${BASE_URL}/api/v1/admin/${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  };

  return useQuery<T>({
    queryKey: [query],
    queryFn: fetchData,
    ...options,
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post<LoginResponse>(
        `${BASE_URL}/api/v1/admin/login`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
    },
  });
};

export const useLogoutMutation = () => {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`${BASE_URL}/api/v1/admin/login`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Logout failed:", error);
    },
  });
};

export const useCreateCharacterMutation = () => {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${BASE_URL}/api/v1/admin/characters`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Character creation failed:", error);
    },
  });
};

export const useUpdateCharacterMutation = () => {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/admin/characters/${data.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Character creation failed:", error);
    },
  });
};

export const useCreateManager = () => {
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${BASE_URL}/api/v1/admin/managers`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Manager creation failed:", error);
    },
  });
};

export const useUpdateManager = () => {
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/admin/managers/${data.id}`,
        {
          role_id: data.role_id,
          status_id: data.status_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Manager updating failed:", error);
    },
  });
};

export const useUpdateProfile = () => {
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/admin/user-info`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Manager creation failed:", error);
    },
  });
};

export const useGetUserId = () => {
  return useMutation({
    mutationFn: async (email: any) => {
      const response = await axios.get(
        `${BASE_URL}/api/v1/admin/reset-password/${email}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Failed Getting user id", error);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/admin/reset-password`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Changing password failed", error);
    },
  });
};

export const useUpdatePassword = () => {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/admin/update-password`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Changing password failed", error);
    },
  });
};

export const useCreateQuest = () => {
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${BASE_URL}/api/v1/admin/quests`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Manager creation failed:", error);
    },
  });
};

export const useEditQuest = () => {
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/admin/quests/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Quest update failed:", error);
    },
  });
};
