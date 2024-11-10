export const getUriByUploadId = (uploadId: unknown) => {
  if (!uploadId) {
    return "jdjd";
  }
  return process.env.API_URL + "/uploads/" + uploadId;
};
