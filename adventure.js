(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const effectsToggle = document.querySelector('.effects-toggle');
  let savedEffects;
  try { savedEffects = localStorage.getItem('faf-atmosphere'); } catch { /* Storage is optional. */ }
  let effectsOn = savedEffects !== 'off' && !reducedMotion.matches;
  let resumeEmbers = () => {};
  function applyEffects() {
    root.dataset.effects = effectsOn ? 'on' : 'off';
    effectsToggle.setAttribute('aria-pressed', String(effectsOn));
    effectsToggle.disabled = reducedMotion.matches;
    effectsToggle.textContent = reducedMotion.matches ? 'Reduced motion' : effectsOn ? 'Atmosphere: on' : 'Atmosphere: off';
    if (effectsOn) resumeEmbers();
  }
  effectsToggle.addEventListener('click', () => {
    effectsOn = !effectsOn;
    if (reducedMotion.matches) effectsOn = false;
    savedEffects = effectsOn ? 'on' : 'off';
    try { localStorage.setItem('faf-atmosphere', savedEffects); } catch { /* No persistence needed. */ }
    applyEffects();
  });
  reducedMotion.addEventListener('change', () => {
    effectsOn = !reducedMotion.matches && savedEffects !== 'off';
    applyEffects();
  });
  applyEffects();

  // Content stays visible if animation support or JavaScript is unavailable.
  const revealElements = document.querySelectorAll('.reveal, .story-beat, .crew-heading, .gallery-heading, .wildlife-heading, .gallery-card, .wildlife-card');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    revealElements.forEach((element) => {
      element.classList.add('reveal');
      revealObserver.observe(element);
    });
    root.classList.add('motion-ready');
  }

  let scrollPending = false;
  function updateReadingProgress() {
    const available = root.scrollHeight - root.clientHeight;
    root.style.setProperty('--read-progress', `${available > 0 ? Math.min(100, window.scrollY / available * 100) : 0}%`);
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateReadingProgress);
    }
  }, { passive: true });
  window.addEventListener('resize', updateReadingProgress, { passive: true });
  updateReadingProgress();

  // Recipe and sequence are based on the supplied cave cooking screenshot.
  // One chop per ingredient; a prepared batch can be dragged or added via the pot button.
  const kitchen = document.querySelector('.kitchen-section');
  const recipe = [...document.querySelectorAll('.recipe-list li')];
  const prepBoard = document.querySelector('.prep-board');
  const potTarget = document.querySelector('.pot-target');
  const fuelButton = document.querySelector('.fuel-button');
  const cookButton = document.querySelector('.cook-button');
  const cookLabel = cookButton.querySelector('span');
  const ingredientCount = document.querySelector('#ingredient-count');
  const fuelTrack = document.querySelector('.fuel-track');
  const fuelLevel = document.querySelector('#fuel-level');
  const recipeStatus = document.querySelector('.recipe-status');
  let cookingState = 'gathering';
  let batchIndex = 0;
  let prepared = false;
  let chops = 0;
  let feeding = false;
  let draggingBatch = false;
  let chopAnimation;
  let fuel = 0;
  let cookTimer;
  function setFuel(value) {
    fuel = Math.max(0, Math.min(100, value));
    kitchen.style.setProperty('--fuel', `${fuel}%`);
    kitchen.classList.toggle('is-fired', fuel > 0);
    fuelTrack.setAttribute('aria-valuenow', String(Math.round(fuel)));
    fuelLevel.textContent = `${Math.round(fuel)}%`;
    if (fuel > 0) resumeEmbers();
  }
  function updateStation() {
    recipe.forEach((item, index) => {
      item.classList.toggle('is-added', index < batchIndex);
      item.classList.toggle('is-next', index === batchIndex);
      if (index === batchIndex) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    ingredientCount.textContent = `${batchIndex} / ${recipe.length} BATCHES`;
    const next = recipe[batchIndex];
    prepBoard.disabled = !next || cookingState !== 'gathering' || feeding;
    prepBoard.draggable = prepared && !feeding;
    prepBoard.classList.toggle('is-prepared', prepared);
    prepBoard.querySelector('strong').textContent = next ? `${next.dataset.name} ×${next.dataset.quantity}` : 'All batches added';
    const quantity = Number(next?.dataset.quantity || 0);
    prepBoard.querySelector('.prep-hint').textContent = feeding ? 'The pot is enjoying that batch…' : prepared ? 'Batch ready · drag it or tap the pot' : next ? `${chops} / ${quantity} chops · tap the board` : 'The recipe is ready to cook';
    prepBoard.setAttribute('aria-label', next ? `${next.dataset.name}, ${chops} of ${quantity} chops. ${prepared ? 'Batch ready to add to pot' : 'Tap to chop'}` : 'All batches added');
    prepBoard.querySelector('.chop-meter').replaceChildren(...Array.from({ length: quantity }, (_, index) => {
      const mark = document.createElement('i');
      mark.classList.toggle('is-chopped', index < chops);
      return mark;
    }));
    potTarget.disabled = !prepared || fuel <= 0 || feeding;
    potTarget.classList.toggle('is-accepting', prepared && fuel > 0 && !feeding);
    potTarget.querySelector('span').textContent = feeding ? 'A hungry pot. A happy pot.' : cookingState === 'ready' ? 'Behemoth Crown Roast · ready' : fuel <= 0 ? 'Add logs to light the fire' : prepared ? 'Drop here, or tap to feed the pot' : 'Prepare the next batch on the cutting board';
    if (cookingState === 'gathering') {
      cookButton.disabled = batchIndex < recipe.length || fuel <= 0 || feeding;
      cookLabel.textContent = batchIndex < recipe.length ? 'Follow the recipe order' : fuel > 0 ? 'Cook Behemoth Crown Roast' : 'Add logs before cooking';
    }
  }
  fuelButton.addEventListener('click', () => {
    setFuel(100);
    updateStation();
    recipeStatus.textContent = cookingState === 'cooking' ? 'The fire is fed. Your roast keeps cooking.' : 'The bonfire is burning. Prepare each batch in recipe order.';
  });
  function addBatch() {
    if (!prepared || feeding || cookingState !== 'gathering') return;
    if (fuel <= 0) { recipeStatus.textContent = 'Out of fuel. Add logs before adding this batch to the pot.'; return; }
    const name = recipe[batchIndex].dataset.name;
    const quantity = recipe[batchIndex].dataset.quantity;
    feeding = true;
    draggingBatch = false;
    kitchen.classList.add('is-lid-open');
    kitchen.querySelector('.offering-token').textContent = `${name} ×${quantity}`;
    kitchen.classList.add('is-feeding');
    batchIndex += 1;
    prepared = false;
    chops = 0;
    setFuel(fuel - 7);
    updateStation();
    recipeStatus.textContent = batchIndex === recipe.length ? 'Every batch is in. Keep the fire fed and start cooking.' : `${name} added. Next: ${recipe[batchIndex].dataset.name}.`;
    // Timers, not animationend, release state even when motion is disabled.
    setTimeout(() => {
      kitchen.classList.remove('is-lid-open');
      if (effectsOn) kitchen.classList.add('is-devouring');
    }, effectsOn ? 380 : 0);
    setTimeout(() => {
      kitchen.classList.remove('is-feeding', 'is-devouring');
      feeding = false;
      updateStation();
    }, effectsOn ? 1100 : 0);
  }
  prepBoard.addEventListener('click', () => {
    if (cookingState !== 'gathering' || feeding || !recipe[batchIndex]) return;
    if (prepared) {
      (fuel > 0 ? potTarget : fuelButton).focus();
      return;
    }
    chops += 1;
    const next = recipe[batchIndex];
    prepared = chops >= Number(next.dataset.quantity);
    if (effectsOn) {
      chopAnimation?.cancel();
      chopAnimation = prepBoard.querySelector('.chopping-knife').animate([
        { transform: 'rotate(-28deg) translateY(-8px)' },
        { transform: 'rotate(12deg) translateY(6px)', offset: .45 },
        { transform: 'rotate(0) translateY(0)' }
      ], { duration: 240, easing: 'ease-out' });
    }
    updateStation();
    recipeStatus.textContent = !prepared ? `${next.dataset.name}: ${chops} of ${next.dataset.quantity} chops. Keep chopping!` : fuel > 0 ? 'Batch prepared. Drag it into the pot, or tap the pot to add it.' : 'Batch prepared. Add logs to the fire before putting it in the pot.';
  });
  prepBoard.addEventListener('dragstart', (event) => {
    if (!prepared || feeding) { event.preventDefault(); return; }
    event.dataTransfer.setData('text/plain', 'faf-prepared-batch');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setDragImage(prepBoard.querySelector('strong'), 60, 12);
    draggingBatch = true;
    kitchen.classList.add('is-lid-open');
  });
  function endDrag() {
    draggingBatch = false;
    if (!feeding) kitchen.classList.remove('is-lid-open');
  }
  prepBoard.addEventListener('dragend', endDrag);
  window.addEventListener('blur', endDrag);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') endDrag(); });
  potTarget.addEventListener('dragover', (event) => {
    if (draggingBatch && prepared && fuel > 0 && !feeding) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  });
  potTarget.addEventListener('drop', (event) => {
    event.preventDefault();
    if (draggingBatch && event.dataTransfer.getData('text/plain') === 'faf-prepared-batch') addBatch();
  });
  potTarget.addEventListener('click', addBatch);
  cookButton.addEventListener('click', () => {
    if (cookingState === 'ready') {
      clearInterval(cookTimer);
      cookingState = 'gathering';
      batchIndex = 0;
      prepared = false;
      chops = 0;
      setFuel(0);
      kitchen.classList.remove('is-ready');
      updateStation();
      recipeStatus.textContent = 'Add logs to the fire, then prepare the first batch.';
      fuelButton.focus();
      return;
    }
    if (batchIndex !== recipe.length || fuel <= 0 || cookingState !== 'gathering') return;
    cookingState = 'cooking';
    kitchen.classList.add('is-cooking');
    cookButton.disabled = true;
    cookLabel.textContent = 'Cooking the Crown Roast…';
    updateStation();
    recipeStatus.textContent = 'The vessel is heating. Keep the bonfire burning.';
    let elapsed = 0;
    let lastTick = performance.now();
    cookTimer = setInterval(() => {
      const now = performance.now();
      const delta = Math.min(now - lastTick, 250);
      lastTick = now;
      if (fuel <= 0) { recipeStatus.textContent = 'Out of fuel. Add logs to continue cooking.'; return; }
      elapsed += delta;
      setFuel(fuel - delta * .005);
      if (elapsed < 4200) return;
      clearInterval(cookTimer);
      cookingState = 'ready';
      kitchen.classList.remove('is-cooking');
      kitchen.classList.add('is-ready');
      cookButton.disabled = false;
      cookLabel.textContent = 'Prepare another roast';
      potTarget.querySelector('span').textContent = 'Behemoth Crown Roast · ready';
      recipeStatus.textContent = 'Behemoth Crown Roast is ready. Your next expedition starts here.';
    }, 100);
  });
  updateStation();

  // Local canvas embers only run while the hearth is on screen.
  const canvas = document.querySelector('.ember-canvas');
  const context = canvas.getContext('2d');
  if (context) {
    let width = 1, height = 1, visible = false, running = false, lastPaint = 0;
    const sparks = Array.from({ length: 36 }, () => ({ life: Math.random(), drift: Math.random() * 2 - 1, size: .8 + Math.random() * 1.5, speed: .12 + Math.random() * .15, phase: Math.random() * Math.PI * 2 }));
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      width = box.width;
      height = box.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    new ResizeObserver(resize).observe(canvas.parentElement);
    function frame(now) {
      if (!visible || !effectsOn || document.hidden || fuel <= 0) { context.clearRect(0, 0, width, height); running = false; return; }
      requestAnimationFrame(frame);
      if (now - lastPaint < 32) return;
      const delta = Math.min((now - lastPaint) / 1000, .05);
      lastPaint = now;
      context.clearRect(0, 0, width, height);
      sparks.forEach((spark, index) => {
        spark.life += delta * spark.speed * (cookingState === 'cooking' ? 1.6 : 1);
        if (spark.life > 1) spark.life = 0;
        if (index > 20 && cookingState !== 'cooking') return;
        const x = width * (.49 + spark.drift * .11) + Math.sin(spark.life * 6 + spark.phase) * 15 + spark.drift * spark.life * 55;
        const y = height * (.85 - spark.life * .68);
        context.globalAlpha = Math.sin(spark.life * Math.PI) * .85;
        context.fillStyle = index % 3 === 0 ? '#fff0b4' : '#efb65f';
        context.shadowColor = '#ffab46';
        context.shadowBlur = 8;
        context.beginPath();
        context.ellipse(x, y, spark.size, spark.size * 1.5, spark.drift, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
    }
    resumeEmbers = () => {
      if (visible && effectsOn && !document.hidden && !running) {
        running = true;
        lastPaint = performance.now();
        requestAnimationFrame(frame);
      }
    };
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resumeEmbers(); }).observe(canvas.parentElement);
    document.addEventListener('visibilitychange', resumeEmbers);
  }

  const artworks = [...document.querySelectorAll('.gallery-card')].map((card) => ({
    source: card.querySelector('img').getAttribute('src'),
    alt: card.querySelector('img').alt,
    title: card.querySelector('h3').textContent,
    card
  }));
  const dialog = document.querySelector('.gallery-dialog');
  let activeArtwork = 0;
  let galleryOpener;
  function showArtwork(index) {
    activeArtwork = (index + artworks.length) % artworks.length;
    const artwork = artworks[activeArtwork];
    const image = dialog.querySelector('figure img');
    image.src = artwork.source;
    image.alt = artwork.alt;
    dialog.querySelector('figcaption').textContent = artwork.title;
    dialog.querySelector('.gallery-position').textContent = `0${activeArtwork + 1} / 0${artworks.length}`;
  }
  artworks.forEach((artwork, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-open';
    button.setAttribute('aria-label', `View ${artwork.title.toLowerCase()} artwork`);
    button.innerHTML = '<span aria-hidden="true">+</span>';
    button.addEventListener('click', () => {
      galleryOpener = button;
      showArtwork(index);
      dialog.showModal();
      document.body.classList.add('has-gallery-dialog');
      dialog.querySelector('.gallery-close').focus();
    });
    artwork.card.querySelector('.gallery-placeholder-art').append(button);
  });
  dialog.querySelector('.gallery-close').addEventListener('click', () => dialog.close());
  dialog.querySelectorAll('[data-gallery-step]').forEach((button) => button.addEventListener('click', () => showArtwork(activeArtwork + Number(button.dataset.galleryStep))));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showArtwork(activeArtwork + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('has-gallery-dialog');
    galleryOpener?.focus();
  });

  document.querySelectorAll('main section:not(.hero) img').forEach((image) => {
    image.loading = 'lazy';
    image.decoding = 'async';
  });
})();
