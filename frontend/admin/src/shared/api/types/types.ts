import { MessageData, QuestData } from "@/pages/createQuest/types/types";
import { UseQueryOptions } from "@tanstack/react-query";

export interface CustomQueryProps<T> {
  query: string;
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;
}

export type CharacterTypes = {
  id: string;
  name: string;
  avatar: string;
  full_size_image: string;
};

export type Role = {
  id: string;
  title: string;
};

export type Status = {
  id: string;
  title: string;
};

export type ManagerType = {
  id: string;
  login: string;
  first_name: string;
  second_name: string;
  role_id: string;
  role_title: string;
  status_id: string;
  status_title: string;
};

export type Quest = {
  id: string;
  user_id: string;
  name: string;
  is_available: boolean;
  public_beautiful_name: string;
};

export type User = {
  first_name: string;
  second_name: string;
  status: string;
  role: string;
};

export type PossibleData =
  | Role[]
  | Status[]
  | ManagerType[]
  | ManagerType
  | Quest[]
  | User
  | CharacterTypes[]
  | MessageData
  | CharacterTypes
  | QuestData;

export interface LoginResponse {
  token: string;
  user_id: string;
  status_id: string;
}
