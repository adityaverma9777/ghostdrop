const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

// Setup Socket.io with CORS (Cross-Origin Resource Sharing)
// This allows your React app (localhost:5173) to talk to this Node app (localhost:5000)
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

// Basic route to check if server is alive
app.get("/", (req, res) => {
	res.send("GhostDrop Server is running...");
});

io.on("connection", (socket) => {
	// Log when a user connects
	console.log(`User Connected: ${socket.id}`);

	// 1. Handshake: User wants to join a specific room ID
	socket.on("join-room", (roomId) => {
		socket.join(roomId);
		console.log(`User ${socket.id} joined room: ${roomId}`);
		
		// Notify others in the room that a new user arrived
		socket.to(roomId).emit("user-connected", socket.id);
	});

	// 2. Offer/Answer: Relaying WebRTC signals between peers
	// When Peer A sends a signal (offer), we send it to Peer B
	socket.on("send-signal", (payload) => {
		io.to(payload.userToSignal).emit("signal-received", { 
			signal: payload.signal, 
			callerID: payload.callerID 
		});
	});

	// When Peer B answers, we send it back to Peer A
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

// Start the server on Port 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));