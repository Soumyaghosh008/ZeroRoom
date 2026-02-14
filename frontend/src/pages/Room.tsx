import { useState, useCallback, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatBody } from '@/components/ChatBody';
import { MessageInput } from '@/components/MessageInput';
import { useCountdown } from '@/hooks/useCountdown';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

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

interface RoomState {
  roomName: string;
  adminName: string;
  expiresAt: number;
  duration: number;
  isAdmin: boolean;
  userId: string;
  userName: string;
}

const STORAGE_KEY = 'zeroroom_session';

function saveSession(roomId: string, data: RoomState) {
  localStorage.setItem(`${STORAGE_KEY}_${roomId}`, JSON.stringify(data));
}

function loadSession(roomId: string): RoomState | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${roomId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navState = location.state as {
    roomName?: string;
    adminName?: string;
    expiresAt?: number;
    duration?: number;
    isAdmin?: boolean;
  } | null;

  // Try to restore session from localStorage
  const savedSession = roomId ? loadSession(roomId) : null;
  const hasState = !!navState || !!savedSession;

  const [joinName, setJoinName] = useState('');
  const [hasJoined, setHasJoined] = useState(hasState);

  const roomName = navState?.roomName || savedSession?.roomName || 'ZeroRoom';
  const expiresAt = navState?.expiresAt || savedSession?.expiresAt || Date.now() + 60 * 60 * 1000;
  const duration = navState?.duration || savedSession?.duration || 1;
  const totalDurationMs = duration * 60 * 60 * 1000;
  const isAdmin = navState?.isAdmin || savedSession?.isAdmin || false;
  const userName = navState?.adminName || savedSession?.userName || joinName;
  const [userId] = useState(() => savedSession?.userId || crypto.randomUUID().slice(0, 8));

  const { isExpired } = useCountdown(expiresAt, totalDurationMs);

  // Save session to localStorage when we have state
  useEffect(() => {
    if (roomId && hasJoined && userName) {
      saveSession(roomId, {
        roomName,
        adminName: isAdmin ? userName : '',
        expiresAt,
        duration,
        isAdmin,
        userId,
        userName,
      });
    }
  }, [roomId, hasJoined, roomName, expiresAt, duration, isAdmin, userId, userName]);

  const [members] = useState<Member[]>(() => {
    const initial: Member[] = [];
    if (navState?.adminName || savedSession?.userName) {
      initial.push({
        id: userId,
        name: navState?.adminName || savedSession?.userName || '',
        isAdmin: isAdmin,
      });
    }
    return initial;
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = useCallback(
    (text: string) => {
      if (isExpired) return;
      const msg: Message = {
        id: crypto.randomUUID(),
        sender: userName,
        senderId: userId,
        text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
    },
    [isExpired, userName, userId]
  );

  const handleJoin = () => {
    if (!joinName.trim()) return;
    setHasJoined(true);
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-in-up">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-1">Join Room</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Room ID: <span className="font-mono-timer text-primary">{roomId}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="Enter your name"
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <button
                onClick={handleJoin}
                disabled={!joinName.trim()}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 glow-primary"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <ChatSidebar
      roomName={roomName}
      expiresAt={expiresAt}
      totalDurationMs={totalDurationMs}
      members={members}
      maxMembers={10}
    />
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar border-border">
            <SheetTitle className="sr-only">Room Sidebar</SheetTitle>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          roomName={roomName}
          memberCount={members.length}
          roomId={roomId || ''}
          isExpired={isExpired}
          onMenuToggle={() => setSidebarOpen(true)}
          showMenu={isMobile}
        />
        <ChatBody messages={messages} currentUserId={userId} />
        <MessageInput onSend={handleSend} disabled={isExpired} />
      </div>

      {/* Expired Overlay */}
      {isExpired && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="text-center animate-fade-in-up">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Room Expired</h2>
            <p className="text-muted-foreground mb-6">This room's time has ended.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform glow-primary"
            >
              Create New Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
