import ProgressBar from "./ProgressBar";
import WaveVisualizer from "./WaveVisualizer";

interface Track {
  id: string;
  name: string;
  url: string;
  duration: number;
  albumArt?: string;
}

interface Playlist {
  name: string;
  artist: string;
  year: number;
  tracks: Track[];
}

interface CurrentTrackProps {
  track: Track | null;
  playlist: Playlist | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
}

const CurrentTrack = ({
  track,
  playlist,
  currentTime,
  duration,
  onSeek,
  onPlayPause,
}: CurrentTrackProps) => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="h-[20vh] w-[65%] p-6 bg-white shadow-lg rounded-3xl">
      <div className="h-full flex flex-col justify-center">
        <div className="flex items-center justify-center mb-8">
          <svg
            className="w-8 h-8 text-primary-500 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <h1 className="text-3xl font-bold text-white">Wave</h1>
        </div>

        {track ? (
          <div className="flex flex-col items-center">
            <img
              src={track.albumArt || "https://via.placeholder.com/150"}
              alt={track.name}
              className="w-32 h-32 rounded-xl shadow-lg mb-6 cursor-pointer"
              onClick={onPlayPause}
            />
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{track.name}</h2>
              <p className="text-lg text-gray-600">{playlist?.artist}</p>
              <p className="text-gray-500">{playlist?.name}</p>
            </div>

            <div className="w-full max-w-md">
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={onSeek}
              />
            </div>

            <div className="mt-4">{/* <WaveVisualizer /> */}</div>
          </div>
        ) : (
          <div className="text-center text-gray-400">No track selected</div>
        )}
      </div>
    </div>
  </div>
);

export default CurrentTrack;
