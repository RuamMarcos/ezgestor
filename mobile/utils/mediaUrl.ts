/**
 * Resolve media URL from backend response
 * If the URL is already absolute (starts with http/https), returns as is
 * Otherwise, constructs full URL using the backend base URL
 * 
 * @param mediaPath - The media path from backend (can be relative or absolute)
 * @returns Full URL to the media file
 */
export const resolveMediaUrl = (mediaPath: string | null | undefined): string | null => {
  if (!mediaPath) return null;
  
  // If already a full URL (from cloud storage like GCS), return as is
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }
  
  // Otherwise, construct URL using backend base URL
  // For mobile, backend is typically on localhost:8000 for local dev
  // or the production URL for deployed apps
  const backendUrl = __DEV__ ? 'http://localhost:8000' : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
  
  return `${backendUrl}${mediaPath}`;
};
