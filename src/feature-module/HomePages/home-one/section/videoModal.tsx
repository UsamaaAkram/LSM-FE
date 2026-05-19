import { useRef, useState } from "react";
import { Modal } from "react-bootstrap";

const VideoModal = ({
  show,
  handleClose,
  videoUrl,
  setWatchedSegments,
  watchedSegments,
  duration,
  setDuration,
  completed, // <-- Add completed prop!
}: {
  show: boolean;
  handleClose: any;
  videoUrl: string;
  setWatchedSegments: React.Dispatch<
    React.SetStateAction<{ start: number; end: number }[]>
  >;
  watchedSegments: { start: number; end: number }[];
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  completed?: boolean; // <-- typed as optional boolean
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const maxAllowed = useRef(0); // highest second allowed to seek to

  // Play/Pause handlers
  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };
  const handlePause = () => {
    setPlaying(false);
    videoRef.current?.pause();
  };

  // When metadata loads, grab duration
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
  };

  // On time update: track watched and limit maxAllowed
  const handleTimeUpdate = () => {
    const now = videoRef.current?.currentTime || 0;
    setCurrent(now);
    // Add/merge segment
    setWatchedSegments((segments) => {
      if (!segments.length || now > segments[segments.length - 1].end + 1) {
        // New segment (eg: after pause)
        return [...segments, { start: now, end: now }];
      }
      // Otherwise, grow last segment
      return [
        ...segments.slice(0, -1),
        { start: segments[segments.length - 1].start, end: now },
      ];
    });
    // Update max allowed seek time
    if (now > maxAllowed.current) maxAllowed.current = now;
  };

  // Block forward skipping: if seek goes past allowed, reset
  const handleSeeking = () => {
    if (!videoRef.current) return;
    const now = videoRef.current.currentTime || 0;
    if (!completed && now > maxAllowed.current + 0.5) {
      videoRef.current.currentTime = maxAllowed.current;
    }
  };

  // Seek bar (only allow seek backwards)
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

  // Disable context menu (right click) for video
  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();
  return (
    <Modal show={show} centered size="lg">
      <Modal.Header closeButton={true} onHide={handleClose}>
        <Modal.Title></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div style={{ position: "relative" }}>
            <video
              ref={videoRef}
              src={videoUrl}
              style={{ display: "block", width: "100%", height: "65vh" }}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onSeeking={handleSeeking}
              onPause={handlePause}
              onPlay={handlePlay}
              tabIndex={-1}
              // controls={false}
              disablePictureInPicture
              // controlsList="nodownload nopictureinpicture noplaybackrate"
              onContextMenu={handleContextMenu}
              onClick={!playing ? handlePlay : handlePause}
            />
            {/* Play icon overlay */}
            {!playing && (
              <div
                className="play-icon"
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
            {/* Custom watched (green) bar */}
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
              {/* Watched segments in green */}
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
              {/* Current time marker */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 16,
            }}
          >
            <button
              onClick={playing ? handlePause : handlePlay}
              style={{ padding: 8 }}
              className="btn btn-secondary px-3 gap-1 d-flex align-items-center"
            >
              {playing ? (
                <i className="fa-solid fa-pause fs-10" />
              ) : (
                <i className="fa-solid fa-play fs-10" />
              )}
              {playing ? "Pause" : "Play"}
            </button>
            <span>
              {formatTime(current)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}
export default VideoModal;
