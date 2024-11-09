MapHander
Alter ContentSheet sizes -
minimized - flex-0
minimal - absolute, min0content
half - flex-half
fullscreen - absolute inset-0
marker details story
Once user selected a marker, display callout with quick description and a button.
The button opens bottom sheet wiht details view.
Bottom sheet starts in maximized state and contains MarkerPreviewContent.
Add new state to Bottom sheet - "half".
Should it alter the layout? Yes
Add new state to Bottom sheet - "minimal". make it current minimized behavior. (Special state for moveMarkerPreview)
Should it alter the layout? No
Change "minimized" state to be actually minimized - Only the window header
Should it alter the layout? Yes
Make minimized bottom sheet take half of the screen and make it part of map container layout (Not absolute)

new name: ContentSheet?
