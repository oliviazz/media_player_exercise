import React from "react";
import { Track, Playlist } from "../types"; // Make sure path is correct
import ProgressBar from "./ProgressBar"; // Assuming ProgressBar exists

interface CurrentTrackProps {
  track: Track | null;
  playlist: Playlist | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volumeGradient: number;
}

const CurrentTrackCard: React.FC<CurrentTrackProps> = ({
  track,
  playlist,
  currentTime,
  duration,
  onSeek,
  volumeGradient,
}) => {
  if (!track) {
    // Optional: Render a placeholder or nothing if no track is loaded
    return <div className="text-center text-gray-400">No track loaded</div>;
  }
  const adjustedVolume = volumeGradient * 0.4 + 0.6;
  const backgroundStyle = {
    // Use RGB for white (255, 255, 255) and volume for alpha
    backgroundColor: `rgba(255, 255, 255, ${adjustedVolume})`,
  };
  // console.log(playlist, track, "current track");

  return (
    // NO 'fixed' class on this outer div. It has margins and mx-auto.
    <div
      // Remove mb-* and ensure no my-* remains. Keep mt-* for space above CurrentTrack.
      className="w-full max-w-md p-4 md:p-6 bg-white shadow-xl rounded-2xl text-gray-900 mx-auto mt-12 md:mt-16 mb-0" // Explicitly set mb-0
      style={backgroundStyle}
    >
      {/* Inner content: flex flex-col items-center justify-center */}
      <div className="flex flex-col items-center justify-center">
        {track ? (
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-4 w-full px-1">
              <h2
                className="text-lg md:text-xl font-bold text-gray-900 truncate" // Reduced size
                title={track.name || "Unknown Track"}
              >
                {track.name || "Unknown Track"}
              </h2>
              <p
                className="text-sm md:text-base text-gray-600 truncate" // Reduced size
                title={playlist?.artist || "Unknown Artist"}
              >
                {playlist?.artist || "Unknown Artist"}
              </p>

              {playlist?.name && (
                <p
                  className="text-xs text-gray-500 truncate mt-1" // Reduced size
                  title={playlist.name}
                >
                  <i>{playlist.name} </i> | <i> {playlist.year} </i>
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full px-1">
              {" "}
              {/* Remove max-w here if container is already small */}
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={onSeek}
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No track selected
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentTrackCard;
