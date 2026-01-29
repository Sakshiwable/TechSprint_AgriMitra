import { useState, useEffect, useRef } from "react";
import { Send, X, Phone, Video, Paperclip, Mic, Image as ImageIcon, MapPin } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export default function ChatWindow({ otherUser, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // 1. Setup Socket
    const newSocket = io("http://localhost:4000"); // Adjust URL if needed
    setSocket(newSocket);

    newSocket.emit("join", currentUser._id); // Join my own room to receive

    newSocket.on("newDirectMessage", (msg) => {
       // Check if message belongs to this conversation
       if (
           (msg.fromUserId === otherUser._id && msg.toUserId === currentUser._id) || 
           (msg.fromUserId === currentUser._id && msg.toUserId === otherUser._id)
       ) {
           setMessages((prev) => {
               // Prevent dupes
               if (prev.find(m => m._id === msg._id)) return prev;
               return [...prev, msg];
           });
       }
    });

    return () => newSocket.disconnect();
  }, [currentUser._id, otherUser._id]);

  useEffect(() => {
      // 2. Fetch History
      fetchMessages();
  }, [otherUser._id]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
      try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`http://localhost:4000/api/chat/${otherUser._id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(res.data);
      } catch (err) {
          console.error("Failed to load messages", err);
      }
  };

  const sendMessage = async (content, type = "text") => {
      if (!content) return;
      try {
          const token = localStorage.getItem("token");
          await axios.post(`http://localhost:4000/api/chat/${otherUser._id}`, 
            { content, messageType: type },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setNewMessage("");
          // Note: Socket will handle adding it to list
      } catch (err) {
          console.error("Send error", err);
          toast.error("Failed to send");
      }
  };

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      
      const toastId = toast.loading("Uploading...");
      try {
          const formData = new FormData();
          formData.append("file", file);
          const token = localStorage.getItem("token");
          
          const uploadRes = await axios.post("http://localhost:4000/api/upload", formData, {
               headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
          });

          const isImage = file.type.startsWith("image/");
          await sendMessage(uploadRes.data.url, isImage ? "image" : "file");
          
          toast.success("Sent", { id: toastId });
      } catch (err) {
          toast.error("Upload failed", { id: toastId });
      }
  };

  // Audio Logic
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
      setIsRecording(true);
    } catch (err) {
      toast.error("Mic access denied");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const uploadAndSendAudio = async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "voice.webm");
      try {
          const res = await axios.post("http://localhost:4000/api/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" }
          });
          await sendMessage(res.data.url, "voice");
      } catch (err) {
          toast.error("Failed to send voice");
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#e5ddd5] w-full">
      {/* Header */}
      <div className="bg-white p-3 flex items-center justify-between border-b shadow-sm shrink-0">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  {otherUser.avatar ? (
                      <img src={otherUser.avatar} className="w-full h-full object-cover"/>
                  ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{otherUser.name[0]}</div>
                  )}
              </div>
              <div>
                  <h3 className="font-bold text-slate-800">{otherUser.name}</h3>
                  <p className="text-xs text-green-600 font-medium">Online</p>
              </div>
          </div>
          <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><Phone size={20}/></button>
              <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><Video size={20}/></button>
              <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500"><X size={20}/></button>
          </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
          {messages.map((msg) => {
              const isMe = msg.fromUserId === currentUser._id;
              return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] p-3 rounded-lg shadow-sm relative ${isMe ? "bg-teal-100 rounded-tr-none" : "bg-white rounded-tl-none"}`}>
                          {msg.messageType === "text" && <p className="text-sm text-slate-800">{msg.text}</p>}
                          {msg.messageType === "image" && (
                              <img src={`http://localhost:4000${msg.attachmentUrl}`} className="max-w-xs rounded-lg cursor-pointer" onClick={()=>window.open(`http://localhost:4000${msg.attachmentUrl}`)}/>
                          )}
                          {msg.messageType === "file" && (
                              <div onClick={()=>window.open(`http://localhost:4000${msg.attachmentUrl}`)} className="flex items-center gap-2 cursor-pointer underline text-blue-600">
                                  <Paperclip size={16}/> Attachment
                              </div>
                          )}
                          {msg.messageType === "voice" && (
                              <audio controls src={`http://localhost:4000${msg.voiceUrl}`} className="h-8 w-48"/>
                          )}
                          <span className="text-[10px] text-slate-400 block text-right mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </span>
                      </div>
                  </div>
              )
          })}
          <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 shrink-0">
         <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
             <input 
                className="flex-1 bg-transparent outline-none text-slate-700" 
                placeholder="Message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(newMessage)}
             />
             <div className="flex gap-2 text-slate-400">
                <label className="cursor-pointer hover:text-slate-600">
                    <input type="file" className="hidden" onChange={handleFileUpload}/>
                    <Paperclip size={18}/>
                </label>
                <label className="cursor-pointer hover:text-slate-600">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload}/>
                    <ImageIcon size={18}/>
                </label>
             </div>
         </div>
         {newMessage.trim() ? (
             <button onClick={() => sendMessage(newMessage)} className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 shadow-md transform active:scale-95 transition"><Send size={18}/></button>
         ) : (
             <button 
                onMouseDown={startRecording} onMouseUp={stopRecording}
                className={`p-3 rounded-full shadow-md text-white transition ${isRecording ? "bg-red-500 animate-pulse" : "bg-teal-600 hover:bg-teal-700"}`}
             ><Mic size={18}/></button>
         )}
      </div>
    </div>
  );
}
