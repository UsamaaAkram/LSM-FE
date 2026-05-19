import { useEffect, useState } from "react";
import moment from "moment";

// Props: endDate in ISO string, optional onExpire callback
const LiveCountdown = ({
  endDate,
  onExpire,
}: {
  endDate: string;
  onExpire?: () => void;
}) => {
  const [diff, setDiff] = useState<number>(() =>
    Math.max(0, moment(endDate).diff(moment(), "seconds"))
  );

  useEffect(() => {
    if (diff <= 0) return;
    const interval = setInterval(() => {
      setDiff(Math.max(0, moment(endDate).diff(moment(), "seconds")));
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate, diff]);

  useEffect(() => {
    if (diff === 0 && onExpire) onExpire();
  }, [diff, onExpire]);

  const duration = moment.duration(diff, "seconds");
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return (
    <div className="mb-4">
      <div
        className="d-flex justify-content-center align-items-center gap-3 fs-36 fw-bold text-primary"
      >
        <span>{String(days).padStart(2, "0")}</span>
        <span>:</span>
        <span>{String(hours).padStart(2, "0")}</span>
        <span>:</span>
        <span>{String(minutes).padStart(2, "0")}</span>
        <span>:</span>
        <span>{String(seconds).padStart(2, "0")}</span>
      </div>
      <div
        className="d-flex justify-content-center align-items-center gap-4 fs-26 text-muted fw-semibold"
        style={{ letterSpacing: 2 }}
      >
        <span>DAY</span>
        <span>HOUR</span>
        <span>MIN</span>
        <span>SEC</span>
      </div>
      <p className="mt-2 text-center">
        You can retake this quiz after the countdown ends.
      </p>
    </div>
  );
};

export default LiveCountdown;