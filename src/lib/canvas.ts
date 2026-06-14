import type { BackgroundType } from "../stores/editor-store";

export interface CompositeOptions {
  foreground: HTMLImageElement;
  original: HTMLImageElement;
  backgroundType: BackgroundType;
  backgroundColor: string;
  blurAmount: number;
  width: number;
  height: number;
}

export function compositeBackground(opts: CompositeOptions): Promise<Blob> {
  const {
    foreground,
    original,
    backgroundType,
    backgroundColor,
    blurAmount,
    width,
    height,
  } = opts;

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    if (backgroundType === "blur") {
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(original, 0, 0, width, height);
      ctx.filter = "none";
    } else if (backgroundType === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    } else if (backgroundType === "black") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);
    } else if (backgroundType === "color") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    if (backgroundType === "transparent") {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.drawImage(foreground, 0, 0, width, height);

    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export function getCompositeCanvas(opts: CompositeOptions): HTMLCanvasElement {
  const {
    foreground,
    original,
    backgroundType,
    backgroundColor,
    blurAmount,
    width,
    height,
  } = opts;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  if (backgroundType === "blur") {
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(original, 0, 0, width, height);
    ctx.filter = "none";
  } else if (backgroundType === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundType === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundType === "color") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(foreground, 0, 0, width, height);

  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: "png" | "jpeg",
  quality: number
): Promise<Blob> {
  return new Promise((resolve) => {
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    canvas.toBlob((blob) => resolve(blob!), mimeType, quality / 100);
  });
}
