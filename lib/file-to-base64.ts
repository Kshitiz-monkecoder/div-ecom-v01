export async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  return Buffer.from(bytes).toString("base64");
}

export async function filesToEnginePayload(files: File[]): Promise<
  Array<{ name: string; type: string; base64: string }>
> {
  const payload = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type,
      base64: await fileToBase64(file),
    }))
  );

  return payload;
}
