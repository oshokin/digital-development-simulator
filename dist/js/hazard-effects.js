// Tiny, local cues identify a hazard. They never change its collision box.
export function hazardEffectState(kind, age, reducedMotion = false) {
  const time = reducedMotion ? 0 : age;
  return {
    time,
    beacon: .50 + .35 * Math.sin(time * 4),
    spark: reducedMotion || Math.sin(time * 7) > .45,
    sand: (time * .65) % 1,
    crawl: Math.sin(time * 5) * 2
  };
}

export function drawHazardEffects(ctx, kind, rect, age, reducedMotion = false) {
  const { x, y, w, h } = rect;
  const fx = hazardEffectState(kind, age, reducedMotion);
  ctx.save();
  if (kind === 'barrier' || kind === 'gate') {
    ctx.fillStyle = `rgba(255, 186, 40, ${fx.beacon})`;
    for (const px of [.19, .81]) {
      ctx.beginPath(); ctx.arc(x + w * px, y + h * .24, 3.7, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (kind === 'cable' && fx.spark) {
    const cx = x + w * .58, cy = y + h * .68;
    ctx.strokeStyle = '#f7f9a9'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx - 2, cy - 2);
    ctx.lineTo(cx + 2, cy - 9); ctx.lineTo(cx + 4, cy - 1); ctx.lineTo(cx + 10, cy + 3); ctx.stroke();
  }
  if (kind === 'server' || kind === 'archive') {
    for (let i = 0; i < 2; i++) {
      const drift = (fx.time * .36 + i * .5) % 1;
      ctx.fillStyle = `rgba(188, 209, 222, ${.30 * (1 - drift)})`;
      ctx.beginPath();
      ctx.ellipse(x + w * (.42 + i * .18) + drift * 4, y + 12 - drift * 25,
        4 + drift * 3, 3 + drift * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (kind === 'hourglass') {
    const cx = x + w * .51, top = y + h * .43;
    ctx.strokeStyle = '#ffdf88'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, top + h * .17); ctx.stroke();
    ctx.fillStyle = '#fff3b7';
    ctx.fillRect(cx - 1, top + h * (.03 + fx.sand * .17), 3, 3);
  }
  if (kind === 'slowdown') {
    // Foot and shell marks move on the existing mirrored snail; no hitbox shift.
    ctx.fillStyle = 'rgba(150, 245, 228, .55)';
    ctx.fillRect(x + w * .68 + fx.crawl, y + h * .86, 7, 2);
    ctx.fillRect(x + w * .83 - fx.crawl, y + h * .88, 4, 2);
    ctx.strokeStyle = 'rgba(119, 238, 244, .65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + w * .63, y + h * .55, 12, fx.time * .7, fx.time * .7 + .7);
    ctx.stroke();
  }
  if (kind === 'router') {
    ctx.strokeStyle = `rgba(132, 243, 255, ${fx.beacon * .65})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x + w * .52, y + h * .25, 10, 3.8, 5.6); ctx.stroke();
  }
  ctx.restore();
}
