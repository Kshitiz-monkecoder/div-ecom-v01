// Helper functions to convert between JSON string and array for SQLite compatibility

export function parseImages(imagesJson: string): string[] {
  try {
    return JSON.parse(imagesJson || "[]");
  } catch {
    return [];
  }
}

export function stringifyImages(images: string[]): string {
  return JSON.stringify(images);
}

