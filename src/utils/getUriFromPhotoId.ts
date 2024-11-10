export const getUriByUploadId = (uploadId: unknown) => {
  if (!uploadId) {
    return "jdjd";
  }
  return process.env.EXPO_PUBLIC_API_URL + "/uploads/" + uploadId;
};
