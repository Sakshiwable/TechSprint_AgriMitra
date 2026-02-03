import { useState, useEffect, useRef } from "react";
import { 
  Search, Plus, MapPin, MoreVertical, Phone, Video, 
  ArrowLeft, Send, Paperclip, Mic, Image as ImageIcon,
  LogOut, X, Users, File, Sparkles, MessageCircle
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  const sidebarRef = useRef(null);
  const chatRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sidebar animation
      gsap.from(".community-item", {
        x: -30,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sidebarRef.current,
          start: "top 80%"
        }
      });

      // Chat messages animation
      gsap.from(".message-bubble", {
        y: 20,
        opacity: 0,
        stagger: 0.03,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, [groups, messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // User State
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error("Invalid token", error);
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
      fetchCommunities();
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

    socketRef.current.emit("joinCommunity", { communityId: selectedGroup._id });

    const handleNewMessage = (msg) => {
      if (msg.communityId === selectedGroup._id) {
         setMessages((prev) => {
            if (prev.some(m => m._id === msg._id)) return prev;
            return [...prev, msg];
         });
      }
    };

    socketRef.current.on("newCommunityMessage", handleNewMessage);

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
      await axios.post(
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
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition"
            >
              Join Now
            </button>
          </div>
        ),
        { duration: 4000, icon: "🌱" }
      );
    }
  };

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const toastId = toast.loading("Uploading...");

      try {
          const token = localStorage.getItem("token");
          const uploadRes = await axios.post("http://localhost:4000/api/upload", formData, {
              headers: { 
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${token}`
              }
          });
          
          const fileUrl = uploadRes.data.url;
          const isImage = file.type.startsWith("image/");

          await axios.post(
              `http://localhost:4000/api/communities/${selectedGroup._id}/messages`,
              { 
                  content: fileUrl, 
                  messageType: isImage ? "image" : "file"
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
          fetchCommunities();
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
        stream.getTracks().forEach(track => track.stop());
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
        mediaRecorderRef.current.stop();
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
       const res = await axios.post("http://localhost:4000/api/upload", formData, {
         headers: { "Content-Type": "multipart/form-data" },
       });
       
       const audioUrl = res.data.url;

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
    <div className="min-h-screen bg-gradient-to-br from-[#f4fdf8] to-emerald-50 pt-20 ">
      <div className="h-[calc(100vh-5rem)] flex gap-4 mx-4 overflow-hidden pb-4">
        {/* Sidebar (Group List) */}
        <div
          ref={sidebarRef}
          className={`${
            mobileView === "list" ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative w-full md:w-80 lg:w-96 bg-white/80 backdrop-blur-xl rounded-3xl border border-emerald-100/50 shadow-2xl h-full transition-transform duration-300 z-30 flex flex-col overflow-hidden`}
        >
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-t-3xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Communities</h1>
            </div>
            <button 
               onClick={() => navigate("/communities/request")}
               className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
               title="Request New Community"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Group List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {groups.length === 0 ? (
               <div className="p-8 text-center text-emerald-600">
                 <Users className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
                 <p className="font-semibold">No communities found.</p>
                 <p className="text-sm text-emerald-500 mt-2">Request one to get started!</p>
               </div>
            ) : (
               groups.map((group) => {
                 const isMember = group.members.some(m => (m._id || m) === currentUserId) || group.members.includes(currentUserId);
                 const isSelected = selectedGroup?._id === group._id;
                 return (
                  <button
                    key={group._id}
                    onClick={() => handleGroupClick(group)}
                    className={`community-item w-full p-4 flex items-center gap-3 transition-all duration-300 rounded-2xl hover:scale-[1.02] ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-400 shadow-lg"
                        : "hover:bg-emerald-50/50 border-2 border-transparent hover:border-emerald-200"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-lg shadow-lg ${
                      isSelected ? "ring-2 ring-emerald-400" : ""
                    }`}>
                       {group.image ? (
                         <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                       ) : (
                         <div className={`w-full h-full flex items-center justify-center ${
                           isSelected ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white" : "bg-gradient-to-br from-emerald-200 to-green-300 text-emerald-700"
                         }`}>
                           {group.name[0]}
                         </div>
                       )}
                    </div>
                    
                    <div className="flex-1 text-left min-w-0">
                      <h3 className={`font-bold text-sm mb-1 truncate ${
                        isSelected ? "text-emerald-700" : "text-gray-800"
                      }`}>
                        {group.name}
                      </h3>
                      <p className="text-xs text-emerald-600 truncate">
                         {group.topic}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users size={12} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600">{group.members?.length || 0} members</span>
                      </div>
                    </div>

                    {isMember && (
                       <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg" title="Joined"></div>
                    )}
                  </button>
                 );
               })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div 
          ref={chatRef}
          className="flex-1 flex flex-col h-full bg-white/80 backdrop-blur-xl rounded-3xl border border-emerald-100/50 shadow-2xl overflow-hidden"
        >
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className={`bg-gradient-to-r from-emerald-500 to-green-600 p-4 flex items-center justify-between shrink-0 shadow-lg ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileView("list")}
                    className="md:hidden p-2 -ml-2 text-white hover:bg-white/20 rounded-xl transition"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm overflow-hidden shadow-lg ring-2 ring-white/30">
                     {selectedGroup.image ? (
                        <img src={selectedGroup.image} alt={selectedGroup.name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/30 text-white font-bold text-xl">
                          {selectedGroup.name[0]}
                        </div>
                     )}
                  </div>
                  
                  <div>
                    <h2 className="font-bold text-white text-base leading-tight">
                      {selectedGroup.name}
                    </h2>
                    <p className="text-xs text-white/90 truncate max-w-[150px] md:max-w-none">
                      {selectedGroup.members?.length || 0} members • {selectedGroup.topic}
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                   <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 hover:bg-white/20 rounded-xl text-white transition backdrop-blur-sm"
                   >
                     <MoreVertical size={20} />
                   </button>

                   <AnimatePresence>
                       {isMenuOpen && (
                           <motion.div 
                               initial={{ opacity: 0, scale: 0.9, y: 10 }}
                               animate={{ opacity: 1, scale: 1, y: 0 }}
                               exit={{ opacity: 0, scale: 0.9, y: 10 }}
                               className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-50 origin-top-right"
                           >
                               <button onClick={() => { setShowInfoModal(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm text-gray-700 flex items-center gap-2 transition">
                                   <MoreVertical size={16} /> Community Info
                               </button>
                               <button onClick={() => { setShowMembersModal(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm text-gray-700 flex items-center gap-2 transition">
                                   <Users size={16} /> Members
                               </button>
                               <div className="h-px bg-emerald-100 my-1"/>
                               <button onClick={() => { setSelectedGroup(null); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm text-gray-700 flex items-center gap-2 transition">
                                   <X size={16} /> Close Chat
                               </button>
                               <button onClick={() => { handleLeaveCommunity(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2 transition">
                                   <LogOut size={16} /> Exit Community
                               </button>
                           </motion.div>
                       )}
                   </AnimatePresence>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-[#f0f2f5]" style={{ backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                  <div className="flex justify-center my-4">
                    <span className="bg-white px-4 py-2 rounded-full text-xs text-emerald-600 shadow-md font-semibold border border-emerald-200">
                      {new Date(selectedGroup.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-center my-4">
                    <span className="bg-white border border-emerald-200 px-4 py-2 rounded-full text-xs text-emerald-700 shadow-sm text-center font-medium">
                      🔒 Messages are end-to-end encrypted.
                    </span>
                  </div>

                  {messages.length === 0 && (
                     <div className="text-center text-sm text-emerald-600 my-10">
                       <MessageCircle className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
                       <p className="font-semibold">No messages yet.</p>
                       <p className="text-emerald-500 mt-1">Be the first to say hi! 👋</p>
                     </div>
                  )}

                  {messages.map((msg) => {
                    const isMe = (msg.sender?._id || msg.sender) === currentUserId;
                    return (
                      <div 
                        key={msg._id} 
                        className={`message-bubble flex ${isMe ? "justify-end" : "justify-start"} px-2`}
                      >
                         <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-3 md:p-4 shadow-md relative ${
                           isMe 
                             ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-tr-sm" 
                             : "bg-white text-gray-800 rounded-tl-sm border border-gray-200"
                         }`}>
                            {!isMe && (
                              <p className="text-xs font-bold text-emerald-600 mb-1.5">{msg.sender?.name || "Unknown"}</p>
                            )}
                            
                            {msg.messageType === 'audio' ? (
                               <audio controls src={`http://localhost:4000${msg.content}`} className="w-full max-w-xs h-10 mt-1 rounded-lg" />
                            ) : msg.messageType === 'image' ? (
                                <div className="rounded-xl overflow-hidden mt-1 max-w-xs shadow-md">
                                    <img src={`http://localhost:4000${msg.content}`} alt="Attachment" className="w-full h-auto cursor-pointer hover:scale-105 transition" onClick={() => window.open(`http://localhost:4000${msg.content}`, '_blank')} />
                                </div>
                            ) : msg.messageType === 'file' ? (
                                <div className="mt-1 flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer" onClick={() => window.open(`http://localhost:4000${msg.content}`, '_blank')}>
                                    <Paperclip size={16} className="text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-700 truncate max-w-[150px]">Attachment</span>
                                </div>
                            ) : (
                               <p className={`text-sm md:text-base break-words leading-relaxed ${isMe ? "text-white" : "text-gray-800"}`}>{msg.content}</p>
                            )}

                            <span className={`text-[10px] md:text-xs block text-right mt-1.5 ${isMe ? "text-white/80" : "text-gray-500"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                            </span>
                         </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-[#f0f2f5] p-3 md:p-4 flex items-center gap-2 md:gap-3 shrink-0 border-t border-gray-200">
                 <button className="p-2 md:p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-white rounded-xl transition">
                   <Plus size={20} className="md:w-6 md:h-6" />
                 </button>
                 <div className="flex-1 bg-white rounded-2xl flex items-center px-3 md:px-4 py-2 md:py-3 shadow-sm border border-gray-200">
                    <input 
                      className="flex-1 outline-none text-gray-800 bg-transparent placeholder:text-gray-400 text-sm md:text-base"
                      placeholder={isRecording ? "Recording audio..." : "Type a message..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isRecording}
                    />
                    <div className="flex items-center gap-2 md:gap-3 text-gray-500">
                       <label className="cursor-pointer hover:text-emerald-600 transition">
                           <input type="file" className="hidden" onChange={handleFileUpload} />
                           <Paperclip size={18} className="md:w-5 md:h-5" />
                       </label>
                       <label className="cursor-pointer hover:text-emerald-600 transition">
                           <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                           <ImageIcon size={18} className="md:w-5 md:h-5" />
                       </label>
                    </div>
                 </div>
                 {newMessage.trim() ? (
                   <button 
                     onClick={handleSendMessage}
                     className="p-3 md:p-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:shadow-lg hover:scale-105 transition-all shadow-md"
                   >
                     <Send size={18} className="md:w-5 md:h-5" />
                   </button>
                 ) : (
                   <button 
                     onMouseDown={startRecording}
                     onMouseUp={stopRecording}
                     onTouchStart={startRecording}
                     onTouchEnd={stopRecording}
                     className={`p-3 md:p-3.5 rounded-2xl transition-all shadow-md hover:scale-105 ${
                       isRecording ? "bg-red-500 animate-pulse text-white" : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg"
                     }`}
                   >
                     <Mic size={18} className="md:w-5 md:h-5" />
                   </button>
                 )}
              </div>

              {/* Modals */}
              <AnimatePresence>
                  {/* Community Info Modal */}
                  {showInfoModal && (
                      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                          <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-emerald-100"
                          >
                              <div className="h-32 bg-gradient-to-r from-emerald-500 to-green-600 relative">
                                  <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition"><X size={20}/></button>
                              </div>
                              <div className="px-6 pb-6 -mt-10">
                                  <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl border-2 border-emerald-200">
                                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 overflow-hidden flex items-center justify-center font-bold text-2xl text-white">
                                          {selectedGroup.image ? <img src={selectedGroup.image} className="w-full h-full object-cover"/> : selectedGroup.name[0]}
                                      </div>
                                  </div>
                                  <h2 className="text-2xl font-bold text-gray-800 mt-3">{selectedGroup.name}</h2>
                                  <p className="text-emerald-600 font-semibold">{selectedGroup.topic}</p>
                                  
                                  <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                                      <h4 className="font-bold text-emerald-700 text-sm mb-2 uppercase tracking-wider">Description</h4>
                                      <p className="text-gray-600 text-sm leading-relaxed">{selectedGroup.description || "No description available."}</p>
                                  </div>

                                  <div className="mt-4 flex gap-4 text-center">
                                      <div className="flex-1 p-4 border border-emerald-100 rounded-2xl bg-emerald-50">
                                          <div className="text-2xl font-bold text-emerald-700">{selectedGroup.members?.length || 0}</div>
                                          <div className="text-xs text-emerald-600 uppercase font-semibold mt-1">Members</div>
                                      </div>
                                      <div className="flex-1 p-4 border border-emerald-100 rounded-2xl bg-emerald-50">
                                          <div className="text-2xl font-bold text-emerald-700">{new Date(selectedGroup.createdAt).getFullYear()}</div>
                                          <div className="text-xs text-emerald-600 uppercase font-semibold mt-1">Created</div>
                                      </div>
                                  </div>
                              </div>
                          </motion.div>
                      </div>
                  )}

                  {/* Members Modal */}
                  {showMembersModal && (
                      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                          <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl h-[60vh] flex flex-col border border-emerald-100"
                          >
                              <div className="p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 flex items-center justify-between">
                                  <h3 className="font-bold text-lg text-gray-800">Community Members</h3>
                                  <button onClick={() => setShowMembersModal(false)} className="text-emerald-600 hover:text-emerald-700 transition"><X size={20}/></button>
                              </div>
                              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                  {selectedGroup.members?.map((member) => (
                                      <div key={member._id || member} className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition">
                                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-white shadow-lg">
                                              {member.avatar ? <img src={member.avatar} className="w-full h-full rounded-xl object-cover"/> : (member.name?.[0] || 'U')}
                                          </div>
                                          <div>
                                              <div className="font-semibold text-gray-800 text-sm">{member.name || "Unknown User"}</div>
                                              <div className="text-xs text-emerald-600">Member</div>
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
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-emerald-50 to-green-50">
               <div className="w-64 h-64 bg-gradient-to-br from-emerald-200 to-green-300 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                 <Sparkles className="w-32 h-32 text-emerald-600" />
               </div>
               <h2 className="text-4xl font-bold text-gray-800 mb-3">AgriMitra Communities</h2>
               <p className="text-emerald-600 max-w-md text-lg">
                 Select a community to view discussions, share tips, and connect with other farmers.
               </p>
               <div className="mt-8 flex items-center gap-2 text-emerald-500 text-sm font-semibold">
                 <MapPin size={16} /> End-to-end encrypted
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
