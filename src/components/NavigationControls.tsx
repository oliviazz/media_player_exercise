import React, { useState } from "react";
import ShuffleIcon from "./icons/ShuffleIcon";
import PauseIcon from "./icons/PauseIcon";
import PreviousIcon from "./icons/PreviousIcon";
import PlayIcon from "./icons/PlayIcon";
import NextIcon from "./icons/NextIcon";

interface NavigationControlPanelProps {
  isPlaying: boolean;
  shuffle: boolean;
  onPlayPause: () => void;
  onShuffle: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const NavigationControls = ({
  isPlaying,
  shuffle,
  onPlayPause,
  onShuffle,
  onNext,
  onPrevious,
}: NavigationControlsProps) => {
  const [isModalExpanded, setIsModalExpanded] = useState(false);

  return (
    <div
      className={`fixed left-0 right-0 transition-all duration-300 ease-in-out ${
        isModalExpanded
          ? "bottom-0 h-[70vh] bg-primary-900/50 backdrop-blur-md rounded-t-3xl"
          : "bottom-0 p-6 bg-primary-900/50 backdrop-blur-md"
      }`}
      onClick={() => setIsModalExpanded(!isModalExpanded)}
    >
      <div
        className={`max-w-2xl mx-auto ${isModalExpanded ? "h-full flex flex-col justify-center" : ""}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-1 bg-primary-400 rounded-full" />
        </div>

        <div
          className={`flex justify-center items-center space-x-8 ${isModalExpanded ? "flex-col space-y-8 space-x-0" : ""}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShuffle();
            }}
            className={`p-3 rounded-full transition-colors duration-200 ${
              shuffle
                ? "text-primary-300 hover:text-primary-200"
                : "text-primary-400 hover:text-primary-300"
            }`}
          >
            <ShuffleIcon className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="p-3 text-primary-200 hover:text-primary-100 transition-colors duration-200"
          >
            <PreviousIcon className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            className="p-4 bg-primary-500 rounded-full text-white hover:bg-primary-400 transition-colors duration-200"
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="p-3 text-primary-200 hover:text-primary-100 transition-colors duration-200"
          >
            <NextIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Additional content when expanded */}
        {isModalExpanded && (
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-primary-100 mb-4">
              Playlist
            </h2>
            <div className="text-primary-300">Coming soon...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationControls;
