export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function getDownloadFilename(
  originalName: string,
  format: "png" | "jpeg"
): string {
  const base = originalName.replace(/\.[^.]+$/, "");
  return `${base}-no-bg.${format}`;
}
