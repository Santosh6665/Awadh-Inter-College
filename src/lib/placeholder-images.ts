import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Safely access the placeholderImages array, providing an empty array as a fallback
// This prevents "Unexpected end of JSON input" errors if the JSON file is empty.
export const PlaceHolderImages: ImagePlaceholder[] = (data && data.placeholderImages) ? data.placeholderImages : [];
