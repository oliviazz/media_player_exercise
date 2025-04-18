import { useState, useRef, useEffect, useMemo } from "react";

import NavigationControlPanel from "./components/NavigationControlPanel";
import CurrentTrackCard from "./components/CurrentTrackCard";
import playlistsRaw from "./data/playlists.json";
import { Track, Playlist } from "./types";
import { InfoIcon } from "./components/icons/Icons";

// --- Type definition for the session play counts store ---
// // --- Not used, but for storing leaderboard sessionStorage ---
// type PlayCounts = {
//   [playlistId: number]: {
//     [trackId: string]: number; // Key is Track ID (assuming it's a string), value is count
//   };
// };

// const PLAY_COUNTS_SESSION_KEY = "waveAppPlayCounts_Session"; // Use a distinct key
// --- Simple wave graphic calculation based on time of song ---
const DynamicGraphicPlaceholder: React.FC<{ beatEnergy: number }> = ({
  beatEnergy,
}) => {
  const calculateSinePath = (energy: number): string => {
    const width = 300; // SVG coordinate width
    const height = 100; // SVG coordinate height
    const centerY = height / 2;
    const points = [];
    // Normalize energy...
    const normalizedEnergy = Math.min(1, Math.max(0, energy / 150));
    // Parameters influenced by energy...
    const baseAmplitude = 5;
    const extraAmplitude = 35;
    const amplitude = baseAmplitude + normalizedEnergy * extraAmplitude;
    const frequency = 0.05;
    const pointsDensity = 5;

    for (let x = 0; x <= width; x += pointsDensity) {
      const y = centerY + Math.sin(x * frequency) * amplitude;
      points.push(`${x},${y.toFixed(2)}`);
    }
    if (points.length === 0) return "";
    return `M ${points[0]} L ${points.slice(1).join(" ")}`;
  };

  const sinePathData = useMemo(
    () => calculateSinePath(beatEnergy),
    [beatEnergy]
  );
  const strokeWidth = 1 + (beatEnergy / 150) * 2;

  return (
    <div className="w-full max-w-2xl mx-auto mt-0 mb-12 md:mt-0 md:mb-16 h-40 md:h-48">
      {/* SVG for Sine Wave */}
      <svg
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <path
          d={sinePathData} // Use the calculated path data
          fill="none"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth={strokeWidth.toFixed(2)}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

function App() {
  // Process Raw Data to create typed Playlist array
  const processedPlaylists: Playlist[] = playlistsRaw.playlists.map(
    (playlistData: any, index: number): Playlist => ({
      id: index, // Assign a simple numeric ID based on index
      name: playlistData.name,
      artist: playlistData["artist"] || "Unknown Artist", // Use correct key and provide default
      year: playlistData.year,
      // IMPORTANT: Use 'playlist' property name if that's the type definition
      // If type uses 'tracks', keep using 'tracks' here. Assuming 'tracks' for now based on later code.
      tracks: playlistData.tracks.map(
        (trackData: any, trackIndex: number): Track => ({
          // Ensure Track type definition expects these fields (string ID)
          id: trackIndex,
          name: trackData.name,
          url: trackData.url,
          duration: trackData.duration,
        })
      ),
    })
  );

  // Track, Playlist Meta Info
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(
    processedPlaylists.length > 0 ? processedPlaylists[0] : null
  );

  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  // Current Track Playback State

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  // analyserRef would be used to calculate beat for Sine Wave, if time
  // const analyserRef = useRef<AnalyserNode | null>(null);

  const [beatEnergy, setBeatEnergy] = useState(0);
  const [volume, setVolume] = useState(1); // Default volume: 1 (100%)
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // (This would be used to store play counts to display a leaderboard)
  // const [sessionPlayCounts, setSessionPlayCounts] = useState<PlayCounts>(() => {
  //   try {
  //     const storedCounts = sessionStorage.getItem(PLAY_COUNTS_SESSION_KEY); // Read from sessionStorage
  //     return storedCounts ? JSON.parse(storedCounts) : {}; // Parse stored JSON or default to {}
  //   } catch (error) {
  //     console.error("Error reading play counts from sessionStorage:", error);
  //     return {}; // Default to empty object on error
  //   }
  // });

  // ---------------------------------------------
  // Animation Helper: Dummy sine wave based on time, eventually sync to beat
  useEffect(() => {
    if (!audioRef.current || !isPlaying) return;
    const updateEnergy = () => {
      if (audioRef.current) {
        const volume = audioRef.current.volume;
        const time = audioRef.current.currentTime;
        setBeatEnergy(Math.abs(Math.sin(time) * 100)); // Simple fake beat
        setVolume(volume);
      }
      requestAnimationFrame(updateEnergy);
    };

    const animation = requestAnimationFrame(updateEnergy);
    return () => cancelAnimationFrame(animation);
  }, [isPlaying]);

  // Volume control - also affects div display
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  // ==================================================
  // Play Next Track
  const playNextTrack = () => {
    if (!currentPlaylist) return;

    setCurrentTrackIndex((prevIndex) => {
      const nextIndex =
        (prevIndex + 1 + currentPlaylist.tracks.length) %
        currentPlaylist.tracks.length;
      console.log("cur", prevIndex, "next", nextIndex, currentPlaylist);
      setIsPlaying(true);
      setCurrentTime(0);
      return nextIndex;
    });
  };

  const playPreviousTrack = () => {
    if (!currentPlaylist) return;

    setCurrentTrackIndex((prevIndex) => {
      const nextIndex =
        (prevIndex - 1 + currentPlaylist.tracks.length) %
        currentPlaylist.tracks.length;
      console.log("cur", prevIndex, "next", nextIndex, currentPlaylist);
      setIsPlaying(true);
      setCurrentTime(0);
      return nextIndex;
    });
  };

  // Adjust time of current track
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Set initial playlist and track
  useEffect(() => {
    console.log("Loading playlist:", playlistsRaw.playlists[0]);
    if (playlistsRaw.playlists.length > 0) {
      const firstPlaylist = playlistsRaw.playlists[0];
      setCurrentPlaylist({
        id: 0,
        name: firstPlaylist.name,
        artist: firstPlaylist["artist"],
        year: firstPlaylist.year,
        tracks: firstPlaylist.tracks.map((track: any, index: number) => ({
          id: index,
          name: track.name,
          url: track.url,
          duration: track.duration,
        })),
      });
      if (firstPlaylist.tracks.length > 0) {
        setCurrentTrack({
          id: currentTrackIndex,
          name: processedPlaylists[currentPlaylistIndex].tracks[
            currentTrackIndex
          ].name,
          url: processedPlaylists[currentPlaylistIndex].tracks[
            currentTrackIndex
          ].url,
          duration:
            processedPlaylists[currentPlaylistIndex].tracks[currentTrackIndex]
              .duration,
        });
      }
    }
    // If time better UX error catching - ie first track in Neither and Both is broken
  }, []);

  // ---------------------------------------------
  // Play the music
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // ---------------------------------------------
  //When current track changes, reset time to start from 0
  useEffect(() => {
    console.log("Track changed, resetting time for:", currentTrack?.name); // Optional log
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [currentTrack, currentTrackIndex]);

  //---------------------------------------------
  // When a new track is selected, play it
  useEffect(() => {
    if (audioRef.current && currentTrackIndex >= 0 && currentPlaylist) {
      // If we're supposed to be playing, start playing the new track
      setIsPlaying(true);
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise.catch((error) => {
            console.error("Auto-play failed:", error);
          });
        }
      }
    }
  }, [currentTrack, currentTrackIndex]);
  //---------------------------------------------
  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowLeft":
          event.preventDefault(); // prevent scrolling
          console.log("Left arrow pressed");
          playPreviousTrack();
          break;
        case "ArrowRight":
          event.preventDefault(); // prevent scrolling
          console.log("Right arrow pressed");
          playNextTrack();
          break;
        case "Space":
          event.preventDefault(); // prevent scrolling
          console.log("Space pressed");
          setIsPlaying((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // === Update useEffect for Track Changes ===
  // Reset time/duration and load new track
  useEffect(() => {
    if (
      currentPlaylist &&
      currentPlaylist.tracks.length > 0 &&
      currentPlaylistIndex >= currentPlaylist.tracks.length
    ) {
      setCurrentPlaylistIndex(0);
    }

    const trackToPlay = currentPlaylist?.tracks[currentTrackIndex] ?? null;
    if (audioRef.current && trackToPlay) {
      // Only change src and load if the track ID is actually different
      if (audioRef.current.src !== trackToPlay.url) {
        console.log(`Loading new track: ${trackToPlay.name}`);
        audioRef.current.src = trackToPlay.url;
        audioRef.current.load(); // Load the new source
        setCurrentTime(0);
        setDuration(0);
        if (isPlaying) {
          // If it was playing, try to play the new track
          audioRef.current
            .play()
            .catch((e) => console.error("Error playing new track:", e));
        }
      }
    } else if (audioRef.current && !trackToPlay) {
      // Handle case where playlist becomes empty or track is invalid
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [currentPlaylistIndex, currentPlaylist, currentTrackIndex]); // Depend on index and playlist object

  // For panel: handler for track selection
  const handleTrackSelection = (playlist: Playlist, trackIndex: number) => {
    console.log(`Track selected: ${playlist.name} - Index ${trackIndex}`);
    if (trackIndex !== -1) {
      setCurrentPlaylist(playlist); // Or playlists[playlistIndex]
      setCurrentTrackIndex(trackIndex);
      setCurrentTrack(playlist.tracks[trackIndex]);
      setCurrentTime(0);
      setIsPlaying(true); // Start playing the selected track
      console.log("currentTrack", currentTrack, playlist.tracks[trackIndex]);
    } else {
      console.error("Selected playlist not found in main list");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-primary-800 to-primary-950 text-white overflow-hidden h-full">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) =>
          !e.currentTarget.seeking &&
          setCurrentTime(e.currentTarget.currentTime)
        }
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={playNextTrack}
      />
      <div className="h-full overflow-y-auto pt-12 md:pt-16 pb-64 md:pb-72 px-4 flex flex-col items-center">
        <div className="text-center mb-1 mt-1">
          <svg className="w-10 h-10 text-white/80 mx-auto" />
          <h1 className="text-5xl md:text-6xl font-bold text-white/90 tracking-tight">
            wave
          </h1>
        </div>
        <CurrentTrackCard
          track={(currentPlaylist?.tracks[currentTrackIndex] as Track) ?? null}
          playlist={currentPlaylist}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volumeGradient={volume}
        />
        <DynamicGraphicPlaceholder beatEnergy={beatEnergy} />
      </div>{" "}
      {/* Navigation Control Panel, Draggable */}
      <NavigationControlPanel
        isPlaying={isPlaying}
        playListData={processedPlaylists}
        currentPlaylist={currentPlaylist}
        // currentTrack={
        //   (currentPlaylist?.tracks[currentTrackIndex] as Track) ?? null
        // }
        currentTrackIndex={currentTrackIndex}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={playNextTrack}
        onPrevious={playPreviousTrack}
        onTrackSelect={handleTrackSelection}
      />
      <div className="fixed top-4 right-4 text-xs text-white/50 z-20">
        <div className="flex items-center space-x-2">
          {" "}
          <span>Vol:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 accent-white/50 bg-white/20 rounded-full appearance-none cursor-pointer"
          />
          <button onClick={() => setShowInfoTooltip(!showInfoTooltip)}>
            <InfoIcon
              className={`w-4 h-4 ${showInfoTooltip ? "opacity-100" : "opacity-50"}`}
            />
          </button>
        </div>
        {showInfoTooltip && (
          <div
            className="absolute top-full right-0 mt-1 w-max max-w-xs p-3 bg-white/80 text-primary-900 text-xs rounded shadow-lg whitespace-pre-wrap z-30 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="list-disc list-inside space-y-1">
              <li>Pull menu up to view playlists</li>
              <li>Space toggles play/pause</li>
              <br></br>
              <i>By @oliviazz </i>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
