import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shield, Users, Zap, ArrowRight, Timer } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Time-Bound',
    desc: 'Rooms auto-expire after 1–3 hours. No history, no traces.',
  },
  {
    icon: Shield,
    title: 'Private & Invite-Only',
    desc: 'Only users with the unique link can join your room.',
  },
  {
    icon: Users,
    title: 'Max 10 Members',
    desc: 'Focused discussions. No noise, no distractions.',
  },
  {
    icon: Zap,
    title: 'Real-Time',
    desc: 'Instant messaging powered by WebSockets.',
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [duration, setDuration] = useState(1);
  const [adminName, setAdminName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleCreateRoom = () => {
    if (!roomName.trim() || !adminName.trim()) return;
    // Generate a mock room ID for demo
    const roomId = crypto.randomUUID().slice(0, 8);
    const expiresAt = Date.now() + duration * 60 * 60 * 1000;
    navigate(`/room/${roomId}`, {
      state: {
        roomName: roomName.trim(),
        adminName: adminName.trim(),
        expiresAt,
        duration,
        isAdmin: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 gradient-radial-top pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Logo & Title */}
        <div className="animate-fade-in-up text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
              <Timer className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Zero<span className="text-gradient-primary">Room</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Temporary. Private. Gone when time's up.
          </p>
        </div>

        {/* Create Room or Feature Cards */}
        {!showCreate ? (
          <>
            {/* CTA */}
            <div className="animate-fade-in-up-delay-1 mb-16">
              <button
                onClick={() => setShowCreate(true)}
                className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl text-lg transition-all duration-300 hover:scale-105 animate-pulse-glow"
              >
                <span className="flex items-center gap-2">
                  Create a Room
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>

            {/* Features */}
            <div className="animate-fade-in-up-delay-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group"
                >
                  <f.icon className="w-8 h-8 text-primary mb-3 transition-transform group-hover:scale-110" />
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Create Room Form */
          <div className="animate-fade-in-up w-full max-w-md">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-6">Create a Room</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Room Name</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Sprint Planning"
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Duration: {duration} hour{duration > 1 ? 's' : ''}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((h) => (
                      <button
                        key={h}
                        onClick={() => setDuration(h)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                          duration === h
                            ? 'bg-primary text-primary-foreground border-primary glow-primary'
                            : 'bg-secondary border-border text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={!roomName.trim() || !adminName.trim()}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 glow-primary"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="animate-fade-in-up-delay-3 mt-16 text-xs text-muted-foreground/50">
          No sign-up. No data stored. Just talk.
        </p>
      </div>
    </div>
  );
};

export default Index;
