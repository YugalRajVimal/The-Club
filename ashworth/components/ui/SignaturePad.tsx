'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface SignaturePadHandle {
  /** Returns a base64 PNG data URL, or null if nothing has been drawn. */
  getDataUrl: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  onChange?: (hasSignature: boolean) => void;
  disabled?: boolean;
  height?: number;
  className?: string;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ onChange, disabled = false, height = 160, className = '' }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const drawingRef = useRef(false);
    const hasDrawnRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const [isEmptyState, setIsEmptyState] = useState(true);

    // Size the canvas backing store to the container's actual width and
    // device pixel ratio so strokes stay crisp on retina/mobile screens.
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const width = container.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1f1b16';
      }
    }, [height]);

    function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
      if (disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      lastPointRef.current = getPos(e);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
      if (!drawingRef.current || disabled) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !lastPointRef.current) return;

      const point = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      lastPointRef.current = point;

      if (!hasDrawnRef.current) {
        hasDrawnRef.current = true;
        setIsEmptyState(false);
        onChange?.(true);
      }
    }

    function endStroke(e: React.PointerEvent<HTMLCanvasElement>) {
      drawingRef.current = false;
      lastPointRef.current = null;
      canvasRef.current?.releasePointerCapture(e.pointerId);
    }

    function clear() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      hasDrawnRef.current = false;
      setIsEmptyState(true);
      onChange?.(false);
    }

    useImperativeHandle(ref, () => ({
      getDataUrl: () => {
        if (!hasDrawnRef.current || !canvasRef.current) return null;
        return canvasRef.current.toDataURL('image/png');
      },
      clear,
      isEmpty: () => !hasDrawnRef.current,
    }));

    return (
      <div ref={containerRef} className={className}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
          className={`w-full touch-none border border-gold-light/50 bg-ivory ${
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair'
          }`}
          style={{ height }}
          role="img"
          aria-label="Draw your signature here"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="font-sans text-[11px] text-ink/45">
            {isEmptyState ? 'Sign above with your mouse or finger' : 'Signature captured'}
          </span>
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="font-sans text-[11px] tracking-widest2 uppercase text-ink/50 hover:text-gold-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }
);

export default SignaturePad;