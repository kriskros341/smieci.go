export type EditExternalMarkerPhotosFormValues = {
  existingPhotos: { uri: string, blurhash?: string, isChecked?: boolean }[],
  newPhotos: { uri: string, blurhash?: string }[],
}