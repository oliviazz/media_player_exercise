import { useEffect, useRef, useState } from "react";

interface SimpleVisualizerProps {
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const SimpleVisualizer = ({ isPlaying, audioRef }: SimpleVisualizerProps) => {
  const [currentEnergy, setCurrentEnergy] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const requestRef = useRef<number>();
  const setupDoneRef = useRef(false);

  // One-time setup of audio context
  useEffect(() => {
    if (!audioRef.current || setupDoneRef.current) return;

    const setupAudio = async () => {
      try {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 32;

        if (!audioRef.current) return;

        sourceRef.current = audioContextRef.current.createMediaElementSource(
          audioRef.current
        );
        sourceRef.current.connect(audioContextRef.current.destination); // Connect to speakers first
        sourceRef.current.connect(analyserRef.current); // Then connect to analyzer

        setupDoneRef.current = true;
        console.log("Audio setup complete");
      } catch (error) {
        console.error("Audio setup error:", error);
      }
    };

    setupAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Animation effect
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;

    const animate = () => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average =
        dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      setCurrentEnergy(average);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  // Only render if setup is complete
  if (!setupDoneRef.current) return null;

  return (
    <div className="fixed bottom-40 left-0 right-0 flex justify-center items-center">
      <div className="bg-white/10 p-4 rounded-lg">
        <div>Energy: {currentEnergy.toFixed(2)}</div>
        <div
          className="h-2 bg-white mt-2 transition-all duration-100"
          style={{ width: `${currentEnergy}px` }}
        />
      </div>
    </div>
  );
};

export default SimpleVisualizer;
