export const getUriByUploadId = (uploadId: unknown) => {
  if (!uploadId) {
    return undefined;
  }
  return process.env.EXPO_PUBLIC_API_URL + "/uploads/" + uploadId;
};

export const getUploadIdByUri = (uploadUri: string) => {
  if (!uploadUri.startsWith(process.env.EXPO_PUBLIC_API_URL + "/uploads/")) {
    throw new Error("upload uri marlformed")
  }
  const key = uploadUri.split('/').at(-1);
  if (!key) {
    throw new Error("upload uri marlformed")
  }
  return key;
};
