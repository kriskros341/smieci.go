import { AxiosInstance } from "axios";
import { BaseResponse } from "./types";

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
