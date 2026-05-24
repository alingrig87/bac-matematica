// ─── Types ────────────────────────────────────────────────────────────────────

export type GeomKind =
  // Linii & unghiuri
  | 'segment'
  | 'ray'
  | 'angle'
  // Triunghiuri
  | 'tri-right'
  | 'tri-equilateral'
  | 'tri-isosceles'
  | 'tri-scalene'
  // Patrulater
  | 'rhombus'
  | 'parallelogram'
  | 'trapezoid'
  | 'trap-right'
  | 'trap-isosceles'
  // Poligoane regulate
  | 'pentagon'
  | 'hexagon'
  | 'heptagon'
  | 'octagon'
  // Cercuri
  | 'arc'
  | 'sector'
  | 'annulus'
  // 3D
  | 'cube'
  | 'cuboid'
  | 'prism-tri'
  | 'prism-hex'
  | 'pyramid-sq'
  | 'tetrahedron'
  | 'cone'
  | 'cylinder'
  | 'sphere';

export interface GeomItem {
  kind: 'geom'; // discriminator unic în DrawItem
  geomKind: GeomKind; // figura concretă
  color: string;
  width: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ShapeGroup {
  label: string;
  shapes: { kind: GeomKind; label: string }[];
}

export const SHAPE_GROUPS: ShapeGroup[] = [
  {
    label: 'Linii & Unghiuri',
    shapes: [
      { kind: 'segment', label: 'Segment' },
      { kind: 'ray', label: 'Semidreaptă' },
      { kind: 'angle', label: 'Unghi' },
    ],
  },
  {
    label: 'Triunghiuri',
    shapes: [
      { kind: 'tri-right', label: 'Dreptunghic' },
      { kind: 'tri-equilateral', label: 'Echilateral' },
      { kind: 'tri-isosceles', label: 'Isoscel' },
      { kind: 'tri-scalene', label: 'Oarecare' },
    ],
  },
  {
    label: 'Patrulater',
    shapes: [
      { kind: 'rhombus', label: 'Romb' },
      { kind: 'parallelogram', label: 'Paralelogram' },
      { kind: 'trapezoid', label: 'Trapez' },
      { kind: 'trap-right', label: 'Trapez dreptunghic' },
      { kind: 'trap-isosceles', label: 'Trapez isoscel' },
    ],
  },
  {
    label: 'Poligoane regulate',
    shapes: [
      { kind: 'pentagon', label: 'Pentagon' },
      { kind: 'hexagon', label: 'Hexagon' },
      { kind: 'heptagon', label: 'Heptagon' },
      { kind: 'octagon', label: 'Octogon' },
    ],
  },
  {
    label: 'Cercuri',
    shapes: [
      { kind: 'arc', label: 'Arc de cerc' },
      { kind: 'sector', label: 'Sector de cerc' },
      { kind: 'annulus', label: 'Coroană circulară' },
    ],
  },
  {
    label: 'Geometrie în spațiu',
    shapes: [
      { kind: 'cube', label: 'Cub' },
      { kind: 'cuboid', label: 'Paralelipiped' },
      { kind: 'prism-tri', label: 'Prismă triunghi.' },
      { kind: 'prism-hex', label: 'Prismă hexagon.' },
      { kind: 'pyramid-sq', label: 'Piramidă (pătrat)' },
      { kind: 'tetrahedron', label: 'Tetraedru' },
      { kind: 'cone', label: 'Con' },
      { kind: 'cylinder', label: 'Cilindru' },
      { kind: 'sphere', label: 'Sferă' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Pt = [number, number];

function poly(ctx: CanvasRenderingContext2D, pts: Pt[], close = true) {
  if (!pts.length) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
  ctx.stroke();
}

function regularPts(n: number, cx: number, cy: number, r: number, offset = 0): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = offset + (2 * Math.PI * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  });
}

function arrowHead(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const L = Math.max(10, Math.hypot(x2 - x1, y2 - y1) * 0.12);
  ctx.beginPath();
  ctx.moveTo(x2 - L * Math.cos(a - 0.38), y2 - L * Math.sin(a - 0.38));
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - L * Math.cos(a + 0.38), y2 - L * Math.sin(a + 0.38));
  ctx.stroke();
}

function rightAngleMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dx: number,
  dy: number,
  sq: number
) {
  // vertex at (x,y), one side in dx direction, other in dy direction
  ctx.beginPath();
  ctx.moveTo(x + dx * sq, y);
  ctx.lineTo(x + dx * sq, y + dy * sq);
  ctx.lineTo(x, y + dy * sq);
  ctx.stroke();
}

// Oblique projection: depth goes upper-right at ~30°
// (ox, oy) = screen center, lx = local-right, ly = local-down, lz = depth
const DX = 0.65; // depth x factor
const DY = 0.38; // depth y factor (negative = up)

function ob(ox: number, oy: number, lx: number, ly: number, lz: number): Pt {
  return [ox + lx + lz * DX, oy + ly - lz * DY];
}

// Draw a 3D face (quadrilateral)
function face3(ctx: CanvasRenderingContext2D, pts: Pt[], dashed = false) {
  if (dashed) ctx.setLineDash([4, 4]);
  poly(ctx, pts);
  if (dashed) ctx.setLineDash([]);
}

// ─── Main draw function ────────────────────────────────────────────────────────

export function drawGeom(
  ctx: CanvasRenderingContext2D,
  kind: GeomKind,
  color: string,
  lw: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const L = Math.min(x1, x2),
    R = Math.max(x1, x2);
  const T = Math.min(y1, y2),
    B = Math.max(y1, y2);
  const cx = (L + R) / 2,
    cy = (T + B) / 2;
  const hw = (R - L) / 2,
    hh = (B - T) / 2;
  const r = Math.min(hw, hh);
  const sq = Math.max(4, lw * 4); // right-angle mark size

  switch (kind) {
    // ── LINII & UNGHIURI ────────────────────────────────────────────────────────

    case 'segment':
      ctx.beginPath();
      ctx.moveTo(L, cy);
      ctx.lineTo(R, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(L, cy - sq * 1.2);
      ctx.lineTo(L, cy + sq * 1.2);
      ctx.moveTo(R, cy - sq * 1.2);
      ctx.lineTo(R, cy + sq * 1.2);
      ctx.stroke();
      break;

    case 'ray':
      ctx.beginPath();
      ctx.moveTo(L, cy);
      ctx.lineTo(R, cy);
      ctx.stroke();
      arrowHead(ctx, L, cy, R, cy);
      ctx.beginPath();
      ctx.moveTo(L, cy - sq * 1.2);
      ctx.lineTo(L, cy + sq * 1.2);
      ctx.stroke();
      break;

    case 'angle': {
      const arm = Math.min(hw, hh) * 1.6;
      ctx.beginPath();
      ctx.moveTo(L, B);
      ctx.lineTo(L + arm, B);
      ctx.stroke();
      arrowHead(ctx, L, B, L + arm, B);
      ctx.beginPath();
      ctx.moveTo(L, B);
      ctx.lineTo(L + arm * 0.707, B - arm * 0.707);
      ctx.stroke();
      arrowHead(ctx, L, B, L + arm * 0.707, B - arm * 0.707);
      ctx.beginPath();
      ctx.arc(L, B, arm * 0.32, -Math.PI / 4, 0);
      ctx.stroke();
      // label: nothing (user adds text)
      break;
    }

    // ── TRIUNGHIURI ─────────────────────────────────────────────────────────────

    case 'tri-right':
      poly(ctx, [
        [L, B],
        [R, B],
        [L, T],
      ]);
      rightAngleMark(ctx, L, B, 1, -1, sq);
      break;

    case 'tri-equilateral': {
      const h = r * Math.sqrt(3);
      poly(ctx, [
        [cx, cy - (h * 2) / 3],
        [cx + r, cy + h / 3],
        [cx - r, cy + h / 3],
      ]);
      break;
    }

    case 'tri-isosceles':
      poly(ctx, [
        [cx, T],
        [R, B],
        [L, B],
      ]);
      break;

    case 'tri-scalene':
      poly(ctx, [
        [L + hw * 0.35, T],
        [R, B],
        [L, B],
      ]);
      break;

    // ── PATRULATER ──────────────────────────────────────────────────────────────

    case 'rhombus':
      poly(ctx, [
        [cx, T],
        [R, cy],
        [cx, B],
        [L, cy],
      ]);
      break;

    case 'parallelogram': {
      const sk = hw * 0.3;
      poly(ctx, [
        [L + sk, T],
        [R, T],
        [R - sk, B],
        [L, B],
      ]);
      break;
    }

    case 'trapezoid': {
      const ins = hw * 0.22;
      poly(ctx, [
        [L + ins, T],
        [R - ins * 1.5, T],
        [R, B],
        [L, B],
      ]);
      break;
    }

    case 'trap-right': {
      const ins = hw * 0.35;
      poly(ctx, [
        [L, T],
        [R - ins, T],
        [R, B],
        [L, B],
      ]);
      break;
    }

    case 'trap-isosceles': {
      const ins = hw * 0.28;
      poly(ctx, [
        [L + ins, T],
        [R - ins, T],
        [R, B],
        [L, B],
      ]);
      break;
    }

    // ── POLIGOANE REGULATE ──────────────────────────────────────────────────────

    case 'pentagon':
      poly(ctx, regularPts(5, cx, cy, r, -Math.PI / 2));
      break;
    case 'hexagon':
      poly(ctx, regularPts(6, cx, cy, r, 0));
      break;
    case 'heptagon':
      poly(ctx, regularPts(7, cx, cy, r, -Math.PI / 2));
      break;
    case 'octagon':
      poly(ctx, regularPts(8, cx, cy, r, Math.PI / 8));
      break;

    // ── CERCURI ─────────────────────────────────────────────────────────────────

    case 'arc':
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
      ctx.stroke();
      break;

    case 'sector':
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 4);
      ctx.closePath();
      ctx.stroke();
      break;

    case 'annulus':
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.52, 0, Math.PI * 2);
      ctx.stroke();
      break;

    // ── GEOMETRIE ÎN SPAȚIU ─────────────────────────────────────────────────────

    case 'cube': {
      const s = r * 0.78;
      // front face
      const fl: Pt = ob(cx, cy, -s, s, 0);
      const fr: Pt = ob(cx, cy, s, s, 0);
      const tr: Pt = ob(cx, cy, s, -s, 0);
      const tl: Pt = ob(cx, cy, -s, -s, 0);
      // back face (same + depth offset)
      const fl2: Pt = ob(cx, cy, -s, s, s * 2);
      const fr2: Pt = ob(cx, cy, s, s, s * 2);
      const tr2: Pt = ob(cx, cy, s, -s, s * 2);
      const tl2: Pt = ob(cx, cy, -s, -s, s * 2);
      // visible faces
      face3(ctx, [tl, tr, tr2, tl2]); // top
      face3(ctx, [tr, fr, fr2, tr2]); // right
      face3(ctx, [fl, fr, tr, tl]); // front
      // hidden edges dashed
      face3(ctx, [fl, fl2, fr2, fr], true);
      face3(ctx, [tl2, fl2], false); // single line hidden
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(fl2[0], fl2[1]);
      ctx.lineTo(tl2[0], tl2[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'cuboid': {
      const sw = hw * 0.72,
        sh = hh * 0.68;
      const sd = Math.min(sw, sh) * 0.9;
      const fl: Pt = ob(cx, cy, -sw, sh, 0);
      const fr: Pt = ob(cx, cy, sw, sh, 0);
      const tr: Pt = ob(cx, cy, sw, -sh, 0);
      const tl: Pt = ob(cx, cy, -sw, -sh, 0);
      const fl2: Pt = ob(cx, cy, -sw, sh, sd * 2);
      const fr2: Pt = ob(cx, cy, sw, sh, sd * 2);
      const tr2: Pt = ob(cx, cy, sw, -sh, sd * 2);
      const tl2: Pt = ob(cx, cy, -sw, -sh, sd * 2);
      face3(ctx, [tl, tr, tr2, tl2]);
      face3(ctx, [tr, fr, fr2, tr2]);
      face3(ctx, [fl, fr, tr, tl]);
      ctx.setLineDash([4, 4]);
      face3(ctx, [fl, fl2, fr2, fr]);
      ctx.beginPath();
      ctx.moveTo(fl2[0], fl2[1]);
      ctx.lineTo(tl2[0], tl2[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'prism-tri': {
      const s = r * 0.78;
      const d = s * 1.4;
      // triangle front
      const A: Pt = ob(cx, cy, 0, -s, 0);
      const BL: Pt = ob(cx, cy, -s, s, 0);
      const BR: Pt = ob(cx, cy, s, s, 0);
      // triangle back
      const A2: Pt = ob(cx, cy, 0, -s, d);
      const BL2: Pt = ob(cx, cy, -s, s, d);
      const BR2: Pt = ob(cx, cy, s, s, d);
      face3(ctx, [A, BR, BL]); // front triangle
      face3(ctx, [A2, BR2, BL2]); // back triangle
      face3(ctx, [A, A2, BR2, BR]); // right lateral
      face3(ctx, [BL, BR, BR2, BL2]); // bottom lateral
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(A2[0], A2[1]);
      ctx.moveTo(BL[0], BL[1]);
      ctx.lineTo(BL2[0], BL2[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'prism-hex': {
      const s = r * 0.65;
      const d = s * 1.2;
      const front = regularPts(6, 0, 0, s, 0);
      const back = front.map(([x, y]) => ob(cx, cy, x, -y, d));
      const frontS = front.map(([x, y]) => ob(cx, cy, x, -y, 0));
      face3(ctx, frontS);
      face3(ctx, back);
      // visible lateral edges (right half)
      for (let i = 0; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(frontS[i][0], frontS[i][1]);
        ctx.lineTo(back[i][0], back[i][1]);
        ctx.stroke();
      }
      ctx.setLineDash([4, 4]);
      for (let i = 4; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(frontS[i][0], frontS[i][1]);
        ctx.lineTo(back[i][0], back[i][1]);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      break;
    }

    case 'pyramid-sq': {
      const s = r * 0.72;
      const h = r * 1.1;
      // base
      const bl: Pt = ob(cx, cy, -s, s, 0);
      const br: Pt = ob(cx, cy, s, s, 0);
      const br2: Pt = ob(cx, cy, s, s, s * 2);
      const bl2: Pt = ob(cx, cy, -s, s, s * 2);
      // apex
      const apex: Pt = ob(cx, cy, 0, -h, s);
      face3(ctx, [bl, br, br2, bl2]); // base
      face3(ctx, [bl, br, apex]); // front face
      face3(ctx, [br, br2, apex]); // right face
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(bl2[0], bl2[1]);
      ctx.lineTo(apex[0], apex[1]);
      ctx.moveTo(bl[0], bl[1]);
      ctx.lineTo(bl2[0], bl2[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      face3(ctx, [bl2, br2, apex], true);
      break;
    }

    case 'tetrahedron': {
      const s = r * 0.85;
      const h = s * Math.sqrt(2 / 3);
      const A: Pt = [cx, cy - h * 1.2];
      const B: Pt = [cx + s * 0.9, cy + h * 0.7];
      const C: Pt = [cx - s * 0.9, cy + h * 0.7];
      const D: Pt = [cx + s * 0.3, cy + h * 0.05];
      face3(ctx, [A, B, C]); // front
      face3(ctx, [A, B, D]); // right
      ctx.setLineDash([4, 4]);
      face3(ctx, [A, C, D]);
      ctx.beginPath();
      ctx.moveTo(B[0], B[1]);
      ctx.lineTo(D[0], D[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      face3(ctx, [B, C, D], true);
      break;
    }

    case 'cone': {
      const s = r * 0.82;
      const h = r * 1.1;
      const apex: Pt = [cx, cy - h];
      // base ellipse
      ctx.beginPath();
      ctx.ellipse(cx, cy + h * 0.15, s, s * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      // visible base arc already drawn; now slant lines
      ctx.beginPath();
      ctx.moveTo(apex[0], apex[1]);
      ctx.lineTo(cx - s, cy + h * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(apex[0], apex[1]);
      ctx.lineTo(cx + s, cy + h * 0.15);
      ctx.stroke();
      // hide back half of base
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(cx, cy + h * 0.15, s, s * 0.32, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'cylinder': {
      const s = r * 0.78;
      const h = r * 1.0;
      // top ellipse
      ctx.beginPath();
      ctx.ellipse(cx, cy - h, s, s * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      // bottom ellipse (front half solid, back dashed)
      ctx.beginPath();
      ctx.ellipse(cx, cy + h, s, s * 0.32, 0, 0, Math.PI);
      ctx.stroke();
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(cx, cy + h, s, s * 0.32, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // vertical lines
      ctx.beginPath();
      ctx.moveTo(cx - s, cy - h);
      ctx.lineTo(cx - s, cy + h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + s, cy - h);
      ctx.lineTo(cx + s, cy + h);
      ctx.stroke();
      break;
    }

    case 'sphere': {
      // outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // equator (ellipse)
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.32, 0, 0, Math.PI);
      ctx.stroke();
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.32, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      // meridian
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.32, r, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
  }

  ctx.restore();
}

// ─── Preview draw (dashed outline) ───────────────────────────────────────────

export function drawGeomPreview(
  ctx: CanvasRenderingContext2D,
  geomKind: GeomKind,
  color: string,
  width: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.setLineDash([6, 4]);
  drawGeom(ctx, geomKind, color, width, x1, y1, x2, y2);
  ctx.restore();
}
