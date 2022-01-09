const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

myVideo.muted = true;

const user = prompt("What is your name?");


var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: `3000`,
});

let myVideoStream;

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, myVideoStream);
    });

    socket.on("user-disconnected", (name) => {
      //myVideo.remove();
      appendMessage(`${name} disconnected`);
    });

    document.addEventListener("keydown", (e) => {
      if (e.which === 13 && chatInputBox.value != "") {
        socket.emit("message", chatInputBox.value);
        chatInputBox.value = "";
      }
    });

    socket.on("createMessage", (data) => {
      console.log(`${data.name}: ${data.message}`);

      appendMessage(`${data.name}: ${data.message}`);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });
  });

//My modificaton

function appendMessage(message) {
  var d = new Date();

  console.log("message : ", message);
  all_messages.innerHTML =
    all_messages.innerHTML +
    `<div class="message-blue">
<b><i class="far fa-user-circle"></i> <span> ${user}</span> </b>
<span class="message-content">${message}</span>
<div class="message-timestamp-left">${
      d.getHours() < 10 ? "0" + d.getHours() : d.getHours()
    }:${d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()}</div>
</div>`;
}

//---------------
peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
  socket.emit("new-user", user);
  appendMessage("You joined");
});

// CHAT

const connectToNewUser = (userId, streams) => {
  var call = peer.call(userId, streams);
  console.log(call);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log(userVideoStream);
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (videoEl, stream) => {
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });

  videoGrid.append(videoEl);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
};

//----------------------------------------------
const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");

muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;

  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    const html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.innerHTML = html;
    muteButton.classList.add("red_btn");
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    const html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.remove("red_btn");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    const html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("red_btn");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    const html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("red_btn");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});
