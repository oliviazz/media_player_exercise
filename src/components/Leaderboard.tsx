import React from "react";

// Define the structure for a single leaderboard entry
interface LeaderboardEntry {
  rank: number;
  trackTitle: string;
  playCount: number;
  playlistTitle: string;
  artist: string;
}

// Define the props for the Leaderboard component
interface LeaderboardProps {
  leaderboardData: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData }) => {
  if (!leaderboardData || leaderboardData.length === 0) {
    return null; // Don't render anything if there's no data
  }

  return (
    // Container: REMOVED bg-white/10, backdrop-blur-sm. INCREASED vertical margin my-24 (or higher if needed)
    <div className="w-full max-w-xl mx-auto my-24 p-6 rounded-lg text-white">
      {" "}
      {/* Keep padding, rounding, text color */}
      <h3 className="text-2xl font-semibold text-center mb-6">
        Top Tracks This Session
      </h3>
      <div className="space-y-3">
        {leaderboardData.map((entry, index) => (
          <div
            key={entry.rank}
            // List Item: Flex layout, vertical alignment, padding, bottom border (except last)
            className={`flex items-center justify-between py-3 ${index < leaderboardData.length - 1 ? "border-b border-white/20" : ""}`}
          >
            {/* Rank */}
            <span className="text-lg font-bold w-8 text-center text-white/80 flex-shrink-0">
              {entry.rank}.
            </span>

            {/* Track Info (takes up remaining space) */}
            <div className="flex-grow mx-4 overflow-hidden">
              {" "}
              {/* overflow-hidden for truncation */}
              <p className="font-medium truncate" title={entry.trackTitle}>
                {entry.trackTitle}
              </p>
              <p
                className="text-sm text-white/70 truncate"
                title={`${entry.artist} • ${entry.playlistTitle}`}
              >
                {entry.artist} • {entry.playlistTitle}
              </p>
            </div>

            {/* Play Count */}
            <span className="text-lg font-semibold w-16 text-right text-white/80 flex-shrink-0">
              {entry.playCount} <span className="text-xs">plays</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
