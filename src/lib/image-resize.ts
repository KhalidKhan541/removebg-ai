const MAX_WIDTH = 2048;
const MAX_HEIGHT = 2048;
const MAX_FILE_SIZE_MB = 20;

export interface ResizeResult {
  blob: Blob;
  width: number;
  height: number;
  url: string;
}

export async function resizeImageIfNeeded(
  file: File,
  maxW = MAX_WIDTH,
  maxH = MAX_HEIGHT,
  maxSizeMB = MAX_FILE_SIZE_MB
): Promise<ResizeResult> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  const needsResize =
    width > maxW || height > maxH || file.size > maxSizeMB * 1024 * 1024;

  if (!needsResize) {
    const url = URL.createObjectURL(file);
    bitmap.close();
    return { blob: file, width, height, url };
  }

  const scale = Math.min(maxW / width, maxH / height, 1);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const quality = file.size > maxSizeMB * 1024 * 1024 ? 0.85 : 0.92;
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png", quality)
  );

  const url = URL.createObjectURL(blob);
  return { blob, width, height, url };
}
