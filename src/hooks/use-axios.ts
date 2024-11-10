import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";

export const useAxios = () => {
  const { getToken } = useAuth();
  const baseURL = process.env.EXPO_PUBLIC_API_URL;
  if (!baseURL) {
    throw new Error("missing EXPO_PUBLIC_API_URL configuration");
  }

  const instance = axios.create({
    baseURL,
  });

  instance.interceptors.request.use(async (req) => {
    const token = await getToken({ template: "JWT" });
    req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  return instance;
};
