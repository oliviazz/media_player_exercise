import { useEffect, useRef, useState } from "react";

export const useAudioTempo = (audioElement: HTMLAudioElement | null) => {
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    if (!audioElement || isSetup) return;

    try {
      // Create new context
      contextRef.current = new AudioContext();

      // Create and configure analyser
      analyserRef.current = contextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Create source and connect
      sourceRef.current =
        contextRef.current.createMediaElementSource(audioElement);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(contextRef.current.destination);

      // Create data array
      dataArrayRef.current = new Uint8Array(
        analyserRef.current.frequencyBinCount
      );

      setIsSetup(true);
      console.log("Audio context setup complete");
    } catch (error) {
      console.error("Audio setup error:", error);
    }
  }, [audioElement, isSetup]);

  const getInstantEnergy = () => {
    if (!analyserRef.current || !dataArrayRef.current) return 0;

    try {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const sum = dataArrayRef.current.reduce((acc, val) => acc + val, 0);
      const average = sum / dataArrayRef.current.length;
      console.log("Raw data:", Array.from(dataArrayRef.current)); // Debug line
      return average;
    } catch (error) {
      console.error("Error getting energy:", error);
      return 0;
    }
  };

  return getInstantEnergy;
};
