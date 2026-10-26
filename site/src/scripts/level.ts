// Level 1: one engine, two modes.
//   'ambient' : the footer. An autopilot runs the level and loops.
//   'play'    : the hidden mini game in the modal. Keyboard or touch.
// All art is original pixel art in the site's palette. Logical units are pixels; one tile is 16.
import { SPRITES } from '../components/sprites';

const T = 16, ROWS = 12, VIEW_H = ROWS * T, GROUND = 10, COLS = 204;
const FLAG_X = 186 * T + 7, CASTLE_X = 192 * T, CASTLE_DOOR = CASTLE_X + 24;
const PLANT_H = 30;   // head 14 + stem 16: only a perfectly timed full jump clears a plant that is out
const MAXV = 140, JUMP_V = 365, GRAV = 900, TIME_LIMIT = 120;   // jump ~74 px (lands on the brick rows); 2 minutes at most
const WIZ_X = CASTLE_X - 18, STOP_X = WIZ_X - 20;
const COL = { mint: '#21EF80', mintD: '#12B862', pink: '#FF63D8', ind: '#585EFF', indT: '#7A7FFF', indD: '#2E33B8', yellow: '#FFD23F', white: '#FFFFFF', ink: '#14141F' };

type Mode = 'ambient' | 'play';
export type Keys = { left: boolean; right: boolean; jump: boolean };

/* ---------- pixel baking ---------- */
function bake(rows: string[], pal: Record<string, string>) {
  const w = Math.max(...rows.map((r) => r.length)), c = document.createElement('canvas');
  c.width = w; c.height = rows.length;
  const g = c.getContext('2d')!;
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.' && pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); } }));
  return c;
}
function tile(draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas'); c.width = c.height = T;
  const g = c.getContext('2d')!; draw(g); return c;
}
const spr = (name: string) => bake(SPRITES[name].rows, SPRITES[name].pal);

let ART: ReturnType<typeof makeArt> | null = null;
function makeArt() {
  const brickRows = (g: CanvasRenderingContext2D, y0: number, fill: string, mortar: string, off: boolean) => {
    g.fillStyle = fill; g.fillRect(0, y0, T, T - y0);
    g.fillStyle = mortar;
    for (let y = y0 + 7; y < T; y += 8) g.fillRect(0, y, T, 1);
    g.fillRect(0, T - 1, T, 1);
    g.fillRect(off ? 3 : 7, y0, 1, 8 - (y0 % 8)); g.fillRect(off ? 11 : 15, y0 + 8, 1, 7);
  };
  const crop = (rows: string[], pal: Record<string, string>) => bake(rows, pal);
  const cactusTop = ['....GGGG....', '....GGDG....', '.GG.GGGG.GG.', '.GG.GGDG.GG.', '.GGGGGGGGGG.', '.GGGGGDGGGG.'];
  const trunk = Array.from({ length: 12 }, (_, i) => (i % 2 ? '....GGDG....' : '....GGGG....'));
  // chomping pipe plant: red head with white spots, white lips and teeth (16 x 14)
  // pipe plant head, classic style: round red head with white spots; the jaws open upward in a V edged with white lips
  const plantOpen = ['RR............RR', 'RRR..........RRR', 'RWRW........WRWR', 'RRRRW......WRRRR', '.RRRRW....WRRRR.', '.RWRRWW..WWRRWR.', '..RRRRWKKWRRRR..',
    '..RRRRRWWRRRRR..', '..RRWRRRRRRWRR..', '...RRRRRRRRRR...', '...RRRWRRWRRR...', '....RRRRRRRR....', '.....RRRRRR.....', '......RRRR......'];
  const plantShut = ['......RRRR......', '....RRRWWRRR....', '...RWRRWWRRWR...', '..RRRRRWWRRRRR..', '.RRWRRRWWRRRWRR.', '.RRRRRRWWRRRRRR.', 'RRRRWRRWWRRWRRRR',
    'RRRRRRRWWRRRRRRR', '.RRWRRRRRRRRWRR.', '.RRRRRRRRRRRRRR.', '..RRRRWRRWRRRR..', '...RRRRRRRRRR...', '....RRRRRRRR....', '......RRRR......'];
  // the bouncing duck: green shell, white rim and flapping wing, yellow head, orange beak and feet (14 x 10, two wing frames)
  const duckBody = ['..SSSSSS.YYYOO', '.SSDSSDSSYY...', 'SSSSSSSSSSY...', 'SDSSDSSDSS....', 'WWWWWWWWWW....', '.FF....FF.....'];
  const duckA = ['....WW........', '...WWWW...YY..', '..WWWWW..YYYY.', '...WWW...YYEYO', ...duckBody];
  const duckB = ['..............', '..........YY..', '.........YYYY.', '.WWWW....YYEYO', 'WWWSSSSS.YYYOO', ...duckBody.slice(1)];
  const dk = { S: COL.mint, D: COL.mintD, W: COL.white, Y: COL.yellow, O: '#FF9F1C', F: '#FF9F1C', E: COL.ink };
  const pp = { R: '#E0303A', W: COL.white, K: COL.ink };
  return {
    wizard: bake(['.....VV.....', '....VVVV....', '....VYVV....', '...VVVVVV...', '..VVVVVVVV..', '.VVVVVVVVVV.', '...SSSSSSS..', '...SESSESS..', '..WWWWWWWW..', '..WWWWWWWW..', '...WWWWWW...', '..VVVVVVVV..', '.VVVDVVDVVV.', '.VVVVVVVVVV.', '.VVVDVVDVVV.', '.VVVVVVVVVV.', '.DDDDDDDDDD.', '..BB....BB..'], { V: '#7A3FD1', D: '#4B2394', Y: COL.yellow, S: '#FFB38A', E: COL.ink, W: '#FFFFFF', B: '#8A5A2A' }),
    scroll: bake(['OCCCCCCCCO', 'OCTTTTTTCO', 'OCCCCCCCCO', 'OCTTTTCCCO', 'OCCCCCCCCO', 'OCCCRRCCCO', 'OCCCRRCCCO', 'OOOOOOOOOO'], { C: '#FFF1DA', O: '#D9B77A', T: '#8A6A3A', R: '#E0507A' }),
    heart: spr('heart'), heroA: spr('heroRunA'), heroB: spr('heroRunB'), heroS: spr('hero'), tree: spr('tree'),
    coin: bake(['..YYYY..', '.YYOOYY.', 'YYYOOYYY', 'YYYOOYYY', 'YYYOOYYY', 'YYYOOYYY', 'YYYOOYYY', 'YYYOOYYY', '.YYOOYY.', '..YYYY..'], { Y: COL.yellow, O: '#E0A820' }),
    mush: bake(['...PPPPPP...', '.PPPPWWPPPP.', 'PPWWPWWPPWWP', 'PPWWPPPPPWWP', 'PPPPPPPPPPPP', '.CCCCCCCCCC.', '..CECCCCEC..', '..CCCCCCCC..', '..CCCCCCCC..', '...CCCCCC...'], { P: COL.pink, W: COL.white, C: '#FFE7C2', E: COL.ink }),
    cactus: crop([...cactusTop, ...trunk], { G: '#3DDC7A', D: COL.mintD }),
    plantOpen: bake(plantOpen, pp), plantShut: bake(plantShut, pp), duckA: bake(duckA, dk), duckB: bake(duckB, dk),
    gTop: tile((g) => { g.fillStyle = COL.mint; g.fillRect(0, 0, T, 3); g.fillStyle = COL.mintD; g.fillRect(0, 3, T, 2); brickRows(g, 5, COL.ind, COL.indD, false); }),
    gBot: tile((g) => brickRows(g, 0, COL.ind, COL.indD, true)),
    brick: tile((g) => { g.fillStyle = '#1b1d5c'; g.fillRect(0, 0, T, T); brickRows(g, 0, COL.indT, COL.ink, false); g.fillStyle = '#A9ADFF'; g.fillRect(0, 0, T, 1); }),
    qb: tile((g) => { g.fillStyle = COL.yellow; g.fillRect(0, 0, T, T); g.fillStyle = '#E0A820'; g.fillRect(0, T - 2, T, 2); g.fillRect(T - 2, 0, 2, T); g.fillStyle = COL.ink;
      [[6, 3, 4, 2], [10, 5, 2, 3], [7, 8, 3, 2], [7, 11, 2, 2]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h)); g.fillStyle = '#fff'; g.fillRect(0, 0, T, 1); }),
    used: tile((g) => { g.fillStyle = '#3a3a5a'; g.fillRect(0, 0, T, T); g.fillStyle = '#2a2a44'; g.fillRect(0, T - 2, T, 2); g.fillRect(T - 2, 0, 2, T); }),
    hard: tile((g) => { g.fillStyle = COL.indD; g.fillRect(0, 0, T, T); g.fillStyle = COL.ind; g.fillRect(0, 0, T, 2); g.fillRect(0, 0, 2, T); g.fillStyle = COL.ink; g.fillRect(0, T - 2, T, 2); g.fillRect(T - 2, 0, 2, T); }),
  };
}

/* ---------- level data ---------- */
type Pipe = { x: number; h: number; phase: number; ext: number };
function buildWorld() {
  const g: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let x = 0; x < COLS; x++) { g[10][x] = 1; g[11][x] = 1; }
  const set = (x: number, y: number, v: number) => { g[y][x] = v; };
  // first block run: ? coin, brick, ? MUSHROOM, brick, ? coin
  [[20, 3], [21, 2], [22, 4], [23, 2], [24, 3]].forEach(([x, v]) => set(x, 7, v));
  for (let x = 80; x <= 86; x++) set(x, 6, x === 83 ? 3 : 2);
  for (let x = 141; x <= 147; x++) set(x, 7, x === 144 ? 4 : x === 142 || x === 146 ? 3 : 2);
  const pipes: Pipe[] = [46, 66, 100, 131, 156].map((x, i) => ({ x, h: 2, phase: i * 1.1, ext: 0 }));
  pipes.forEach((p) => { for (let y = GROUND - p.h; y < GROUND; y++) { set(p.x, y, 6); set(p.x + 1, y, 6); } });
  for (let i = 0; i < 4; i++) for (let y = GROUND - 1 - i; y < GROUND; y++) set(172 + i, y, 5);   // stairs
  const cacti = [34, 40, 56, 57, 93, 108, 118, 119, 124, 150, 164].map((x) => ({ x: x * T + 2, y: GROUND * T - 18, w: 12, h: 18 }));
  const coins: { x: number; y: number; got: boolean }[] = [];
  const row = (x0: number, n: number, y: number) => { for (let i = 0; i < n; i++) coins.push({ x: (x0 + i) * T + 4, y: y * T + 3, got: false }); };
  row(12, 5, 8); row(37, 3, 6); row(70, 4, 5); row(80, 7, 4); row(96, 5, 7); row(112, 5, 6); row(128, 6, 5); row(141, 7, 5); row(160, 4, 6);
  for (let i = 0; i < 5; i++) coins.push({ x: (64 + i) * T + 2, y: (8 - Math.sin((i / 4) * Math.PI) * 3) * T, got: false });
  const ducks = [78].map((c) => ({ x: c * T, y: GROUND * T - 20, vx: -34, vy: 0, home: c * T, hop: 0.3, dead: false }));
  // easter-egg bricks: look ordinary, but keep paying out (more each time) when bumped again and again
  const multi: Record<string, number> = { '21,7': 0, '84,6': 0, '145,7': 0 };
  return { g, pipes, cacti, coins, ducks, multi };
}

/* ---------- engine ---------- */
export function createLevel(canvas: HTMLCanvasElement, opts: { mode: Mode; onEnd?: (r: { won: boolean; score: number }) => void }) {
  const ctx = canvas.getContext('2d')!;
  const ambient = opts.mode === 'ambient';
  const art = (ART ??= makeArt());
  const keys: Keys = { left: false, right: false, jump: false };
  let auto = false, s = 1, viewW = 400, world = buildWorld(), raf = 0, last = 0, t = 0, running = false, muted = false;
  let phase: 'ready' | 'play' | 'dying' | 'slide' | 'walk' | 'scroll' | 'clear' | 'over' = ambient ? 'play' : 'ready';
  let h = { x: 40, y: GROUND * T - 20, vx: 0, vy: 0, ground: true, big: false, face: 1, inv: 0, anim: 0 };
  let flagT = 0, scrollT = 0, coyote = 0, buf = 0, score = 0, coinN = 0, lives = 3, timeLeft = TIME_LIMIT, hold = 0, jumpWas = false, flagBonus = 0, deadT = 0, cam = 0, ambientWait = 0;
  let mush: { x: number; y: number; vx: number; vy: number }[] = [];
  let bumps: { x: number; y: number; t: number }[] = [];
  let bits: { x: number; y: number; vx: number; vy: number; c: string; t: number }[] = [];
  let pops: { x: number; y: number; txt: string; t: number }[] = [];
  let cpops: { x: number; y: number; vy: number; t: number }[] = [];
  const stars = Array.from({ length: 90 }, (_, i) => ({ x: (i * 97) % 1600, y: (i * 53) % 130, p: i % 5 }));
  const size = () => (h.big ? { w: 13, h: 30 } : { w: 10, h: 20 });

  /* audio (play mode only, tiny) */
  let AC: AudioContext | null = null;
  const beep = (f: number, f2: number, d: number, type: OscillatorType = 'square', v = 0.04) => {
    if (ambient || muted) return;
    try {
      AC ??= new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = AC.createOscillator(), g = AC.createGain(), n = AC.currentTime;
      o.type = type; o.frequency.setValueAtTime(f, n); o.frequency.exponentialRampToValueAtTime(f2, n + d);
      g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(0.0001, n + d);
      o.connect(g); g.connect(AC.destination); o.start(n); o.stop(n + d + 0.02);
    } catch { /* audio is optional */ }
  };

  const solid = (tx: number, ty: number) => {
    if (tx < 0 || tx >= COLS) return true;
    if (ty < 0) return false;
    if (ty >= ROWS) return true;
    return world.g[ty][tx] !== 0;
  };
  let lastDeath = '';
  const reset = (respawn = false) => {
    world = buildWorld(); mush = []; bumps = []; bits = []; pops = []; cpops = [];
    h = { x: 40, y: GROUND * T - 20, vx: 0, vy: 0, ground: true, big: false, face: 1, inv: 0, anim: 0 };
    timeLeft = TIME_LIMIT; cam = 0; hold = 0; ambientWait = 0; scrollT = 0; flagT = 0; coyote = 0; buf = 0; phase = ambient || respawn ? 'play' : 'ready';
  };
  const fullReset = () => { score = 0; coinN = 0; lives = 3; reset(); };
  const add = (n: number, x: number, y: number) => { score += n; pops.push({ x, y, txt: String(n), t: 0 }); };

  function bump(tx: number, ty: number) {
    const c = world.g[ty][tx], key = `${tx},${ty}`;
    if (c === 2 && key in world.multi) {
      const n = ++world.multi[key]; coinN++; bumps.push({ x: tx, y: ty, t: 0 });
      add(100 * n, tx * T, ty * T - 12); cpops.push({ x: tx * T + 4, y: ty * T - 10, vy: -230, t: 0 });
      beep(660 + n * 70, 1100 + n * 90, 0.12);
      if (n >= 10) { world.g[ty][tx] = 7; delete world.multi[key]; }
      return;
    }
    if (c === 2) {
      world.g[ty][tx] = 0; add(50, tx * T, ty * T - 4); beep(150, 60, 0.12, 'sawtooth');
      for (let i = 0; i < 4; i++) bits.push({ x: tx * T + 4 + (i % 2) * 6, y: ty * T + 4 + (i >> 1) * 6, vx: (i % 2 ? 1 : -1) * (30 + i * 8), vy: -140 - i * 12, c: COL.indT, t: 0 });
    } else if (c === 3) {
      world.g[ty][tx] = 7; bumps.push({ x: tx, y: ty, t: 0 }); coinN++; add(200, tx * T, ty * T - 12); beep(988, 1319, 0.16);
    } else if (c === 4) {
      world.g[ty][tx] = 7; bumps.push({ x: tx, y: ty, t: 0 }); mush.push({ x: tx * T + 2, y: ty * T - 11, vx: 42, vy: 0 }); beep(300, 700, 0.18, 'triangle');
    } else if (c !== 0) bumps.push({ x: tx, y: ty, t: 0 });
  }

  function moveHero(dt: number) {
    const { w, h: hh } = size();
    // horizontal
    const target = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const turning = target !== 0 && h.vx !== 0 && Math.sign(target) !== Math.sign(h.vx);
    const acc = (turning ? 4800 : h.ground ? 2800 : 2000) * dt;
    if (target) { h.vx += Math.sign(target * MAXV - h.vx) * Math.min(acc, Math.abs(target * MAXV - h.vx)); h.face = target; }
    else h.vx -= Math.sign(h.vx) * Math.min(Math.abs(h.vx), (h.ground ? 3200 : 1000) * dt);
    h.x += h.vx * dt;
    let top = Math.floor(h.y / T), bot = Math.floor((h.y + hh - 0.01) / T);
    if (h.vx > 0) { const tx = Math.floor((h.x + w) / T); for (let ty = top; ty <= bot; ty++) if (solid(tx, ty)) { h.x = tx * T - w; h.vx = 0; break; } }
    else if (h.vx < 0) { const tx = Math.floor(h.x / T); for (let ty = top; ty <= bot; ty++) if (solid(tx, ty)) { h.x = (tx + 1) * T; h.vx = 0; break; } }
    // jump (variable height)
    // forgiving jump: a short grace after leaving a ledge and a short buffer before landing
    coyote = h.ground ? 0.09 : coyote - dt; buf = keys.jump && !jumpWas ? 0.11 : buf - dt;
    if (buf > 0 && coyote > 0) { h.vy = -JUMP_V; h.ground = false; buf = 0; coyote = 0; beep(330, 660, 0.14, 'square', 0.03); }
    if (!keys.jump && h.vy < -120) h.vy = -120;
    jumpWas = keys.jump;
    // vertical
    h.vy += GRAV * dt; h.y += h.vy * dt; h.ground = false;
    const l = Math.floor(h.x / T), r = Math.floor((h.x + w - 0.01) / T);
    if (h.vy > 0) {
      const ty = Math.floor((h.y + hh) / T);
      for (let tx = l; tx <= r; tx++) if (solid(tx, ty)) { h.y = ty * T - hh; h.vy = 0; h.ground = true; break; }
    } else if (h.vy < 0) {
      const ty = Math.floor(h.y / T);
      for (let tx = l; tx <= r; tx++) if (solid(tx, ty)) {
        const cx = Math.floor((h.x + w / 2) / T); const pick = solid(cx, ty) ? cx : tx;
        h.y = (ty + 1) * T; h.vy = 0; bump(pick, ty); break;
      }
    }
    if (h.y > VIEW_H + 40) die('fall');
  }

  const rect = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function hurt(why = '') {
    if (ambient || h.inv > 0 || phase !== 'play') return;
    if (h.big) { h.big = false; h.inv = 1.6; h.y += 10; beep(400, 120, 0.25, 'sawtooth'); } else die(why);
  }
  function die(why = '') {
    if (phase === 'dying' || ambient) { if (ambient) reset(); return; }
    lastDeath = `${why} x=${Math.round(h.x)} y=${Math.round(h.y)}`; phase = 'dying'; deadT = 0; h.vy = -200; h.vx = 0; beep(440, 90, 0.6, 'triangle', 0.05);
  }
  function plantRect(p: Pipe) { return { x: p.x * T + 9, y: (GROUND - p.h) * T - p.ext + 2, w: 14, h: Math.max(0, Math.min(p.ext, 14) - 2) }; }   // the head bites, the stem does not

  function ai() {
    keys.right = true; keys.left = false;
    const { w, h: hh } = size();
    const feet = h.y + hh - 4, ax = Math.floor((h.x + w + 14) / T);
    const wall = solid(ax, Math.floor(feet / T)) || solid(ax, Math.floor((feet - 14) / T));
    const cact = world.cacti.some((c) => c.x > h.x + w && c.x - (h.x + w) < 22 && c.y + c.h > h.y);
    const pipe = world.pipes.some((p) => p.x * T > h.x + w && p.x * T - (h.x + w) < 20);
    // cross only when the plant is down with time to spare (its cycle is 4.2 s; it is fully hidden from 3.8 s to 1.4 s)
    const plantUp = world.pipes.some((p) => { const c = p.phase % 4.2; return p.x * T > h.x + w && p.x * T - (h.x + w) < 56 && (p.ext > 0 || (c > 0.5 && c < 3.8)); });
    const duck = world.ducks.some((dd) => !dd.dead && dd.x > h.x + w - 4 && dd.x - (h.x + w) < 34);
    if (plantUp && h.ground) { keys.right = false; keys.jump = false; return; }   // wait for the plant to sink
    const under = h.ground && [20, 21, 22, 23, 24, 142, 143, 144, 145, 146].some((c) => Math.abs(h.x + w / 2 - (c * T + 8)) < 2.5) && Math.random() < 0.5;
    keys.jump = h.ground ? wall || cact || pipe || duck || under : keys.jump && h.vy < 0;   // hold while rising = full-height jump
  }

  function update(dt: number) {
    t += dt;
    if (phase === 'slide' || phase === 'walk' || phase === 'scroll' || phase === 'clear') flagT = Math.min(1, flagT + dt / 1.4);   // the flag is raised once he reaches the pole
    if (phase === 'ready') return;
    if (phase === 'over' || phase === 'clear') {
      if (ambient && phase === 'clear') { ambientWait += dt; if (ambientWait > 2.6) { reset(); } }
      bits.forEach((b) => { b.vy += GRAV * 0.6 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.t += dt; }); bits = bits.filter((b) => b.t < 1.6);
      return;
    }
    if (phase === 'dying') {
      deadT += dt; h.vy += GRAV * dt; h.y += h.vy * dt;
      if (deadT > 1.3) { lives--; if (lives <= 0) { phase = 'over'; opts.onEnd?.({ won: false, score }); } else reset(true); }
      return;
    }
    if (phase === 'slide') {
      h.y += 110 * dt; const { h: hh } = size();
      if (h.y + hh >= GROUND * T) { h.y = GROUND * T - hh; phase = 'walk'; h.x = FLAG_X + 4; h.face = 1; }
      return;
    }
    if (phase === 'walk') {
      h.x += 70 * dt; h.anim += dt;
      if (h.x >= STOP_X) { h.x = STOP_X; phase = 'scroll'; scrollT = 0; beep(392, 523, 0.25, 'triangle', 0.04); }
      return;
    }
    if (phase === 'scroll') {
      scrollT += dt; h.anim = 0;
      if (scrollT >= 1.4) {
        phase = 'clear'; ambientWait = 0; score += Math.max(0, Math.ceil(timeLeft)) * 50;
        pops.push({ x: h.x - 14, y: h.y - 26, txt: 'LEVEL CLEAR!', t: -0.9 });
        for (let i = 0; i < 44; i++) bits.push({ x: h.x + 6, y: h.y, vx: (Math.random() - 0.5) * 170, vy: -40 - Math.random() * 190, c: [COL.yellow, COL.pink, COL.mint, COL.indT][i % 4], t: 0 });
        beep(523, 1046, 0.5, 'square', 0.05); setTimeout(() => beep(784, 1568, 0.5, 'square', 0.05), 220);
        opts.onEnd?.({ won: true, score });
      }
      return;
    }
    // playing
    if (ambient || auto) ai();
    // timer
    if (!ambient) { timeLeft -= dt; if (timeLeft <= 0) { timeLeft = 0; die('time'); return; } }
    moveHero(Math.min(dt, 1 / 60));
    h.anim += dt * Math.abs(h.vx) / 40; if (h.inv > 0) h.inv -= dt;
    const { w, h: hh } = size(); const hb = { x: h.x + 1, y: h.y + 2, w: w - 2, h: hh - 2 };
    // coins
    world.coins.forEach((c) => { if (!c.got && rect(hb, { x: c.x, y: c.y, w: 8, h: 10 })) { c.got = true; coinN++; add(200, c.x, c.y - 4); beep(988, 1319, 0.12); } });
    // hazards
    world.cacti.forEach((c) => { if (rect(hb, { x: c.x + 1, y: c.y + 2, w: c.w - 2, h: c.h - 2 })) hurt('cactus'); });
    world.pipes.forEach((p) => {
      const near = Math.abs(h.x + w / 2 - (p.x * T + 16)) < 28;
      p.phase += dt; const c = p.phase % 4.2;
      const want = c < 1.4 ? 0 : c < 1.9 ? (c - 1.4) / 0.5 : c < 3.3 ? 1 : c < 3.8 ? 1 - (c - 3.3) / 0.5 : 0;
      // like the original: a plant that is already out stays out for its whole bite; it only refuses to come out while you stand beside the pipe
      const target = near && p.ext <= 0 ? 0 : want * PLANT_H;
      p.ext += Math.max(-70 * dt, Math.min(70 * dt, target - p.ext));
      if (p.ext > 6 && rect(hb, plantRect(p))) hurt('plant');
    });
    world.ducks.forEach((dd) => {
      if (dd.dead) return;
      dd.vy += GRAV * dt; dd.x += dd.vx * dt; dd.y += dd.vy * dt;
      if (Math.abs(dd.x - dd.home) > 3 * T || solid(Math.floor((dd.x + (dd.vx > 0 ? 28 : 0)) / T), Math.floor((dd.y + 8) / T))) { dd.vx = -dd.vx; dd.x += dd.vx * dt * 2; }
      const gy = Math.floor((dd.y + 20) / T);
      if (dd.vy > 0 && solid(Math.floor((dd.x + 14) / T), gy)) { dd.y = gy * T - 20; dd.vy = 0; dd.hop -= dt; if (dd.hop <= 0) { dd.vy = -220; dd.hop = 0.45; } }
      if (rect(hb, { x: dd.x + 2, y: dd.y + 2, w: 24, h: 18 })) {
        if (h.vy > 40 && h.y + hh - 8 < dd.y + 6) { dd.dead = true; h.vy = -200; add(100, dd.x, dd.y - 8); beep(520, 180, 0.12, 'square', 0.04); }   // stomp
        else hurt('duck');
      }
    });
    // mushrooms
    mush.forEach((m) => {
      m.vy += GRAV * dt; m.x += m.vx * dt;
      if (solid(Math.floor((m.x + (m.vx > 0 ? 12 : 0)) / T), Math.floor((m.y + 5) / T))) { m.vx = -m.vx; m.x += m.vx * dt * 2; }
      m.y += m.vy * dt;
      const ty = Math.floor((m.y + 10) / T);
      if (m.vy > 0 && (solid(Math.floor((m.x + 2) / T), ty) || solid(Math.floor((m.x + 9) / T), ty))) { m.y = ty * T - 10; m.vy = 0; }
      if (rect(hb, { x: m.x, y: m.y, w: 12, h: 10 })) {
        (m as any).dead = true; add(1000, m.x, m.y - 8); beep(392, 1568, 0.35, 'triangle', 0.05);
        if (!h.big) { h.big = true; h.y -= 10; pops.push({ x: m.x - 8, y: m.y - 20, txt: 'SKILL UP!', t: 0 }); }
      }
    });
    mush = mush.filter((m) => !(m as any).dead && m.y < VIEW_H + 20);
    // flag
    if (hb.x + hb.w > FLAG_X && hb.x < FLAG_X + 3 && hb.y + hb.h > 3 * T) {
      phase = 'slide'; h.x = FLAG_X - w + 1; h.vx = 0;
      flagBonus = Math.round(400 + (Math.min(1, Math.max(0, (GROUND * T - (h.y + hh)) / (7 * T)))) * 4600 / 100) * 100; add(flagBonus, FLAG_X - 10, h.y - 10);
      beep(1046, 262, 0.7, 'square', 0.05);
    }
    // block bounce timers, particles, pops
    bumps.forEach((b) => (b.t += dt)); bumps = bumps.filter((b) => b.t < 0.18);
    bits.forEach((b) => { b.vy += GRAV * 0.6 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.t += dt; }); bits = bits.filter((b) => b.t < 1.6);
    pops.forEach((p) => { p.t += dt; if (p.t > 0) p.y -= 26 * dt; }); pops = pops.filter((p) => p.t < 0.9);
    cpops.forEach((q) => { q.t += dt; q.vy += 900 * dt; q.y += q.vy * dt; }); cpops = cpops.filter((q) => q.t < 0.5);
  }

  /* ---------- drawing ---------- */
  const R = (x: number, y: number, w: number, hh: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, hh); };
  const S = (img: HTMLCanvasElement, x: number, y: number, w = img.width, hh = img.height, flip = false) => {
    x = Math.round(x); y = Math.round(y);
    if (flip) { ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, w, hh); ctx.restore(); } else ctx.drawImage(img, x, y, w, hh);
  };
  function mound(cx: number, w: number, hh: number, col: string) {
    for (let r = 0; r < hh / 4; r++) { const ww = w * Math.sqrt(1 - (r / (hh / 4)) ** 2); R(cx - ww / 2, GROUND * T - hh + r * 4, ww, 4, col); }
  }
  function cloud(x: number, y: number, a: number) {
    ctx.globalAlpha = a; R(x + 8, y, 24, 6, COL.indT); R(x, y + 6, 44, 6, COL.indT); R(x + 4, y + 12, 36, 4, COL.indT); ctx.globalAlpha = 1;
  }
  function draw() {
    const dpr = canvas.width;
    ctx.setTransform(s, 0, 0, s, 0, 0); ctx.imageSmoothingEnabled = false;
    R(0, 0, viewW, VIEW_H, '#06071a');
    const camX = Math.round(cam);
    ctx.save(); ctx.translate(-camX, 0);
    // the wizard's tower
    const TW = 36, TH = 88, ty0 = GROUND * T - TH, tx0 = CASTLE_X;
    R(tx0, ty0, TW, TH, COL.ind); for (let y = ty0 + 8; y < GROUND * T; y += 8) R(tx0, y, TW, 1, COL.indD);
    R(tx0, ty0, 3, TH, '#7A7FFF'); R(tx0 + TW - 3, ty0, 3, TH, COL.indD);
    R(tx0 - 3, ty0 - 4, TW + 6, 5, COL.indD);
    for (let r = 0; r < 7; r++) R(tx0 - 3 + r * 2.5, ty0 - 4 - (r + 1) * 5, TW + 6 - r * 5, 5, r % 2 ? '#6a35b8' : '#7A3FD1');
    R(tx0 + TW / 2 - 1, ty0 - 4 - 42, 2, 8, COL.yellow);
    R(tx0 + TW / 2 - 7, GROUND * T - 22, 14, 22, '#000'); R(tx0 + TW / 2 - 5, GROUND * T - 25, 10, 4, '#000');
    [ty0 + 12, ty0 + 38].forEach((wy) => { R(tx0 + TW / 2 - 4, wy, 8, 12, COL.yellow); R(tx0 + TW / 2 - 4, wy + 5, 8, 1, '#E0A820'); });
    // the wizard (faces the hero) with a glowing staff
    const wy0 = GROUND * T - 18 + (Math.sin(t * 3) > 0 ? 0 : 1);
    S(art.wizard, WIZ_X, wy0, 12, 18, true);
    R(WIZ_X + 13, GROUND * T - 26, 2, 26, '#8A5A2A'); const glow = Math.floor(t * 4) % 2 ? COL.yellow : '#fff6b0'; R(WIZ_X + 12, GROUND * T - 31, 4, 5, glow);
    if (phase === 'clear') { const bob = Math.sin(t * 5) * 2; S(bakeStar(), WIZ_X - 2, ty0 - 70 + bob, 15, 15); }
    // flagpole
    R(FLAG_X, 3 * T, 2, 7 * T, '#cfcfe8'); R(FLAG_X - 2, 3 * T - 4, 6, 5, COL.yellow);
    const flagLow = GROUND * T - 14, flagHigh = 3 * T + 2, fe = 1 - (1 - flagT) * (1 - flagT);
    R(FLAG_X + 2, flagLow + (flagHigh - flagLow) * fe, 12, 8, COL.pink);
    // plants (behind pipe bodies)
    world.pipes.forEach((p) => {
      if (p.ext > 0) {
        const open = Math.floor(t * 4) % 2 === 0; const top = (GROUND - p.h) * T - p.ext;
        R(p.x * T + 15, top + 13, 2, p.ext, COL.mint); R(p.x * T + 9, top + 19, 6, 3, COL.mint); R(p.x * T + 17, top + 23, 6, 3, COL.mint);
        ctx.save(); ctx.beginPath(); ctx.rect(p.x * T, 0, 32, (GROUND - p.h) * T); ctx.clip();
        S(open ? art.plantOpen : art.plantShut, p.x * T + 8, top, 16, 14); ctx.restore();
      }
    });
    // tiles in view
    const x0 = Math.max(0, Math.floor(camX / T) - 1), x1 = Math.min(COLS - 1, Math.ceil((camX + viewW) / T) + 1);
    for (let ty = 0; ty < ROWS; ty++) for (let tx = x0; tx <= x1; tx++) {
      const c = world.g[ty][tx]; if (!c) continue;
      const b = bumps.find((q) => q.x === tx && q.y === ty); const off = b ? -Math.round(Math.sin((b.t / 0.18) * Math.PI) * 5) : 0;
      const X = tx * T, Y = ty * T + off;
      if (c === 1) S(ty === GROUND ? art.gTop : art.gBot, X, Y);
      else if (c === 2) S(art.brick, X, Y); else if (c === 3 || c === 4) S(Math.floor(t * 3) % 4 === 0 ? art.used : art.qb, X, Y);
      else if (c === 7) S(art.used, X, Y); else if (c === 5) S(art.hard, X, Y);
      else if (c === 6) { const lip = world.g[ty - 1]?.[tx] !== 6; R(X, Y, T, T, COL.mint); R(X, Y, T, 2, COL.mintD); if (lip) { R(X - (tx % 2 === 0 ? 2 : 0), Y, T + 2, 5, COL.mintD); R(X - (tx % 2 === 0 ? 2 : 0), Y, T + 2, 2, COL.white); } R(X + (tx % 2 ? 11 : 2), Y + 5, 2, T - 5, '#9affc6'); }
    }
    // coins
    const cw = Math.abs(Math.cos(t * 5));
    world.coins.forEach((c) => { if (!c.got && c.x > camX - 20 && c.x < camX + viewW + 20) S(art.coin, c.x + (8 - 8 * cw) / 2, c.y, Math.max(2, 8 * cw), 10); });
    world.cacti.forEach((c) => S(art.cactus, c.x, c.y, 12, 18));
    world.ducks.forEach((dd) => { if (!dd.dead) S(Math.floor(t * 6) % 2 ? art.duckA : art.duckB, dd.x, dd.y, 28, 20, dd.vx > 0); });
    mush.forEach((m) => S(art.mush, m.x, m.y, 12, 10));
    // hero
    drawHero();
    bits.forEach((b) => R(b.x, b.y, 3, 3, b.c));
    ctx.font = '6px "Press Start 2P", monospace'; ctx.textBaseline = 'top';
    cpops.forEach((q) => { const sw = Math.abs(Math.cos(q.t * 18)); S(art.coin, q.x + (8 - 8 * sw) / 2, q.y, Math.max(2, 8 * sw), 10); });
    pops.forEach((p) => { if (p.t < 0) return; ctx.fillStyle = COL.white; ctx.fillText(p.txt, Math.round(p.x), Math.round(p.y)); });
    ctx.restore();
    if (!ambient) hud();
    void dpr;
  }
  let starImg: HTMLCanvasElement | null = null;
  const bakeStar = () => (starImg ??= bake(['.......Y.......', '......YYY......', '......YYY......', '.....YYYYY.....', 'YYYYYYYYYYYYYYY', '.YYYYYYYYYYYYY.', '..YYYYYYYYYYY..', '...YYYYYYYYY...', '..YYYYYYYYYYY..', '..YYYYY.YYYYY..', '.YYYY.....YYYY.', '.YY.........YY.'], { Y: COL.yellow }));
  function drawHero() {
    if (h.inv > 0 && Math.floor(t * 14) % 2 === 0) return;
    const { w, h: hh } = size();
    const img = h.ground ? (Math.abs(h.vx) > 8 || phase === 'walk' ? (Math.floor(h.anim * 2.4) % 2 ? art.heroB : art.heroA) : art.heroS) : art.heroA;
    const dw = h.big ? 21 : 14, dh = hh, x = h.x + w / 2 - dw / 2;
    ctx.save();
    if (phase === 'dying') { ctx.translate(x + dw / 2, h.y + dh / 2); ctx.rotate(Math.sin(deadT * 10) * 0.4); ctx.translate(-(x + dw / 2), -(h.y + dh / 2)); }
    S(img, x, h.y, dw, dh, h.face < 0);
    ctx.restore();
    // the internship scroll: flies from the wizard's hand to Aritra, then he holds it up
    if (phase === 'scroll') { const k = Math.min(1, scrollT / 1.2), e = k * k * (3 - 2 * k); S(art.scroll, WIZ_X - 4 + (h.x + 12 - (WIZ_X - 4)) * e, GROUND * T - 14 + (h.y + 6 - (GROUND * T - 14)) * e - Math.sin(k * Math.PI) * 14, 10, 8); }
    if (phase === 'clear') S(art.scroll, h.x + 1, h.y - 10 + Math.sin(t * 6) * 1.5, 10, 8);
  }
  function hud() {
    const sh = (txt: string, x: number, y: number, c = COL.white) => { ctx.fillStyle = '#000'; ctx.fillText(txt, x + 1, y + 1); ctx.fillStyle = c; ctx.fillText(txt, x, y); };
    ctx.font = '8px "Press Start 2P", monospace'; ctx.textBaseline = 'top';
    sh(`SCORE ${String(score).padStart(6, '0')}`, 6, 6, COL.pink);
    sh(`COINS ${String(coinN).padStart(2, '0')}`, Math.round(viewW * 0.34), 6, COL.yellow);
    sh(`TIME ${String(Math.max(0, Math.ceil(timeLeft))).padStart(3, '0')}`, Math.round(viewW * 0.58), 6, timeLeft < 20 ? COL.pink : COL.mint);
    for (let i = 0; i < lives; i++) ctx.drawImage(art.heart, viewW - 12 - i * 10, 6, 7, 6);
    const msg = phase === 'ready' ? ['LEVEL 1', 'GET ARITRA HIS INTERNSHIP', 'REACH THE WIZARD · PRESS ANY KEY'] : phase === 'over' ? ['GAME OVER', 'NOT YET', 'PRESS ENTER TO TRY AGAIN'] : null;
    if (phase === 'clear') {     // confirmation dialog, in the scene
      const bw = Math.min(viewW - 24, 252), bx = 10, by = 28;   // top-left, clear of the flag and the tower
      ctx.fillStyle = '#000'; ctx.fillRect(bx, by, bw, 58); ctx.strokeStyle = COL.mint; ctx.lineWidth = 2; ctx.strokeRect(bx + 1, by + 1, bw - 2, 56);
      ctx.fillStyle = COL.pink; ctx.fillRect(bx + 4, by + 4, 4, 4); ctx.fillRect(bx + bw - 8, by + 4, 4, 4);
      ctx.textAlign = 'center'; ctx.font = '8px "Press Start 2P", monospace';
      sh('CONGRATULATIONS!', bx + bw / 2, by + 11, COL.yellow); sh('ARITRA GOT THE', bx + bw / 2, by + 26, COL.white); sh('INTERNSHIP!', bx + bw / 2, by + 38, COL.white);
      ctx.textAlign = 'left';
    }
    if (msg) {
      ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(0, 54, viewW, 84); ctx.textAlign = 'center';
      ctx.font = '12px "Press Start 2P", monospace'; sh(msg[0], viewW / 2, 66, phase === 'over' ? COL.pink : COL.yellow);
      ctx.font = '8px "Press Start 2P", monospace'; sh(msg[1], viewW / 2, 92); if (Math.floor(t * 2) % 2 === 0) sh(msg[2], viewW / 2, 112, COL.mint);
      ctx.textAlign = 'left';
    }
  }

  function frame(now: number) {
    raf = 0; if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    update(dt);
    const target = Math.min(CASTLE_X + 64 - viewW, Math.max(0, h.x - viewW * 0.38));
    cam += (target - cam) * Math.min(1, dt * 8); if (cam < 0) cam = 0;
    draw();
    raf = requestAnimationFrame(frame);
  }

  return {
    keys,
    resize(cssW: number, dpr: number) {
      s = ambient ? Math.max(1, Math.round(dpr)) : Math.max(1, Math.floor((cssW * dpr) / 448));
      canvas.width = Math.round(cssW * dpr); canvas.height = VIEW_H * s;
      canvas.style.width = cssW + 'px'; canvas.style.height = (VIEW_H * s) / dpr + 'px';
      viewW = Math.ceil(canvas.width / s); if (!running) draw();
    },
    start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
    press(k: keyof Keys, v: boolean) { keys[k] = v; if (!ambient && v && phase === 'ready') phase = 'play'; },
    restart() { if (phase === 'over' || phase === 'clear') { fullReset(); phase = 'play'; } },
    // test hooks: advance the simulation without drawing, or let the autopilot play
    step(sec: number) { for (let i = 0; i < Math.round(sec * 60); i++) { update(1 / 60); const tg = Math.min(CASTLE_X + 64 - viewW, Math.max(0, h.x - viewW * 0.38)); cam += (tg - cam) * 0.13; } },
    tp(x: number) { h.x = x; h.y = GROUND * T - size().h; h.vx = 0; cam = Math.max(0, x - viewW * 0.38); },
    setAuto(v: boolean) { auto = v; if (v && phase === 'ready') phase = 'play'; },
    debug() { return { phase, x: Math.round(h.x), y: Math.round(h.y), big: h.big, score, coins: coinN, lives, time: Math.round(timeLeft), lastDeath, mush: mush.length, ducks: world.ducks.filter((q) => !q.dead).length, plants: world.pipes.map((q) => Math.round(q.ext)) }; },
    anyKey() { if (!ambient && phase === 'ready') phase = 'play'; },
    toggleMute() { muted = !muted; return muted; },
    get phase() { return phase; },
    fullReset,
  };
}
