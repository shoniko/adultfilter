"use strict";

function onLoad()
{
  let images = Array.prototype.slice.call(document.images);
  let imageSrcs = [];
  images.forEach((img) =>
  {
    imageSrcs.push(img.src);
    img.style.webkitFilter = "blur(8px)";
  });
  chrome.runtime.sendMessage({imageSrcs});
}

window.addEventListener("load", onLoad, false);

chrome.runtime.onMessage.addListener(
  (result, sender, sendResponse) =>
  {
    if (!sender.tab)
    {
      let images = Array.prototype.slice.call(document.images);
      images.forEach((img) =>
      {
        let adultContentDetected = false;
        result.forEach((prediction) =>
        {
          if (img.src == prediction.src)
          {
            adultContentDetected = true;
          }
        });
        if (!adultContentDetected)
        {
          img.style.webkitFilter = "";
        }
      });
    }
  }
);
