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

export type { Track, Playlist };
