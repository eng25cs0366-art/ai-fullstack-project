import React, { useState, useEffect, useRef } from 'react';

// --- CONSTANTS & AVATARS ---
const DEPARTMENTS = [
  "All Departments",
  "AIML",
  "Data Science",
  "Computer Science Core",
  "Mechanical",
  "Electrical",
  "Sports Club",
  "Medical & Pharmacy"
];

const ANIMAL_AVATARS = [
  { id: "fox", name: "Cute Fox", emoji: "🦊" },
  { id: "panda", name: "Fluffy Panda", emoji: "🐼" },
  { id: "bear", name: "Honey Bear", emoji: "🐻" },
  { id: "cat", name: "Kitty Cat", emoji: "🐱" },
  { id: "dog", name: "Puppy Dog", emoji: "🐶" },
  { id: "bunny", name: "Hop Bunny", emoji: "🐰" },
  { id: "lion", name: "Brave Lion", emoji: "🦁" },
  { id: "koala", name: "Sleepy Koala", emoji: "🐨" },
  { id: "tiger", name: "Wild Tiger", emoji: "🐯" },
  { id: "owl", name: "Wise Owl", emoji: "🦉" },
  { id: "penguin", name: "Chilly Penguin", emoji: "🐧" },
  { id: "frog", name: "Hoppy Frog", emoji: "🐸" }
];

const DEFAULT_EVENTS = [
  {
    id: "evt-1",
    title: "AI & ML Innovation Summit",
    department: "AIML",
    date: "2026-11-15",
    time: "10:00 AM",
    venue: "Main Auditorium A",
    description: "Showcasing student projects in Deep Learning, Computer Vision, and Generative AI. Looking for developers to present!",
    rolesNeeded: ["ML Engineer", "UI/UX Designer", "Presenter"],
    maxParticipants: 50,
    creatorId: "faculty_admin",
    creatorName: "Faculty Admin",
    creatorRole: "Advisor",
    creatorEmoji: "🦉",
    attendees: []
  },
  {
    id: "evt-2",
    title: "Inter-Dept Football Tournament",
    department: "Sports Club",
    date: "2026-11-18",
    time: "03:30 PM",
    venue: "College Sports Complex",
    description: "Annual knockout championship! Need player rosters from Mech, CS, and Electrical departments.",
    rolesNeeded: ["Goalkeeper", "Midfielder", "Team Captain"],
    maxParticipants: 40,
    creatorId: "sports_lead",
    creatorName: "Sports Captain",
    creatorRole: "Captain",
    creatorEmoji: "🦁",
    attendees: []
  }
];

export default function App() {
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [authMode, setAuthMode] = useState("signin");
  
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDept, setAuthDept] = useState("AIML");
  const [authYear, setAuthYear] = useState("3rd Year");
  const [authRole, setAuthRole] = useState(ANIMAL_AVATARS[0].id);
  const [authError, setAuthError] = useState("");

  // Event State
  const [events, setEvents] = useState([]);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [expandedRosters, setExpandedRosters] = useState({});
  const [actionPop, setActionPop] = useState(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [chatMessageText, setChatMessageText] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const canvasRef = useRef(null);
  const clockFaceRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  // Event Form State with Analog & Digital Clock Picker
  const [newEvent, setNewEvent] = useState({
    title: "",
    department: "AIML",
    timePeriod: "AM",
    timeHour: "10",
    timeMinute: "00",
    venue: "",
    description: "",
    rolesNeededStr: "",
    maxParticipants: 30
  });

  const [calViewDate, setCalViewDate] = useState(new Date());
  const [selectedCalDate, setSelectedCalDate] = useState(new Date().toISOString().split('T')[0]);

  // Calendar Month Navigation
  const handlePrevMonth = () => {
    setCalViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Real-time events sync across tabs
  useEffect(() => {
    const syncEvents = () => {
      const saved = localStorage.getItem("am_all_events");
      if (saved) {
        try {
          setEvents(JSON.parse(saved));
        } catch(e) {}
      } else {
        localStorage.setItem("am_all_events", JSON.stringify(DEFAULT_EVENTS));
        setEvents(DEFAULT_EVENTS);
      }
    };

    syncEvents();
    const interval = setInterval(syncEvents, 250);

    const handleStorageEvent = (e) => {
      if (e.key === "am_all_events") syncEvents();
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  // Sync session on load
  useEffect(() => {
    const savedUser = localStorage.getItem("am_current_user");
    if (savedUser) {
      try {
        setCurrentUserProfile(JSON.parse(savedUser));
      } catch(e) {}
    }
  }, []);

  // Sync registered users for directory
  useEffect(() => {
    const syncUsers = () => {
      const stored = localStorage.getItem("am_all_users");
      if (stored) {
        try {
          const mapObj = JSON.parse(stored);
          setRegisteredUsers(Object.values(mapObj));
        } catch (e) {}
      }
    };
    syncUsers();
    const timer = setInterval(syncUsers, 400);
    return () => clearInterval(timer);
  }, []);

  // Real-time Chat Ledger Sync Loop across tabs
  useEffect(() => {
    const syncLedger = () => {
      const stored = localStorage.getItem("am_global_message_ledger");
      if (stored) {
        try {
          setAllMessages(JSON.parse(stored));
        } catch (e) {}
      }
    };
    syncLedger();
    const timer = setInterval(syncLedger, 300);

    const handleStorageEvent = (e) => {
      if (e.key === "am_global_message_ledger") syncLedger();
    };
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeChatUser && chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, activeChatUser]);

  // Send Direct Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessageText.trim() || !activeChatUser || !currentUserProfile) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: currentUserProfile.username,
      receiver: activeChatUser.username,
      text: chatMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let existingLedger = [];
    const raw = localStorage.getItem("am_global_message_ledger");
    if (raw) {
      try { existingLedger = JSON.parse(raw); } catch(e){}
    }
    const updatedLedger = [...existingLedger, newMsg];
    localStorage.setItem("am_global_message_ledger", JSON.stringify(updatedLedger));
    setAllMessages(updatedLedger);
    setChatMessageText("");
  };

  // PERMANENT 3D HOLOGRAPHIC & INTERACTIVE PARTICLE CANVAS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      radius: Math.random() * 2.5 + 1,
      color: Math.random() > 0.5 ? '#facc15' : '#22d3ee'
    }));

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(250, 204, 21, ${1 - dist / 130 * 0.6})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${1 - mdist / 160})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const triggerActionPop = (msg) => {
    setActionPop(msg);
    setTimeout(() => setActionPop(null), 2500);
  };

  // Authentication
  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError("");

    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError("Please fill in all required fields.");
      return;
    }

    const selectedAvatarObj = ANIMAL_AVATARS.find(a => a.id === authRole) || ANIMAL_AVATARS[0];

    const newProfile = {
      username: authUsername.trim(),
      password: authPassword.trim(),
      department: authDept,
      year: authYear,
      role: selectedAvatarObj.name,
      roleEmoji: selectedAvatarObj.emoji
    };

    let usersMap = {};
    const existing = localStorage.getItem("am_all_users");
    if (existing) {
      try { usersMap = JSON.parse(existing); } catch(e){}
    }

    if (usersMap[newProfile.username.toLowerCase()]) {
      setAuthError("Username already exists! Choose another.");
      return;
    }

    usersMap[newProfile.username.toLowerCase()] = newProfile;
    localStorage.setItem("am_all_users", JSON.stringify(usersMap));

    setCurrentUserProfile(newProfile);
    localStorage.setItem("am_current_user", JSON.stringify(newProfile));
    triggerActionPop(`WELCOME ${newProfile.username.toUpperCase()}!`);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setAuthError("");

    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError("Please enter your username and password.");
      return;
    }

    let usersMap = {};
    const existing = localStorage.getItem("am_all_users");
    if (existing) {
      try { usersMap = JSON.parse(existing); } catch(e){}
    }

    const user = usersMap[authUsername.trim().toLowerCase()];
    if (!user || user.password !== authPassword.trim()) {
      setAuthError("Invalid username or password.");
      return;
    }

    setCurrentUserProfile(user);
    localStorage.setItem("am_current_user", JSON.stringify(user));
    triggerActionPop(`LOGGED IN AS ${user.username.toUpperCase()}`);
  };

  const handleLogout = () => {
    setCurrentUserProfile(null);
    localStorage.removeItem("am_current_user");
    triggerActionPop("LOGGED OUT!");
  };

  // Calendar Day Rendering
  const renderCalendarDays = () => {
    const year = calViewDate.getFullYear();
    const month = calViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedCalDate === dateStr;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => setSelectedCalDate(dateStr)}
          className={`p-2 rounded-xl text-xs font-black transition-all ${
            isSelected 
              ? "bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105" 
              : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
          }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  // Event Publishing
  const handlePublishEvent = (e) => {
    e.preventDefault();
    if (!currentUserProfile) return;

    if (!newEvent.title || !selectedCalDate || !newEvent.venue) {
      alert("Please fill in all required event details!");
      return;
    }

    const formattedTime = `${newEvent.timeHour}:${newEvent.timeMinute} ${newEvent.timePeriod}`;
    const rolesNeededArr = newEvent.rolesNeededStr
      ? newEvent.rolesNeededStr.split(',').map(r => r.trim()).filter(Boolean)
      : ["General Members"];

    const initialHostAttendee = {
      id: currentUserProfile.username,
      username: currentUserProfile.username,
      department: currentUserProfile.department || "AIML",
      year: currentUserProfile.year || "1st Year",
      role: currentUserProfile.role || "Cute Fox",
      roleEmoji: currentUserProfile.roleEmoji || "🦊"
    };

    const createdEvent = {
      id: `evt-${Date.now()}`,
      title: newEvent.title,
      department: newEvent.department,
      date: selectedCalDate,
      time: formattedTime,
      venue: newEvent.venue,
      description: newEvent.description,
      rolesNeeded: rolesNeededArr,
      maxParticipants: parseInt(newEvent.maxParticipants) || 30,
      creatorId: currentUserProfile.username,
      creatorName: currentUserProfile.username,
      creatorRole: currentUserProfile.role,
      creatorEmoji: currentUserProfile.roleEmoji || "🦊",
      attendees: [initialHostAttendee]
    };

    const updatedEvents = [createdEvent, ...events];
    setEvents(updatedEvents);
    localStorage.setItem("am_all_events", JSON.stringify(updatedEvents));

    setIsPublishModalOpen(false);
    setNewEvent({
      title: "", department: "AIML",
      timePeriod: "AM", timeHour: "10", timeMinute: "00",
      venue: "", description: "", rolesNeededStr: "", maxParticipants: 30
    });
    setExpandedRosters(prev => ({ ...prev, [createdEvent.id]: true }));
    triggerActionPop("BOOM! EVENT PUBLISHED!");
  };

  // Real-time Event Attendee Join / Leave Toggle
  const handleToggleJoin = (eventItem) => {
    if (!currentUserProfile) return;

    const currentAttendees = eventItem.attendees || [];
    const isAlreadyJoined = currentAttendees.some(a => (a.username || a.id) === currentUserProfile.username);

    let updatedAttendees;
    if (isAlreadyJoined) {
      updatedAttendees = currentAttendees.filter(a => (a.username || a.id) !== currentUserProfile.username);
    } else {
      updatedAttendees = [...currentAttendees, {
        id: currentUserProfile.username,
        username: currentUserProfile.username,
        department: currentUserProfile.department || "AIML",
        year: currentUserProfile.year || "1st Year",
        role: currentUserProfile.role || "Cute Fox",
        roleEmoji: currentUserProfile.roleEmoji || "🦊"
      }];
    }

    const updatedEvent = { ...eventItem, attendees: updatedAttendees };
    const allEvents = events.map(e => e.id === eventItem.id ? updatedEvent : e);

    setEvents(allEvents);
    localStorage.setItem("am_all_events", JSON.stringify(allEvents));

    if (!isAlreadyJoined) {
      setExpandedRosters(prev => ({ ...prev, [eventItem.id]: true }));
    }

    triggerActionPop(isAlreadyJoined ? "LEFT EVENT!" : "JOINED EVENT!");
  };

  // Host Administrative Controls
  const handleRemoveAttendee = (eventItem, targetUsername) => {
    if (!currentUserProfile || eventItem.creatorId !== currentUserProfile.username) return;

    const updatedAttendees = (eventItem.attendees || []).filter(a => (a.username || a.id) !== targetUsername);
    const updatedEvent = { ...eventItem, attendees: updatedAttendees };
    const allEvents = events.map(e => e.id === eventItem.id ? updatedEvent : e);

    setEvents(allEvents);
    localStorage.setItem("am_all_events", JSON.stringify(allEvents));
    triggerActionPop("MEMBER REMOVED BY HOST!");
  };

  const handleDeleteEvent = (eventId) => {
    const updated = events.filter(e => e.id !== eventId);
    setEvents(updated);
    localStorage.setItem("am_all_events", JSON.stringify(updated));
    triggerActionPop("DELETED EVENT!");
  };

  // Interactive Analog Clock Math
  const handleClockFaceClick = (e) => {
    if (!clockFaceRef.current) return;
    const rect = clockFaceRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const clickX = e.clientX - rect.left - centerX;
    const clickY = e.clientY - rect.top - centerY;
    
    let angleRad = Math.atan2(clickY, clickX) + Math.PI / 2;
    if (angleRad < 0) angleRad += Math.PI * 2;
    
    const angleDeg = (angleRad * 180) / Math.PI;
    const minuteVal = Math.round((angleDeg / 360) * 60) % 60;
    const hourVal = Math.floor((angleDeg / 360) * 12) || 12;

    setNewEvent(prev => ({
      ...prev,
      timeHour: String(hourVal).padStart(2, '0'),
      timeMinute: String(minuteVal - (minuteVal % 5)).padStart(2, '0')
    }));
  };

  const rawHour = parseInt(newEvent.timeHour) || 12;
  const rawMinute = parseInt(newEvent.timeMinute) || 0;
  const hourDeg = ((rawHour % 12) * 30) + (rawMinute * 0.5);
  const minuteDeg = rawMinute * 6;

  const filteredEvents = selectedDept === "All Departments" 
    ? events 
    : events.filter(e => e.department === selectedDept);

  return (
    <div className="relative min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* CONSTANT INTERACTIVE HOLOGRAPHIC BACKGROUND */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* ACTION BANNERS */}
      {actionPop && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce pointer-events-none">
          <div className="bg-yellow-400 text-black font-black text-2xl px-6 py-3 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
            ⚡ {actionPop} ⚡
          </div>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header className="relative z-10 border-b-4 border-black bg-yellow-400 text-black px-6 py-4 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-400 border-3 border-black rounded-xl flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-3deg]">
              A&M
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider leading-none">Around Me</h1>
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800">Campus Events & Connect</span>
            </div>
          </div>

          {currentUserProfile && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs px-3.5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 transition-all active:translate-y-0.5"
              >
                💬 Chat
              </button>

              <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xl">{currentUserProfile.roleEmoji || "🦊"}</span>
                <div className="text-left">
                  <div className="text-xs font-black">{currentUserProfile.username}</div>
                  <div className="text-[10px] text-yellow-400 font-bold">{currentUserProfile.department} • {currentUserProfile.year}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-3.5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 transition-all active:translate-y-0.5"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!currentUserProfile ? (
          /* AUTHENTICATION DASHBOARD WITH 3D INTERACTIVE HERO GRAPHIC */
          <div className="max-w-md mx-auto my-8 bg-slate-800 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            
            <div className="mb-6 relative group">
              <div className="relative bg-gradient-to-br from-yellow-400 via-amber-300 to-cyan-400 border-4 border-black rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-black overflow-hidden">
                <div className="relative z-10 w-16 h-16 bg-slate-900 border-4 border-black rounded-2xl flex items-center justify-center mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-3">
                  <span className="text-3xl font-black text-cyan-400 tracking-tighter">A&M</span>
                </div>

                <h2 className="relative z-10 text-xl font-black tracking-wider uppercase text-slate-950 text-center leading-none">
                  CAMPUS CONNECT PORTAL
                </h2>
                <p className="relative z-10 text-[11px] font-extrabold uppercase text-slate-900 tracking-wider mt-1 text-center bg-white/60 px-2.5 py-0.5 rounded-lg border border-black/40">
                  ⚡ Live Meetups & Event Rosters ⚡
                </p>
              </div>
            </div>

            <div className="flex bg-slate-900 rounded-2xl border-2 border-black p-1 mb-6">
              <button
                onClick={() => { setAuthMode("signin"); setAuthError(""); }}
                className={`flex-1 py-2 rounded-xl font-black text-xs uppercase transition-all ${
                  authMode === "signin" 
                    ? "bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
                className={`flex-1 py-2 rounded-xl font-black text-xs uppercase transition-all ${
                  authMode === "register" 
                    ? "bg-cyan-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Register Profile
              </button>
            </div>

            {authError && (
              <div className="mb-4 bg-rose-500 text-white p-3 rounded-xl border-2 border-black font-bold text-xs">
                ⚠️ {authError}
              </div>
            )}

            {authMode === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-slate-300">Username</label>
                  <input
                    type="text"
                    required
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder=""
                    className="w-full bg-slate-900 border-2 border-black rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-slate-300">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border-2 border-black rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5"
                >
                  SIGN IN TO CAMPUS
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-slate-300">Choose Username</label>
                  <input
                    type="text"
                    required
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder=""
                    className="w-full bg-slate-900 border-2 border-black rounded-xl px-4 py-2 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-slate-300">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border-2 border-black rounded-xl px-4 py-2 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Department</label>
                    <select
                      value={authDept}
                      onChange={(e) => setAuthDept(e.target.value)}
                      className="w-full bg-slate-900 border-2 border-black rounded-xl px-2 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {DEPARTMENTS.filter(d => d !== "All Departments").map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Academic Year</label>
                    <select
                      value={authYear}
                      onChange={(e) => setAuthYear(e.target.value)}
                      className="w-full bg-slate-900 border-2 border-black rounded-xl px-2 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="PG / PhD">PG / PhD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Pick Avatar</label>
                  <div className="grid grid-cols-6 gap-1.5 bg-slate-900 p-2 rounded-xl border-2 border-black max-h-32 overflow-y-auto">
                    {ANIMAL_AVATARS.map(avatar => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setAuthRole(avatar.id)}
                        className={`text-xl p-1.5 rounded-lg transition-all ${
                          authRole === avatar.id 
                            ? "bg-cyan-400 border-2 border-black scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                            : "hover:bg-slate-800 opacity-60 hover:opacity-100"
                        }`}
                        title={avatar.name}
                      >
                        {avatar.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-black py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5"
                >
                  CREATE CAMPUS ACCOUNT
                </button>
              </form>
            )}
          </div>
        ) : (
          /* EVENTS DASHBOARD */
          <div className="space-y-6">
            <div className="bg-slate-800 border-4 border-black rounded-2xl p-4 sm:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-yellow-400">Campus Events Feed</h2>
                <p className="text-xs text-slate-300 font-medium">Explore department happenings, join rosters, or host your own meetups.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-slate-900 border-2 border-black text-xs font-black text-white px-3 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-4 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5"
                >
                  + Publish Event
                </button>
              </div>
            </div>

            {/* EVENT CARDS FEED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.length === 0 ? (
                <div className="md:col-span-2 bg-slate-800 border-4 border-black rounded-2xl p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-lg font-black text-slate-400 uppercase">No events found in this department.</p>
                </div>
              ) : (
                filteredEvents.map(eventItem => {
                  const attendeesList = eventItem.attendees || [];
                  const isHost = currentUserProfile && eventItem.creatorId === currentUserProfile.username;
                  const isJoined = attendeesList.some(a => (a.username || a.id) === currentUserProfile?.username);
                  const isExpanded = !!expandedRosters[eventItem.id];

                  return (
                    <div 
                      key={eventItem.id}
                      className="bg-slate-800 border-4 border-black rounded-3xl p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="bg-cyan-400 text-black font-black text-[10px] px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                            {eventItem.department}
                          </span>

                          {isHost && (
                            <button
                              onClick={() => handleDeleteEvent(eventItem.id)}
                              className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-2 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              title="Delete Event"
                            >
                              🗑️
                            </button>
                          )}
                        </div>

                        <h3 className="text-lg font-black uppercase text-yellow-400 mb-2 leading-tight">
                          {eventItem.title}
                        </h3>

                        <p className="text-xs text-slate-300 font-medium mb-4 line-clamp-3">
                          {eventItem.description}
                        </p>

                        <div className="bg-slate-900 p-3 rounded-2xl border-2 border-black mb-4 space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-slate-300 font-bold">
                            📅 <span>{eventItem.date} at {eventItem.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300 font-bold">
                            📍 <span>{eventItem.venue}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">{eventItem.creatorEmoji || "🦊"}</span>
                          <div>
                            <div className="text-xs font-black text-white">Host: {eventItem.creatorName}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{eventItem.creatorRole}</div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t-2 border-slate-700 pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <button
                            onClick={() => setExpandedRosters(prev => ({ ...prev, [eventItem.id]: !prev[eventItem.id] }))}
                            className="flex items-center gap-1.5 text-xs font-black text-cyan-400 hover:underline"
                          >
                            <span>👥 {attendeesList.length} / {eventItem.maxParticipants} Attending</span>
                            <span>{isExpanded ? "▲" : "▼"}</span>
                          </button>

                          <button
                            onClick={() => handleToggleJoin(eventItem)}
                            className={`font-black text-xs px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5 ${
                              isJoined 
                                ? "bg-rose-500 hover:bg-rose-600 text-white" 
                                : "bg-cyan-400 hover:bg-cyan-300 text-black"
                            }`}
                          >
                            {isJoined ? "Leave Event" : "Join Event"}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="bg-slate-900 border-2 border-black rounded-2xl p-3 mt-2 space-y-2 max-h-40 overflow-y-auto">
                            {attendeesList.length === 0 ? (
                              <div className="text-xs text-slate-500 text-center py-2">No attendees joined yet.</div>
                            ) : (
                              attendeesList.map((member, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-800 p-2 rounded-xl border border-slate-700">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{member.roleEmoji || "🦊"}</span>
                                    <div>
                                      <div className="text-xs font-black text-white">{member.username}</div>
                                      <div className="text-[9px] text-slate-400 font-bold">{member.department}</div>
                                    </div>
                                  </div>

                                  {isHost && member.username !== currentUserProfile.username && (
                                    <button
                                      onClick={() => handleRemoveAttendee(eventItem, member.username)}
                                      className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-black text-[10px] px-2 py-1 rounded-lg border border-rose-500"
                                    >
                                      ❌ Remove
                                    </button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* PUBLISH EVENT MODAL WITH ANALOG CLOCK PICKER */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-800 border-4 border-black rounded-3xl p-4 sm:p-5 max-w-xl w-full shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative my-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPublishModalOpen(false)}
              className="absolute top-3 right-3 bg-rose-500 text-white px-2 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 font-black text-xs"
            >
              ✕
            </button>

            <h2 className="text-xl font-black uppercase text-yellow-400 mb-0.5">Host Campus Event</h2>
            <p className="text-[11px] text-slate-300 mb-4">Create a meetup, workshop, or gathering for your department.</p>

            <form onSubmit={handlePublishEvent} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g. Hackathon Prep Workshop"
                    className="w-full bg-slate-900 border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Department</label>
                  <select
                    value={newEvent.department}
                    onChange={(e) => setNewEvent({ ...newEvent, department: e.target.value })}
                    className="w-full bg-slate-900 border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:border-yellow-400 focus:outline-none"
                  >
                    {DEPARTMENTS.filter(d => d !== "All Departments").map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CALENDAR DATE SELECTION */}
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Select Date</label>
                <div className="bg-slate-900 border-2 border-black rounded-xl p-2.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-black text-yellow-400">
                      {calViewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="bg-slate-800 text-white px-2 py-0.5 rounded-lg border border-slate-700 text-xs font-bold"
                      >
                        ◄
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="bg-slate-800 text-white px-2 py-0.5 rounded-lg border border-slate-700 text-xs font-bold"
                      >
                        ►
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays()}
                  </div>
                </div>
              </div>

              {/* ANALOG CLOCK PICKER */}
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Select Time (Click Dial or Buttons)</label>
                <div className="bg-slate-900 border-2 border-black rounded-xl p-3 flex flex-col sm:flex-row items-center justify-around gap-3">
                  
                  <div className="flex flex-col items-center shrink-0">
                    <div 
                      ref={clockFaceRef}
                      onClick={handleClockFaceClick}
                      className="w-32 h-32 rounded-full bg-slate-800 border-4 border-black relative cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center select-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => {
                        const angle = (n * 30 - 90) * (Math.PI / 180);
                        const radius = 46; 
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        return (
                          <div 
                            key={n} 
                            className="absolute font-black text-[9px] text-slate-300"
                            style={{ transform: `translate(${x}px, ${y}px)` }}
                          >
                            {n}
                          </div>
                        );
                      })}

                      <div 
                        className="absolute w-1 bg-yellow-400 rounded-full origin-bottom shadow-sm"
                        style={{
                          height: '24px',
                          bottom: '50%',
                          transform: `rotate(${hourDeg}deg)`,
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />

                      <div 
                        className="absolute w-0.5 bg-cyan-400 rounded-full origin-bottom shadow-sm"
                        style={{
                          height: '34px',
                          bottom: '50%',
                          transform: `rotate(${minuteDeg}deg)`,
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />

                      <div className="w-2.5 h-2.5 bg-yellow-400 border border-black rounded-full z-10" />
                    </div>

                    <div className="mt-1.5 text-[11px] font-black text-yellow-400">
                      ⏰ {newEvent.timeHour}:{newEvent.timeMinute} {newEvent.timePeriod}
                    </div>
                  </div>

                  <div className="space-y-2 w-full sm:w-auto">
                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Hours</span>
                      <div className="grid grid-cols-6 gap-1">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                          const hStr = String(h).padStart(2, '0');
                          const isSelected = newEvent.timeHour === hStr;
                          return (
                            <button
                              key={h}
                              type="button"
                              onClick={() => setNewEvent(prev => ({ ...prev, timeHour: hStr }))}
                              className={`p-1 rounded text-[10px] font-black border border-black ${
                                isSelected ? "bg-yellow-400 text-black" : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {h}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Minutes</span>
                      <div className="grid grid-cols-6 gap-1">
                        {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setNewEvent(prev => ({ ...prev, timeMinute: m }))}
                            className={`p-1 rounded text-[10px] font-black border border-black ${
                              newEvent.timeMinute === m ? "bg-cyan-400 text-black" : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Period</span>
                      <div className="flex gap-1.5">
                        {["AM", "PM"].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewEvent(prev => ({ ...prev, timePeriod: p }))}
                            className={`flex-1 py-0.5 rounded text-[10px] font-black border border-black ${
                              newEvent.timePeriod === p ? "bg-yellow-400 text-black" : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Venue</label>
                  <input
                    type="text"
                    required
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    placeholder="e.g. Auditorium A or Seminar Hall 2"
                    className="w-full bg-slate-900 border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Max Participants</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: e.target.value })}
                    className="w-full bg-slate-900 border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-slate-300">Event Description</label>
                <textarea
                  rows="2"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Describe what attendees can expect at this event..."
                  className="w-full bg-slate-900 border-2 border-black rounded-xl p-2.5 text-xs font-bold text-white focus:border-yellow-400 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5"
              >
                PUBLISH CAMPUS EVENT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIMPLE DIRECT CHAT MODAL */}
      {isChatOpen && currentUserProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-800 border-4 border-black rounded-3xl w-full max-w-2xl h-[550px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative flex flex-col overflow-hidden">
            
            <div className="bg-yellow-400 border-b-4 border-black p-3.5 text-black flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-white font-black flex items-center justify-center rounded-lg text-sm">
                  💬
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase leading-none">Campus Direct Chat</h3>
                  <p className="text-[10px] font-bold text-slate-800 uppercase">Connect with online & offline students</p>
                </div>
              </div>

              <button
                onClick={() => { setIsChatOpen(false); setActiveChatUser(null); }}
                className="bg-rose-500 text-white font-black px-2 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* LEFT SIDEBAR: USERS DIRECTORY */}
              <div className="w-1/3 border-r-2 border-slate-700 bg-slate-900 p-3 overflow-y-auto space-y-2">
                <div className="text-[10px] font-black uppercase text-slate-400 mb-2">All Registered Students</div>
                {registeredUsers
                  .filter(u => u.username !== currentUserProfile.username)
                  .length === 0 ? (
                    <div className="text-xs text-slate-500 py-4 text-center">No other accounts registered yet. Create another profile to start messaging!</div>
                  ) : (
                    registeredUsers
                      .filter(u => u.username !== currentUserProfile.username)
                      .map(user => {
                        const isSelected = activeChatUser?.username === user.username;
                        const userMsgs = allMessages.filter(m => 
                          (m.sender === currentUserProfile.username && m.receiver === user.username) ||
                          (m.sender === user.username && m.receiver === currentUserProfile.username)
                        );
                        return (
                          <button
                            key={user.username}
                            onClick={() => setActiveChatUser(user)}
                            className={`w-full text-left p-2 rounded-xl border-2 border-black flex items-center gap-2 transition-all ${
                              isSelected
                                ? "bg-cyan-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold scale-[1.02]"
                                : "bg-slate-800 text-white hover:bg-slate-700 border-slate-700"
                            }`}
                          >
                            <span className="text-lg">{user.roleEmoji || "🦊"}</span>
                            <div className="overflow-hidden flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black truncate">{user.username}</span>
                                {userMsgs.length > 0 && (
                                  <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.2 rounded-full font-black border border-black">
                                    {userMsgs.length}
                                  </span>
                                )}
                              </div>
                              <div className="text-[9px] text-slate-400 truncate">{user.department}</div>
                            </div>
                          </button>
                        );
                      })
                  )}
              </div>

              {/* RIGHT DISPLAY: ACTIVE CONVERSATION */}
              <div className="flex-1 bg-slate-950 flex flex-col">
                {activeChatUser ? (
                  <>
                    <div className="bg-slate-900 border-b border-slate-700 p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{activeChatUser.roleEmoji || "🦊"}</span>
                        <div>
                          <div className="text-xs font-black text-white">{activeChatUser.username}</div>
                          <div className="text-[9px] text-cyan-400 font-bold">{activeChatUser.department} • {activeChatUser.year}</div>
                        </div>
                      </div>
                      <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md font-bold uppercase">
                        Offline Delivery Ready
                      </span>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                      {allMessages
                        .filter(m => 
                          (m.sender === currentUserProfile.username && m.receiver === activeChatUser.username) ||
                          (m.sender === activeChatUser.username && m.receiver === currentUserProfile.username)
                        )
                        .map(msg => {
                          const isMe = msg.sender === currentUserProfile.username;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                              <div className={`max-w-[80%] px-3 py-2 rounded-xl border-2 border-black text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                isMe 
                                  ? "bg-yellow-400 text-black rounded-tr-none" 
                                  : "bg-cyan-400 text-black rounded-tl-none"
                              }`}>
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.timestamp}</span>
                            </div>
                          );
                        })}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-2 bg-slate-900 border-t border-slate-700 flex gap-2">
                      <input
                        type="text"
                        value={chatMessageText}
                        onChange={(e) => setChatMessageText(e.target.value)}
                        placeholder={`Message @${activeChatUser.username}...`}
                        className="flex-1 bg-slate-950 border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-yellow-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5"
                      >
                        Send
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500 text-xs font-bold">
                    👈 Select a student from the left directory to start chatting!
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}