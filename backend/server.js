require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*", // later change to frontend URL in production
  }),
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store active rooms
const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join Room
  socket.on("join_room", ({ roomId, username }) => {
    if (!roomId || !username) return;

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    // Max 10 users limit
    if (rooms[roomId].length >= 10) {
      socket.emit("room_full");
      return;
    }

    socket.join(roomId);

    rooms[roomId].push({
      id: socket.id,
      username,
    });

    // Send updated member list
    io.to(roomId).emit("room_users", rooms[roomId]);

    console.log(`${username} joined room ${roomId}`);
  });

  // Send Message
  socket.on("send_message", ({ roomId, message, username, senderId }) => {
    if (!roomId || !message) return;

    io.to(roomId).emit("receive_message", {
      username,
      message,
      senderId,
      time: Date.now(),
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const updatedUsers = rooms[roomId].filter(
        (user) => user.id !== socket.id,
      );

      rooms[roomId] = updatedUsers;

      io.to(roomId).emit("room_users", updatedUsers);

      if (updatedUsers.length === 0) {
        delete rooms[roomId]; // Clean empty room
      }
    }

    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
