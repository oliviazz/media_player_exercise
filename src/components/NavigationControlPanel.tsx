import React, { useState, useRef, useEffect } from "react";

interface IconProps {
  className?: string;
}

const ShuffleIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 3h5v5" />
    <path d="M4 20L21 3" />
    <path d="M21 16v5h-5" />
    <path d="M15 15l6 6" />
    <path d="M4 4l5 5" />
  </svg>
);

const PreviousIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
);

const PauseIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const PlayIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const NextIcon = ({ className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

const RepeatIcon = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M4 12v5h.582m15.356 2A8.001 8.001 0 004.582 17M20 12h-5.418"
    />
  </svg>
);

interface NavigationControlPanelProps {
  isPlaying: boolean;
  shuffle: boolean;
  onPlayPause: () => void;
  onShuffle: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const NavigationControlPanel = ({
  isPlaying,
  shuffle,
  onPlayPause,
  onShuffle,
  onNext,
  onPrevious,
}: NavigationControlPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const panelCurrentOffset = useRef<number>(0);

  const handleDragStart = (e: MouseEvent | TouchEvent) => {
    if (!panelRef.current) return;

    if ("touches" in e) {
      // If passive: true was used on listener, we might not be able to preventDefault here
      // Consider moving preventDefault to the touchmove listener if needed
    } else {
      e.preventDefault(); // Prevent text selection on mouse drag
    }

    setIsDragging(true);
    dragStartY.current = "touches" in e ? e.touches[0].clientY : e.clientY;

    const computedStyle = window.getComputedStyle(panelRef.current);
    const transformMatrix = new DOMMatrixReadOnly(computedStyle.transform);
    const currentPanelY = transformMatrix.m42;
    panelCurrentOffset.current = currentPanelY;

    console.log("[DragStart] Reading initial state:", {
      startY: dragStartY.current,
      readPanelY: currentPanelY,
      isExpandedState: isExpanded,
    });
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !panelRef.current) return;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const dragDeltaY = clientY - dragStartY.current;

    const initialPanelY = panelCurrentOffset.current;
    const targetY = initialPanelY + dragDeltaY;

    const remInPixels = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const collapsedPanelHeight = 6 * remInPixels;
    const collapsedPosition = window.innerHeight - collapsedPanelHeight;
    const fullyExpandedPosition = 0;

    const clampedY = Math.max(
      fullyExpandedPosition,
      Math.min(collapsedPosition, targetY)
    );

    console.log("[DragMove] Calculating position:", {
      clientY,
      dragDeltaY,
      initialPanelY,
      targetY,
      collapsedBoundary: collapsedPosition,
      clampedY,
    });

    panelRef.current.style.transform = `translateY(${clampedY}px)`;
  };

  const handleDragEnd = () => {
    if (!isDragging || !panelRef.current) return;
    setIsDragging(false);

    const computedStyle = window.getComputedStyle(panelRef.current);
    const transformMatrix = new DOMMatrixReadOnly(computedStyle.transform);
    const finalPanelTopPosition = transformMatrix.m42;

    const collapseThresholdY = window.innerHeight * 0.33;
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
        console.log("--> Collapsing");
        setIsExpanded(false);
      } else {
        console.log("--> Staying Expanded");
      }
    } else {
      if (verticalDragDistance > expandThresholdDistance) {
        console.log("--> Expanding");
        setIsExpanded(true);
      } else {
        console.log("--> Staying Collapsed");
      }
    }

    if (panelRef.current) {
      panelRef.current.style.transform = "";
    }
  };

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

  return (
    <>
      <svg width="0" height="0">
        <defs>
          <clipPath id="curvedTopPanel" clipPathUnits="objectBoundingBox">
            <path d="M 0,1 L 1,1 L 1,0.1 Q 0.5,-0.05 0,0.1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        ref={panelRef}
        className={`
          fixed left-0 right-0 bottom-0 w-full
          bg-primary-900/50 backdrop-blur-md
          transition-transform duration-300 ease-out
          ${isDragging ? "transition-none" : ""}
          ${isExpanded ? "translate-y-0" : "translate-y-[calc(100%-6rem)]"}
          flex flex-col
          overflow-hidden
        `}
        style={{
          height: "70vh",
          clipPath: "url(#curvedTopPanel)",
        }}
      >
        <div className="relative flex-shrink-0 h-24 flex flex-col items-center justify-start pt-4 px-4">
          <div
            ref={dragHandleRef}
            className="absolute top-0 left-0 w-full h-12 bg-transparent cursor-grab touch-none z-10"
            aria-label="Drag handle"
          />
          {/* <div className="w-10 h-1.5 bg-gray-400 rounded-full mt-2 opacity-50 pointer-events-none" /> */}
          <div className="flex items-center justify-center space-x-6 w-full mt-2 relative z-0">
            <button
              onClick={onShuffle}
              className={`p-1 rounded-full ${shuffle ? "text-accent" : "text-white"}`}
            >
              <ShuffleIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onPrevious}
              className="text-white p-1 rounded-full"
            >
              <PreviousIcon className="w-6 h-6" />
            </button>
            <button
              onClick={onPlayPause}
              className="bg-white text-primary-900 rounded-full p-2 mx-2 shadow-md"
            >
              {isPlaying ? (
                <PauseIcon className="w-8 h-8" />
              ) : (
                <PlayIcon className="w-8 h-8" />
              )}
            </button>
            <button onClick={onNext} className="text-white p-1 rounded-full">
              <NextIcon className="w-6 h-6" />
            </button>
            <button className="text-white p-1 rounded-full">
              <RepeatIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          className={`flex-grow overflow-y-auto transition-opacity duration-200 px-4 pb-4 ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        ></div>
      </div>
    </>
  );
};

export default NavigationControlPanel;
