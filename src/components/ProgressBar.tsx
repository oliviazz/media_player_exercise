interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
}

const ProgressBar = ({ currentTime, duration, onSeek }: ProgressBarProps) => {
  const progress = (currentTime / duration) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = duration * percentage;
    onSeek(newTime);
  };

  return (
    <div className="w-[65%] mx-auto">
      <div
        className="h-2 bg-gray-200 rounded-full cursor-pointer"
        onClick={handleClick}
      >
        <div
          className="h-2 bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default ProgressBar;
