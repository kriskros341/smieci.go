import Constants from "expo-constants";

export const getUriByUploadId = (uploadId: unknown) => {
  if (!uploadId) {
    return 'jdjd'
  }
  return Constants?.expoConfig?.extra?.apiUrl + "/uploads/" + uploadId;
}