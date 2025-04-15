import { useRef, useEffect } from "react";

export const useAudioVisualizer = (audioElement: HTMLAudioElement | null) => {
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (!audioElement || isSetupRef.current) return;

    try {
      contextRef.current = new AudioContext();
      sourceRef.current =
        contextRef.current.createMediaElementSource(audioElement);
      analyserRef.current = contextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(contextRef.current.destination);

      isSetupRef.current = true;
    } catch (error) {
      console.error("Audio setup error:", error);
    }

    return () => {
      if (contextRef.current) {
        contextRef.current.close();
      }
    };
  }, [audioElement]);

  return analyserRef.current;
};
