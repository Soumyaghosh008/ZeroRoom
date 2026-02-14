import { Users, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ChatHeaderProps {
  roomName: string;
  memberCount: number;
  roomId: string;
  isExpired: boolean;
}

export function ChatHeader({
  roomName,
  memberCount,
  roomId,
  isExpired,
}: ChatHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-5">
      <div>
        <h3 className="font-semibold text-foreground">{roomName}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{memberCount} online</span>
          {isExpired && (
            <span className="ml-2 text-destructive font-medium">• Expired</span>
          )}
        </div>
      </div>

      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {copied ? "Copied!" : "Invite Link"}
      </button>
    </div>
  );
}
