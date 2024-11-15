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

interface GetUsersResponse
  extends BaseDataResponse<
    {
      id: string;
      username: string;
      profilePictureUrl: string;
      points: number;
    }[]
  > {}

export const _getUsers = async (
  axios: AxiosInstance,
): Promise<GetUsersResponse> => {
  const response = await axios.get("/users/getUsers");

  return response?.data;
};

export const _getUserByClerkId = async (axios: AxiosInstance, id: unknown) => {
  const response = await axios.get(`/users/${id}`);

  return response.data;
};
