import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";

let model: bodyPix.BodyPix | null = null;

async function loadModel() {
  if (model) return model;
  
  await tf.setBackend("webgl");
  await tf.ready();
  
  model = await bodyPix.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });
  
  return model;
}

self.onmessage = async (e: MessageEvent) => {
  const { imageBitmap, id } = e.data;

  try {
    const progressMsg = (msg: string) => {
      self.postMessage({ type: "progress", progress: 10, message: msg, id });
    };

    progressMsg("Loading AI model...");
    const net = await loadModel();

    progressMsg("Analyzing image...");
    const imageData = await createImageData(imageBitmap);

    progressMsg("Removing background...");
    const segmentation = await net.segmentPerson(imageData, {
      internalResolution: "medium",
      segmentationThreshold: 0.7,
      flipHorizontal: false,
    });

    progressMsg("Creating result...");
    const resultBlob = await applyMask(imageBitmap, segmentation);

    self.postMessage({ type: "done", blob: resultBlob, id });
  } catch (err) {
    self.postMessage({
      type: "error",
      error: err instanceof Error ? err.message : "Background removal failed",
      id,
    });
  }
};

async function createImageData(imageBitmap: ImageBitmap): Promise<ImageData> {
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imageBitmap, 0, 0);
  return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
}

async function applyMask(
  imageBitmap: ImageBitmap,
  segmentation: bodyPix.SemanticPersonSegmentation
): Promise<Blob> {
  const width = imageBitmap.width;
  const height = imageBitmap.height;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(imageBitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const mask = segmentation.data;

  for (let i = 0; i < mask.length; i++) {
    const alpha = mask[i] === 1 ? 255 : 0;
    data[i * 4 + 3] = alpha;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.convertToBlob({ type: "image/png" });
}
