"use strict";

import {AdultDetector} from "./adultDetector";

let adultDetector = new AdultDetector();

async function initialize()
{
  await adultDetector.load();
}

async function getImageData(inputSource)
{
  return new Promise((resolve, reject) =>
  {
    let input = new Image();
    input.onload = async function()
    {
      resolve(adultDetector.fromPixels(this));
    };
    input.onerror = async function(err)
    {
      resolve(adultDetector.empty());
    };
    input.src = inputSource;
  });
}

chrome.runtime.onMessage.addListener(
  async(request, sender, sendResponse) =>
  {
    if (!sender.tab)
    {
      return;
    }
    if (typeof request.imageSrcs != "undefined")
    {
      sendResponse("processing");
      let images = [];
      Array.from(request.imageSrcs).forEach(src =>
      {
        images.push(getImageData(src));
      });
      await Promise.all(images).then(async(processedImages) =>
      {
        const t0 = performance.now();
        let result = await adultDetector.predict(processedImages);
        const t1 = performance.now();
        console.log("Prediction of " + images.length + " elements took: " + (t1 - t0));
        let predictions = Object.values(await result.data());
        let returnObject = [];
        Array.from(request.imageSrcs).forEach((src, index) =>
        {
          let curPos = index * 5;
          let curPrediction = predictions.slice(curPos, curPos + 5);
          if (curPrediction[3] > 0.5)
          {
            returnObject.push({
              src,
              prediction: curPrediction
            });
          }
        });
        chrome.tabs.sendMessage(sender.tab.id, returnObject);
      }).catch((err) =>
      {
        console.log(err);
      });
    }
  }
);

initialize();
