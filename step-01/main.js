const constraints = {
  video: true
};

const localVideo = document.querySelector("video");

function gotLocalMediaStream(mediaStream) {
  window.localStream = mediaStream;

  localVideo.srcObject = mediaStream;
}

function handleLocalMediaStreamError(error) {
  console.log("navigator.getUserMedia error", error);
}

navigator.getUserMedia(
  constraints,
  gotLocalMediaStream,
  handleLocalMediaStreamError
);
