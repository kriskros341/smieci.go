import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";

export const useAxios = () => {
  const { getToken } = useAuth();
  const instance = axios.create({
    baseURL: "http://192.168.21.10:8080",
  });

  instance.interceptors.request.use(async (req) => {
    const token = await getToken({ template: "JWT" });
    req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  return instance;
};
