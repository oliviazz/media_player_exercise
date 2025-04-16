interface Track {
  id: number; // We'll need to assign this when loading
  name: string; // Matches JSON
  url: string;
  duration?: number; // Matches JSON (optional if sometimes missing)
}

interface Playlist {
  id: number; // We'll need to assign this when loading
  name: string; // Matches JSON
  artist: string; // Matches JSON (assuming "artist:" is a typo for "artist")
  year?: number; // Optional
  tracks: Track[];
}

export type { Track, Playlist };
