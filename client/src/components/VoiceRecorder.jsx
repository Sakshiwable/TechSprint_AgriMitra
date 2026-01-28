// components/VoiceRecorder.jsx
import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceRecorder({ onSend, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        
        // Calculate duration
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
        };
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied. Please allow microphone access to record voice messages.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSend = async () => {
    if (audioBlob) {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result;
        onSend(base64Audio, duration);
        // Reset
        setAudioBlob(null);
        setAudioUrl(null);
        setDuration(0);
        setRecordingTime(0);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
      reader.readAsDataURL(audioBlob);
    }
  };

  const handleCancel = () => {
    stopRecording();
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (onCancel) {
      onCancel();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {!isRecording && !audioBlob && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={startRecording}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
            title="Record voice message"
          >
            <Mic size={20} />
          </motion.button>
        )}

        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-full px-4 py-2"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-red-700">
              {formatTime(recordingTime)}
            </span>
            <button
              onClick={stopRecording}
              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              <Square size={16} />
            </button>
          </motion.div>
        )}

        {audioBlob && !isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-3 py-2"
          >
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={(e) => {
                // Optional: show playback progress
              }}
            />
            <button
              onClick={playAudio}
              className="p-1.5 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span className="text-sm font-medium text-cyan-700">
              {formatTime(duration)}
            </span>
            <button
              onClick={handleSend}
              className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
              title="Send voice message"
            >
              <Send size={14} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

