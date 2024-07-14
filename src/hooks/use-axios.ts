import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import Constants from "expo-constants";

export const useAxios = () => {
  const { getToken } = useAuth();
  const baseURL = Constants?.expoConfig?.extra?.apiUrl;
  if (!baseURL) {
    throw 'missing apiURL configuration';
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
