import { useEffect, useRef } from "react";

interface WaveVisualizerProps {
  analyser: AnalyserNode;
}

const WaveVisualizer = ({ analyser }: WaveVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const dataArrayRef = useRef<Uint8Array>(
    new Uint8Array(analyser.frequencyBinCount)
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const dataArray = dataArrayRef.current;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      // Create smooth wave effect
      const sliceWidth = width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 4 + height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      // Complete the wave
      ctx.lineTo(width, height / 2);

      // Style the wave
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser]);

  return (
    <canvas ref={canvasRef} className="w-full h-16" width={1000} height={64} />
  );
};

export default WaveVisualizer;
