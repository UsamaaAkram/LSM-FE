import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const VDO_SCRIPT = "https://player.vdocipher.com/v2/api.js";

type Segment = { start: number; end: number };

// Loads the VdoCipher player SDK once, then resolves.
function loadVdoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).VdoPlayer) return resolve();
    const existing = document.querySelector(
      `script[src="${VDO_SCRIPT}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("vdo script")));
      if ((window as any).VdoPlayer) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = VDO_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("vdo script"));
    document.body.appendChild(s);
  });
}

// Renders a VdoCipher DRM player and tracks watch progress identically to the
// native VideoPlayer (same watchedSegments / duration props), so the existing
// lesson-watched save logic works unchanged. Fetches a short-lived OTP from our
// backend (which enforces enrollment + stamps the student's email watermark).
const VdoPlayer = ({
  vdoId,
  courseId,
  watchedSegments,
  setWatchedSegments,
  setDuration,
  completed,
}: {
  vdoId: string;
  courseId?: string;
  watchedSegments: Segment[];
  setWatchedSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  completed?: boolean;
}) => {
  const [embed, setEmbed] = useState<{ otp: string; playbackInfo: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  // Always-current furthest-watched point, used to resume on metadata load.
  const resumeRef = useRef<number>(0);
  // Furthest point the viewer is allowed to seek to (no skipping ahead).
  const maxAllowedRef = useRef<number>(0);
  // Latest `completed` flag — a finished lesson may be scrubbed freely.
  const completedRef = useRef<boolean>(!!completed);
  // JWT for the enrollment-gated OTP endpoint (other endpoints aren't gated).
  const token = useSelector((s: any) => s.auth?.token);

  useEffect(() => {
    completedRef.current = !!completed;
  }, [completed]);

  useEffect(() => {
    const last = watchedSegments.reduce((m, s) => Math.max(m, s.end), 0);
    if (last > resumeRef.current) resumeRef.current = last;
    if (last > maxAllowedRef.current) maxAllowedRef.current = last;
  }, [watchedSegments]);

  // 1) Fetch OTP + playbackInfo from our backend (enrollment-gated)
  useEffect(() => {
    let active = true;
    setEmbed(null);
    setError(null);
    axios
      .post(
        `${API_URL}/api/videos/${vdoId}/otp`,
        { courseId },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
      .then((res) => {
        if (active) setEmbed(res.data);
      })
      .catch((e) => {
        if (active)
          setError(e.response?.data?.error || "Unable to load protected video");
      });
    return () => {
      active = false;
    };
  }, [vdoId, courseId, token]);

  // 2) Once the iframe is rendered, attach the SDK + progress listeners
  useEffect(() => {
    if (!embed || !iframeRef.current) return;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    loadVdoScript()
      .then(() => {
        if (disposed || !iframeRef.current) return;
        const W = window as any;
        if (!W.VdoPlayer) return;
        const player = W.VdoPlayer.getInstance(iframeRef.current);
        const v = player.video; // HTMLVideoElement-like API

        const onMeta = () => {
          setDuration(v.duration || 0);
          // Resume from the furthest point already watched
          if (
            resumeRef.current > 0 &&
            v.duration &&
            resumeRef.current < v.duration
          ) {
            try {
              v.currentTime = resumeRef.current;
            } catch {
              /* ignore */
            }
          }
          maxAllowedRef.current = Math.max(
            maxAllowedRef.current,
            resumeRef.current
          );
        };
        const onTime = () => {
          const now = v.currentTime || 0;
          // Normal forward playback extends the allowed point
          if (now > maxAllowedRef.current) maxAllowedRef.current = now;
          setWatchedSegments((segments) => {
            if (!segments.length || now > segments[segments.length - 1].end + 1) {
              return [...segments, { start: now, end: now }];
            }
            return [
              ...segments.slice(0, -1),
              { start: segments[segments.length - 1].start, end: now },
            ];
          });
        };
        // Block skipping ahead: snap back to the furthest watched point.
        const onSeek = () => {
          if (
            !completedRef.current &&
            v.currentTime > maxAllowedRef.current + 1
          ) {
            try {
              v.currentTime = maxAllowedRef.current;
            } catch {
              /* ignore */
            }
          }
        };

        v.addEventListener("loadedmetadata", onMeta);
        v.addEventListener("timeupdate", onTime);
        v.addEventListener("seeking", onSeek);
        v.addEventListener("seeked", onSeek);
        cleanup = () => {
          v.removeEventListener("loadedmetadata", onMeta);
          v.removeEventListener("timeupdate", onTime);
          v.removeEventListener("seeking", onSeek);
          v.removeEventListener("seeked", onSeek);
        };
      })
      .catch(() => setError("Failed to load the secure video player"));

    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, [embed, setDuration, setWatchedSegments]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!embed)
    return (
      <div className="text-center py-5">
        <span className="spinner-border" />
      </div>
    );

  return (
    <div style={{ position: "relative", paddingTop: "56.25%" }}>
      <iframe
        ref={iframeRef}
        title="course-video"
        src={`https://player.vdocipher.com/v2/?otp=${embed.otp}&playbackInfo=${embed.playbackInfo}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: 0,
          borderRadius: 8,
        }}
        allow="encrypted-media"
        allowFullScreen
      />
    </div>
  );
};

export default VdoPlayer;
