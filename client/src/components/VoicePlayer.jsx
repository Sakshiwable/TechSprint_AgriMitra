// components/VoicePlayer.jsx
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export default function VoicePlayer({ audioUrl, duration, isMine = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 py-2">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <button
        onClick={togglePlay}
        className={`p-2 rounded-full transition ${
          isMine
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-cyan-100 hover:bg-cyan-200 text-cyan-700"
        }`}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <div className="flex-1 flex items-center gap-2">
        <Volume2
          size={14}
          className={isMine ? "text-white/80" : "text-cyan-600"}
        />
        <div className="flex-1 bg-white/20 rounded-full h-2 relative overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isMine ? "bg-white/40" : "bg-cyan-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium ${
            isMine ? "text-white/90" : "text-slate-600"
          }`}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

