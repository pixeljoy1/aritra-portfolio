/*
 * plaque: a wall nameplate for any A-Frame experience.  Reusable, no dependencies beyond A-Frame.
 *
 *   <script src="plaque.js?v=1.03"></script>
 *   <a-entity plaque="title: KERALAM HOUSE XR; name: Aritra Mitra;
 *                     detail: BDes, Immersive Digital Environments|O.P. Jindal Global University, Class of 2028;
 *                     lines: #WALK|Stick: walk and turn|Trigger: speed up;
 *                     version: 1.03"
 *              position="1.35 2.35 3.68"></a-entity>
 *
 * The entity position is the TOP CENTRE of the plate; the plate grows downwards to fit its text.
 * Text lists use "|" between rows. A row that starts with "#" is a heading (gold); an empty row is a gap.
 * Bump `version` every time the experience is published.
 */
AFRAME.registerComponent('plaque', {
  schema: {
    title:   { default: '' },
    name:    { default: '' },
    detail:  { default: '' },          // "|" separated, shown under the name
    lines:   { default: '' },          // "|" separated, the how-to
    version: { default: '' },          // shown bottom right as vX.XX
    width:   { default: 0.8 },         // metres
    gold:    { default: '#e2b64a' },
    board:   { default: '#2a1a10' },
    ink:     { default: '#f3ead6' }
  },

  init: function () { this.kids = []; },

  update: function () {
    var d = this.data, el = this.el, W = d.width, pad = 0.05, y = -pad, kids = this.kids, self = this;
    kids.forEach(function (k) { if (k.parentNode) k.parentNode.removeChild(k); });
    kids.length = 0;

    function text(value, size, color, align, yy, bold) {
      var t = document.createElement('a-text');
      var left = align === 'left';
      t.setAttribute('value', value);
      t.setAttribute('color', color);
      t.setAttribute('align', align);
      t.setAttribute('anchor', align);
      t.setAttribute('baseline', 'top');
      t.setAttribute('width', size * 30);           // wrap 30 chars: glyph height scales with `size`
      t.setAttribute('wrap-count', 30);
      t.setAttribute('position', (left ? -W / 2 + pad : 0) + ' ' + yy + ' 0.012');
      el.appendChild(t); kids.push(t);
    }
    function rows(str, size, color, gap) {
      str.split('|').forEach(function (r) {
        if (!r.trim()) { y -= size * 0.9; return; }
        var head = r.charAt(0) === '#';
        text(head ? r.slice(1) : r, size, head ? d.gold : color, 'left', y);
        y -= size * 1.5 + (gap || 0);
      });
    }

    if (d.title) { text(d.title, 0.03, d.gold, 'center', y); y -= 0.056; }
    if (d.name)  { text(d.name, 0.026, d.ink, 'center', y);  y -= 0.05; }
    if (d.detail) {
      d.detail.split('|').forEach(function (r) { text(r, 0.017, '#cdbf9f', 'center', y); y -= 0.03; });
    }
    if (d.lines) {
      y -= 0.02;
      var rule = document.createElement('a-plane');            // thin gold rule
      rule.setAttribute('width', W - pad * 2); rule.setAttribute('height', 0.003);
      rule.setAttribute('color', d.gold); rule.setAttribute('position', '0 ' + y + ' 0.012');
      rule.setAttribute('material', 'shader: flat');
      el.appendChild(rule); kids.push(rule);
      y -= 0.03;
      rows(d.lines, 0.019, d.ink);
    }
    if (d.version) {
      var vt = 'v' + d.version;
      text(vt, 0.017, d.gold, 'left', y - 0.005);
      var last = kids[kids.length - 1];
      last.setAttribute('align', 'right'); last.setAttribute('anchor', 'right');
      last.setAttribute('position', (W / 2 - pad) + ' ' + (y - 0.005) + ' 0.012');
      y -= 0.04;
    }
    var H = -y + pad;

    // plate: dark board, gold edge, a little depth so it reads as an object on the wall
    var plate = document.createElement('a-box');
    plate.setAttribute('width', W); plate.setAttribute('height', H); plate.setAttribute('depth', 0.024);
    plate.setAttribute('color', d.board);
    plate.setAttribute('material', 'color: ' + d.board + '; roughness: 1; metalness: 0');
    plate.setAttribute('position', '0 ' + (-H / 2) + ' 0');
    var edge = document.createElement('a-box');
    edge.setAttribute('width', W + 0.03); edge.setAttribute('height', H + 0.03); edge.setAttribute('depth', 0.012);
    edge.setAttribute('material', 'color: ' + d.gold + '; roughness: 0.6; metalness: 0');
    edge.setAttribute('position', '0 ' + (-H / 2) + ' -0.006');
    el.appendChild(plate); el.appendChild(edge); kids.push(plate, edge);
    // the text sits on the plate's front face
    this.height = H;
  },

  remove: function () {
    this.kids.forEach(function (k) { if (k.parentNode) k.parentNode.removeChild(k); });
    this.kids.length = 0;
  }
});
