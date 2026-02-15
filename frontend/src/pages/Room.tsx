import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { ChatHeader } from "../components/ChatHeader";
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatBody } from "../components/ChatBody";
import { MessageInput } from "../components/MessageInput";

const socket = io("http://localhost:5000");

interface Message {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: number;
}

interface Member {
  id: string;
  name: string;
  isAdmin: boolean;
}

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [joinName, setJoinName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [expiresAt] = useState(Date.now() + 60 * 60 * 1000); // 1 hour
  const totalDurationMs = 60 * 60 * 1000;

  const currentUserId = socket.id || "";

  // Join Room
  const handleJoin = () => {
    if (!joinName.trim() || !roomId) return;

    socket.emit("join_room", {
      roomId,
      username: joinName,
    });

    setHasJoined(true);
  };

  // Send Message
  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim() || !roomId) return;

      socket.emit("send_message", {
        roomId,
        message: text,
        username: joinName,
        senderId: socket.id,
      });
    },
    [roomId, joinName],
  );

  useEffect(() => {
    // Receive Message
    socket.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: data.username,
          senderId: data.senderId,
          text: data.message,
          timestamp: data.time,
        },
      ]);
    });

    // Update Members
    socket.on("room_users", (users) => {
      const formatted = users.map((u: any, index: number) => ({
        id: u.id,
        name: u.username,
        isAdmin: index === 0,
      }));
      setMembers(formatted);
    });

    // Room Full
    socket.on("room_full", () => {
      alert("Room is full (Max 10 users)");
      navigate("/");
    });

    return () => {
      socket.off("receive_message");
      socket.off("room_users");
      socket.off("room_full");
    };
  }, [navigate]);

  if (!hasJoined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 border rounded-lg shadow-md">
          <h2 className="mb-4 text-lg font-semibold">
            Enter your name to join
          </h2>

          <input
            className="border p-2 w-full mb-3"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder="Your Name"
          />

          <button
            onClick={handleJoin}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar
        roomName={`Room ${roomId}`}
        expiresAt={expiresAt}
        totalDurationMs={totalDurationMs}
        members={members}
        maxMembers={10}
      />

      <div className="flex flex-col flex-1">
        <ChatHeader
          roomName={`Room ${roomId}`}
          memberCount={members.length}
          roomId={roomId || ""}
          isExpired={Date.now() > expiresAt}
        />

        <ChatBody messages={messages} currentUserId={currentUserId} />

        <MessageInput onSend={handleSend} disabled={Date.now() > expiresAt} />
      </div>
    </div>
  );
}
