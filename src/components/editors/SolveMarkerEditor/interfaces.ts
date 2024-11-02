export interface SolveMarkerEditorFormValues {
  photos: { uri: string | undefined }[]; // This represents an array of strings (e.g., hobbies or tags)
  additionalPhotos: { uri: string | undefined }[];
  participants: { userId: string }[],
}