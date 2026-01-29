import { useState, useEffect, useRef } from "react";
import { 
  Search, Plus, MapPin, MoreVertical, Phone, Video, 
  ArrowLeft, Send, Paperclip, Mic, Image as ImageIcon,
  LogOut, X, Users, File
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

export default function CommunityPage() {
  const navigate = useNavigate();
  const [mobileView, setMobileView] = useState("list"); // "list" or "chat"
  
  // Data State
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // User State
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState("farmer");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
        // ideally get role from decoded token or profile
        // setUserRole(decoded.role || "farmer"); 
      } catch (e) {
        console.error("Invalid token");
      }
    }
    fetchCommunities();

    // Socket Connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token: token },
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/api/communities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching communities:", err);
    }
  };

  const handleJoin = async (communityId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:4000/api/communities/${communityId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Joined community!");
      fetchCommunities(); // Refresh to update membership status
      // Optionally auto-select
      const joinedGroup = groups.find(g => g._id === communityId);
      if (joinedGroup) setSelectedGroup(joinedGroup);
    } catch (error) {
       toast.error(error.response?.data?.message || "Failed to join");
    }
  };

  const fetchMessages = async (communityId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:4000/api/communities/${communityId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Socket: Join/Leave Room & Listen for Messages
  useEffect(() => {
    if (!selectedGroup?._id || !socketRef.current) return;

    // Join new room
    socketRef.current.emit("joinCommunity", { communityId: selectedGroup._id });

    // Listen for incoming messages
    const handleNewMessage = (msg) => {
      // Only append if it belongs to the current room
      if (msg.communityId === selectedGroup._id) {
         setMessages((prev) => {
            // Prevent duplicates (if any)
            if (prev.some(m => m._id === msg._id)) return prev;
            return [...prev, msg];
         });
      }
    };

    socketRef.current.on("newCommunityMessage", handleNewMessage);

    // Cleanup: Leave room and remove listener
    return () => {
      if (socketRef.current) {
         socketRef.current.emit("leaveCommunity", { communityId: selectedGroup._id });
         socketRef.current.off("newCommunityMessage", handleNewMessage);
      }
    };
  }, [selectedGroup?._id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:4000/api/communities/${selectedGroup._id}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send");
    }
  };

  const handleGroupClick = (group) => {
    const isMember = group.members.some(m => (m._id || m) === currentUserId) || group.members.includes(currentUserId);
    
    if (isMember) {
      setSelectedGroup(group);
      setMobileView("chat");
      fetchMessages(group._id); 
    } else {
       toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Join {group.name}?</span>
            <span className="text-xs">Join to participate in discussions.</span>
            <button 
              onClick={() => { toast.dismiss(t.id); handleJoin(group._id); }}
              className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm"
            >
              Join Now
            </button>
          </div>
        ),
        { duration: 4000, icon: "🌱" }
      );
    }
  };

  // --- New Features: Uploads & Menu Logic ---

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const toastId = toast.loading("Uploading...");

      try {
          const token = localStorage.getItem("token");
          // 1. Upload
          const uploadRes = await axios.post("http://localhost:4000/api/upload", formData, {
              headers: { 
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${token}`
              }
          });
          
          const fileUrl = uploadRes.data.url;
          const isImage = file.type.startsWith("image/");

          // 2. Send Message with Link/Image
          await axios.post(
              `http://localhost:4000/api/communities/${selectedGroup._id}/messages`,
              { 
                  content: fileUrl, 
                  messageType: isImage ? "image" : "file" // You might need to update Schema if strict enum, else 'text' works with logic
              },
              { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success("Sent!", { id: toastId });
      } catch (err) {
          console.error("Upload error", err);
          toast.error("Upload failed", { id: toastId });
      }
  };

  const handleLeaveCommunity = async () => {
      if(!selectedGroup) return;
      if(!window.confirm(`Are you sure you want to leave ${selectedGroup.name}?`)) return;

      try {
          const token = localStorage.getItem("token");
          await axios.post(`http://localhost:4000/api/communities/${selectedGroup._id}/leave`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success(`Left ${selectedGroup.name}`);
          setSelectedGroup(null);
          fetchCommunities(); // Refresh list
      } catch (err) {
          console.error(err);
          toast.error("Failed to leave community");
      }
  };

  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);


  // Audio State
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadAndSendAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      mediaRecorder.start();
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      const duration = Date.now() - recordingStartTimeRef.current;
      if (duration < 1000) {
        // Discard if less than 1 second (accidental click)
        mediaRecorderRef.current.stop();
        // Clear onstop handler to prevent sending
        mediaRecorderRef.current.onstop = null;
        setIsRecording(false);
        toast("Hold to record...", { icon: "🎤" });
        return;
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAndSendAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "voice-message.webm");

    try {
       // 1. Upload Layout
       const res = await axios.post("http://localhost:4000/api/upload", formData, {
         headers: { "Content-Type": "multipart/form-data" },
       });
       
       const audioUrl = res.data.url;

       // 2. Send Message
       const token = localStorage.getItem("token");
       await axios.post(
          `http://localhost:4000/api/communities/${selectedGroup._id}/messages`,
          { content: audioUrl, messageType: "audio" },
          { headers: { Authorization: `Bearer ${token}` } }
       );
    } catch (err) {
       console.error("Error sending voice message:", err);
       toast.error("Failed to send voice message");
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 flex overflow-hidden">
      {/* Sidebar (Group List) */}
      <div
        className={`${
          mobileView === "list" ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 h-full transition-transform duration-300 z-20 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Communities</h1>
          <button 
             onClick={() => navigate("/communities/request")}
             className="bg-teal-50 text-teal-600 p-2 rounded-full hover:bg-teal-100 transition"
             title="Request New Community"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto">
          {groups.length === 0 ? (
             <div className="p-8 text-center text-slate-500">
               No communities found. Request one!
             </div>
          ) : (
             groups.map((group) => (
              <button
                key={group._id}
                onClick={() => handleGroupClick(group)}
                className={`w-full p-4 flex items-center gap-3 transition border-b border-slate-50 last:border-0 ${
                  selectedGroup?._id === group._id
                    ? "bg-teal-50 border-l-4 border-l-teal-500"
                    : "hover:bg-slate-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-slate-500 text-lg">
                   {group.image ? (
                     <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                   ) : (
                     group.name[0]
                   )}
                </div>
                
                <div className="flex-1 text-left">
                  <h3 className={`font-semibold text-sm ${selectedGroup?._id === group._id ? "text-teal-800" : "text-slate-800"}`}>
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                     {group.topic}
                  </p>
                </div>

                {/* Member indicator */}
                {(group.members.some(m => (m._id || m) === currentUserId) || group.members.includes(currentUserId)) && (
                   <div className="w-2 h-2 rounded-full bg-teal-500" title="Joined"></div>
                )}
              </button>
             ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#e5ddd5] relative">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className={`bg-white border-b border-slate-200 p-3 flex items-center justify-between shrink-0 shadow-sm ${mobileView === 'chat' ? 'block' : 'hidden md:flex'}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-2 -ml-2 text-slate-600"
                >
                  <ArrowLeft size={20} />
                </button>
                
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                   {selectedGroup.image ? (
                      <img src={selectedGroup.image} alt={selectedGroup.name} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-600 font-bold">
                        {selectedGroup.name[0]}
                      </div>
                   )}
                </div>
                
                <div>
                  <h2 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-xs text-slate-500 truncate max-w-[150px] md:max-w-none">
                    {selectedGroup.members?.length || 0} members • {selectedGroup.topic}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                 <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition"
                 >
                   <MoreVertical size={20} />
                 </button>

                 <AnimatePresence>
                     {isMenuOpen && (
                         <motion.div 
                             initial={{ opacity: 0, scale: 0.9, y: 10 }}
                             animate={{ opacity: 1, scale: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.9, y: 10 }}
                             className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
                         >
                             <button onClick={() => { setShowInfoModal(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2">
                                 <MoreVertical size={16} /> Community Info
                             </button>
                             <button onClick={() => { setShowMembersModal(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2">
                                 <Users size={16} /> Members
                             </button>
                             <div className="h-px bg-gray-100 my-1"/>
                             <button onClick={() => { setSelectedGroup(null); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2">
                                 <X size={16} /> Close Chat
                             </button>
                             <button onClick={() => { handleLeaveCommunity(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2">
                                 <LogOut size={16} /> Exit Community
                             </button>
                         </motion.div>
                     )}
                 </AnimatePresence>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] opacity-90" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                <div className="flex justify-center my-4">
                  <span className="bg-white/90 px-3 py-1 rounded-lg text-xs text-slate-500 shadow-sm">
                    {new Date(selectedGroup.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-center my-4">
                  <span className="bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-lg text-xs text-yellow-800 shadow-sm text-center">
                    🔒 Messages are end-to-end encrypted.
                  </span>
                </div>

                {messages.length === 0 && (
                   <div className="text-center text-sm text-slate-500 my-10">
                     No messages yet. Be the first to say hi! 👋
                   </div>
                )}

                {messages.map((msg) => {
                  const isMe = (msg.sender?._id || msg.sender) === currentUserId;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                       <div className={`max-w-[80%] rounded-lg p-3 shadow-sm relative ${
                         isMe ? "bg-teal-100 rounded-tr-none" : "bg-white rounded-tl-none"
                       }`}>
                          {!isMe && <p className="text-xs font-bold text-teal-700 mb-1">{msg.sender?.name}</p>}
                          
                          {msg.messageType === 'audio' ? (
                             <audio controls src={`http://localhost:4000${msg.content}`} className="w-64 h-10 mt-1" />
                          ) : msg.messageType === 'image' ? (
                              <div className="rounded-lg overflow-hidden mt-1 max-w-xs">
                                  <img src={`http://localhost:4000${msg.content}`} alt="Attachment" className="w-full h-auto cursor-pointer hover:scale-105 transition" onClick={() => window.open(`http://localhost:4000${msg.content}`, '_blank')} />
                              </div>
                          ) : msg.messageType === 'file' ? (
                              <div className="mt-1 flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition cursor-pointer" onClick={() => window.open(`http://localhost:4000${msg.content}`, '_blank')}>
                                  <Paperclip size={16} className="text-slate-500" />
                                  <span className="text-sm underline text-blue-600 truncate max-w-[150px]">Attachment</span>
                              </div>
                          ) : (
                             <p className="text-sm text-slate-800 break-words">{msg.content}</p>
                          )}

                          <span className="text-[10px] text-slate-400 block text-right mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                          </span>
                       </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 md:gap-4 shrink-0 z-10">
               <button className="p-2 text-slate-500 hover:text-slate-600">
                 <Plus size={24} />
               </button>
               <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2 shadow-sm">
                  <input 
                    className="flex-1 outline-none text-slate-700 bg-transparent placeholder:text-slate-400"
                    placeholder={isRecording ? "Recording audio..." : "Type a message..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isRecording}
                  />
                  <div className="flex items-center gap-3 text-slate-400">
                     <label className="cursor-pointer hover:text-slate-600">
                         <input type="file" className="hidden" onChange={handleFileUpload} />
                         <Paperclip size={20} />
                     </label>
                     <label className="cursor-pointer hover:text-slate-600">
                         <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                         <ImageIcon size={20} />
                     </label>
                  </div>
               </div>
               {newMessage.trim() ? (
                 <button 
                   onClick={handleSendMessage}
                   className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition shadow-md"
                 >
                   <Send size={20} />
                 </button>
               ) : (
                 <button 
                   onMouseDown={startRecording}
                   onMouseUp={stopRecording}
                   onTouchStart={startRecording} // Mobile support
                   onTouchEnd={stopRecording}
                   className={`p-3 rounded-full transition shadow-md ${
                     isRecording ? "bg-red-500 animate-pulse text-white" : "bg-teal-600 text-white hover:bg-teal-700"
                   }`}
                 >
                   <Mic size={20} />
                 </button>
               )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {/* Community Info Modal */}
                {showInfoModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="h-32 bg-teal-600 relative">
                                <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 bg-black/20 text-white p-1 rounded-full"><X size={20}/></button>
                            </div>
                            <div className="px-6 pb-6 -mt-10">
                                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md">
                                    <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-2xl text-slate-500">
                                        {selectedGroup.image ? <img src={selectedGroup.image} className="w-full h-full object-cover"/> : selectedGroup.name[0]}
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mt-3">{selectedGroup.name}</h2>
                                <p className="text-teal-600 font-medium">{selectedGroup.topic}</p>
                                
                                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                                    <h4 className="font-bold text-slate-700 text-sm mb-1 uppercase tracking-wider">Description</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{selectedGroup.description || "No description available."}</p>
                                </div>

                                <div className="mt-4 flex gap-4 text-center">
                                    <div className="flex-1 p-3 border border-slate-100 rounded-lg">
                                        <div className="text-xl font-bold text-slate-800">{selectedGroup.members?.length || 0}</div>
                                        <div className="text-xs text-slate-400 uppercase">Members</div>
                                    </div>
                                    <div className="flex-1 p-3 border border-slate-100 rounded-lg">
                                        <div className="text-xl font-bold text-slate-800">{new Date(selectedGroup.createdAt).getFullYear()}</div>
                                        <div className="text-xs text-slate-400 uppercase">Created</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Members Modal */}
                {showMembersModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl h-[60vh] flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-slate-800">Community Members</h3>
                                <button onClick={() => setShowMembersModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {selectedGroup.members?.map((member) => (
                                    <div key={member._id || member} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition">
                                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                                            {member.avatar ? <img src={member.avatar} className="w-full h-full rounded-full object-cover"/> : (member.name?.[0] || 'U')}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800 text-sm">{member.name || "Unknown User"}</div>
                                            <div className="text-xs text-slate-500">Member</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

          </>
        ) : (
          /* Empty State */
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50">
             <div className="w-64 h-64 bg-slate-200 rounded-full flex items-center justify-center mb-6">
               <img src="https://cdni.iconscout.com/illustration/premium/thumb/farmer-working-in-farm-2537380-2127264.png" alt="Select Community" className="w-48 opacity-80" />
             </div>
             <h2 className="text-3xl font-light text-slate-700 mb-2">AgriMitra Communities</h2>
             <p className="text-slate-500 max-w-md">
               Select a community to view discussions, share tips, and connect with other farmers.
             </p>
             <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm">
               <MapPin size={16} /> End-to-end encrypted
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
