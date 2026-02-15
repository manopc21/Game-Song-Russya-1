document.addEventListener("click", () => {
  const bgMusic = document.getElementById("bgMusic");

  if (bgMusic && bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }
}, { once: true });

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado");

  const playBtn = document.getElementById("playBtn");
  const storyBtn = document.getElementById("storyBtn");
  const backToMenuBtn = document.getElementById("backToMenuBtn");
  const menuBtn = document.getElementById("menuBtn");

  const mainMenu = document.getElementById("mainMenu");
  const gameContainer = document.getElementById("gameContainer");
  const storyModal = document.getElementById("storyModal");

  // DEBUG
  console.log("playBtn:", playBtn);
  console.log("storyBtn:", storyBtn);

  if (!playBtn || !storyBtn) {
    console.error("Botões NÃO encontrados no DOM");
    return;
  }

  // PLAY
  playBtn.addEventListener("click", () => {
    console.log("PLAY clicado");
    mainMenu.classList.add("hidden");
    gameContainer.classList.remove("hidden");

    const bgMusic = document.getElementById("bgMusic");
    if (bgMusic) {
      bgMusic.play().catch(() => {});
    }
  });

  // STORY
  storyBtn.addEventListener("click", () => {
    console.log("STORY clicado");
    storyModal.classList.remove("hidden");
  });

  // BACK (story)
  if (backToMenuBtn) {
    backToMenuBtn.addEventListener("click", () => {
      storyModal.classList.add("hidden");
    });
  }

  // BACK TO MENU (victory / game over)
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      gameContainer.classList.add("hidden");
      mainMenu.classList.remove("hidden");
    });
  }
});

// ============ DOM ELEMENTS ============
const mainMenu = document.getElementById('mainMenu');
const gameContainer = document.getElementById('gameContainer');
const storyModal = document.getElementById('storyModal');
const victoryScreen = document.getElementById('victoryScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const playBtn = document.getElementById('playBtn');
const storyBtn = document.getElementById('storyBtn');
const modalCloseBtn = document.querySelector(".modal-close");

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", () => {
    storyModal.classList.add("hidden");
  });
}

const backToMenuBtn = document.getElementById('backToMenuBtn');
const menuBtn = document.getElementById('menuBtn');
const gameOverMenuBtn = document.getElementById('gameOverMenuBtn');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bgMusic = document.getElementById('bgMusic');
const dialogEl = document.getElementById('dialog');
const actionBtn = document.getElementById('actionBtn');
const charNameEl = document.getElementById('charName');
const hpFill = document.getElementById('hpFill');
const mpFill = document.getElementById('mpFill');
const hpText = document.getElementById('hpText');
const mpText = document.getElementById('mpText');
const songFragmentsEl = document.getElementById('songFragments');
const nearbyEntityEl = document.getElementById('nearbyEntity');
const hudLocationEl = document.querySelector('.hud-location');
const hudObjectiveEl = document.getElementById('hudObjective');
const eventLogEl = document.getElementById('eventLog');

// ============ CONSTANTS ============
const TILE_SIZE = 32;
const MAP_WIDTH = 20; // Reduzido de 60 para 20
const MAP_HEIGHT = 20; // Reduzido de 60 para 20
const CENTER_X = MAP_WIDTH / 2 * TILE_SIZE;
const CENTER_Y = MAP_HEIGHT / 2 * TILE_SIZE;

const gameData = {
  regions: {
    forestCrystal: { name: '🏔️ Crystal Forest', color: '#06b6d4', altColor: '#167e8f', grass: '#4dd0e1' },
    hallRuins: { name: '🎭 Hall of Ruins', color: '#6366f1', altColor: '#4f46e5', grass: '#818cf8' },
    cavern: { name: '💎 Crystal Cavern', color: '#86efac', altColor: '#4ade80', grass: '#a7f3d0' },
    village: { name: '🏚️ Abandoned Village', color: '#f87171', altColor: '#dc2626', grass: '#fca5a5' },
    temple: { name: '🕉️ Forgotten Temple', color: '#d946ef', altColor: '#a21caf', grass: '#f0abfc' }
  }
};

const state = {
  gameState: 'menu', // menu, playing, victory
  running: true,
  player: {
    x: CENTER_X + 100, y: CENTER_Y + 100,
    r: 12,
    color: '#fde047',
    vx: 0, vy: 0,
    hp: 100, hpMax: 100,
    mp: 50, mpMax: 50,
    moveSpeed: 150,
    notasColetadas: 0,
    level: 1,
    exp: 0
  },
  camera: { x: 0, y: 0 },
  keys: {},
  showDialog: false,
  currentRegion: 'forestCrystal',
  eventLog: [],
  terrainNoise: {}, // Cache para ruído procedural
  npcs: [
    { id: 'bardo', x: 250, y: 200, name: '♪ Lyric the Bard', icon: '🎵', type: 'npc', text: 'Music is your guide...' }
  ],
  enemies: [
    { id: 'silence1', x: 150, y: 150, name: '👤 Silent Creature', hp: 20, hpMax: 20, type: 'enemy', threat: 'low', lastShot: 0 },
    { id: 'shadow1', x: 300, y: 250, name: '⚫ Shadow Beast', hp: 30, hpMax: 30, type: 'enemy', threat: 'high', lastShot: 0 },
    { id: 'mage1', x: 500, y: 100, name: '🔥 Fire Mage', hp: 25, hpMax: 25, type: 'enemy', threat: 'high', lastShot: 0 },
    { id: 'knight1', x: 100, y: 400, name: '⚔️ Shadow Knight', hp: 35, hpMax: 35, type: 'enemy', threat: 'high', lastShot: 0 },
    { id: 'wraith1', x: 550, y: 450, name: '👻 Frozen Specter', hp: 22, hpMax: 22, type: 'enemy', threat: 'medium', lastShot: 0 },
    { id: 'demon1', x: 50, y: 500, name: '😈 Flame Demon', hp: 40, hpMax: 40, type: 'enemy', threat: 'high', lastShot: 0 },
    { id: 'golem1', x: 450, y: 500, name: '🪨 Fire Golem', hp: 45, hpMax: 45, type: 'enemy', threat: 'high', lastShot: 0 }
  ],
  notas: [
    { id: 'nota1', x: 100, y: 100, name: '♪ Musical Note I', type: 'nota', collected: false },
    { id: 'nota2', x: 400, y: 150, name: '♪ Musical Note II', type: 'nota', collected: false },
    { id: 'nota3', x: 200, y: 350, name: '♪ Musical Note III', type: 'nota', collected: false },
    { id: 'nota4', x: 500, y: 300, name: '♪ Musical Note IV', type: 'nota', collected: false },
    { id: 'nota5', x: 350, y: 80, name: '♪ Musical Note V', type: 'nota', collected: false },
    { id: 'nota6', x: 450, y: 400, name: '♪ Musical Note VI', type: 'nota', collected: false }
  ],
  projetos: [],
  playerHasMoved: false,
  microfone: {
    x: CENTER_X,
    y: CENTER_Y,
    radius: 40,
    name: 'Microfone Sagrado'
  },
  nearbyEntity: null,
  lastInteractTime: 0
};

// ============ FUNÇÕES AUXILIARES ============
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function fireProjectile(enemyX, enemyY, targetX, targetY) {
  const dx = targetX - enemyX;
  const dy = targetY - enemyY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const speed = 200;
  
  if (dist > 0) {
    state.projetos.push({
      x: enemyX,
      y: enemyY,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      radius: 8,
      color: '#ff6b35',
      type: 'fireball'
    });
  }
}

// Perlin-like noise simples para geração de terreno
function simpleNoise(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

function getRegionAtPosition(x, y) {
  const col = Math.floor(x / (TILE_SIZE * 5));
  const row = Math.floor(y / (TILE_SIZE * 5));
  
  if (col < 2 && row < 2) return 'forestCrystal';
  if (col >= 2 && col < 4 && row < 2) return 'hallRuins';
  if (col < 2 && row >= 2 && row < 4) return 'cavern';
  if (col >= 2 && col < 4 && row >= 2 && row < 4) return 'village';
  if (col >= 3 && row >= 3) return 'temple';
  return 'forestCrystal';
}

// ============ RENDERING ============
function resize() {
  // Always maintain 9:16 aspect ratio, never resize during any game state
  const vp = document.getElementById('viewport');
  const rect = vp.getBoundingClientRect();
  
  // Only set canvas dimensions if not already set
  if (canvas.width === 0 || canvas.height === 0) {
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
}

function worldToScreen(wx, wy) {
  return {
    x: Math.round(wx - state.camera.x),
    y: Math.round(wy - state.camera.y)
  };
}

// Gerar terreno procedural com padrão de grama/vegetação
function generateGrassPattern(x, y, region) {
  const noise1 = simpleNoise(x * 0.5, y * 0.5, 1);
  const noise2 = simpleNoise(x * 0.3, y * 0.3, 2);
  
  const pattern = (noise1 + noise2) / 2;
  
  const regionData = gameData.regions[region];
  const baseColor = regionData.color;
  const grassColor = regionData.grass;
  
  // Criar padrão natural de grama
  if (pattern > 0.5) {
    return grassColor;
  } else {
    return baseColor;
  }
}

function renderMap() {
  const viewW = canvas.width / devicePixelRatio;
  const viewH = canvas.height / devicePixelRatio;
  
  // Background
  ctx.fillStyle = '#0a1929';
  ctx.fillRect(0, 0, viewW, viewH);
  
  // Limite de mundo (apenas desenhar tiles dentro dos limites válidos)
  const maxX = MAP_WIDTH * TILE_SIZE;
  const maxY = MAP_HEIGHT * TILE_SIZE;
  
  // Render tiles em view
  const startCol = Math.floor(state.camera.x / TILE_SIZE);
  const startRow = Math.floor(state.camera.y / TILE_SIZE);
  const endCol = Math.ceil((state.camera.x + viewW) / TILE_SIZE);
  const endRow = Math.ceil((state.camera.y + viewH) / TILE_SIZE);
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      // Verificar limites do mapa
      if (col < 0 || row < 0 || col >= MAP_WIDTH || row >= MAP_HEIGHT) continue;
      
      const wx = col * TILE_SIZE;
      const wy = row * TILE_SIZE;
      const screen = worldToScreen(wx, wy);
      
      // Determinar região
      const region = getRegionAtPosition(wx, wy);
      const color = generateGrassPattern(col, row, region);
      
      // Desenhar tile
      ctx.fillStyle = color;
      ctx.fillRect(screen.x, screen.y, TILE_SIZE, TILE_SIZE);
      
      // Grid subtle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(screen.x, screen.y, TILE_SIZE, TILE_SIZE);
    }
  }
  
  // Desenhar Microfone Sagrado no centro
  const mScreen = worldToScreen(state.microfone.x, state.microfone.y);
  
  // Aura do microfone
  ctx.fillStyle = 'rgba(253, 224, 71, 0.1)';
  ctx.beginPath();
  ctx.arc(mScreen.x, mScreen.y, 60, 0, Math.PI * 2);
  ctx.fill();
  
  // Círculo do microfone
  ctx.strokeStyle = '#fcd34d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(mScreen.x, mScreen.y, state.microfone.radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Desenhar microfone (símbolo)
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#fcd34d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎤', mScreen.x, mScreen.y);
  
  // Desenhar notas
  for (const nota of state.notas) {
    if (nota.collected) continue;
    
    const s = worldToScreen(nota.x, nota.y);
    
    // Glow
    ctx.fillStyle = 'rgba(192, 132, 252, 0.2)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Brilho
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 16, 0, Math.PI * 2);
    ctx.stroke();
    
    // Símbolo
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#c084fc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', s.x, s.y);
  }
  
  // Desenhar NPCs
  for (const npc of state.npcs) {
    const s = worldToScreen(npc.x, npc.y);
    
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 18, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(npc.icon, s.x, s.y);
  }
  
  // Desenhar inimigos
  for (const enemy of state.enemies) {
    const s = worldToScreen(enemy.x, enemy.y);
    
    let color = '#f87171';
    if (enemy.threat === 'high') color = '#dc2626';
    else if (enemy.threat === 'medium') color = '#ea580c';
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 18, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚔', s.x, s.y);
    
    // HP bar
    const hpPercent = enemy.hp / enemy.hpMax;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(s.x - 12, s.y - 20, 24 * hpPercent, 3);
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(s.x - 12, s.y - 20, 24, 3);
  }
  
  // Desenhar seta de guia se tiver 6 notas
  if (state.player.notasColetadas === 6) {
    const angle = Math.atan2(state.microfone.y - state.player.y, state.microfone.x - state.player.x);
    const arrowX = state.microfone.x + Math.cos(angle) * 70;
    const arrowY = state.microfone.y + Math.sin(angle) * 70;
    const aScreen = worldToScreen(arrowX, arrowY);
    
    ctx.save();
    ctx.translate(aScreen.x, aScreen.y);
    ctx.rotate(angle);
    
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(-8, 8);
    ctx.lineTo(0, 5);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
  
  // Desenhar projéteis (bolas de fogo)
  for (const proj of state.projetos) {
    const s = worldToScreen(proj.x, proj.y);
    
    // Ao do projétil
    ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 16, 0, Math.PI * 2);
    ctx.fill();
    
    // Núcleo da bola de fogo
    ctx.fillStyle = proj.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, proj.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Brilho
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, proj.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Desenhar player
  const pScreen = worldToScreen(state.player.x, state.player.y);
  
  // Glow
  ctx.fillStyle = 'rgba(253, 224, 71, 0.2)';
  ctx.beginPath();
  ctx.arc(pScreen.x, pScreen.y, 28, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.fillStyle = state.player.color;
  ctx.beginPath();
  ctx.arc(pScreen.x, pScreen.y, state.player.r, 0, Math.PI * 2);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(pScreen.x, pScreen.y, state.player.r, 0, Math.PI * 2);
  ctx.stroke();
  
  // HP bar
  const hpPercent = state.player.hp / state.player.hpMax;
  ctx.fillStyle = '#10b981';
  ctx.fillRect(pScreen.x - 15, pScreen.y - 25, 30 * hpPercent, 3);
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(pScreen.x - 15, pScreen.y - 25, 30, 3);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderMap();
}

// ============ GAME LOGIC ============
function update(dt) {
  // Track if player has moved
  if ((state.player.vx !== 0 || state.player.vy !== 0) && !state.playerHasMoved) {
    state.playerHasMoved = true;
  }
  
  // Update player position
  state.player.x += state.player.vx * dt;
  state.player.y += state.player.vy * dt;
  
  // Clamp to world
  const maxX = MAP_WIDTH * TILE_SIZE;
  const maxY = MAP_HEIGHT * TILE_SIZE;
  state.player.x = clamp(state.player.x, 0, maxX);
  state.player.y = clamp(state.player.y, 0, maxY);
  
  // Update camera
  const viewW = canvas.width / devicePixelRatio;
  const viewH = canvas.height / devicePixelRatio;
  state.camera.x = clamp(state.player.x - viewW / 2, 0, Math.max(0, maxX - viewW));
  state.camera.y = clamp(state.player.y - viewH / 2, 0, Math.max(0, maxY - viewH));
  
  // Update region
  state.currentRegion = getRegionAtPosition(state.player.x, state.player.y);
  if (hudLocationEl) {
    const regionName = gameData.regions[state.currentRegion]?.name || 'Unknown';
    hudLocationEl.textContent = regionName;
  }
  
  // Update HUD
  if (hudObjectiveEl) {
    if (state.player.notasColetadas === 6) {
      hudObjectiveEl.textContent = '➡️ Deliver notes to the Microphone!';
      hudObjectiveEl.style.color = '#fcd34d';
    } else {
      hudObjectiveEl.textContent = `Find 6 musical notes (${state.player.notasColetadas}/6)`;
    }
  }
  
  // Check nearby entities
  let nearby = null;
  let nearestDist = Infinity;
  
  // Check notas - AUTO COLLECT
  for (const nota of state.notas) {
    if (nota.collected) continue;
    const d = distance(state.player.x, state.player.y, nota.x, nota.y);
    // Auto-collect if touching
    if (d < 30) {
      state.player.notasColetadas++;
      state.player.mp = clamp(state.player.mp + 15, 0, state.player.mpMax);
      nota.collected = true;
      if (state.player.notasColetadas === 6) {
        addEvent('✨ All 6 notes collected! Go to the Sacred Microphone!', '#10b981');
      }
    } else if (d < 60 && d < nearestDist) {
      nearby = nota;
      nearestDist = d;
    }
  }
  
  // Check microfone - AUTO WIN
  const distToMicrofone = distance(state.player.x, state.player.y, state.microfone.x, state.microfone.y);
  if (distToMicrofone < 50 && state.player.notasColetadas === 6) {
    // Auto-win condition
    showVictory();
  } else if (distToMicrofone < 80 && distToMicrofone < nearestDist) {
    nearby = state.microfone;
    nearestDist = distToMicrofone;
  }
  
  // Check NPCs
  for (const npc of state.npcs) {
    const d = distance(state.player.x, state.player.y, npc.x, npc.y);
    if (d < 80 && d < nearestDist) {
      nearby = npc;
      nearestDist = d;
    }
  }
  
  // Check enemies
  for (const enemy of state.enemies) {
    const d = distance(state.player.x, state.player.y, enemy.x, enemy.y);
    if (d < 80 && d < nearestDist) {
      nearby = enemy;
      nearestDist = d;
    }
    
    // Simple enemy AI
    if (d < 200 && Math.random() < 0.02) {
      const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
      enemy.x += Math.cos(angle) * 80 * dt;
      enemy.y += Math.sin(angle) * 80 * dt;
    }
  }
  
  // Update HUD nearby
  if (nearbyEntityEl) {
    if (nearby) {
      if (nearby.type === 'nota') {
        nearbyEntityEl.textContent = `Musical note nearby! (Pass over)`;
        nearbyEntityEl.style.color = '#c084fc';
      } else if (nearby === state.microfone) {
        if (state.player.notasColetadas === 6) {
          nearbyEntityEl.textContent = `🎤 Pass over to win!`;
          nearbyEntityEl.style.color = '#fcd34d';
        } else {
          nearbyEntityEl.textContent = `You have ${state.player.notasColetadas}/6 notes`;
          nearbyEntityEl.style.color = '#a78bfa';
        }
      } else if (nearby.type === 'npc') {
        nearbyEntityEl.textContent = `Talk to ${nearby.name} [E]`;
        nearbyEntityEl.style.color = '#60a5fa';
      } else if (nearby.type === 'enemy') {
        nearbyEntityEl.textContent = `Attack ${nearby.name} [E]`;
        nearbyEntityEl.style.color = '#f87171';
      }
    } else {
      nearbyEntityEl.textContent = '';
    }
  }
  
  state.nearbyEntity = nearby;
  
  // Update HUD bars
  if (hpFill) hpFill.style.width = (state.player.hp / state.player.hpMax * 100) + '%';
  if (mpFill) mpFill.style.width = (state.player.mp / state.player.mpMax * 100) + '%';
  if (hpText) hpText.textContent = `${state.player.hp}/${state.player.hpMax}`;
  if (mpText) mpText.textContent = `${state.player.mp}/${state.player.mpMax}`;
  if (songFragmentsEl) songFragmentsEl.textContent = `🎵 ${state.player.notasColetadas}/6`;
  
  // Update projetos (fireballs)
  const projectilesToRemove = [];
  for (let i = 0; i < state.projetos.length; i++) {
    const proj = state.projetos[i];
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    
    // Remove if off-screen
    const maxX = MAP_WIDTH * TILE_SIZE;
    const maxY = MAP_HEIGHT * TILE_SIZE;
    if (proj.x < 0 || proj.x > maxX || proj.y < 0 || proj.y > maxY) {
      projectilesToRemove.push(i);
      continue;
    }
    
    // Collision with player
    const distToPlayer = distance(proj.x, proj.y, state.player.x, state.player.y);
    if (distToPlayer < proj.radius + state.player.r) {
      const damage = 15;
      state.player.hp = Math.max(0, state.player.hp - damage);
      projectilesToRemove.push(i);
      
      if (state.player.hp <= 0) {
        showGameOver();
      }
    }
  }
  
  // Remove marked projectiles
  for (let i = projectilesToRemove.length - 1; i >= 0; i--) {
    state.projetos.splice(projectilesToRemove[i], 1);
  }
  
  // Enemies shoot fireballs (only after player starts moving)
  if (state.playerHasMoved) {
    const viewW = canvas.width / devicePixelRatio;
    const viewH = canvas.height / devicePixelRatio;
    
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) continue;
      
      // Check if enemy is within camera view
      const enemyScreen = worldToScreen(enemy.x, enemy.y);
      const isInView = enemyScreen.x >= 0 && enemyScreen.x <= viewW && 
                       enemyScreen.y >= 0 && enemyScreen.y <= viewH;
      
      if (!isInView) continue; // Skip if not visible
      
      const distToPlayer = distance(enemy.x, enemy.y, state.player.x, state.player.y);
      
      // Shoot if close enough and cooldown passed
      if (distToPlayer < 400) {
        const now = Date.now();
        if (!enemy.lastShot) enemy.lastShot = 0;
        
        if (now - enemy.lastShot > 1500) {
          fireProjectile(enemy.x, enemy.y, state.player.x, state.player.y);
          enemy.lastShot = now;
        }
      }
    }
  }
}

// ============ INTERACTION SYSTEM ============
function addEvent(text, color = '#e0f2fe') {
  const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  state.eventLog.unshift({ text, color, time: timestamp });
  
  if (state.eventLog.length > 5) {
    state.eventLog.pop();
  }
  
  if (eventLogEl) {
    eventLogEl.innerHTML = state.eventLog.map(e => 
      `<div class="event-entry" style="color: ${e.color}">[${e.time}] ${e.text}</div>`
    ).join('');
    eventLogEl.classList.remove('hidden');
  }
}

function interact() {
  if (!state.nearbyEntity) return;
  
  // Cooldown para evitar múltiplas interações
  const now = performance.now();
  if (now - state.lastInteractTime < 200) return;
  state.lastInteractTime = now;
  
  const entity = state.nearbyEntity;
  
  if (entity.type === 'nota') {
    // Notes are collected automatically, no action needed
    return;
  } else if (entity === state.microfone) {
    if (state.player.notasColetadas === 6) {
      showVictory();
    } else {
      addEvent(`You have ${state.player.notasColetadas}/6 notes. Find more!`, '#a78bfa');
    }
  } else if (entity.type === 'npc') {
    addEvent(`${entity.name}: "${entity.text}"`, '#c084fc');
    dialogEl.textContent = entity.text;
    dialogEl.classList.remove('hidden');
    state.showDialog = true;
    state.player.mp = clamp(state.player.mp + 5, 0, state.player.mpMax);
  } else if (entity.type === 'enemy') {
    attackEnemy(entity);
  }
}

function attackEnemy(enemy) {
  if (state.player.mp < 15) {
    return;
  }
  
  state.player.mp -= 15;
  const damage = Math.floor(Math.random() * 20) + 10;
  enemy.hp -= damage;
  
  if (enemy.hp <= 0) {
    state.player.exp += 50;
    
    const idx = state.enemies.indexOf(enemy);
    if (idx !== -1) state.enemies.splice(idx, 1);
  } else {
    const counterDamage = Math.floor(Math.random() * 10) + 5;
    state.player.hp -= counterDamage;
  }
}

function showVictory() {
  state.gameState = 'victory';
  victoryScreen.classList.remove('hidden');
  bgMusic.pause();
}

function showGameOver() {
  state.gameState = 'gameOver';
  gameOverScreen.classList.remove('hidden');
  bgMusic.pause();
}

// ============ MENU SYSTEM ============
function startGame() {
  // Prevent multiple game starts
  if (state.gameState === 'playing') return;
  
  mainMenu.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  resize(); // Recalculate canvas size now that gameContainer is visible
  state.gameState = 'playing';
  state.player.x = CENTER_X + 100;
  state.player.y = CENTER_Y + 100;
  state.player.vx = 0;
  state.player.vy = 0;
  bgMusic.play(); // Continue music during gameplay
  requestAnimationFrame(gameLoop);
}

function showStory() {
  storyModal.classList.remove('hidden');
}

function backToMenu() {
  storyModal.classList.add('hidden');
}

function returnToMenu() {
  gameContainer.classList.add('hidden');
  victoryScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  mainMenu.classList.remove('hidden');
  state.gameState = 'menu';
  // Reset game state
  state.player.notasColetadas = 0;
  state.player.hp = 100;
  state.player.mp = 50;
  state.projetos = [];
  state.playerHasMoved = false;
  bgMusic.play(); // Resume music on menu
  bgMusic.currentTime = 0;
  for (const nota of state.notas) {
    nota.collected = false;
  }
  state.enemies = [
    { id: 'silence1', x: 150, y: 150, name: '👤 Silent Creature', hp: 20, hpMax: 20, type: 'enemy', threat: 'low', lastShot: 0 },
    { id: 'shadow1', x: 300, y: 250, name: '⚫ Shadow Beast', hp: 30, hpMax: 30, type: 'enemy', threat: 'high', lastShot: 0 },
    { id: 'mage1', x: 500, y: 100, name: '🔥 Fire Mage', hp: 25, hpMax: 25, type: 'enemy', threat: 'high', lastShot: 0 },
    { id: 'knight1', x: 100, y: 400, name: '⚔️ Shadow Knight', hp: 35, hpMax: 35, type: 'enemy', threat: 'high', lastShot: 0 },
    { id: 'wraith1', x: 550, y: 450, name: '👻 Frozen Specter', hp: 22, hpMax: 22, type: 'enemy', threat: 'medium', lastShot: 0 },
    { id: 'demon1', x: 50, y: 500, name: '😈 Flame Demon', hp: 40, hpMax: 40, type: 'enemy', threat: 'high', lastShot: 0 },
    { id: 'golem1', x: 450, y: 500, name: '🤖 Fire Golem', hp: 45, hpMax: 45, type: 'enemy', threat: 'high', lastShot: 0 }
  ];
  state.eventLog = [];
  state.lastInteractTime = 0;
  state.nearbyEntity = null;
  // Hide and clear event log when returning to menu
  eventLogEl.innerHTML = '';
  eventLogEl.classList.add('hidden');
}

// ============ CONTROLS ============
function setupControls() {

  // Keyboard
  window.addEventListener('keydown', (ev) => {
    if (ev.repeat || state.gameState !== 'playing') return;

    const k = ev.key.toLowerCase();

    // 🔒 BLOQUEIA SCROLL DO NAVEGADOR
    if (["arrowleft","arrowright","arrowup","arrowdown"," "].includes(k)) {
      ev.preventDefault();
    }

    state.keys[k] = true;

    const speed = state.player.moveSpeed;

    if (k === 'arrowleft' || k === 'a') state.player.vx = -speed;
    if (k === 'arrowright' || k === 'd') state.player.vx = speed;
    if (k === 'arrowup' || k === 'w') state.player.vy = -speed;
    if (k === 'arrowdown' || k === 's') state.player.vy = speed;

    if (k === 'e' || k === ' ') interact();

  }, { passive: false });


  window.addEventListener('keyup', (ev) => {
    if (state.gameState !== 'playing') return;

    const k = ev.key.toLowerCase();

    if (["arrowleft","arrowright","arrowup","arrowdown"," "].includes(k)) {
      ev.preventDefault();
    }

    delete state.keys[k];

    if (k === 'arrowleft' || k === 'a') {
      if (!state.keys['arrowright'] && !state.keys['d']) state.player.vx = 0;
    }
    if (k === 'arrowright' || k === 'd') {
      if (!state.keys['arrowleft'] && !state.keys['a']) state.player.vx = 0;
    }
    if (k === 'arrowup' || k === 'w') {
      if (!state.keys['arrowdown'] && !state.keys['s']) state.player.vy = 0;
    }
    if (k === 'arrowdown' || k === 's') {
      if (!state.keys['arrowup'] && !state.keys['w']) state.player.vy = 0;
    }

  }, { passive: false });


  // Action button
  actionBtn.addEventListener('click', interact);

  // Dialog dismiss
  dialogEl.addEventListener('click', closeDialog);


  // ===== TOUCH CONTROLS =====
  canvas.addEventListener('touchstart', (e) => {
    if (state.gameState !== 'playing') return;
    e.preventDefault();
    updateTouchMovement(e);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (state.gameState !== 'playing') return;
    e.preventDefault();
    updateTouchMovement(e);
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    state.player.vx = 0;
    state.player.vy = 0;
  });


  function updateTouchMovement(e) {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();

    const relX = (touch.clientX - rect.left) / rect.width;
    const relY = (touch.clientY - rect.top) / rect.height;

    const speed = state.player.moveSpeed;

    if (relX < 0.35) state.player.vx = -speed;
    else if (relX > 0.65) state.player.vx = speed;
    else state.player.vx = 0;

    if (relY < 0.35) state.player.vy = -speed;
    else if (relY > 0.65) state.player.vy = speed;
    else state.player.vy = 0;
  }
}


// ============ DIALOG ============
function closeDialog() {
  state.showDialog = false;
  dialogEl.classList.add('hidden');
  dialogEl.textContent = '';
}

// ============ INITIALIZATION ============
function init() {
  resize();
  window.addEventListener('resize', resize);
  
  setupControls();
  
  // Menu button event listeners
  playBtn.addEventListener('click', startGame);
  storyBtn.addEventListener('click', showStory);
  backToMenuBtn.addEventListener('click', backToMenu);
  menuBtn.addEventListener('click', returnToMenu);
  gameOverMenuBtn.addEventListener('click', returnToMenu);
  
  // Start background music on menu
  bgMusic.play();
  bgMusic.volume = 0.5; // Set volume to 50%
  
  // Volume control - Menu slider
  menuVolumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value / 100;
    // Sync game volume slider
    gameVolumeSlider.value = e.target.value;
  });
  // Set initial menu slider value
  menuVolumeSlider.value = 50;
  
  // Volume control - Game slider
  gameVolumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value / 100;
    // Sync menu volume slider
    menuVolumeSlider.value = e.target.value;
  });
  // Set initial game slider value
  gameVolumeSlider.value = 50;
}

let lastTime = performance.now();
function gameLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  
  if (state.running && state.gameState === 'playing') {
    update(dt);
    render();
  }
  
  if (state.gameState === 'playing') {
    requestAnimationFrame(gameLoop);
  }
}

init();   // sua inicialização do jogo


// ===============================
// BLOQUEIA ARRASTAR TELA MOBILE
// ===============================
window.addEventListener("touchmove", function(e) {
  if (state.gameState === "playing") {
    e.preventDefault();
  }
}, { passive: false });

