"use strict";

const MODEL_PATH = "https://s3.amazonaws.com/ir_public/nsfwjscdn/TFJS_nsfw_mobilenet/tfjs_quant_nsfw_mobilenet/model.json";
const IMAGE_SIZE = 224;

const tf = require("@tensorflow/tfjs");

const NSFW_CLASSES = {
  0: "Drawing",
  1: "Hentai",
  2: "Neutral",
  3: "Porn",
  4: "Sexy"
};

// Based on https://github.com/infinitered/nsfwjs/blob/master/src/index.ts
export class AdultDetector
{
  constructor()
  {
    this.model = null;
    this.normalizationOffset = 255;
  }

  async load()
  {
    this.model = await tf.loadLayersModel(MODEL_PATH);
    // Warmup the model.
    const result = tf.tidy(() =>
      this.model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3]))
    );
    console.log(await result.data());
    result.dispose();
  }

  async fromPixels(image)
  {
    return tf.browser.fromPixels(image);
  }

  async empty()
  {
    return tf.zeros([IMAGE_SIZE, IMAGE_SIZE, 3]);
  }

  async predict(images)
  {
    return tf.tidy(() =>
    {
      let preprocessed = [];
      images.forEach(img =>
      {
        // Normalize the image from [0, 255] to [0, 1].
        const normalized = img
          .toFloat()
          .div(this.normalizationOffset);

        // Resize the image to
        let resized = normalized;
        const size = IMAGE_SIZE;
        // check width and height if resize needed
        if (img.shape[0] !== size || img.shape[1] !== size)
        {
          const alignCorners = true;
          resized = tf.image.resizeBilinear(
            normalized,
            [size, size],
            alignCorners
          );
          preprocessed.push(resized);
        }
      });

      // Reshape to a single-element batch so we can pass it to predict.
      const batched = tf.stack(preprocessed);

      // return logits
      return this.model.predict(batched);
    });
  }
}

