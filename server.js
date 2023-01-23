/*This is a Node.js server-side script that uses
 the Express and Socket.io libraries to create a real-time 
 WebRTC video chat application. */


 /**
 * These lines import the Express and uuid libraries, 
 * and create an instance of the Express application and an HTTP server.
 */
const express = require("express"); //ส่วนนี้ เป็นการเรียนใช้ express
const app = express(); //ส่วนนี้ เป็นการสร้างตัวแปรเพื่อเก็บ express
const server = require("http").Server(app);//ส่วนนี้ เป็นการเรียนใช้ server
const { v4: uuidv4 } = require("uuid");//ส่วนนี้ เป็นการเรียนใช้ uuid
 
/** 
 * This line imports the ExpressPeerServer module from the peer library, 
 * and the next line creates an options object with the debug property 
 * set to true.
 */
const { ExpressPeerServer } = require("peer"); //ส่วนนี้จะเป็นการเรียกใช้ ExpressPeerServer จาก library ของ peer และ option ในการเช็ค Error
const opinions = {
    debug: true,
}

/**
 * This line sets the view engine for the Express application to EJS, 
 * and the next line imports the Socket.io library 
 * and attaches it to the HTTP server. 
 * The cors property is used to allow connections from any origin.
 */
app.set("view engine", "ejs"); // ส่วนนี้จะเป็นการ set view engine เป็น EJSและเรียกใช้ socket.io จาก library และส่งไปกับ Http server
const io = require("socket.io")(server, { 
    cors: {
        origin: '*'
    }
});

/**
 * These lines mount the ExpressPeerServer middleware on the /peerjs route 
 * and serve the contents of the public directory as static assets.
 */

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));


/**
 * This code creates a route for the root URL and 
 * redirects the user to a randomly generated room ID 
 * created by uuidv4()
 */

app.get("/", (req, res) => { //สร้าง route สำหรับ URL เพื่อนำไปสุ่ม id ห้อง
    res.redirect(`/${uuidv4()}`);
});


/**
 * This code creates a route for URLs with a room parameter 
 * and renders the room.ejs view with the roomId parameter passed in.
 */

app.get("/:room", (req, res) => { // สร้าง route กับ ตัวแปรของห้องเพื่อนำไปแสดงในหน้า room.ejs
    res.render("room", { roomId: req.params.room });
});



/**
 * This code listens for a "connection" event from the client, 
 * and when a client connects it listens for a "join-room" event 
 * and joins the room with a certain roomId. 
 * It also emits an event "user-connected" with a certain userId 
 * after 1 sec. It also listens for a "message" event, 
 * and when a message is received, 
 * it emits the message and the userName to all clients in the room.
 */
io.on("connection", (socket) => { //ส่วนนี้จะเป็นการเชื่อมต่อของ client ด้วย RoomID ในการเข้าห้องและเมื่อมีการแชทกันก็จะมี Deley ประมาณ 1 วินาทีในการรับข้อความและชื่อของเราส่งให้ทุกคนในห้องเห็ฯ
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        setTimeout(() => {
            socket.to(roomId).broadcast.emit("user-connected", userId);
        }, 1000)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

/**This line starts the server and 
 * listens on the port specified in the 
 * PORT environment variable or port 3030 if it is not set. */
server.listen(process.env.PORT || 3030); //ส่วนนี้คือการเริ่มตัว server ใน port 3030

