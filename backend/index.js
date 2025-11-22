const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);


const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});


app.get("/", (req, res) => {
	res.send("GhostDrop Server is running...");
});

io.on("connection", (socket) => {
	console.log(`User Connected: ${socket.id}`);

	
	socket.on("join-room", (roomId) => {
		socket.join(roomId);
		console.log(`User ${socket.id} joined room: ${roomId}`);
		
		
		socket.to(roomId).emit("user-connected", socket.id);
	});

	
	socket.on("send-signal", (payload) => {
		io.to(payload.userToSignal).emit("signal-received", { 
			signal: payload.signal, 
			callerID: payload.callerID 
		});
	});

	
	socket.on("return-signal", (payload) => {
		io.to(payload.callerID).emit("signal-accepted", { 
			signal: payload.signal, 
			id: socket.id 
		});
	});

	socket.on("disconnect", () => {
		console.log("User Disconnected", socket.id);
		socket.broadcast.emit("callEnded");
	});
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));