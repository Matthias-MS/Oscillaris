(() => {
  const canvas = document.getElementById('waves');
  const ctx = canvas.getContext('2d');
  let t = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H * 0.5;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const numRings = 32;
    for (let i = numRings; i >= 0; i--) {
      const progress = i / numRings;
      const phase = t * 0.009 - progress * 3.0;
      const waveMod = Math.sin(phase) * 0.016;
      const rx = (W * 0.05 + W * 0.42 * progress) * (1 + waveMod);
      const ry = (H * 0.012 + H * 0.15 * progress) * (1 + waveMod * 0.5);
      const baseAlpha = Math.pow(1 - progress, 1.6) * 0.55 + 0.03;
      const pulse = Math.sin(phase * 1.2) * 0.08;
      const r = Math.floor(80 + 60 * (1 - progress));
      const g = Math.floor(120 + 80 * (1 - progress));
      const b = Math.floor(180 + 60 * (1 - progress));

      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${baseAlpha + pulse})`;
      ctx.lineWidth = progress < 0.12 ? 1.2 : 0.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
      ctx.strokeStyle = `rgba(${r},${g},${b},${(baseAlpha + pulse) * 0.13})`;
      ctx.lineWidth = progress < 0.12 ? 1.2 : 0.6;
      ctx.stroke();
    }

    // center glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.15);
    grd.addColorStop(0, `rgba(100,160,255,${0.07 + Math.sin(t * 0.015) * 0.03})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // vignette
    const vig = ctx.createRadialGradient(cx, cy * 0.9, H * 0.05, cx, cy * 0.9, H * 0.78);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.55, 'rgba(0,0,0,0.35)');
    vig.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // bottom fade
    const sh = ctx.createLinearGradient(0, cy * 0.8, 0, H);
    sh.addColorStop(0, 'rgba(0,0,0,0)');
    sh.addColorStop(0.4, 'rgba(0,0,0,0.6)');
    sh.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = sh;
    ctx.fillRect(0, cy * 0.8, W, H);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();
