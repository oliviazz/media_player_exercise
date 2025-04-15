import { useState, useRef, useEffect } from "react";

import NavigationControlPanel from "./components/NavigationControlPanel";
import CurrentTrack from "./components/CurrentTrack";

import playlists from "./data/playlists.json";
import { Track, Playlist } from "./types";

function App() {
  // === CORE AUDIO SYSTEM: Basic state for playback ===

  // Track, Playlist Meta Info
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);

  // Current Track Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // TBD.... Audio Analysis System ?
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [beatEnergy, setBeatEnergy] = useState(0);

  // ==================================================
  // Listeners to handle button toggles
  const playNextTrack = () => {
    if (!currentPlaylist || !currentTrack) {
      console.log("No playlist or track found");
      return;
    }

    const currentIndex = currentPlaylist.tracks.findIndex(
      (t) => t.url === currentTrack.url
    );
    const nextIndex = (currentIndex + 1) % currentPlaylist.tracks.length;
    setCurrentTrack(currentPlaylist.tracks[nextIndex]);
    setIsPlaying(true);
  };

  // could add a loop playlist or not state
  const playPreviousTrack = () => {
    if (!currentPlaylist || !currentTrack) return;

    const currentIndex = currentPlaylist.tracks.findIndex(
      (t) => t.url === currentTrack.url
    );
    const prevIndex =
      (currentIndex - 1 + currentPlaylist.tracks.length) %
      currentPlaylist.tracks.length;
    setCurrentTrack(currentPlaylist.tracks[prevIndex]);
    setIsPlaying(true);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // ==================================================
  // === TESTING: First verify playlists load correctly ===

  // ---------------------------------------------
  // EFFECT: LOADING THE PLAYLISTS
  useEffect(() => {
    console.log("Loading playlist:", playlists.playlists[0]);
    if (playlists.playlists.length > 0) {
      const firstPlaylist = playlists.playlists[0];
      setCurrentPlaylist({
        name: firstPlaylist.name,
        artist: firstPlaylist["artist:"],
        year: firstPlaylist.year,
        tracks: firstPlaylist.tracks.map((track) => ({
          id: track.name,
          name: track.name,
          url: track.url,
          duration: track.duration,
        })),
      });
      if (firstPlaylist.tracks.length > 0) {
        setCurrentTrack({
          id: firstPlaylist.tracks[0].name,
          name: firstPlaylist.tracks[0].name,
          url: firstPlaylist.tracks[0].url,
          duration: firstPlaylist.tracks[0].duration,
        });
      }
    }
    // Maybe add error catching with display module?
  }, []);

  // ---------------------------------------------
  // === CORE PLAYBACK: Keep this enabled to test basic audio ===
  // EFFECT: ACTUALLY PLAYING THE MUSIC
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise.catch((error) => {
            console.error("Playback failed:", error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]); // Add currentTrack to dependencies

  //
  // ---------------------------------------------
  // EFFECT: RESET TIME WHEN TRACK CHANGES
  useEffect(() => {
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [currentTrack]);

  //---------------------------------------------
  // Add this effect to auto-play when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      // If we're supposed to be playing, start playing the new track
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise.catch((error) => {
            console.error("Auto-play failed:", error);
          });
        }
      }
    }
  }, [currentTrack]); // This effect runs whenever the track changes

  // ---------------------------------------------
  // Getting experimentall... trying to get beat energy?
  useEffect(() => {
    if (!audioRef.current || !isPlaying) return;

    // Just detect volume changes for now, no AudioContext
    const updateEnergy = () => {
      if (audioRef.current) {
        // wait both of these are working though
        const volume = audioRef.current.volume;
        const time = audioRef.current.currentTime;
        console.log(volume, "volume", time, "time");
        setBeatEnergy(Math.abs(Math.sin(time * volume) * 100)); // Simple fake beat
      }
      // idk what this is
      requestAnimationFrame(updateEnergy);
      console.log("Beat energy:", beatEnergy);
    };

    const animation = requestAnimationFrame(updateEnergy);
    return () => cancelAnimationFrame(animation);
  }, [isPlaying]);
  // ---------------------------------------------
  // useEffect(() => {
  //   if (currentTrack) {
  //     console.log("Trying to load track:", {
  //       url: currentTrack.url,
  //       name: currentTrack.name,
  //     });

  //     // Test if URL is accessible
  //     fetch(currentTrack.url, { method: "HEAD" })
  //       .then((response) => {
  //         console.log("URL status:", response.status);
  //       })
  //       .catch((error) => {
  //         console.log("URL error:", error);
  //       });
  //   }
  // }, [currentTrack]);

  // // === START TEST: Minimal beat detection ===
  // const [energy, setEnergy] = useState(0);
  // const testContextRef = useRef<AudioContext | null>(null);
  // const testAnalyserRef = useRef<AnalyserNode | null>(null);

  // useEffect(() => {
  //   if (!audioRef.current || testContextRef.current) return; // Only create once

  //   try {
  //     testContextRef.current = new AudioContext();
  //     testAnalyserRef.current = testContextRef.current.createAnalyser();
  //     testAnalyserRef.current.fftSize = 32;

  //     const source = testContextRef.current.createMediaElementSource(
  //       audioRef.current
  //     );
  //     source.connect(testContextRef.current.destination);
  //     source.connect(testAnalyserRef.current);

  //     function detectBeat() {
  //       if (!testAnalyserRef.current) return;
  //       const data = new Uint8Array(testAnalyserRef.current.frequencyBinCount);
  //       testAnalyserRef.current.getByteFrequencyData(data);
  //       const avg = data.reduce((acc, val) => acc + val, 0) / data.length;
  //       setEnergy(avg);
  //       requestAnimationFrame(detectBeat);
  //     }

  //     detectBeat();
  //     console.log("Beat detection enabled");
  //   } catch (error) {
  //     console.log("Beat detection disabled:", error);
  //   }
  // }, []);
  // // === END TEST: Minimal beat detection ===

  // === AUDIO ANALYSIS SETUP: Currently causing playback issues ===
  /* useEffect(() => {
    if (!audioRef.current || analyserRef.current) return;

    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(audioContextRef.current.destination);
      sourceRef.current.connect(analyserRef.current);
      
      console.log('Audio analysis setup complete');
    } catch (error) {
      console.error('Audio setup error:', error);
    }
  }, []); */

  // Reset time when track changes

  // === START TEST: Debug playlist data ===
  // useEffect(() => {
  //   console.log("First track data:", {
  //     original: playlists.playlists[0].tracks[0],
  //     url: playlists.playlists[0].tracks[0].url,
  //   });
  // }, []);
  // === END TEST: Debug playlist data ===

  // === START TEST: Tiny beat energy ===

  // === END TEST: Tiny beat energy ===

  // === START AUDIO ANALYSIS TEST ===
  /*
  // These refs hold our audio analysis setup
  
  const audioContextRef = useRef<AudioContext | null>(null);  
   // Manages audio processing
  const analyserRef = useRef<AnalyserNode | null>(null);      
   // Analyzes frequency data
  const [realBeatEnergy, setRealBeatEnergy] = useState(0);     
  // Stores current beat energy

  // This effect sets up audio analysis when playing starts
  useEffect(() => {
    // Only set up if:
    // 1. We have an audio element (<audio> is mounted)
    // 2. Music is playing
    // 3. We haven't already set up analysis
    if (!audioRef.current || !isPlaying || audioContextRef.current) return;

    try {
      // Create new audio processing context
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;

      // Connect our <audio> element to the analyzer
      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      // Connect to speakers first (important!)
      source.connect(audioContextRef.current.destination);
      // Then connect to analyzer
      source.connect(analyserRef.current);

      // Start analyzing frequency data
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      function analyzeBeat() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setRealBeatEnergy(average);
        requestAnimationFrame(analyzeBeat);
      }
      analyzeBeat();

    } catch (error) {
      console.error('Audio analysis failed:', error);
    }

    // Clean up when component unmounts or playing stops
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isPlaying]);

  // Display the beat energy
  <div className="fixed bottom-4 right-4 text-xs text-white/50">
    real beat: {Math.round(realBeatEnergy)}
  </div>
  */
  // === END AUDIO ANALYSIS TEST ===

  // === END TEST: Debug audio loading ===

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-950 text-white">
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={playNextTrack}
      />
      <CurrentTrack
        track={currentTrack}
        playlist={currentPlaylist}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        onPlayPause={() => setIsPlaying(!isPlaying)}
      />

      <NavigationControlPanel
        isPlaying={isPlaying}
        shuffle={shuffle}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onShuffle={() => setShuffle(!shuffle)}
        onNext={playNextTrack}
        onPrevious={playPreviousTrack}
      />

      {/* === START TEST: Beat display === */}
      <div className="fixed bottom-4 right-4 text-xs text-white/50">
        {isPlaying && `energy: ${Math.round(beatEnergy)}`}
      </div>
      {/* === END TEST: Beat display === */}
    </div>
  );
}

export default App;
