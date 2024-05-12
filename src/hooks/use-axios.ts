import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import Constants from "expo-constants";

export const useAxios = () => {
  const { getToken } = useAuth();
  const instance = axios.create({
    baseURL: Constants?.expoConfig?.extra?.apiUrl,
  });

  instance.interceptors.request.use(async (req) => {
    const token = await getToken({ template: "JWT" });
    req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  return instance;
};
