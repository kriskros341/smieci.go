import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";

export const useAxios = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  // @ts-ignore
  const baseURL = process.env.EXPO_PUBLIC_API_URL;
  if (!baseURL) {
    console.warn("missing EXPO_PUBLIC_API_URL configuration")
    throw new Error("missing EXPO_PUBLIC_API_URL configuration");
  }

  const instance = axios.create({
    baseURL,
  });

  instance.interceptors.request.use(async (req) => {
    console.log('Auth state:', { isLoaded, isSignedIn }); // Debug auth state
    const token = await getToken({ template: "JWT" });
    if (!token) {
      console.error("missing Bearer token")
      throw new Error("missing Bearer token")
    }
    req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  return instance;
};
