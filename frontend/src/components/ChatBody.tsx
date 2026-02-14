import { useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: number;
}

interface ChatBodyProps {
  messages: Message[];
  currentUserId: string;
}

export function ChatBody({ messages, currentUserId }: ChatBodyProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          No messages yet. Start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {messages.map((msg) => {
        const isMine = msg.senderId === currentUserId;
        return (
          <div
            key={msg.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[70%] ${isMine ? "order-1" : ""}`}>
              {!isMine && (
                <p className="text-xs text-muted-foreground mb-1 ml-1">
                  {msg.sender}
                </p>
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMine
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
