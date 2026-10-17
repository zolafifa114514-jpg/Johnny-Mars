(() => {
  const pages = [...document.querySelectorAll('.story-page')];
  const dots = document.getElementById('dots');
  const pageNumber = document.getElementById('pageNumber');
  const prev = document.getElementById('prevButton');
  const next = document.getElementById('nextButton');
  const totalPages = pages.length;
  const completed = Array(totalPages).fill(false);
  const drawingKey = 'johnny-builds-to-mars-rocket-v1';
  let current = 0;
  let audio;

  function chirp(type = 'tap') {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audio.createOscillator(), gain = audio.createGain();
      const now = audio.currentTime;
      osc.connect(gain); gain.connect(audio.destination);
      osc.type = type === 'launch' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(type === 'launch' ? 120 : 380, now);
      osc.frequency.exponentialRampToValueAtTime(type === 'launch' ? 620 : 680, now + (type === 'launch' ? .6 : .14));
      gain.gain.setValueAtTime(.001, now); gain.gain.exponentialRampToValueAtTime(.09, now + .02);
      gain.gain.exponentialRampToValueAtTime(.001, now + (type === 'launch' ? .65 : .18));
      osc.start(now); osc.stop(now + (type === 'launch' ? .7 : .2));
    } catch (_) {}
  }

  function pulse(element, className) {
    element.classList.remove(className); void element.offsetWidth; element.classList.add(className);
    setTimeout(() => element.classList.remove(className), 850);
  }

  function burst(scene, x, y, count = 12, className = 'effect-dot') {
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('span'); const angle = (Math.PI * 2 * i) / count; const distance = 25 + Math.random() * 55;
      dot.className = className; dot.style.left = `${x}%`; dot.style.top = `${y}%`;
      dot.style.setProperty('--dx', `${Math.cos(angle) * distance}px`); dot.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      scene.append(dot); setTimeout(() => dot.remove(), 1200);
    }
  }

  function burstFromEvent(scene, event, count = 12, className = 'effect-dot') {
    const box = scene.getBoundingClientRect();
    const x = Number.isFinite(event?.clientX) && event.clientX ? ((event.clientX - box.left) / box.width) * 100 : 50;
    const y = Number.isFinite(event?.clientY) && event.clientY ? ((event.clientY - box.top) / box.height) * 100 : 50;
    burst(scene, Math.max(4, Math.min(96, x)), Math.max(4, Math.min(96, y)), count, className);
  }

  function updateControls() {
    const nextLocked = current === totalPages - 1 || !completed[current];
    prev.disabled = current === 0; next.disabled = nextLocked;
    next.setAttribute('aria-disabled', String(nextLocked));
  }

  function showPage(index) {
    current = Math.max(0, Math.min(totalPages - 1, index));
    pages.forEach((page, i) => page.classList.toggle('active', i === current));
    dots.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === current));
    pageNumber.textContent = current + 1; updateControls();
  }

  function goTo(index) {
    if (index > current && !completed[current]) return;
    chirp(); showPage(index);
  }

  function completePage(index) { completed[index] = true; if (index === current) updateControls(); }

  pages.forEach((_, i) => {
    const dot = document.createElement('button'); dot.className = 'dot'; dot.type = 'button'; dot.ariaLabel = `Go to page ${i + 1}`;
    dot.addEventListener('click', () => goTo(i)); dots.append(dot);
  });
  prev.addEventListener('click', () => goTo(current - 1)); next.addEventListener('click', () => goTo(current + 1));

  const startButton = document.getElementById('startButton');
  startButton.addEventListener('click', () => { chirp(); burst(document.querySelector('.hero-illustration'), 66, 48, 16); completePage(0); showPage(1); });

  function clickAction(target, message, pageIndex) {
    target.addEventListener('click', () => { chirp(); message.classList.add('show'); target.classList.add('reacted'); completePage(pageIndex); });
    if (target.tagName !== 'BUTTON') {
      target.setAttribute('tabindex', '0'); target.setAttribute('role', 'button');
      target.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); target.click(); } });
    }
  }

  clickAction(document.getElementById('rocketScene'), document.getElementById('rocketMessage'), 3);
  clickAction(document.getElementById('landingScene'), document.getElementById('groundMessage'), 6);
  clickAction(document.querySelector('.final-johnny'), document.getElementById('finalMessage'), 7);

  const marsScene = document.getElementById('marsScene'); const mars = document.getElementById('mars');
  const marsMessage = document.getElementById('marsMessage'); const constellationPath = document.getElementById('constellationPath');
  const constellationProgress = document.getElementById('constellationProgress'); const constellationStars = [...document.querySelectorAll('.constellation-star')];
  const constellationCoordinates = { 1: '17,18', 2: '46,12', 3: '82,52' }; let constellationStep = 0; let marsFound = false;
  function findMars(event) {
    marsFound = true; pulse(marsScene, 'scene-flash'); pulse(mars, 'planet-pop'); burstFromEvent(marsScene, event, 16);
    marsMessage.textContent = constellationStep === 3 ? 'Aha! Your star map found Mars!' : 'Mars is glowing. Connect the stars too!'; marsMessage.classList.add('show');
    if (constellationStep === 3) completePage(1);
  }
  constellationStars.forEach(star => {
    const chooseStar = event => {
      event.stopPropagation(); const number = Number(star.dataset.constellation);
      if (number !== constellationStep + 1) { pulse(star, 'wrong'); marsMessage.textContent = `Try star ${constellationStep + 1} next!`; marsMessage.classList.add('show'); chirp(); return; }
      constellationStep += 1; star.classList.add('connected'); constellationPath.setAttribute('points', [...Array(constellationStep)].map((_, i) => constellationCoordinates[i + 1]).join(' '));
      constellationProgress.textContent = `STAR MAP ${constellationStep} / 3`; burstFromEvent(marsScene, event, 8); chirp();
      if (constellationStep === 3) marsMessage.textContent = 'Great map! Now tap Mars.'; else marsMessage.textContent = `Star ${constellationStep} is connected!`;
      marsMessage.classList.add('show');
      if (marsFound && constellationStep === 3) completePage(1);
    };
    star.addEventListener('click', chooseStar); star.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chooseStar(e); } });
  });
  marsScene.addEventListener('click', e => { if (e.target.closest('.constellation-star')) return; if (e.target.closest('#mars')) findMars(e); else { pulse(marsScene, 'scene-flash'); burstFromEvent(marsScene, e, 8); } });
  marsScene.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.constellation-star')) { e.preventDefault(); findMars(e); } });

  const blueprintCanvas = document.getElementById('rocketBlueprint');
  const blueprintScene = document.getElementById('blueprintScene');
  const blueprintContext = blueprintCanvas.getContext('2d');
  const drawMessage = document.getElementById('drawMessage');
  const drawHint = document.getElementById('drawHint');
  const drawStages = [...document.querySelectorAll('.draw-stage')];
  const stageNames = { body: 'body', nose: 'nose cone', fin: 'fin' };
  const stageColors = { body: '#ff6f61', nose: '#7164cf', fin: '#e8a23c' };
  let activeStage = 'body'; let activeStroke = null;
  let drawing = { strokes: [], complete: { body: false, nose: false, fin: false } };

  function loadDrawing() {
    try {
      const saved = JSON.parse(localStorage.getItem(drawingKey) || 'null');
      if (saved?.strokes && saved?.complete) drawing = saved;
    } catch (_) {}
  }

  function saveDrawing() {
    try { localStorage.setItem(drawingKey, JSON.stringify(drawing)); } catch (_) {}
  }

  function drawStroke(context, stroke, scaleX = 1, scaleY = 1) {
    if (!stroke.points?.length) return;
    context.save(); context.strokeStyle = stroke.color; context.lineWidth = 11; context.lineCap = 'round'; context.lineJoin = 'round';
    context.beginPath(); context.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);
    stroke.points.slice(1).forEach(point => context.lineTo(point.x * scaleX, point.y * scaleY)); context.stroke(); context.restore();
  }

  function renderBlueprint() {
    const ctx = blueprintContext; ctx.clearRect(0, 0, blueprintCanvas.width, blueprintCanvas.height);
    ctx.save(); ctx.strokeStyle = '#d6bd83'; ctx.lineWidth = 3; ctx.setLineDash([10, 12]); ctx.beginPath(); ctx.moveTo(70, 210); ctx.lineTo(630, 210); ctx.stroke(); ctx.restore();
    drawing.strokes.forEach(stroke => drawStroke(ctx, stroke));
    syncRocketCanvases();
  }

  function drawingComplete() { return ['body', 'nose', 'fin'].every(part => drawing.complete[part]); }

  function updateDrawingStatus() {
    drawStages.forEach(button => button.classList.toggle('active', button.dataset.drawStage === activeStage));
    const missing = ['body', 'nose', 'fin'].find(part => !drawing.complete[part]);
    if (drawingComplete()) {
      drawHint.textContent = 'Saved! Your rocket is ready.'; drawMessage.classList.add('show'); completePage(2);
    } else {
      drawHint.textContent = `Draw the ${stageNames[missing]} next!`; drawMessage.classList.remove('show');
    }
    updateControls();
  }

  function canvasPoint(event) {
    const box = blueprintCanvas.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * blueprintCanvas.width, y: ((event.clientY - box.top) / box.height) * blueprintCanvas.height };
  }

  drawStages.forEach(button => button.addEventListener('click', () => { activeStage = button.dataset.drawStage; updateDrawingStatus(); chirp(); }));
  blueprintCanvas.addEventListener('pointerdown', event => {
    event.preventDefault(); blueprintCanvas.setPointerCapture(event.pointerId); activeStroke = { stage: activeStage, color: stageColors[activeStage], points: [canvasPoint(event)] }; chirp();
  });
  blueprintCanvas.addEventListener('pointermove', event => {
    if (!activeStroke) return; activeStroke.points.push(canvasPoint(event)); renderBlueprint();
  });
  function finishStroke() {
    if (!activeStroke) return;
    if (activeStroke.points.length > 2) { drawing.strokes.push(activeStroke); drawing.complete[activeStage] = true; saveDrawing(); burst(blueprintScene, 50, 50, 8); pulse(blueprintScene, 'scene-flash'); renderBlueprint(); updateDrawingStatus(); }
    activeStroke = null;
  }
  blueprintCanvas.addEventListener('pointerup', finishStroke); blueprintCanvas.addEventListener('pointercancel', () => { activeStroke = null; renderBlueprint(); });
  document.getElementById('clearBlueprint').addEventListener('click', () => {
    drawing = { strokes: [], complete: { body: false, nose: false, fin: false } }; activeStage = 'body';
    try { localStorage.removeItem(drawingKey); } catch (_) {}
    renderBlueprint(); updateDrawingStatus(); chirp(); burst(blueprintScene, 50, 50, 12);
  });

  function syncRocketCanvases() {
    const targets = ['garageRocketCanvas', 'launchRocketCanvas', 'landedRocketCanvas', 'homeRocketCanvas'];
    targets.forEach(id => {
      const target = document.getElementById(id); if (!target) return;
      const context = target.getContext('2d'); context.clearRect(0, 0, target.width, target.height);
      const sx = target.width / blueprintCanvas.width; const sy = target.height / blueprintCanvas.height;
      drawing.strokes.forEach(stroke => drawStroke(context, stroke, sx, sy));
    });
  }

  loadDrawing(); renderBlueprint(); updateDrawingStatus();

  const rocketScene = document.getElementById('rocketScene'); const bigRocket = document.getElementById('bigRocket'); const garageDog = document.getElementById('garageDog');
  rocketScene.addEventListener('click', e => { pulse(rocketScene, 'scene-flash'); pulse(bigRocket, 'rocket-build'); burstFromEvent(rocketScene, e, 14); });
  garageDog.addEventListener('click', e => { e.stopPropagation(); garageDog.classList.toggle('judging'); pulse(garageDog, 'dog-bounce'); burstFromEvent(rocketScene, e, 8); chirp(); });
  garageDog.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); garageDog.click(); } });

  const launchButton = document.getElementById('launchButton'); const progress = document.getElementById('launchProgress'); const launchRocket = document.getElementById('launchRocket'); const countdown = document.getElementById('countdown'); const launchScene = document.querySelector('.launch-scene');
  let holdTimer, launchAdvanceTimer, held = 0, launched = false;
  function startHold(e) {
    e.preventDefault(); if (launched) return; clearInterval(holdTimer); held = 0; chirp('launch');
    holdTimer = setInterval(() => {
      held = Math.min(100, held + 2); progress.style.width = `${held}%`;
      if (held >= 100) { clearInterval(holdTimer); launched = true; completePage(4); launchScene.classList.add('liftoff'); burst(launchScene, 50, 48, 24); launchRocket.style.transform = 'translateY(-500px) rotate(8deg)'; countdown.textContent = 'LIFTOFF!'; launchAdvanceTimer = setTimeout(() => showPage(5), 1150); }
    }, 28);
  }
  function stopHold() { if (held < 100 && !launched) { clearInterval(holdTimer); progress.style.width = '0'; held = 0; } }
  launchButton.addEventListener('pointerdown', startHold); ['pointerup', 'pointerleave', 'pointercancel'].forEach(name => launchButton.addEventListener(name, stopHold));

  const draggedStars = new Set(); const dragScene = document.getElementById('dragScene');
  document.querySelectorAll('.draggable').forEach(star => {
    star.dataset.startLeft = star.style.left; star.dataset.startTop = star.style.top; let dragging = false;
    const move = e => { if (!dragging) return; const box = dragScene.getBoundingClientRect(); star.style.left = `${Math.max(2, Math.min(95, ((e.clientX - box.left) / box.width) * 100))}%`; star.style.top = `${Math.max(3, Math.min(90, ((e.clientY - box.top) / box.height) * 100))}%`; };
    const finishDrag = () => { if (!dragging) return; dragging = false; star.classList.remove('dragging'); draggedStars.add(star.dataset.star); burst(dragScene, parseFloat(star.style.left), parseFloat(star.style.top), 7, 'effect-dot trail-dot'); document.getElementById('starMessage').classList.add('show'); chirp(); if (draggedStars.size === document.querySelectorAll('.draggable').length) completePage(5); };
    star.addEventListener('pointerdown', e => { dragging = true; star.classList.add('dragging'); star.setPointerCapture(e.pointerId); chirp(); }); star.addEventListener('pointermove', move); star.addEventListener('pointerup', finishDrag); star.addEventListener('pointercancel', finishDrag);
  });

  const landingScene = document.getElementById('landingScene'); landingScene.addEventListener('click', e => { pulse(landingScene, 'ground-stomp'); burstFromEvent(landingScene, e, 13); burstFromEvent(landingScene, e, 1, 'effect-dot ripple'); });
  const finalJohnny = document.querySelector('.final-johnny'); const finalScene = document.getElementById('finalScene'); finalJohnny.addEventListener('click', e => { pulse(finalJohnny, 'final-celebrate'); burstFromEvent(finalScene, e, 18); });

  function resetBook() {
    clearInterval(holdTimer); clearTimeout(launchAdvanceTimer); completed.fill(false); completed[2] = drawingComplete(); current = 0; draggedStars.clear(); held = 0; launched = false;
    document.querySelectorAll('.scene-bubble, .ground-message, .final-message').forEach(message => message.classList.remove('show')); document.querySelectorAll('.effect-dot').forEach(item => item.remove()); document.querySelectorAll('.reacted').forEach(item => item.classList.remove('reacted'));
    garageDog.classList.remove('judging'); document.querySelectorAll('.draggable').forEach(star => { star.style.left = star.dataset.startLeft; star.style.top = star.dataset.startTop; star.classList.remove('dragging'); });
    progress.style.width = '0'; launchRocket.style.transform = ''; launchScene.classList.remove('liftoff'); countdown.textContent = '3... 2... 1...'; constellationStep = 0; marsFound = false; constellationPath.setAttribute('points', ''); constellationProgress.textContent = 'STAR MAP 0 / 3'; constellationStars.forEach(star => star.classList.remove('connected', 'wrong')); marsMessage.textContent = 'Connect the stars first!'; updateDrawingStatus(); showPage(0);
  }
  document.getElementById('restartButton').addEventListener('click', () => { chirp(); resetBook(); });
  showPage(0);
})();
