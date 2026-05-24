import { useRef, useCallback, useState } from 'react';
import { createWorker, Worker } from 'tesseract.js';

export type RecogState = 'idle' | 'waiting' | 'recognizing' | 'done' | 'error';

interface Point {
  x: number;
  y: number;
}
export interface PenStroke {
  points: Point[];
  color: string;
  width: number;
}

export interface RecogResult {
  text: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HandwriteRecognition {
  state: RecogState;
  result: RecogResult | null;
  addStroke: (stroke: PenStroke) => void;
  cancel: () => void;
  accept: () => RecogResult | null;
  pendingStrokes: PenStroke[];
}

const DEBOUNCE_MS = 1400;
const PADDING = 20;
const MIN_DIM = 40;

export function useHandwriteRecognition(): HandwriteRecognition {
  const workerRef = useRef<Worker | null>(null);
  const initRef = useRef<Promise<Worker> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const [state, setState] = useState<RecogState>('idle');
  const [result, setResult] = useState<RecogResult | null>(null);
  const [pendingStrokes, setPendingStrokes] = useState<PenStroke[]>([]);
  const pendingRef = useRef<PenStroke[]>([]);

  // ── Worker (lazy init, cached) ────────────────────────────────────────────
  const getWorker = useCallback((): Promise<Worker> => {
    if (workerRef.current) return Promise.resolve(workerRef.current);
    if (initRef.current) return initRef.current;

    const p = createWorker('eng', 1, {
      workerPath: '/tesseract/worker.min.js',
      corePath: '/tesseract/tesseract-core-lstm.js',
      langPath: '/tesseract/lang',
      logger: () => {},
    }).then((w) => {
      workerRef.current = w;
      return w;
    });

    initRef.current = p;
    return p;
  }, []);

  // ── OCR pe canvas offscreen ───────────────────────────────────────────────
  const runRecognition = useCallback(async () => {
    const strokes = pendingRef.current;
    if (!strokes.length) {
      setState('idle');
      return;
    }

    // 1. Bounding box a tuturor stroke-urilor
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const s of strokes) {
      for (const p of s.points) {
        if (p.x < x0) x0 = p.x;
        if (p.y < y0) y0 = p.y;
        if (p.x > x1) x1 = p.x;
        if (p.y > y1) y1 = p.y;
      }
    }

    const bx = x0 - PADDING,
      by = y0 - PADDING;
    const bw = Math.max(x1 - x0 + PADDING * 2, MIN_DIM);
    const bh = Math.max(y1 - y0 + PADDING * 2, MIN_DIM);

    // 2. Render pe canvas alb (upscale pentru OCR mai bun)
    const scale = Math.max(3, 120 / Math.max(bw, bh));
    const oc = document.createElement('canvas');
    oc.width = Math.round(bw * scale);
    oc.height = Math.round(bh * scale);
    const ctx = oc.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, oc.width, oc.height);
    ctx.save();
    ctx.translate(-bx * scale, -by * scale);
    ctx.scale(scale, scale);
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const s of strokes) {
      if (s.points.length < 2) continue;
      ctx.lineWidth = Math.max(s.width * 1.2, 2.5);
      ctx.beginPath();
      s.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    }
    ctx.restore();

    // 3. OCR
    setState('recognizing');
    try {
      const worker = await getWorker();

      // PSM 7 = single line, PSM 8 = single word, PSM 13 = raw line
      await worker.setParameters({ tessedit_pageseg_mode: '7' } as never);

      const { data } = await worker.recognize(oc);
      const text = data.text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

      if (text && data.confidence > 15) {
        setResult({
          text,
          confidence: data.confidence,
          x: x0,
          y: y0,
          w: bw - PADDING * 2,
          h: bh - PADDING * 2,
        });
        setState('done');
      } else {
        setState('error');
      }
    } catch (err) {
      console.error('[OCR]', err);
      setState('error');
    }
  }, [getWorker]);

  const scheduleRecognition = useCallback(() => {
    clearTimeout(timerRef.current);
    setState('waiting');
    timerRef.current = setTimeout(runRecognition, DEBOUNCE_MS);
  }, [runRecognition]);

  const addStroke = useCallback(
    (stroke: PenStroke) => {
      const next = [...pendingRef.current, stroke];
      pendingRef.current = next;
      setPendingStrokes(next);
      scheduleRecognition();
    },
    [scheduleRecognition]
  );

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
    pendingRef.current = [];
    setPendingStrokes([]);
    setResult(null);
    setState('idle');
  }, []);

  const accept = useCallback((): RecogResult | null => {
    const r = result;
    cancel();
    return r;
  }, [result, cancel]);

  return { state, result, addStroke, cancel, accept, pendingStrokes };
}
