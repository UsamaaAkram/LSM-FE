import { useCallback, useEffect, useRef, useState } from "react";

const VideoPlayer = ({
  videoUrl,
  setWatchedSegments,
  watchedSegments,
  duration,
  setDuration,
  completed,
}: {
  videoUrl: string;
  setWatchedSegments: React.Dispatch<
    React.SetStateAction<{ start: number; end: number }[]>
  >;
  watchedSegments: { start: number; end: number }[];
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  completed?: boolean;
  //   onClose: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const maxAllowed = useRef(0);

  // Volume state
  const [volume, setVolume] = useState(1); // 0 to 1
  const [muted, setMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1); // remember volume before mute

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset player state when videoUrl changes
  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    maxAllowed.current = 0;
  }, [videoUrl]);

  // ─── Volume Handlers ───
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (muted) {
      // Unmute: restore previous volume (at least 0.1)
      const restoreVol = prevVolume > 0 ? prevVolume : 0.5;
      setVolume(restoreVol);
      setMuted(false);
      if (videoRef.current) {
        videoRef.current.volume = restoreVol;
        videoRef.current.muted = false;
      }
    } else {
      // Mute: save current volume, set to 0
      setPrevVolume(volume);
      setVolume(0);
      setMuted(true);
      if (videoRef.current) {
        videoRef.current.volume = 0;
        videoRef.current.muted = true;
      }
    }
  };

  // Volume icon based on level
  const getVolumeIcon = () => {
    if (muted || volume === 0) return "fa-volume-xmark";
    if (volume < 0.5) return "fa-volume-low";
    return "fa-volume-high";
  };

  // ─── Fullscreen Handlers ───
  const enterFullscreen = useCallback(async () => {
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen not supported:", err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Exit fullscreen failed:", err);
    }
  }, []);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Listen for fullscreen change (covers Esc key, browser chrome button, API calls)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Also handle Esc key explicitly for extra safety
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, exitFullscreen]);

  // ─── Existing Play/Pause/Seek Logic (unchanged) ───
  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };
  const handlePause = () => {
    setPlaying(false);
    videoRef.current?.pause();
  };

  const getLastWatched = () =>
    watchedSegments.length ? Math.max(...watchedSegments.map((s) => s.end)) : 0;

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current?.duration || 0);
    const lastWatched = getLastWatched();
    if (videoRef.current && lastWatched > 0) {
      videoRef.current.currentTime = lastWatched;
      setCurrent(lastWatched);
      maxAllowed.current = lastWatched;
    } else {
      setCurrent(0);
      maxAllowed.current = 0;
    }
    // Apply initial volume to video element
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  };

  const handleTimeUpdate = () => {
    const now = videoRef.current?.currentTime || 0;
    setCurrent(now);
    setWatchedSegments((segments) => {
      if (!segments.length || now > segments[segments.length - 1].end + 1) {
        return [...segments, { start: now, end: now }];
      }
      return [
        ...segments.slice(0, -1),
        { start: segments[segments.length - 1].start, end: now },
      ];
    });
    if (now > maxAllowed.current) maxAllowed.current = now;
  };

  const handleSeeking = () => {
    if (!videoRef.current) return;
    const now = videoRef.current.currentTime || 0;
    if (!completed && now > maxAllowed.current + 0.5) {
      videoRef.current.currentTime = maxAllowed.current;
    }
  };

  const handleCustomSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;
    if (completed || seekTime <= maxAllowed.current) {
      videoRef.current!.currentTime = seekTime;
      setCurrent(seekTime);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      ref={containerRef}
      style={{
        background: isFullscreen ? "#000" : "transparent",
        display: "flex",
        flexDirection: "column",
        ...(isFullscreen
          ? { height: "100vh", width: "100vw", justifyContent: "center" }
          : {}),
      }}
    >
      {/* Video */}
      <div
        style={{
          position: "relative",
          borderRadius: isFullscreen ? 0 : 8,
          overflow: "hidden",
          background: "#000",
          flex: isFullscreen ? 1 : "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          style={{
            display: "block",
            width: "100%",
            height: isFullscreen ? "100%" : "70vh",
            objectFit: "contain",
          }}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onPause={handlePause}
          onPlay={handlePlay}
          tabIndex={-1}
          disablePictureInPicture
          onContextMenu={handleContextMenu}
          onClick={!playing ? handlePlay : handlePause}
        />
        {/* Play icon overlay */}
        {!playing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
              zIndex: 10,
              background: "rgba(0,0,0,0.35)",
              borderRadius: "50%",
              padding: 18,
              fontSize: 36,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={handlePlay}
          >
            <i className="fa-solid fa-play fs-28" />
          </div>
        )}
        {/* Custom seek bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#eee",
            borderRadius: 2,
            cursor: "pointer",
          }}
          onClick={handleCustomSeek}
        >
          {watchedSegments.map((seg, i) => {
            if (!duration || seg.end <= seg.start) return null;
            const left = `${(seg.start / duration) * 100}%`;
            const width = `${((seg.end - seg.start) / duration) * 100}%`;
            return (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left,
                  width,
                  height: "100%",
                  background: "#00bffd",
                  borderRadius: 2,
                }}
              />
            );
          })}
          <span
            style={{
              position: "absolute",
              left: `${(current / duration) * 100}%`,
              width: 2,
              height: "100%",
              background: "#1976d2",
            }}
          />
        </div>
      </div>

      {/* ─── Controls Bar ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 12,
          padding: isFullscreen ? "0 24px 16px" : 0,
          flexWrap: "wrap",
        }}
      >
        {/* Play / Pause */}
        <button
          onClick={playing ? handlePause : handlePlay}
          className="btn btn-secondary px-3 gap-1 d-flex align-items-center"
        >
          {playing ? (
            <i className="fa-solid fa-pause fs-10" />
          ) : (
            <i className="fa-solid fa-play fs-10" />
          )}
          {playing ? "Pause" : "Play"}
        </button>

        {/* Time */}
        <span style={{ color: isFullscreen ? "#fff" : "inherit" }}>
          {formatTime(current)} / {formatTime(duration)}
        </span>

        {/* Volume Control */}
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={toggleMute}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36, padding: 0 }}
            title={muted ? "Unmute" : "Mute"}
          >
            <i className={`fa-solid ${getVolumeIcon()}`} />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>

        {/* Spacer to push fullscreen button to the right */}
        <div style={{ flex: 1 }} />

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
        >
          <i
            className={`fa-solid ${isFullscreen ? "fa-compress" : "fa-expand"}`}
          />
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>
    </div>
  );
};

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default VideoPlayer;
