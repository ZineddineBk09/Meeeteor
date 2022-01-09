const videoElem = document.querySelector(".video");
const logElem = document.getElementById("log");
const startElem = document.querySelector(".start");
const stopElem = document.querySelector(".stop_share");
const videogrp = document.querySelector(".main__videos");

// Options for getDisplayMedia()

var displayMediaOptions = {
  video: {
    cursor: "never",
  },
  audio: false,
};

// Set event listeners for the start and stop buttons
startElem.addEventListener(
  "click",
  function (evt) {
    console.log('3abezzzt')
    //videogrp.classList.remove("main__videos");
    //videogrp.classList.add("video_groupe_hidden");
    videogrp.style.display = "none";
    videoElem.classList.remove("video");
    videoElem.classList.add("videoshare_hidden");

    startElem.classList.remove("start");
    startElem.classList.add("start_after");
    stopElem.classList.remove("stop_share");
    stopElem.classList.add("stop_share_after");
    startCapture();
  },
  false
);

stopElem.addEventListener(
  "click",
  function (evt) {
    console.log('3abezzzt')
    videogrp.style.display = "block";

    videogrp.classList.remove("video_groupe_hidden");
    videogrp.classList.add("main__videos");
    videoElem.classList.remove("videoshare_hidden");
    videoElem.classList.add("video");
    startElem.classList.add("start");
    startElem.classList.remove("start_after");
    stopElem.classList.add("stop_share");
    stopElem.classList.remove("stop_share_after");
    stopCapture();
  },
  false
);
console.log = (msg) => (logElem.innerHTML += `${msg}<br>`);
console.error = (msg) =>
  (logElem.innerHTML += `<span class="error">${msg}</span><br>`);
console.warn = (msg) =>
  (logElem.innerHTML += `<span class="warn">${msg}<span><br>`);
console.info = (msg) =>
  (logElem.innerHTML += `<span class="info">${msg}</span><br>`);
async function startCapture() {
  logElem.innerHTML = "";

  try {
    videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
    dumpOptionsInfo();
  } catch (err) {
    console.error("Error: " + err);
  }
}
function stopCapture(evt) {
  let tracks = videoElem.srcObject.getTracks();

  tracks.forEach((track) => track.stop());
  videoElem.srcObject = null;
}
function dumpOptionsInfo() {
  const videoTrack = videoElem.srcObject.getVideoTracks()[0];

  console.info("Track settings:");
  console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
  console.info("Track constraints:");
  console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
}

$(document).ready(function () {
  document.getElementById("start").click();
  function triggerClick() {
    var event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    var cb = document.querySelector("input[type=submit][name=btnK]");
    var canceled = !cb.dispatchEvent(event);
    if (canceled) {
      // preventDefault was called and the event cancelled
    } else {
      // insert your event-logic here...
    }
  }
});
