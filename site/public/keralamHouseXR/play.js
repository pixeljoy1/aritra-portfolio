/*
 * play.js: playground physics for A-Frame. No dependencies beyond A-Frame.
 * Each component integrates real equations of motion every frame (semi-implicit Euler, 4 sub-steps).
 *
 *   pendulum   a swing: theta'' = -(g/L) sin(theta) - damping * theta'.  Put the entity at the PIVOT and hang the
 *              chains and seat below it (children, negative y). length = pivot to seat in metres.
 *   seesaw     a plank on a fulcrum: gravity torque from the two riders' weights, with stops and a soft bounce.
 *              Riders shift their weight (a slow sine), which is what makes it rock.
 *   spinner    a merry-go-round: spins about y, friction slows it down.
 *   slideball  a ball released at the top of a slide: gravity along the slope minus friction, then rolls out and
 *              stops, then returns to the top.
 *
 * A walker near a swing or the merry-go-round gives it a push (every ~2 s). When something has nearly stopped,
 * a gentle breeze or a passing child gives it a small kick, so the playground is never frozen.
 */
(function () {
  var G = 9.8, T = AFRAME.THREE;
  var tmp = new T.Vector3(), head = new T.Vector3();

  function headNear(el, radius) {
    var cam = document.getElementById('cam');
    if (!cam) return false;
    cam.object3D.getWorldPosition(head);
    el.object3D.getWorldPosition(tmp);
    return Math.hypot(head.x - tmp.x, head.z - tmp.z) < radius;
  }
  function steps(dtMs) { var dt = Math.min(dtMs, 50) / 1000; return [dt, 4, dt / 4]; }

  AFRAME.registerComponent('pendulum', {
    schema: { length: { default: 1.95 }, angle: { default: 0.4 }, damping: { default: 0.05 },
              axis: { default: 'x' }, push: { default: 0.9 }, radius: { default: 1.4 } },
    init: function () { this.th = this.data.angle; this.w = 0; this.since = 99; this.idle = 0; },
    tick: function (time, dtMs) {
      var d = this.data, s = steps(dtMs), k = G / d.length;
      for (var i = 0; i < s[1]; i++) {
        this.w += (-k * Math.sin(this.th) - d.damping * this.w) * s[2];
        this.th += this.w * s[2];
      }
      this.el.object3D.rotation[d.axis] = this.th;
      this.since += s[0];
      var e = Math.abs(this.th) + Math.abs(this.w) * 0.3;            // how much it is still moving
      this.idle = e < 0.12 ? this.idle + s[0] : 0;
      if (this.since > 2 && headNear(this.el, d.radius)) { this.kick(); }
      else if (this.idle > 3) { this.kick(0.6); }
    },
    kick: function (f) {
      this.w += (this.w >= 0 ? 1 : -1) * this.data.push * (f || 1);
      this.since = 0; this.idle = 0;
    }
  });

  AFRAME.registerComponent('seesaw', {
    schema: { half: { default: 1.4 }, maxAngle: { default: 0.27 }, shift: { default: 0.4 }, rate: { default: 2.1 },
              damping: { default: 0.35 } },
    init: function () { this.th = 0.1; this.w = 0; this.t = 0; },
    tick: function (time, dtMs) {
      var d = this.data, s = steps(dtMs), I = 2 * d.half * d.half + 0.4;
      for (var i = 0; i < s[1]; i++) {
        this.t += s[2];
        var sh = Math.sin(d.rate * this.t) * d.shift;                // riders lean in and out
        var tau = ((1 + sh) - (1 - sh)) * G * d.half * Math.cos(this.th);   // torque of left minus right rider
        this.w += (tau / I - d.damping * this.w) * s[2];
        this.th += this.w * s[2];
        if (Math.abs(this.th) > d.maxAngle) {                         // the plank hits the ground: stop, bounce a little
          var sg = Math.sign(this.th);
          this.th = sg * d.maxAngle;
          if (this.w * sg > 0) this.w = -this.w * 0.3;
        }
      }
      this.el.object3D.rotation.z = this.th;
    }
  });

  AFRAME.registerComponent('spinner', {
    schema: { speed: { default: 1.1 }, friction: { default: 0.12 }, push: { default: 1.4 }, radius: { default: 1.9 } },
    init: function () { this.w = this.data.speed; this.since = 99; this.idle = 0; },
    tick: function (time, dtMs) {
      var d = this.data, s = steps(dtMs);
      var sg = Math.sign(this.w) || 1;
      this.w -= (d.friction * this.w + 0.03 * sg) * s[0];            // viscous plus a little dry friction
      if (this.w * sg < 0) this.w = 0;
      this.el.object3D.rotation.y += this.w * s[0];
      this.since += s[0];
      this.idle = Math.abs(this.w) < 0.2 ? this.idle + s[0] : 0;
      if (this.since > 2 && headNear(this.el, d.radius) && Math.abs(this.w) < 2.5) { this.w += d.push * 0.6; this.since = 0; }
      else if (this.idle > 2.5) { this.w += d.push; this.since = 0; this.idle = 0; }
    }
  });

  // The ball: set `from` (top of the slide, ball centre) and `to` (bottom end). It then rolls out along +dir x.
  AFRAME.registerComponent('slideball', {
    schema: { from: { type: 'vec3' }, to: { type: 'vec3' }, mu: { default: 0.22 }, runout: { default: 0.5 } },
    init: function () { this.reset(); },
    reset: function () {
      var d = this.data;
      this.dx = d.to.x - d.from.x; this.dy = d.to.y - d.from.y;
      this.L = Math.hypot(this.dx, this.dy);
      this.ca = this.dx / this.L; this.sa = -this.dy / this.L;      // cos, sin of the slope (downhill = +s)
      this.s = 0; this.v = 0; this.wait = 0; this.flat = 0;
      this.apply();
    },
    apply: function () {
      var d = this.data, p = this.el.object3D.position;
      if (this.s <= this.L) p.set(d.from.x + this.ca * this.s, d.from.y - this.sa * this.s, d.from.z);
      else p.set(d.to.x + this.flat, d.to.y, d.to.z);
    },
    tick: function (time, dtMs) {
      var d = this.data, s = steps(dtMs);
      if (this.wait > 0) { this.wait -= s[0]; if (this.wait <= 0) this.reset(); return; }
      for (var i = 0; i < s[1]; i++) {
        if (this.s <= this.L) {
          this.v += G * (this.sa - d.mu * this.ca) * s[2];           // gravity along the slope minus friction
          this.s += this.v * s[2];
        } else {
          this.v = Math.max(0, this.v - d.mu * G * s[2]);            // rolling out on the flat
          this.flat += this.v * s[2];
          if (this.v === 0 || this.flat > d.runout) { this.wait = 2.2; break; }
        }
      }
      this.apply();
    }
  });
})();
