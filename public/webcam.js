const socket = io("/"); //ส่วนนี้จะเป็นการเรียกใช้กล้องและสร้างตัวแปรในการจัดหน้าตาต่างๆ
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;

backBtn.addEventListener("click", () => { //ส่วนนี้จะเป็นส่วนในการจัดหน้าตาของปุ่มต่างๆบนหน้าเว็บ
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => { //ส่วนนี้จะเป็นส่วนในการจัดหน้าตาของแชทต่างๆบนหน้าเว็บ
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name"); // code ส่วนนี้จะแจ้งเตื่อนขึ้นมาเมื่อเข้าไปในห้องแชท เพื่อในกรอกชื่อ

var peer = new Peer({ // สร้างตัวแปร ในการเก็บ host และport ต่างๆของ Peer
  host: '127.0.0.1',
  port: 3030,
  path: '/peerjs',
  config: {
    'iceServers': [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credentials: 'openrelayproject'
      }
      // {
      //   url: 'turn:192.158.29.39:3478?transport=tcp',
      //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      //   username: '28224511:1379330808'
      // }
    ]
  },

  debug: 3
});

let myVideoStream; // ส่วนนี้จะเป็นการอนุญาติในการใช้กล้อง และ ไมค์
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => { // ส่วนนี้จะเป็น code ที่เกี่ยวกับ webcam ในการ stream
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log('someone call me');
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => { //ส่วนนี้จะเป็นการแสดงกล้องของคนที่เข้ามาในแชท
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => { // เมื่อ กรอกชื่อเสร็จ จะทำการjoin โดยการใช้ตัวเเปร peer ในการเชื่อม server จาก id
  console.log('my id is' + id);
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => { // ส่วนนี้เป็น code ในการส่งข้อความเมื่อกด Click
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => { // ส่วนนี้เป็น code ในการส่งข้อความเมื่อกด Enter
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton"); //สร้างตัวแปรเพื่อมาเก็บค่าของปุ่ม inviteButton
const muteButton = document.querySelector("#muteButton");//สร้างตัวแปรเพื่อมาเก็บค่าของปุ่ม muteButton
const stopVideo = document.querySelector("#stopVideo");//สร้างตัวแปรเพื่อมาเก็บค่าของปุ่ม stopVideo
muteButton.addEventListener("click", () => {// ส่วนนี้จะเป็น code เกี่ยวกับการปิกเสียง/เปิดเสียง
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => { // ส่วนนี้จะเป็น code เกี่ยวกับการปิด/เปิดกล้อง
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => { // ส่วนนี้จะเป็น code เกี่ยวกับการ เชิญเพื่อนเข้ามาสนทนา
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

socket.on("createMessage", (message, userName) => { //ส่วนนี้จะเป็น code ในการสร้างข้อความมาแสดง และจะใช้ คำว่า me หน้าข้อความเพื่อจะได้รู้ว่าใครเป็นคนส่งข้อความ
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
    }</span> </b>
        <span>${message}</span>
    </div>`;
});