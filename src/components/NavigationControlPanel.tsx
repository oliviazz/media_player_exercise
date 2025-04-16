import React, { useState, useRef, useEffect } from "react";
import { Playlist } from "../types"; // Import types
import { PreviousIcon, PauseIcon, PlayIcon, NextIcon } from "./icons/Icons";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface NavigationControlPanelProps {
  isPlaying: boolean;
  playListData: Playlist[]; // Playlist[] type from App.tsx
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onTrackSelect: (playlist: Playlist, trackIndex: number) => void;
  currentPlaylist: Playlist | null;
  currentTrackIndex: number;
}

const NavigationControlPanel: React.FC<NavigationControlPanelProps> = ({
  isPlaying,
  playListData,
  onPlayPause,
  onNext,
  onPrevious,
  onTrackSelect,
  currentPlaylist,
  currentTrackIndex,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const panelCurrentOffset = useRef<number>(0);

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  // ---------------------------------------------
  // Start Panel Drag Functions
  // ---------------------------------------------
  const handleDragStart = (e: MouseEvent | TouchEvent) => {
    if (!panelRef.current) return;
    if ("touches" in e) {
      // If passive: true was used on listener, we might not be able to preventDefault here
    } else {
      e.preventDefault(); // Prevent text selection on mouse drag
    }

    setIsDragging(true);

    dragStartY.current = "touches" in e ? e.touches[0].clientY : e.clientY;
    const computedStyle = window.getComputedStyle(panelRef.current);
    const transformMatrix = new DOMMatrixReadOnly(computedStyle.transform);
    const currentPanelY = transformMatrix.m42;
    panelCurrentOffset.current = currentPanelY;

    console.log("[DragStart] Reading initial state on drag:", {
      startY: dragStartY.current,
      readPanelY: currentPanelY,
      isExpandedState: isExpanded,
    });
  };

  // listeners for dragging
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !panelRef.current) return;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const dragDeltaY = clientY - dragStartY.current;
    const initialPanelY = panelCurrentOffset.current;
    const targetY = initialPanelY + dragDeltaY;

    const remInPixels = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const collapsedPanelHeight = 10 * remInPixels;
    const collapsedPosition = window.innerHeight - collapsedPanelHeight;
    const fullyExpandedPosition = 0;

    const clampedY = Math.max(
      fullyExpandedPosition,
      Math.min(collapsedPosition, targetY)
    );
    // (Can use for debugging)
    // console.log("[DragMove] Calculating position:", {
    //   clientY,
    //   dragDeltaY,
    //   initialPanelY,
    //   targetY,
    //   collapsedBoundary: collapsedPosition,
    //   clampedY,
    // });

    panelRef.current.style.transform = `translateY(${clampedY}px)`;
  };

  // listeners for dragging
  const handleDragEnd = () => {
    if (!isDragging || !panelRef.current) return;
    setIsDragging(false);

    const computedStyle = window.getComputedStyle(panelRef.current);
    const transformMatrix = new DOMMatrixReadOnly(computedStyle.transform);
    const finalPanelTopPosition = transformMatrix.m42;

    // Collaps back to bottom if the panel is dragged down >25% of screen height
    const collapseThresholdY = window.innerHeight * 0.25;
    // Expand back to top if the panel is dragged up < 15% of screen height
    const expandThresholdDistance = window.innerHeight * 0.15;
    const initialPanelY = panelCurrentOffset.current;
    const verticalDragDistance = initialPanelY - finalPanelTopPosition;

    console.log("[DragEnd] Deciding action:", {
      finalPanelTopPosition,
      initialPanelY,
      collapseThresholdY,
      expandThresholdDistance,
      verticalDragDistance,
      isCurrentlyExpanded: isExpanded,
    });

    if (isExpanded) {
      if (finalPanelTopPosition > collapseThresholdY) {
        console.log("--> Collapsing, dragged down > 25% of screen height");
        setIsExpanded(false);
      } else {
        console.log("--> Staying Expanded");
      }
    } else {
      if (verticalDragDistance > expandThresholdDistance) {
        console.log("--> Expanding");
        setIsExpanded(true);
      } else {
        console.log("--> Staying Collapsed, dragged up < 15% of screen height");
      }
    }
    if (panelRef.current) {
      panelRef.current.style.transform = "";
    }
  };

  // Listeners for dragging
  useEffect(() => {
    const handleElement = dragHandleRef.current;
    const panelElement = panelRef.current;

    if (!handleElement || !panelElement) return;
    const handleMouseDown = (e: MouseEvent) => handleDragStart(e);
    const handleTouchStart = (e: TouchEvent) => {
      handleDragStart(e);
    };

    handleElement.addEventListener("mousedown", handleMouseDown);
    handleElement.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchend", handleDragEnd);
    window.addEventListener("mouseleave", handleDragEnd);

    return () => {
      handleElement.removeEventListener("mousedown", handleMouseDown);
      handleElement.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchend", handleDragEnd);
      window.removeEventListener("mouseleave", handleDragEnd);
    };
  }, [isDragging, isExpanded]);

  // ---------------------------------------------
  // EndPanel Drag Functions
  // ---------------------------------------------

  // --- Handlers for Menu Navigation ---
  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  };

  const handleTrackItemClick = (trackIndex: number) => {
    if (selectedPlaylist) {
      onTrackSelect(selectedPlaylist, trackIndex);
    }
  };

  // Start of render
  return (
    <div
      ref={panelRef}
      className={`
        fixed inset-x-0 bottom-0
        w-screen
        mx-0 mt-2 py-2 px-0
        /* Base background */
        bg-primary-800/40
        /* Background on hover - increase opacity */
        hover:bg-primary-800/50
        backdrop-blur-md
        rounded-t-xl
        transition-transform duration-300 ease-out
        transition-colors duration-200 ease-in-out /* Smooth transition for background */
        ${isDragging ? "transition-none" : ""}
        ${isExpanded ? "translate-y-0" : "translate-y-[calc(100%-7rem)]"}
        flex flex-col
        overflow-hidden
      `}
      style={{
        height: "60vh",
        borderTopLeftRadius: "50px",
        borderTopRightRadius: "50px",
      }}
    >
      <div className="relative flex-shrink-0 h-24 flex flex-col items-center justify-start pt-2 px-4">
        {/* Clear draggable handle for panel */}
        <div
          ref={dragHandleRef}
          className="absolute top-0 left-0 w-full h-12 bg-transparent cursor-grab touch-none z-10"
          aria-label="Drag handle"
        />

        <div className="absolute left-1/2 pt-1 top-4 transform -translate-x-1/2 z-20 flex items-center justify-center space-x-4">
          <button
            onClick={onPrevious}
            className="text-white p-2 rounded-full focus:outline-none"
          >
            <PreviousIcon className="w-6 h-6" />
          </button>
          <button
            onClick={onPlayPause}
            className="text-white p-2 focus:outline-none group"
          >
            {isPlaying ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIcon className="w-8 h-8" />
            )}
          </button>
          <button
            onClick={onNext}
            className="text-white p-2 rounded-full focus:outline-none"
          >
            <NextIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main content  */}
      <div
        className={`flex flex-row flex-grow overflow-hidden transition-opacity duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Left column: showing playlists */}
        <div className="w-2/5 border-r border-white/10 overflow-y-auto p-4 h-full flex flex-col items-center">
          <ul className="space-y-2 w-full max-w-xs">
            {Array.isArray(playListData) &&
              playListData.map((playlist) => {
                const isCurrentPlaylist = currentPlaylist?.id === playlist.id;
                const isSelected = selectedPlaylist?.name === playlist.name;
                return (
                  <li
                    key={playlist.id}
                    onClick={() => handlePlaylistSelect(playlist)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors truncate ${
                      isSelected
                        ? "bg-white/50 text-white"
                        : "bg-white/5 hover:bg-white/40 text-white/80"
                    }`}
                  >
                    <p
                      className={`p-2 rounded-lg cursor-pointer transition-colors truncate ${
                        isCurrentPlaylist ? "text-blue" : "text-white"
                      }`}
                    >
                      {playlist.name}
                    </p>
                    <p className="text-xs text-white/60">
                      {playlist.artist || "Unknown"} | {playlist.year} 〰{" "}
                      {Array.isArray(playlist.tracks)
                        ? playlist.tracks.length
                        : 0}{" "}
                      tracks
                    </p>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Right Column: tracks */}
        <div className="w-3/5 p-4 h-full flex flex-col">
          {selectedPlaylist ? (
            <>
              <div className="flex-shrink-0 w-full mb-4 bg-white/40 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white text-left truncate w-full">
                  {selectedPlaylist.name}
                </h3>
                <p className="text-sm text-white/40 text-left w-full mt-1">
                  {selectedPlaylist.artist} | {selectedPlaylist.year}
                </p>
              </div>

              <div className="flex-grow overflow-y-auto w-full max-w-md mx-auto relative">
                <ul className="space-y-1 w-full">
                  {selectedPlaylist.tracks.map((track, index) => {
                    // This calculation needs props passed down or state from App.tsx
                    // Temporarily commenting out until props are added
                    const isCurrentTrack =
                      currentPlaylist?.id === selectedPlaylist.id &&
                      index === currentTrackIndex;
                    return (
                      <li
                        key={track.id}
                        onClick={() => handleTrackItemClick(index)}
                        className={`p-2 rounded cursor-pointer transition-colors truncate ${
                          isCurrentTrack
                            ? "bg-primary-500/10 backdrop-blur-sm text-white" // Style for current track with blur
                            : "hover:bg-white/10 text-white/90" // Default style
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          {/* Use tabular-nums for consistent number width */}
                          <span className="w-6 text-right mr-2 tabular-nums">
                            {index + 1}.
                          </span>
                          <span className="flex-grow text-left">
                            {track.name}
                          </span>
                          {/* Use tabular-nums */}
                          <span className="ml-2 tabular-nums">
                            {formatTime(track.duration || 0)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/50">
              <p>Select a playlist to display track</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default NavigationControlPanel;
