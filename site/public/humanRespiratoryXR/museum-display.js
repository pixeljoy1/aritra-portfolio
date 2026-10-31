/*
 * MUSEUM DISPLAY: a reusable A-Frame interaction model for "look at one thing on a plinth" XR experiences.
 * See README.md next to this file for the full behaviour reference. No walking, no free flight.
 *
 *   museum-rig      The viewer rides a circle around a subject, always facing it.
 *                   Stick left/right (either hand) = glide round at a steady rate.
 *                   Stick forward/back (left hand) = move closer / further.   Right stick forward/back = rise / lower.
 *                   Keyboard: A D / arrows = circle, W S = closer/further, R F = up/down (page may add more).
 *   museum-pointer  A visible laser on BOTH hands plus a reticle. Either trigger clicks. Falls back to the WebXR
 *                   "select" event if the gamepad trigger event never arrives.
 *
 * Put both on the rig entity that holds the camera and the two hand entities:
 *   <a-entity id="rig" museum-rig museum-pointer>
 *     <a-camera></a-camera>
 *     <a-entity id="lhand" oculus-touch-controls="hand: left"></a-entity>
 *     <a-entity id="rhand" oculus-touch-controls="hand: right"></a-entity>
 *   </a-entity>
 *
 * The page supplies the subject and the click behaviour:
 *   rig.components['museum-rig'].setSubject(function (out) { out.c.set(x, y, z); out.r = radiusMetres; return true; });
 *   rig.components['museum-pointer'].setHandlers({ cast: (origin, dir) => hit|null, hover: (hit) => {}, click: (origin, dir, hand) => {} });
 */
(function () {
  var T = AFRAME.THREE;
  var QS = new URLSearchParams(location.search);
  var AIM_Q = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), (parseFloat(QS.get('aim')) || 0) * Math.PI / 180);
  var _q = new T.Quaternion();
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Controller aim: the hand's forward axis, optionally tilted up/down with ?aim=<degrees>
  function aimRay(el, origin, dir) {
    el.object3D.getWorldPosition(origin);
    el.object3D.getWorldQuaternion(_q).multiply(AIM_Q);
    dir.set(0, 0, -1).applyQuaternion(_q);
  }

  // ------------------------------------------------------------------------------------------------
  AFRAME.registerComponent('museum-rig', {
    schema: {
      boost: { default: 2.2 },          // extra speed at a full trigger pull: 1 + boost times the base rate
      rate: { default: 0.9 },           // rad/s while a stick is held to the side: one lap in about 7 s
      frame: { default: 3.0 },          // distance to the subject, in subject radii
      minFrame: { default: 2.6 }, maxFrame: { default: 9 },
      minRadius: { default: 0.7 },     // never closer than this many metres
      lift: { default: 0.34 },          // eye height above the subject centre, in subject radii
      minLift: { default: -0.9 }, maxLift: { default: 1.4 },
      dolly: { default: 0.55 },         // closer/further speed (fraction of distance per second)
      rise: { default: 0.6 },           // up/down speed (subject radii per second)
      leftHand: { default: 'lhand' }, rightHand: { default: 'rhand' },
      camera: { default: 'cam' }
    },

    init: function () {
      var self = this, d = this.data;
      this.cam = document.getElementById(d.camera);
      this.hands = { l: document.getElementById(d.leftHand), r: document.getElementById(d.rightHand) };
      this.stick = { l: { x: 0, y: 0 }, r: { x: 0, y: 0 } };
      this.key = { x: 0, y: 0, z: 0 };                  // keyboard: circle, dolly, rise (-1, 0, 1)
      this.auto = 0;                                      // hands-free circling: 0 off, 1 or -1 direction
      this.trig = 0;                                      // trigger pull on either hand speeds the circling up
      this.speedMul = 1;                                  // page can offer a slow / normal / fast setting
      this.trigs = { l: 0, r: 0 };
      this.paused = false;
      this.frame = d.frame; this.lift = d.lift;           // targets
      this.theta = 0; this.w = 0;                         // angle round the subject and current angular speed
      this.R = null; this.H = 0;                          // eased radius and eye height above the centre
      this.c = new T.Vector3(); this.cReady = false;      // eased subject centre
      this.subject = { c: new T.Vector3(0, 1.4, -1.2), r: 0.5 };
      this.subjectFn = null;
      this.lap = 0;                                       // total angle travelled (radians, always positive)
      this._p = new T.Vector3();
      ['l', 'r'].forEach(function (h) {
        var el = self.hands[h]; if (!el) return;
        el.addEventListener('thumbstickmoved', function (e) { self.stick[h].x = e.detail.x; self.stick[h].y = e.detail.y; });
        el.addEventListener('triggerchanged', function (e) { self.trigs[h] = e.detail.value; self.trig = Math.max(self.trigs.l, self.trigs.r); });
      });
    },

    setSubject: function (fn) { this.subjectFn = fn; },
    // Set the framing straight away (no easing), e.g. after a reset
    home: function () { this.frame = this.data.frame; this.lift = this.data.lift; this.theta = 0; this.w = 0; this.R = null; this.cReady = false; },
    // Ask for a new distance in subject radii (the rig eases there); used when a new subject is chosen
    frameTo: function (frame, lift) {
      this.frame = clamp(frame, this.data.minFrame, this.data.maxFrame);
      if (lift !== undefined) this.lift = clamp(lift, this.data.minLift, this.data.maxLift);
    },
    // True while the rig is still easing towards its framing
    settling: function () { return this._settling; },

    // Which way the sticks ask us to circle: left/right of centre, with a wide dead cone around forward/back
    stickDir: function (s) { return Math.abs(s.x) > 0.55 && Math.abs(s.y) < 0.6 ? Math.sign(s.x) : 0; },

    tick: function (time, dtMs) {
      if (this.paused || !this.cam) return;
      var dt = Math.min(dtMs, 50) / 1000, d = this.data, rig = this.el.object3D, sub = this.subject;
      if (this.subjectFn) this.subjectFn(sub);
      var kc = 1 - Math.exp(-3 * dt);
      if (!this.cReady) { this.c.copy(sub.c); this.cReady = true; } else this.c.lerp(sub.c, kc);

      // Input. Circle: any stick held to the side, or keys, or the page's hands-free setting.
      var L = this.stick.l, Rr = this.stick.r;
      var dir = this.key.x || this.stickDir(L) || this.stickDir(Rr) || this.auto;
      var move = this.key.y || (Math.abs(L.x) < 0.5 && Math.abs(L.y) > 0.25 ? L.y : 0);
      var rise = this.key.z || (Math.abs(Rr.x) < 0.5 && Math.abs(Rr.y) > 0.25 ? -Rr.y : 0);
      if (move) this.frame = clamp(this.frame * Math.exp(move * d.dolly * dt), d.minFrame, d.maxFrame);
      if (rise) this.lift = clamp(this.lift + rise * d.rise * dt, d.minLift, d.maxLift);

      // A steady angular speed, eased in and out, so the path is a perfect circle at constant radius
      var boost = 1 + d.boost * Math.max(this.trig, this.key.fast || 0);              // trigger = accelerator
      this.w += (dir * d.rate * this.speedMul * boost - this.w) * (1 - Math.exp(-5 * dt));
      if (Math.abs(this.w) < 1e-4 && !dir) this.w = 0;
      var dth = this.w * dt;
      this.theta += dth;
      if (dth) {
        this.lap += Math.abs(dth);
        this.el.emit('museum-orbit', { delta: Math.abs(dth), total: this.lap }, false);
      }

      // Radius and height follow the subject's size, so scaling the subject keeps the same framing
      var Rt = Math.max(this.frame * sub.r, d.minRadius), Ht = this.lift * sub.r, ke = 1 - Math.exp(-2.4 * dt);
      if (this.R === null) { this.R = Rt; this.H = Ht; } else { this.R += (Rt - this.R) * ke; this.H += (Ht - this.H) * ke; }
      this._settling = Math.abs(Rt - this.R) > 0.005 || Math.abs(Ht - this.H) > 0.005;

      // Place the head on the circle, facing the centre. The rig is turned about the vertical only.
      var th = this.theta, cs = Math.cos(th), sn = Math.sin(th), cp = this.cam.object3D.position;
      rig.rotation.set(0, th, 0);
      rig.position.set(
        this.c.x + sn * this.R - (cp.x * cs + cp.z * sn),
        this.c.y + this.H - cp.y,
        this.c.z + cs * this.R - (-cp.x * sn + cp.z * cs)
      );
    }
  });

  // ------------------------------------------------------------------------------------------------
  AFRAME.registerComponent('museum-pointer', {
    schema: {
      leftHand: { default: 'lhand' }, rightHand: { default: 'rhand' },
      color: { default: '#00e5ff' }, length: { default: 1.4 }
    },

    init: function () {
      var self = this, sc = this.el.sceneEl;
      this.hs = {};
      this.handlers = { cast: null, hover: null, click: null };
      this.last = 'l'; this.fired = { l: 0, r: 0 };
      this._o = new T.Vector3(); this._d = new T.Vector3();
      this.reticle = new T.Mesh(new T.SphereGeometry(0.006, 10, 8), new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, depthTest: false }));
      this.reticle.renderOrder = 40; this.reticle.visible = false; sc.object3D.add(this.reticle);
      [['l', this.data.leftHand], ['r', this.data.rightHand]].forEach(function (p) {
        var el = document.getElementById(p[1]); if (!el) return;
        var laser = new T.Mesh(new T.CylinderGeometry(0.0025, 0.0025, 1, 6).rotateX(-Math.PI / 2).translate(0, 0, -0.5),
          new T.MeshBasicMaterial({ color: new T.Color(self.data.color), transparent: true, opacity: 0.85, toneMapped: false, depthTest: false }));
        laser.renderOrder = 39; laser.frustumCulled = false; laser.quaternion.copy(AIM_Q); laser.visible = false;
        el.object3D.add(laser);
        self.hs[p[0]] = { el: el, laser: laser };
        el.addEventListener('triggerdown', function () { self.fire(p[0]); });
        el.addEventListener('abuttondown', function () { /* reserved for the page */ });
      });
      // Fallback: the WebXR "select" event arrives even when the gamepad trigger event does not
      sc.addEventListener('enter-vr', function () {
        var s = sc.renderer && sc.renderer.xr && sc.renderer.xr.getSession && sc.renderer.xr.getSession();
        if (!s) return;
        s.addEventListener('selectstart', function (e) {
          var h = e.inputSource && e.inputSource.handedness === 'right' ? 'r' : 'l';
          self.fire(h);
        });
      });
    },

    setHandlers: function (h) { for (var k in h) this.handlers[k] = h[k]; },

    // Is this controller there to be pointed with?
    live: function (h) {
      var o = this.hs[h]; if (!o) return false;
      var tc = o.el.components['tracked-controls'];
      return !!(o.el.object3D.visible || (tc && tc.controller));
    },

    fire: function (h) {
      var now = performance.now(); if (now - this.fired[h] < 250) return;   // trigger + select both arrive: count once
      this.fired[h] = now; this.last = h;
      if (!this.handlers.click || !this.hs[h]) return;
      aimRay(this.hs[h].el, this._o, this._d);
      this.handlers.click(this._o, this._d, h);
    },

    buzz: function (h, i, ms) {
      try {
        var tc = this.hs[h || this.last].el.components['tracked-controls'], gp = tc && tc.controller && tc.controller.gamepad;
        if (!gp) return;
        if (gp.hapticActuators && gp.hapticActuators[0]) gp.hapticActuators[0].pulse(i || 0.4, ms || 30);
        else if (gp.vibrationActuator) gp.vibrationActuator.playEffect('dual-rumble', { duration: ms || 30, strongMagnitude: i || 0.4, weakMagnitude: i || 0.4 });
      } catch (e) {}
    },

    tick: function () {
      var sc = this.el.sceneEl, vr = sc.is('vr-mode'), best = null, bestH = null, self = this;
      this.status = { l: false, r: false };
      ['l', 'r'].forEach(function (h) {
        var o = self.hs[h]; if (!o) return;
        var on = vr && self.live(h); self.status[h] = on; o.laser.visible = on;
        if (!on) return;
        aimRay(o.el, self._o, self._d);
        var hit = self.handlers.cast ? self.handlers.cast(self._o, self._d) : null;
        o.laser.scale.z = hit ? hit.distance : self.data.length;
        if (hit && (!best || h === self.last)) { best = hit; bestH = h; }
      });
      this.reticle.visible = !!best;
      if (best) this.reticle.position.copy(best.point);
      if (vr && this.handlers.hover) this.handlers.hover(best, bestH);
    }
  });

  window.MUSEUM = { aimRay: aimRay };
})();
