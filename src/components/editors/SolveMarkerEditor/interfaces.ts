export interface SolveMarkerEditorFormValues {
  photos: { uri: string | undefined }[]; // This represents an array of strings (e.g., hobbies or tags)
  additionalPhotos: { uri: string }[];
  participants: { userId: string }[];
}
