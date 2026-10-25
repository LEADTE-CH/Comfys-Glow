export function resolveAssetUrl(path: string): string {
  if (import.meta.env.DEV || !path.startsWith('/src/assets/images/')) {
    return path;
  }

  return path
    .replace('/src/assets/images/', '/static-images/')
    .replace(/\.(?:jpe?g|png)$/i, '.webp');
}
