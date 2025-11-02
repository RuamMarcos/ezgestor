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
  // In development, backend runs on port 8000
  // In production, it's on the same origin
  const isDevelopment = window.location.port === '5173';
  const backendUrl = isDevelopment 
    ? window.location.origin.replace(':5173', ':8000')
    : window.location.origin;
  
  return `${backendUrl}${mediaPath}`;
};
