import axios from "axios";

export const useAxios = () => {
  const instance = axios.create({
    baseURL: "http://192.168.21.12:8080",
  });
  // TODO: add authorization interceptor for every request
  return instance;
};
