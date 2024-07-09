import { AxiosInstance } from "axios";
import { BaseDataResponse, BaseResponse } from "./types";

interface CreateUserParams {
  username: string;
  email: string;
}

export const _createUser = async (
  axios: AxiosInstance,
  { username, email }: CreateUserParams,
): Promise<BaseResponse> => {
  const response = await axios.post("/users/createUser", {
    username,
    email,
  });

  return response.data;
};

interface GetUsersResponse extends BaseDataResponse<{ username: string }[]> {}

export const _getUsers = async (
  axios: AxiosInstance,
): Promise<GetUsersResponse> => {
  const response = await axios.get("/users/getUsers").catch(err => {
    console.error(JSON.stringify(err, null, 2));
  });

  return response?.data;
};

export const _deleteUser = async (axios: AxiosInstance, email: string) => {
  const response = await axios.post("/users/deleteUser", {
    email,
  });

  return response.data;
};
