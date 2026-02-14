import { useCountdown } from "@/hooks/useCountdown";
import { Crown, Users } from "lucide-react";

interface Member {
  id: string;
  name: string;
  isAdmin: boolean;
}

interface ChatSidebarProps {
  roomName: string;
  expiresAt: number;
  totalDurationMs: number;
  members: Member[];
  maxMembers: number;
}

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-blue-500/20 text-blue-400",
  "bg-purple-500/20 text-purple-400",
  "bg-amber-500/20 text-amber-400",
  "bg-pink-500/20 text-pink-400",
  "bg-cyan-500/20 text-cyan-400",
];

export function ChatSidebar({
  roomName,
  expiresAt,
  totalDurationMs,
  members,
  maxMembers,
}: ChatSidebarProps) {
  const { formatted, isExpired, percentage } = useCountdown(
    expiresAt,
    totalDurationMs,
  );

  return (
    <div className="w-72 border-r border-border bg-sidebar flex flex-col h-full">
      {/* Room Info */}
      <div className="p-5 border-b border-border">
        <h2 className="font-semibold text-sidebar-foreground truncate text-lg">
          {roomName}
        </h2>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>
            {members.length}/{maxMembers} members
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="p-5 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
          Time Remaining
        </p>
        <div
          className={`font-mono-timer text-3xl font-bold tracking-widest text-center py-3 rounded-xl border transition-all duration-300 ${
            isExpired
              ? "text-destructive border-destructive/30 bg-destructive/5"
              : "text-primary border-primary/20 bg-primary/5 animate-pulse-glow"
          }`}
        >
          {isExpired ? "EXPIRED" : formatted}
        </div>
        {/* Progress bar */}
        {!isExpired && (
          <div className="mt-3 h-1 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Members */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
          Members
        </p>
        <div className="space-y-2">
          {members.map((member, i) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                  avatarColors[i % avatarColors.length]
                }`}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {member.name}
                </p>
              </div>
              {member.isAdmin && (
                <Crown className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
