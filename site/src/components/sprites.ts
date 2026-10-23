// Original pixel art (spec Appendix A). '.' = transparent.
export const SPRITES: Record<string, { pal: Record<string, string>; rows: string[] }> = {
  hero: {
    pal: { H: '#FFD23F', S: '#FFB38A', E: '#14141F', M: '#E0507A', T: '#3DDCD0', Y: '#FFD23F', P: '#3B3B52', O: '#CFCFE8' },
    rows: [
      '....HHHHHH....', '...HHHHHHHH...', '..HHHHHHHHHH..', '..HHSSSSSSHH..', '..HSSSSSSSSH..',
      '..HSEESSEESH..', '..HSSSSSSSSH..', '...SSSMMSSS...', '....SSSSSS....', '...TTTSSTTT...',
      '..TTTTTTTTTT..', '.STTTTTTTTTTS.', '.STTTTTTTTTTS.', '.SSTTYYYYTTSS.', '...PPPPPPPP...',
      '...PPPPPPPP...', '...PPP..PPP...', '...PPP..PPP...', '..OOOO..OOOO..', '..OOOO..OOOO..',
    ],
  },
  tree: {
    pal: { G: '#21EF80', D: '#12B862', I: '#585EFF' },
    rows: [
      '....GGGGGG....', '..GGGGGGGGGG..', '.GGGGGDGGGGGG.', 'GGGDGGGGGGDGGG', 'GGGGGGGDGGGGGG',
      'GGDGGGGGGGGDGG', '.GGGGGGGGGGGG.', '..GGGDGGGGGG..', '....GGGGGG....', '......II......',
      '......II......', '.....III......', '......II......', '......II......', '.....IIII.....', '....IIIIII....',
    ],
  },
  heart: {
    pal: { R: '#FF63D8' },
    rows: ['.RR.RR.', 'RRRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'],
  },
  arrow: {
    pal: { X: '#FF63D8' },
    rows: ['X..', 'XX.', 'XXX', 'XX.', 'X..'],
  },
  star: {
    pal: { Y: '#FFD23F' },
    rows: ['..Y..', '..Y..', 'YYYYY', '..Y..', '..Y..'],
  },
  tiger: {
    pal: { O: '#FF9F1C', A: '#B34700', W: '#FFFFFF', N: '#FF63D8', F: '#FFE7C2' },
    rows: [
      '..............O..O.....', '..............OOOOOO....', '..OOOOOOOOO..OOWOOWO...', '.OOAOOAOOAOOOOOOOOOOO..',
      'OOOAOOAOOAOOOOONNOOO...', 'O.OOAOOAOOAOOOOFFFFF...', '...OOOOOOOOOOOFFFFF....', '...OOOOOOOOOOOOOO......',
      '...OO.OO...OO.OO.......', '..OO..OO...OO..OO......', '..FF..FF...FF..FF......',
    ],
  },
};

export function spriteRects(name: string) {
  const s = SPRITES[name];
  const paths: Record<string, string> = {};
  s.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c === '.') { x++; continue; }
      let e = x; while (e < row.length && row[e] === c) e++;
      paths[c] = (paths[c] ?? '') + `M${x} ${y}h${e - x}v1h-${e - x}z`;
      x = e;
    }
  });
  const w = Math.max(...s.rows.map((r) => r.length));
  return { w, h: s.rows.length, paths: Object.entries(paths).map(([c, d]) => ({ fill: s.pal[c], d })) };
}
