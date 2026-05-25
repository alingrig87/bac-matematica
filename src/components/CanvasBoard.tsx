import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GeomKind, GeomItem, SHAPE_GROUPS, drawGeom, drawGeomPreview } from '../shapes';
import { SUBIECTE } from '../data/subiecte';

// ─── Types ────────────────────────────────────────────────────────────────────

type PenTool = 'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'text' | 'geom' | 'move';
type Point = { x: number; y: number };

interface PenItem {
  kind: 'pen' | 'eraser';
  color: string;
  width: number;
  points: Point[];
}
interface ShapeItem {
  kind: 'line' | 'rect' | 'circle';
  color: string;
  width: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
interface TextItem {
  kind: 'text';
  color: string;
  fontSize: number;
  x: number;
  y: number;
  content: string;
}
interface ImageItem {
  kind: 'image';
  id: string;
  dataURL: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
type DrawItem = PenItem | ShapeItem | TextItem | GeomItem | ImageItem;

interface ShapePreview {
  kind: 'line' | 'rect' | 'circle';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// ─── Image cache (module-level) ───────────────────────────────────────────────
const _imgCache = new Map<string, HTMLImageElement>();
function preloadImg(id: string, dataURL: string, onLoad: () => void) {
  if (_imgCache.has(id)) {
    onLoad();
    return;
  }
  const img = new Image();
  img.onload = () => {
    _imgCache.set(id, img);
    onLoad();
  };
  img.src = dataURL;
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawItem(ctx: CanvasRenderingContext2D, item: DrawItem) {
  ctx.save();
  switch (item.kind) {
    case 'geom':
      drawGeom(ctx, item.geomKind, item.color, item.width, item.x1, item.y1, item.x2, item.y2);
      ctx.restore();
      return;
    case 'pen':
      ctx.strokeStyle = (item as PenItem).color;
      ctx.lineWidth = (item as PenItem).width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      (item as PenItem).points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.stroke();
      break;
    case 'eraser':
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = (item as PenItem).width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      (item as PenItem).points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.stroke();
      break;
    case 'line': {
      const s = item as ShapeItem;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      break;
    }
    case 'rect': {
      const s = item as ShapeItem;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.strokeRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
      break;
    }
    case 'circle': {
      const s = item as ShapeItem;
      const cx = (s.x1 + s.x2) / 2,
        cy = (s.y1 + s.y2) / 2;
      const rx = Math.abs(s.x2 - s.x1) / 2,
        ry = Math.abs(s.y2 - s.y1) / 2;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'text': {
      const t = item as TextItem;
      ctx.fillStyle = t.color;
      ctx.font = `${t.fontSize}px sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(t.content, t.x, t.y);
      break;
    }
    case 'image': {
      const img = _imgCache.get(item.id);
      if (img) {
        ctx.drawImage(img, item.x, item.y, item.w, item.h);
      } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.fillStyle = '#aaa';
        ctx.font = '14px sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText('⏳ Se încarcă...', item.x + 12, item.y + 12);
      }
      break;
    }
  }
  ctx.restore();
}

function drawShapePreview(
  ctx: CanvasRenderingContext2D,
  s: ShapePreview,
  color: string,
  width: number
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash([6, 4]);
  switch (s.kind) {
    case 'line':
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      break;
    case 'rect':
      ctx.strokeRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
      break;
    case 'circle': {
      const cx = (s.x1 + s.x2) / 2,
        cy = (s.y1 + s.y2) / 2;
      const rx = Math.abs(s.x2 - s.x1) / 2,
        ry = Math.abs(s.y2 - s.y1) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

function redrawAll(
  ctx: CanvasRenderingContext2D,
  items: DrawItem[],
  preview?: { shape: ShapePreview; color: string; width: number },
  geomPreview?: {
    geomKind: GeomKind;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    width: number;
  },
  pan?: { x: number; y: number },
  scale?: number
) {
  // Clear in raw device pixels (bypass any active transform)
  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
  // Draw with pan + scale on top of the base DPR transform
  ctx.save();
  const s = scale ?? 1;
  if (s !== 1) ctx.scale(s, s);
  if (pan) ctx.translate(-pan.x, -pan.y);
  items.forEach((item) => drawItem(ctx, item));
  if (preview) drawShapePreview(ctx, preview.shape, preview.color, preview.width);
  if (geomPreview)
    drawGeomPreview(
      ctx,
      geomPreview.geomKind,
      geomPreview.color,
      geomPreview.width,
      geomPreview.x1,
      geomPreview.y1,
      geomPreview.x2,
      geomPreview.y2
    );
  ctx.restore();
}

// ─── Smart eraser: hit-test & highlight ──────────────────────────────────────

function distSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax,
    dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

function hitTest(item: DrawItem, px: number, py: number, tol: number): boolean {
  switch (item.kind) {
    case 'pen':
    case 'eraser': {
      const pts = item.points;
      for (let i = 1; i < pts.length; i++)
        if (distSeg(px, py, pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y) < tol + item.width / 2)
          return true;
      return pts.length === 1 && Math.hypot(px - pts[0].x, py - pts[0].y) < tol + item.width;
    }
    case 'line':
      return distSeg(px, py, item.x1, item.y1, item.x2, item.y2) < tol + item.width / 2;
    case 'rect': {
      const { x1, y1, x2, y2, width } = item;
      const t2 = tol + width / 2;
      return (
        distSeg(px, py, x1, y1, x2, y1) < t2 ||
        distSeg(px, py, x2, y1, x2, y2) < t2 ||
        distSeg(px, py, x2, y2, x1, y2) < t2 ||
        distSeg(px, py, x1, y2, x1, y1) < t2
      );
    }
    case 'circle': {
      const cx = (item.x1 + item.x2) / 2,
        cy = (item.y1 + item.y2) / 2;
      const rx = Math.abs(item.x2 - item.x1) / 2,
        ry = Math.abs(item.y2 - item.y1) / 2;
      if (!rx || !ry) return false;
      const dx = (px - cx) / rx,
        dy = (py - cy) / ry;
      return Math.abs(Math.sqrt(dx * dx + dy * dy) - 1) * Math.min(rx, ry) < tol + item.width / 2;
    }
    case 'text': {
      const approxW = item.content.length * item.fontSize * 0.55;
      return (
        px >= item.x - tol &&
        px <= item.x + approxW + tol &&
        py >= item.y - tol &&
        py <= item.y + item.fontSize + tol
      );
    }
    case 'geom': {
      const minX = Math.min(item.x1, item.x2) - tol,
        maxX = Math.max(item.x1, item.x2) + tol;
      const minY = Math.min(item.y1, item.y2) - tol,
        maxY = Math.max(item.y1, item.y2) + tol;
      return px >= minX && px <= maxX && py >= minY && py <= maxY;
    }
    case 'image':
      return (
        px >= item.x - tol &&
        px <= item.x + item.w + tol &&
        py >= item.y - tol &&
        py <= item.y + item.h + tol
      );
  }
}

function drawHighlight(ctx: CanvasRenderingContext2D, item: DrawItem) {
  ctx.save();
  const RED = '#ef4444';
  switch (item.kind) {
    case 'pen':
    case 'eraser': {
      ctx.strokeStyle = RED;
      ctx.lineWidth = item.width + 6;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      item.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
      break;
    }
    case 'line': {
      ctx.strokeStyle = RED;
      ctx.lineWidth = item.width + 6;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(item.x1, item.y1);
      ctx.lineTo(item.x2, item.y2);
      ctx.stroke();
      break;
    }
    case 'rect': {
      ctx.strokeStyle = RED;
      ctx.lineWidth = item.width + 5;
      ctx.globalAlpha = 0.55;
      ctx.strokeRect(item.x1, item.y1, item.x2 - item.x1, item.y2 - item.y1);
      ctx.fillStyle = RED;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(item.x1, item.y1, item.x2 - item.x1, item.y2 - item.y1);
      break;
    }
    case 'circle': {
      const cx = (item.x1 + item.x2) / 2,
        cy = (item.y1 + item.y2) / 2;
      const rx = Math.abs(item.x2 - item.x1) / 2,
        ry = Math.abs(item.y2 - item.y1) / 2;
      ctx.strokeStyle = RED;
      ctx.lineWidth = item.width + 5;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'text': {
      ctx.font = `${item.fontSize}px sans-serif`;
      const w = ctx.measureText(item.content).width;
      ctx.fillStyle = RED;
      ctx.globalAlpha = 0.15;
      ctx.fillRect(item.x - 3, item.y - 3, w + 6, item.fontSize + 6);
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = RED;
      ctx.textBaseline = 'top';
      ctx.fillText(item.content, item.x, item.y);
      break;
    }
    case 'geom': {
      ctx.globalAlpha = 0.6;
      drawGeom(ctx, item.geomKind, RED, item.width + 3, item.x1, item.y1, item.x2, item.y2);
      break;
    }
    case 'image': {
      ctx.strokeStyle = RED;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.85;
      ctx.strokeRect(item.x, item.y, item.w, item.h);
      ctx.fillStyle = RED;
      ctx.globalAlpha = 0.06;
      ctx.fillRect(item.x, item.y, item.w, item.h);
      break;
    }
  }
  ctx.restore();
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IC = {
  strokeWidth: 2,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const IconPen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
const IconEraser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <path d="M20 20H7L3 16l10-10 7 7-3 3" />
    <path d="M6 11l7 7" />
  </svg>
);
const IconLine = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <line x1="5" y1="19" x2="19" y2="5" />
  </svg>
);
const IconRect = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <rect x="3" y="5" width="18" height="14" rx="1" />
  </svg>
);
const IconCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const IconText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);
const IconShapes = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <path d="M12 2l4 8H8z" />
    <rect x="2" y="13" width="8" height="8" />
    <circle cx="18" cy="17" r="4" />
  </svg>
);
const IconUndo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <polyline points="9 14 4 9 9 4" />
    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </svg>
);
const IconRedo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <polyline points="15 14 20 9 15 4" />
    <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
  </svg>
);
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconZoomIn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...IC}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const IconZoomOut = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...IC}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const IconHome = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...IC}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);
const IconMove = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M12 12m0 0l0 0" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);
const IconPdf = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...IC}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

// ─── Mini canvas icon for each geom shape ─────────────────────────────────────

function ShapeIcon({ kind }: { kind: GeomKind }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    c.width = 44 * dpr;
    c.height = 44 * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, 44, 44);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    drawGeom(ctx, kind, '#333', 1.5, 5, 5, 39, 39);
  }, [kind]);
  return <canvas ref={ref} style={{ width: 44, height: 44 }} />;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PALETTE = [
  '#1a1a1a',
  '#e53e3e',
  '#dd6b20',
  '#d69e2e',
  '#276749',
  '#2b6cb0',
  '#805ad5',
  '#d53f8c',
  '#ffffff',
];
const PEN_SIZES = [2, 4, 8, 16];
const ERASER_SIZES = [12, 24, 40];
const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4];

// ─── Pill button ──────────────────────────────────────────────────────────────

function PillBtn({
  active,
  onClick,
  children,
  disabled,
  title,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: 'none',
        padding: 0,
        flexShrink: 0,
        background: active ? '#1a1a1a' : 'transparent',
        color: active ? '#fff' : disabled ? '#ccc' : '#333',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) (e.currentTarget as HTMLElement).style.background = '#f0f0f0';
      }}
      onMouseLeave={(e) => {
        if (!active && !disabled) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TextCursor {
  x: number;
  y: number;
  value: string;
}

interface CanvasBoardProps {
  onOpenSubiecte?: () => void;
  onOpenFormulas?: () => void;
}

export default function CanvasBoard({
  onOpenSubiecte,
  onOpenFormulas,
}: CanvasBoardProps = {}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDrawingRef = useRef(false);
  const startRef = useRef<Point>({ x: 0, y: 0 });
  const currentPenRef = useRef<PenItem | null>(null);

  const [items, setItems] = useState<DrawItem[]>([]);
  const itemsRef = useRef<DrawItem[]>([]);

  const undoRef = useRef<DrawItem[][]>([]);
  const redoRef = useRef<DrawItem[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [tool, setTool] = useState<PenTool>('pen');
  const toolRef = useRef<PenTool>('pen');
  const [activeGeom, setActiveGeom] = useState<GeomKind | null>(null);
  const activeGeomRef = useRef<GeomKind | null>(null);
  const [color, setColor] = useState('#1a1a1a');
  const colorRef = useRef('#1a1a1a');
  const [penSize, setPenSize] = useState(3);
  const penSizeRef = useRef(3);
  const [eraserSize, setEraserSize] = useState(24);
  const eraserSizeRef = useRef(24);

  const [textCursor, setTextCursor] = useState<TextCursor | null>(null);
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── pan & zoom ───────────────────────────────────────────────────────────
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const [zoom, setZoom] = useState(1);
  // move (pan) drag state
  const panStartRef = useRef({ x: 0, y: 0 }); // pan at drag start
  const moveStartRef = useRef({ x: 0, y: 0 }); // screen pos at drag start
  const [isPanning, setIsPanning] = useState(false);

  // ── smart eraser ─────────────────────────────────────────────────────────
  const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(null);
  const hoveredIdxRef = useRef<number>(-1);
  const preEraseSnapshotRef = useRef<DrawItem[] | null>(null);

  // sync refs
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  useEffect(() => {
    activeGeomRef.current = activeGeom;
  }, [activeGeom]);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);
  useEffect(() => {
    penSizeRef.current = penSize;
  }, [penSize]);
  useEffect(() => {
    eraserSizeRef.current = eraserSize;
  }, [eraserSize]);

  // ── canvas init ──────────────────────────────────────────────────────────────

  function getCtx() {
    return canvasRef.current!.getContext('2d')!;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const r = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * r;
      canvas.height = canvas.offsetHeight * r;
      canvas.getContext('2d')!.scale(r, r);
      redrawAll(
        canvas.getContext('2d')!,
        itemsRef.current,
        undefined,
        undefined,
        panRef.current,
        scaleRef.current
      );
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    itemsRef.current = items;
    redrawAll(getCtx(), items, undefined, undefined, panRef.current, scaleRef.current);
  }, [items]);

  // ── history ──────────────────────────────────────────────────────────────────

  function commit(next: DrawItem[]) {
    undoRef.current = [...undoRef.current, itemsRef.current];
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
    setItems(next);
  }

  const undo = useCallback(() => {
    if (!undoRef.current.length) return;
    const prev = undoRef.current[undoRef.current.length - 1];
    redoRef.current = [...redoRef.current, itemsRef.current];
    undoRef.current = undoRef.current.slice(0, -1);
    setCanUndo(undoRef.current.length > 0);
    setCanRedo(true);
    setItems(prev);
  }, []);

  const redo = useCallback(() => {
    if (!redoRef.current.length) return;
    const next = redoRef.current[redoRef.current.length - 1];
    undoRef.current = [...undoRef.current, itemsRef.current];
    redoRef.current = redoRef.current.slice(0, -1);
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    setItems(next);
  }, []);

  // ── wheel: zoom (always) + auto-switch to move mode ─────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Determine delta: pinch-to-zoom on trackpad uses ctrlKey + deltaY;
      // normal scroll wheel on mouse → zoom too (user's request)
      const deltaY = e.deltaY;
      if (deltaY === 0 && e.deltaX === 0) return;

      // Two-finger trackpad pan (no ctrlKey, deltaMode=0, both axes possible)
      if (
        !e.ctrlKey &&
        !e.metaKey &&
        Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.5 &&
        e.deltaMode === 0
      ) {
        // horizontal + vertical scroll → pan (trackpad gesture)
        panRef.current = {
          x: panRef.current.x + e.deltaX / scaleRef.current,
          y: panRef.current.y + e.deltaY / scaleRef.current,
        };
      } else {
        // Zoom centered on cursor position
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left,
          sy = e.clientY - rect.top;
        const factor = deltaY < 0 ? 1.12 : 0.88;
        const oldScale = scaleRef.current;
        const newScale = Math.max(0.1, Math.min(8, oldScale * factor));
        panRef.current = {
          x: sx / oldScale + panRef.current.x - sx / newScale,
          y: sy / oldScale + panRef.current.y - sy / newScale,
        };
        scaleRef.current = newScale;
        setZoom(newScale);
        // Auto-switch to move mode so user can drag to pan immediately
        toolRef.current = 'move';
        setTool('move');
      }
      redrawAll(
        canvas.getContext('2d')!,
        itemsRef.current,
        undefined,
        undefined,
        panRef.current,
        scaleRef.current
      );
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Escape') closePopovers();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  // ── pointer helpers ───────────────────────────────────────────────────────────

  function getScreenPos(e: React.PointerEvent): Point {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function getPos(e: React.PointerEvent): Point {
    const s = getScreenPos(e);
    return {
      x: s.x / scaleRef.current + panRef.current.x,
      y: s.y / scaleRef.current + panRef.current.y,
    };
  }

  function activeSize() {
    return toolRef.current === 'eraser' ? eraserSizeRef.current : penSizeRef.current;
  }

  function closePopovers() {
    setShowColorPanel(false);
    setShowMenu(false);
    setShowShapes(false);
    setShowPdfPanel(false);
  }

  // ── PDF import ───────────────────────────────────────────────────────────
  const loadPDF = useCallback(async (source: File | string) => {
    setPdfLoading(true);
    setShowPdfPanel(false);
    setShowMenu(false);
    try {
      // Dynamic import — pdfjs-dist e split într-un chunk separat
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const data =
        source instanceof File
          ? await source.arrayBuffer()
          : await fetch(source).then((r) => r.arrayBuffer());

      const pdf = await getDocument({ data }).promise;
      const canvas = canvasRef.current!;
      const targetW = canvas.offsetWidth - 40;

      const newItems: DrawItem[] = [];
      let yOff = panRef.current.y + 20;

      for (let pg = 1; pg <= pdf.numPages; pg++) {
        const page = await pdf.getPage(pg);
        const vp0 = page.getViewport({ scale: 1 });
        const sc = targetW / vp0.width;
        const vp = page.getViewport({ scale: sc });

        const oc = document.createElement('canvas');
        oc.width = Math.round(vp.width);
        oc.height = Math.round(vp.height);
        await page.render({ canvas: oc, viewport: vp }).promise;

        const dataURL = oc.toDataURL('image/jpeg', 0.92);
        const id = crypto.randomUUID();
        const xOff = panRef.current.x + 20;

        preloadImg(id, dataURL, () => {
          redrawAll(
            getCtx(),
            itemsRef.current,
            undefined,
            undefined,
            panRef.current,
            scaleRef.current
          );
        });

        newItems.push({ kind: 'image', id, dataURL, x: xOff, y: yOff, w: oc.width, h: oc.height });
        yOff += oc.height + 16;
      }

      commit([...itemsRef.current, ...newItems]);
    } catch (err) {
      console.error('[PDF]', err);
      alert('Nu am putut încărca PDF-ul.');
    } finally {
      setPdfLoading(false);
    }
  }, []);

  // ── zoom & pan controls ───────────────────────────────────────────────────
  function applyZoom(newScale: number, sx: number, sy: number) {
    const old = scaleRef.current;
    panRef.current = {
      x: sx / old + panRef.current.x - sx / newScale,
      y: sy / old + panRef.current.y - sy / newScale,
    };
    scaleRef.current = newScale;
    setZoom(newScale);
    redrawAll(getCtx(), itemsRef.current, undefined, undefined, panRef.current, scaleRef.current);
  }
  function zoomIn() {
    const c = canvasRef.current!;
    const next =
      ZOOM_STEPS.find((s) => s > scaleRef.current + 0.001) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1];
    applyZoom(next, c.offsetWidth / 2, c.offsetHeight / 2);
  }
  function zoomOut() {
    const c = canvasRef.current!;
    const next =
      [...ZOOM_STEPS].reverse().find((s) => s < scaleRef.current - 0.001) ?? ZOOM_STEPS[0];
    applyZoom(next, c.offsetWidth / 2, c.offsetHeight / 2);
  }
  function resetView() {
    panRef.current = { x: 0, y: 0 };
    scaleRef.current = 1;
    setZoom(1);
    redrawAll(getCtx(), itemsRef.current, undefined, undefined, { x: 0, y: 0 }, 1);
  }

  // ── smart eraser helpers ─────────────────────────────────────────────────────

  function eraseTopAt(pos: Point): DrawItem[] | null {
    const items = itemsRef.current;
    const tol = Math.max(eraserSizeRef.current / (2 * scaleRef.current), 8);
    for (let i = items.length - 1; i >= 0; i--) {
      if (hitTest(items[i], pos.x, pos.y, tol)) {
        const next = items.filter((_, j) => j !== i);
        itemsRef.current = next;
        hoveredIdxRef.current = -1;
        return next;
      }
    }
    return null;
  }

  function updateEraserHover(pos: Point) {
    const items = itemsRef.current;
    const tol = Math.max(eraserSizeRef.current / (2 * scaleRef.current), 8);
    let found = -1;
    for (let i = items.length - 1; i >= 0; i--) {
      if (hitTest(items[i], pos.x, pos.y, tol)) {
        found = i;
        break;
      }
    }
    if (found !== hoveredIdxRef.current) {
      hoveredIdxRef.current = found;
      const ctx = getCtx();
      redrawAll(ctx, items, undefined, undefined, panRef.current, scaleRef.current);
      if (found >= 0) {
        const s = scaleRef.current;
        ctx.save();
        if (s !== 1) ctx.scale(s, s);
        ctx.translate(-panRef.current.x, -panRef.current.y);
        drawHighlight(ctx, items[found]);
        ctx.restore();
      }
    }
  }

  // ── pointer events ────────────────────────────────────────────────────────────

  function pointerDown(e: React.PointerEvent) {
    closePopovers();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const t = toolRef.current,
      pos = getPos(e);

    if (t === 'text') {
      setTextCursor({ x: pos.x, y: pos.y, value: '' });
      return;
    }

    if (t === 'move') {
      isDrawingRef.current = true;
      const sp = getScreenPos(e);
      moveStartRef.current = sp;
      panStartRef.current = { ...panRef.current };
      setIsPanning(true);
      return;
    }

    isDrawingRef.current = true;
    startRef.current = pos;

    if (t === 'eraser') {
      preEraseSnapshotRef.current = [...itemsRef.current];
      const next = eraseTopAt(pos);
      if (next) redrawAll(getCtx(), next, undefined, undefined, panRef.current, scaleRef.current);
      return;
    }

    if (t === 'pen') {
      currentPenRef.current = {
        kind: t,
        color: colorRef.current,
        width: activeSize(),
        points: [pos],
      };
    }
  }

  function pointerMove(e: React.PointerEvent) {
    const t = toolRef.current,
      pos = getPos(e),
      ctx = getCtx();

    // Move (pan) mode
    if (t === 'move') {
      if (isDrawingRef.current) {
        const sp = getScreenPos(e);
        panRef.current = {
          x: panStartRef.current.x - (sp.x - moveStartRef.current.x) / scaleRef.current,
          y: panStartRef.current.y - (sp.y - moveStartRef.current.y) / scaleRef.current,
        };
        redrawAll(ctx, itemsRef.current, undefined, undefined, panRef.current, scaleRef.current);
      }
      return;
    }

    // Eraser: hover highlight (always) + erase while dragging
    if (t === 'eraser') {
      setEraserPos(getScreenPos(e)); // screen coords for CSS overlay
      if (isDrawingRef.current) {
        const next = eraseTopAt(pos);
        if (next) redrawAll(ctx, next, undefined, undefined, panRef.current, scaleRef.current);
      } else {
        updateEraserHover(pos);
      }
      return;
    }

    if (!isDrawingRef.current) return;

    if (t === 'pen') {
      if (!currentPenRef.current) return;
      currentPenRef.current.points.push(pos);
      const pts = currentPenRef.current.points,
        prev = pts[pts.length - 2];
      if (!prev) return;
      ctx.save();
      const s = scaleRef.current;
      if (s !== 1) ctx.scale(s, s);
      ctx.translate(-panRef.current.x, -panRef.current.y);
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = activeSize();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
    } else if (t === 'line' || t === 'rect' || t === 'circle') {
      redrawAll(
        ctx,
        itemsRef.current,
        {
          shape: { kind: t, x1: startRef.current.x, y1: startRef.current.y, x2: pos.x, y2: pos.y },
          color: colorRef.current,
          width: penSizeRef.current,
        },
        undefined,
        panRef.current,
        scaleRef.current
      );
    } else if (t === 'geom' && activeGeomRef.current) {
      redrawAll(
        ctx,
        itemsRef.current,
        undefined,
        {
          geomKind: activeGeomRef.current,
          x1: startRef.current.x,
          y1: startRef.current.y,
          x2: pos.x,
          y2: pos.y,
          color: colorRef.current,
          width: penSizeRef.current,
        },
        panRef.current,
        scaleRef.current
      );
    }
  }

  function pointerUp(e: React.PointerEvent) {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const t = toolRef.current,
      pos = getPos(e);

    if (t === 'move') {
      setIsPanning(false);
      return;
    }

    if (t === 'eraser') {
      // Commit one undo entry for the whole drag-erase session
      if (
        preEraseSnapshotRef.current &&
        preEraseSnapshotRef.current.length !== itemsRef.current.length
      ) {
        undoRef.current = [...undoRef.current, preEraseSnapshotRef.current];
        redoRef.current = [];
        setCanUndo(true);
        setCanRedo(false);
        setItems(itemsRef.current);
      }
      preEraseSnapshotRef.current = null;
      hoveredIdxRef.current = -1;
      return;
    }

    if (t === 'pen') {
      if (!currentPenRef.current) return;
      const stroke = currentPenRef.current;
      currentPenRef.current = null;
      commit([...itemsRef.current, stroke]);
    } else if (t === 'line' || t === 'rect' || t === 'circle') {
      const { x: x1, y: y1 } = startRef.current;
      if (Math.abs(pos.x - x1) < 3 && Math.abs(pos.y - y1) < 3) {
        redrawAll(
          getCtx(),
          itemsRef.current,
          undefined,
          undefined,
          panRef.current,
          scaleRef.current
        );
        return;
      }
      commit([
        ...itemsRef.current,
        {
          kind: t,
          color: colorRef.current,
          width: penSizeRef.current,
          x1,
          y1,
          x2: pos.x,
          y2: pos.y,
        },
      ]);
    } else if (t === 'geom' && activeGeomRef.current) {
      const { x: x1, y: y1 } = startRef.current;
      if (Math.abs(pos.x - x1) < 4 && Math.abs(pos.y - y1) < 4) {
        redrawAll(
          getCtx(),
          itemsRef.current,
          undefined,
          undefined,
          panRef.current,
          scaleRef.current
        );
        return;
      }
      commit([
        ...itemsRef.current,
        {
          kind: 'geom' as const,
          geomKind: activeGeomRef.current,
          color: colorRef.current,
          width: penSizeRef.current,
          x1,
          y1,
          x2: pos.x,
          y2: pos.y,
        },
      ]);
    }
  }

  // ── text ─────────────────────────────────────────────────────────────────────

  function commitText(value: string) {
    if (!textCursor) return;
    if (value.trim()) {
      const fontSize = penSize <= 4 ? 20 : penSize <= 8 ? 28 : 36;
      commit([
        ...itemsRef.current,
        {
          kind: 'text',
          color: colorRef.current,
          fontSize,
          x: textCursor.x,
          y: textCursor.y,
          content: value,
        },
      ]);
    }
    setTextCursor(null);
  }

  // ── export ────────────────────────────────────────────────────────────────────

  function exportPNG() {
    const src = canvasRef.current!;
    const off = document.createElement('canvas');
    off.width = src.width;
    off.height = src.height;
    const ctx = off.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.drawImage(src, 0, 0);
    const a = document.createElement('a');
    a.href = off.toDataURL('image/png');
    a.download = 'board.png';
    a.click();
    setShowMenu(false);
  }

  // ── styles ────────────────────────────────────────────────────────────────────

  const panelShadow = '0 8px 32px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.06)';
  const divider = (
    <div style={{ width: 1, height: 24, background: '#e0e0e0', margin: '0 4px', flexShrink: 0 }} />
  );
  const penCursor =
    "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><text y='22' font-size='22'>✏️</text></svg>\") 2 22, crosshair";
  const cursorStyle =
    tool === 'eraser'
      ? 'none'
      : tool === 'text'
        ? 'text'
        : tool === 'pen'
          ? penCursor
          : tool === 'move'
            ? isPanning
              ? 'grabbing'
              : 'grab'
            : 'crosshair';

  const isGeomActive = tool === 'geom';

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{ position: 'fixed', inset: 0 }}
      onClick={(e) => {
        if (
          !(e.target as HTMLElement).closest('[data-panel]') &&
          !(e.target as HTMLElement).closest('[data-toolbar]')
        )
          closePopovers();
      }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: '#fff',
          touchAction: 'none',
          cursor: cursorStyle,
          display: 'block',
        }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerLeave={() => {
          setEraserPos(null);
          setIsPanning(false);
          if (hoveredIdxRef.current >= 0) {
            hoveredIdxRef.current = -1;
            redrawAll(
              getCtx(),
              itemsRef.current,
              undefined,
              undefined,
              panRef.current,
              scaleRef.current
            );
          }
          pointerUp({ pointerId: 0 } as React.PointerEvent);
        }}
      />

      {/* ── Eraser circle cursor ── */}
      {tool === 'eraser' && eraserPos && (
        <div
          style={{
            position: 'absolute',
            left: eraserPos.x - eraserSize / 2,
            top: eraserPos.y - eraserSize / 2,
            width: eraserSize,
            height: eraserSize,
            borderRadius: '50%',
            border: hoveredIdxRef.current >= 0 ? '2px solid #ef4444' : '2px dashed #999',
            background: hoveredIdxRef.current >= 0 ? 'rgba(239,68,68,0.08)' : 'transparent',
            pointerEvents: 'none',
            transition: 'border-color 0.1s, background 0.1s',
            zIndex: 50,
          }}
        />
      )}

      {/* ── Floating toolbar ── */}
      <div
        data-toolbar=""
        style={{
          position: 'fixed',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '4px 6px',
          background: '#fff',
          borderRadius: 100,
          boxShadow: '0 2px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.07)',
          zIndex: 100,
          userSelect: 'none',
        }}
      >
        <PillBtn
          active={tool === 'pen'}
          onClick={() => {
            setTool('pen');
            toolRef.current = 'pen';
            closePopovers();
          }}
          title="Pix (desenare liberă)"
        >
          <IconPen />
        </PillBtn>
        <PillBtn
          active={tool === 'eraser'}
          onClick={() => {
            setTool('eraser');
            toolRef.current = 'eraser';
            closePopovers();
          }}
          title="Radieră"
        >
          <IconEraser />
        </PillBtn>
        <PillBtn
          active={tool === 'move'}
          onClick={() => {
            setTool('move');
            toolRef.current = 'move';
            closePopovers();
          }}
          title="Mută canvas (pan)"
        >
          <IconMove />
        </PillBtn>
        {divider}
        <PillBtn
          active={tool === 'line'}
          onClick={() => {
            setTool('line');
            closePopovers();
          }}
          title="Linie"
        >
          <IconLine />
        </PillBtn>
        <PillBtn
          active={tool === 'rect'}
          onClick={() => {
            setTool('rect');
            closePopovers();
          }}
          title="Dreptunghi"
        >
          <IconRect />
        </PillBtn>
        <PillBtn
          active={tool === 'circle'}
          onClick={() => {
            setTool('circle');
            closePopovers();
          }}
          title="Elipsă / Cerc"
        >
          <IconCircle />
        </PillBtn>
        <PillBtn
          active={tool === 'text'}
          onClick={() => {
            setTool('text');
            closePopovers();
          }}
          title="Text"
        >
          <IconText />
        </PillBtn>
        {/* Shapes button — shows geom kind name if active */}
        <PillBtn
          active={isGeomActive}
          onClick={() => {
            setShowShapes((v) => !v);
            setShowColorPanel(false);
            setShowMenu(false);
          }}
          title="Figuri geometrice"
        >
          {isGeomActive && activeGeom ? (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                lineHeight: 1,
                textAlign: 'center',
                padding: '0 2px',
              }}
            >
              {SHAPE_GROUPS.flatMap((g) => g.shapes)
                .find((s) => s.kind === activeGeom)
                ?.label.slice(0, 8)}
            </span>
          ) : (
            <IconShapes />
          )}
        </PillBtn>
        {divider}
        {/* Color dot */}
        <PillBtn
          active={showColorPanel}
          onClick={() => {
            setShowColorPanel((v) => !v);
            setShowMenu(false);
            setShowShapes(false);
          }}
          title="Culoare & mărime"
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: color,
              border: color === '#ffffff' ? '2px solid #ccc' : '2px solid rgba(0,0,0,0.15)',
              boxShadow: showColorPanel ? '0 0 0 2px #3182ce' : 'none',
            }}
          />
        </PillBtn>
        {divider}
        <PillBtn onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <IconUndo />
        </PillBtn>
        <PillBtn onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <IconRedo />
        </PillBtn>
        {divider}
        <PillBtn
          active={showPdfPanel}
          onClick={() => {
            setShowPdfPanel((v) => !v);
            setShowColorPanel(false);
            setShowMenu(false);
            setShowShapes(false);
          }}
          title="Importă / deschide PDF"
        >
          {pdfLoading ? (
            <div
              style={{
                width: 16,
                height: 16,
                border: '2px solid #3182ce',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          ) : (
            <IconPdf />
          )}
        </PillBtn>
        <PillBtn
          active={showMenu}
          onClick={() => {
            setShowMenu((v) => !v);
            setShowColorPanel(false);
            setShowShapes(false);
            setShowPdfPanel(false);
          }}
          title="Meniu"
        >
          <IconMenu />
        </PillBtn>
      </div>

      {/* ── Shapes panel ── */}
      {showShapes && (
        <div
          data-panel=""
          style={{
            position: 'fixed',
            top: 68,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: panelShadow,
            zIndex: 200,
            maxHeight: 'calc(100vh - 90px)',
            overflowY: 'auto',
            width: 520,
          }}
        >
          {SHAPE_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#888',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                {group.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {group.shapes.map(({ kind, label }) => {
                  const isActive = activeGeom === kind;
                  return (
                    <button
                      key={kind}
                      onClick={() => {
                        setTool('geom');
                        setActiveGeom(kind);
                        setShowShapes(false);
                      }}
                      title={label}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 8px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: isActive ? '#3182ce' : '#e8e8e8',
                        background: isActive ? '#ebf8ff' : '#fafafa',
                        width: 72,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = '#bbb';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e8';
                      }}
                    >
                      <ShapeIcon kind={kind} />
                      <span
                        style={{
                          fontSize: 9.5,
                          color: isActive ? '#2b6cb0' : '#555',
                          textAlign: 'center',
                          lineHeight: 1.2,
                          fontWeight: isActive ? 700 : 400,
                        }}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Color panel ── */}
      {showColorPanel && (
        <div
          data-panel=""
          style={{
            position: 'fixed',
            top: 68,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            borderRadius: 14,
            padding: '14px 18px',
            boxShadow: panelShadow,
            zIndex: 200,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#888',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Culoare
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: c,
                    padding: 0,
                    cursor: 'pointer',
                    border: 'none',
                    outline:
                      color === c
                        ? '3px solid #3182ce'
                        : c === '#ffffff'
                          ? '1.5px solid #ccc'
                          : '1.5px solid transparent',
                    outlineOffset: 2,
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 26,
                  height: 26,
                  padding: 1,
                  border: '1.5px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: 'none',
                }}
              />
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#888',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {tool === 'eraser' ? 'Mărime radieră' : 'Grosime linie'}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(tool === 'eraser' ? ERASER_SIZES : PEN_SIZES).map((w) => {
                const active = tool === 'eraser' ? eraserSize === w : penSize === w;
                return (
                  <button
                    key={w}
                    onClick={() => (tool === 'eraser' ? setEraserSize(w) : setPenSize(w))}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: `1.5px solid ${active ? '#3182ce' : '#e0e0e0'}`,
                      background: active ? '#ebf8ff' : '#fafafa',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: Math.min(w * 1.2, 20),
                        height: Math.min(w * 1.2, 20),
                        borderRadius: '50%',
                        background: active ? '#2b6cb0' : '#aaa',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Menu panel ── */}
      {showMenu && (
        <div
          data-panel=""
          style={{
            position: 'fixed',
            top: 68,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            borderRadius: 12,
            padding: 6,
            boxShadow: panelShadow,
            zIndex: 200,
            minWidth: 190,
          }}
        >
          {[
            {
              label: '∑  Formule matematică',
              action: () => {
                setShowMenu(false);
                onOpenFormulas?.();
              },
              danger: false,
            },
            {
              label: '📚  Subiecte EN VIII',
              action: () => {
                setShowMenu(false);
                onOpenSubiecte?.();
              },
              danger: false,
            },
            { label: '↓  Export PNG', action: exportPNG, danger: false },
            {
              label: '🗑  Șterge tot',
              action: () => {
                commit([]);
                setShowMenu(false);
              },
              danger: true,
            },
          ].map(({ label, action, danger }) => (
            <button
              key={label}
              onClick={action}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 14,
                color: danger ? '#e53e3e' : '#333',
                fontFamily: 'inherit',
                display: 'block',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = danger ? '#fff5f5' : '#f7f7f7')
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Zoom controls (right) ── */}
      <div
        style={{
          position: 'fixed',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          padding: 4,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
          zIndex: 100,
        }}
      >
        <button
          onClick={zoomIn}
          title="Zoom in"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: '#555',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <IconZoomIn />
        </button>
        <button
          onClick={resetView}
          title="Reset zoom & poziție"
          style={{
            width: 36,
            height: 20,
            borderRadius: 6,
            border: 'none',
            background: zoom !== 1 ? '#eef2ff' : 'transparent',
            color: zoom !== 1 ? '#4f46e5' : '#999',
            cursor: 'pointer',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '-0.3px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = zoom !== 1 ? '#eef2ff' : 'transparent')
          }
        >
          {zoom === 1 ? '100%' : `${Math.round(zoom * 100)}%`}
        </button>
        <button
          onClick={zoomOut}
          title="Zoom out"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: '#555',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <IconZoomOut />
        </button>
        <div style={{ width: 1, height: 12, background: '#e8e8e8', margin: '2px auto' }} />
        <button
          onClick={resetView}
          title="Resetează poziția (Home)"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: '#555',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <IconHome />
        </button>
      </div>

      {/* ── Text overlay ── */}
      {textCursor && (
        <input
          autoFocus
          value={textCursor.value}
          onChange={(e) => setTextCursor({ ...textCursor, value: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitText(textCursor.value);
            if (e.key === 'Escape') setTextCursor(null);
          }}
          onBlur={() => commitText(textCursor.value)}
          style={{
            position: 'fixed',
            left: textCursor.x,
            top: textCursor.y,
            background: 'transparent',
            border: '1.5px dashed #3182ce',
            outline: 'none',
            fontSize: penSize <= 4 ? 20 : penSize <= 8 ? 28 : 36,
            color,
            fontFamily: 'sans-serif',
            padding: '0 4px',
            minWidth: 140,
            zIndex: 50,
          }}
        />
      )}

      {/* ── Hidden file input ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadPDF(f);
          e.target.value = '';
        }}
      />

      {/* ── PDF panel ── */}
      {showPdfPanel && (
        <div
          data-panel=""
          style={{
            position: 'fixed',
            top: 68,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            borderRadius: 14,
            padding: '14px 16px',
            boxShadow: panelShadow,
            zIndex: 200,
            width: 340,
          }}
        >
          {/* Upload from disk */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1.5px dashed #cbd5e0',
              background: '#f7faff',
              cursor: 'pointer',
              fontSize: 13,
              color: '#2b6cb0',
              fontFamily: 'inherit',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3182ce')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e0')}
          >
            <IconPdf />
            <span>📂 Deschide PDF de pe calculator</span>
          </button>

          {/* Subiecte list */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#888',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Subiecte EN VIII descărcate
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {SUBIECTE.map((s) => (
              <div key={s.subiectUrl} style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => loadPDF(s.subiectUrl)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: 7,
                    border: '1px solid #e8e8e8',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#333',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  📄 {s.label}
                </button>
                {s.baremUrl && (
                  <button
                    onClick={() => loadPDF(s.baremUrl!)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 7,
                      border: '1px solid #e8e8e8',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 11,
                      color: '#718096',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fff0')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    title="Deschide barem"
                  >
                    barem
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#aaa' }}>
            Paginile PDF se plasează pe tablă la poziția curentă. Poți desena direct pe ele.
          </div>
        </div>
      )}

      {/* hint */}
      <div
        style={{
          position: 'fixed',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 11,
          color: '#bbb',
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Ctrl+Z undo · Ctrl+Y redo · Esc închide panouri
      </div>
    </div>
  );
}
