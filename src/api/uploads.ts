import { AxiosInstance } from "axios";

export const _getUploadById = async (
  axios: AxiosInstance,
  uploadId: string,
) => {
  const response = await axios.get(`/uploads/${uploadId}`);
  return response.data;
};
