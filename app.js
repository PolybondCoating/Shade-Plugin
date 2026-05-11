/* ==============================================
   POLYBOND — APP LOGIC
   File: js/app.js

   SECTIONS:
   1.  STATE VARIABLES
   2.  PAGE NAVIGATION
   3.  COLOUR GRID — filter + render
   4.  COLOUR DETAIL — individual colour page
   5.  COLOUR DETAIL — profile SVG renderer
   6.  VISUALISER PAGE — full page
   7.  VISUALISER — SVG models
   8.  PRODUCTS PAGE
   9.  HERO MOSAIC
   10. MODAL
   11. INIT
=============================================== */


/* ==============================================
   1. STATE VARIABLES
   These hold the current state of the UI
   Change defaults here if needed
=============================================== */
let currentPage      = 'home';           // currently shown page
let activeColour     = COLOURS[0];       // colour shown on detail page (default: first colour)
let visActiveColour  = COLOURS[0];       // colour selected in visualiser
let filters          = { finish: 'all', lrv: 'all' }; // active filter values
let searchQuery      = '';               // current search box value
let lightingMode     = 'daylight';       // detail page lighting mode
let visLighting      = 'daylight';       // visualiser page lighting
let visModel         = 'extrusion';      // visualiser active model type


/* ==============================================
   2. PAGE NAVIGATION
   showPage(page) — switches visible page
   Called by nav buttons and internal links
   page values match id="page-[value]" in index.html
=============================================== */
window.showPage = function(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  currentPage = page;

  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');

  // Highlight matching nav link
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.textContent.toLowerCase().replace(/\s/g,'').includes(
      page === 'colour-detail' ? 'colours' :
      page === 'architects'    ? 'architects' : page
    )) l.classList.add('active');
  });

  window.scrollTo(0, 0);

  // Trigger page-specific render functions
  if (page === 'colours')    renderColourGrid();
  if (page === 'visualiser') renderVisualiser();
  if (page === 'products')   renderProducts();
};

// Opens a colour detail page for the given product code
window.openColour = function(code) {
  const c = COLOURS.find(x => x.code === code);
  if (!c) return;
  activeColour = c;
  renderColourDetail(c);
  showPage('colour-detail');
};


/* ==============================================
   3. COLOUR GRID — FILTER + RENDER
   getFilteredColours() — applies active filters
   renderColourGrid()   — renders the card grid
   setFilter()          — called by filter chip buttons
   searchColours()      — called by search input

   TO ADD A NEW FILTER TYPE:
   1. Add a filter-chip button in index.html
   2. Add the logic here in getFilteredColours()
=============================================== */
function getFilteredColours() {
  return COLOURS.filter(c => {
    // Finish type filter
    if (filters.finish !== 'all' && c.finish !== filters.finish) return false;
    // LRV range filters — change thresholds here
    if (filters.lrv === 'dark'  && c.lrv >= 20) return false;
    if (filters.lrv === 'mid'   && (c.lrv < 20 || c.lrv > 60)) return false;
    if (filters.lrv === 'light' && c.lrv <= 60) return false;
    // Search — matches name, code, or RAL
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) &&
          !c.code.toLowerCase().includes(q) &&
          !c.ral.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function renderColourGrid() {
  const grid = document.getElementById('colourGrid');
  const cols = getFilteredColours();
  // Each colour card — edit the card HTML structure here
  grid.innerHTML = cols.map(c => `
    <div class="colour-card" onclick="openColour('${c.code}')">
      <div class="colour-swatch" style="background:${c.hex}">
        <span class="swatch-finish-badge">${c.finish}</span>
      </div>
      <div class="colour-info">
        <div class="colour-code">${c.code}</div>
        <div class="colour-name">${c.name}</div>
        <div class="colour-meta">
          <span>${c.ral}</span>
          <span>LRV ${c.lrv}</span>
          <span>${c.gloss}°</span>
        </div>
      </div>
    </div>
  `).join('');
}

window.setFilter = function(btn, type, val) {
  const bar = document.getElementById('filterBar');
  bar.querySelectorAll('.filter-chip').forEach(ch => {
    if (ch.getAttribute('onclick') && ch.getAttribute('onclick').includes("'"+type+"'")) {
      ch.classList.remove('active');
    }
  });
  btn.classList.add('active');
  filters[type] = val;
  renderColourGrid();
};

window.searchColours = function(val) {
  searchQuery = val;
  renderColourGrid();
};


/* ==============================================
   4. COLOUR DETAIL — INDIVIDUAL COLOUR PAGE
   renderColourDetail(c) — populates all detail page elements
   Change the specs array to show/hide data fields
=============================================== */
function renderColourDetail(c) {
  document.getElementById('detailCode').textContent = c.code + ' — ' + c.finish;
  document.getElementById('detailName').textContent = c.name;
  document.getElementById('detailSwatch').style.background = c.hex;

  // Spec grid data — add/remove items here to change which fields show
  const specs = [
    ['HEX',   c.hex],
    ['RAL',   c.ral],
    ['sRGB',  c.rgb],
    ['LAB',   c.lab],
    ['LRV',   c.lrv + '%'],
    ['Gloss', c.gloss + '°'],
  ];
  document.getElementById('specGrid').innerHTML = specs.map(([l,v]) => `
    <div class="spec-cell">
      <span class="spec-label">${l}</span>
      <span class="spec-val">${v}</span>
    </div>
  `).join('');

  // LRV bar — position marker at percentage
  document.getElementById('lrvValue').textContent = c.lrv;
  document.getElementById('lrvMarker').style.left = c.lrv + '%';

  // Similar colours — finds colours with LRV within 12 points
  // Change the 12 to a larger/smaller number to show more/fewer similar colours
  const similar = COLOURS.filter(x => x.code !== c.code && Math.abs(x.lrv - c.lrv) < 12).slice(0, 8);
  document.getElementById('similarColours').innerHTML = similar.map(s => `
    <div class="similar-swatch" title="${s.name}" style="background:${s.hex}" onclick="openColour('${s.code}')"></div>
  `).join('');

  renderProfileSVG(c.hex, lightingMode);
  document.getElementById('modalSub').textContent = `Requesting sample of ${c.code} — ${c.name}. We'll dispatch within 3–5 working days.`;
}


/* ==============================================
   5. COLOUR DETAIL — PROFILE SVG RENDERER
   renderProfileSVG(hex, lighting) — renders isometric extrusion
   hex     : colour hex code to apply
   lighting: 'daylight' / 'warm' / 'overcast'

   TO CHANGE THE MODEL: edit the SVG paths below
   TO CHANGE LIGHTING TINTS: edit the lightTint values
=============================================== */
function renderProfileSVG(hex, lighting) {
  const container = document.getElementById('profileContainer');
  if (!container) return;

  // Lighting affects brightness and colour tint overlay
  const light     = lighting === 'daylight' ? 1.0 : lighting === 'warm' ? 0.85 : 0.72;
  const lightTint = lighting === 'warm'     ? 'rgba(255,160,60,0.08)'  :
                    lighting === 'overcast' ? 'rgba(140,180,220,0.06)' : 'transparent';

  container.innerHTML = `
    <svg viewBox="0 0 480 280" width="480" height="280" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pgFace" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${hex}" stop-opacity="0.6"/>
          <stop offset="30%"  stop-color="${hex}" stop-opacity="${light}"/>
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.7"/>
        </linearGradient>
        <linearGradient id="pgTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${hex}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.6"/>
        </linearGradient>
        <linearGradient id="pgSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${hex}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.2"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path d="M160,90 L320,90 L320,210 L160,210 Z" fill="url(#pgFace)" filter="url(#shadow)"/>
      <path d="M160,90 L320,90 L360,60 L200,60 Z"   fill="url(#pgTop)"/>
      <path d="M320,90 L360,60 L360,180 L320,210 Z"  fill="url(#pgSide)"/>
      <rect x="195" y="90" width="20" height="120" fill="rgba(0,0,0,0.3)"/>
      <rect x="265" y="90" width="20" height="120" fill="rgba(0,0,0,0.3)"/>
      <line x1="160" y1="90" x2="320" y2="90" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
      <ellipse cx="240" cy="238" rx="100" ry="8" fill="rgba(0,0,0,0.3)"/>
      <rect x="0" y="0" width="480" height="280" fill="${lightTint}" pointer-events="none"/>
      <text x="240" y="235" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-family="monospace" font-size="9">60 × 40mm T-SLOT PROFILE</text>
    </svg>
  `;
}

// Called by lighting tab buttons on detail page
window.setLighting = function(btn, mode) {
  document.querySelectorAll('.lighting-tabs .light-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  lightingMode = mode;
  renderProfileSVG(activeColour.hex, mode);
};


/* ==============================================
   6. VISUALISER PAGE — FULL PAGE
   renderVisualiser() — initialises the full visualiser page
   setVisColour()     — called when a palette swatch is clicked
   setModel()         — called by model selector buttons
   setVisLight()      — called by lighting scene buttons
   updateVisInfo()    — updates the info overlay panel
=============================================== */
function renderVisualiser() {
  const palette = document.getElementById('visPalette');
  palette.innerHTML = COLOURS.map(c => `
    <div class="vis-swatch-btn ${c.code === visActiveColour.code ? 'active' : ''}"
      title="${c.name} (${c.code})"
      style="background:${c.hex}"
      onclick="setVisColour('${c.code}')">
    </div>
  `).join('');
  renderVisModel();
  updateVisInfo();
}

window.setVisColour = function(code) {
  visActiveColour = COLOURS.find(c => c.code === code) || visActiveColour;
  document.querySelectorAll('.vis-swatch-btn').forEach((el, i) => {
    el.classList.toggle('active', COLOURS[i] && COLOURS[i].code === code);
  });
  renderVisModel();
  updateVisInfo();
};

window.setModel = function(btn, model) {
  visModel = model;
  document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderVisModel();
};

window.setVisLight = function(btn, mode) {
  visLighting = mode;
  document.querySelectorAll('.light-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderVisModel();
};

// Updates the info overlay bottom-left of visualiser
// Add/remove fields here to change what's displayed
function updateVisInfo() {
  const c = visActiveColour;
  document.getElementById('visInfoOverlay').innerHTML = `
    <div class="vis-info-item"><span class="vis-info-label">Code</span><span class="vis-info-val">${c.code}</span></div>
    <div class="vis-info-item"><span class="vis-info-label">Name</span><span class="vis-info-val">${c.name}</span></div>
    <div class="vis-info-item"><span class="vis-info-label">Finish</span><span class="vis-info-val">${c.finish}</span></div>
    <div class="vis-info-item"><span class="vis-info-label">LRV</span><span class="vis-info-val">${c.lrv}%</span></div>
    <div class="vis-info-item"><span class="vis-info-label">HEX</span><span class="vis-info-val">${c.hex}</span></div>
  `;
  document.getElementById('visSelectedLabel').textContent = `${c.code} — ${c.name}`;
}


/* ==============================================
   7. VISUALISER — SVG MODELS
   renderVisModel() — generates SVG for selected model + colour + lighting
   
   TO ADD A NEW MODEL:
   1. Add a model-btn in index.html with onclick="setModel(this,'yourmodel')"
   2. Add an else if (visModel === 'yourmodel') { svg = `...`; } block below
=============================================== */
function renderVisModel() {
  const area = document.getElementById('visModel');
  if (!area) return;

  const hex       = visActiveColour.hex;
  const light     = visLighting === 'daylight' ? 1.0 : visLighting === 'warm' ? 0.85 : 0.72;
  const lightTint = visLighting === 'warm'     ? 'rgba(255,160,60,0.10)'  :
                    visLighting === 'overcast' ? 'rgba(140,180,220,0.08)' : 'transparent';
  const bgTint    = visLighting === 'daylight' ? '#1a1c24' :
                    visLighting === 'warm'     ? '#1e1810' : '#161c22';

  area.parentElement.style.background = bgTint;

  let svg = '';

  if (visModel === 'extrusion') {
    // Long aluminium extrusion with grooves
    svg = `<svg viewBox="0 0 640 480" width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vFace" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${hex}" stop-opacity="0.55"/>
          <stop offset="50%"  stop-color="${hex}" stop-opacity="${light}"/>
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.65"/>
        </linearGradient>
        <linearGradient id="vTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${hex}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.5"/>
        </linearGradient>
        <linearGradient id="vSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${hex}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.15"/>
        </linearGradient>
        <filter id="vs"><feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000" flood-opacity="0.6"/></filter>
      </defs>
      <path d="M100,140 L540,140 L540,340 L100,340 Z" fill="url(#vFace)" filter="url(#vs)"/>
      <path d="M100,140 L540,140 L580,100 L140,100 Z" fill="url(#vTop)"/>
      <path d="M540,140 L580,100 L580,300 L540,340 Z" fill="url(#vSide)"/>
      <rect x="180" y="140" width="18" height="200" fill="rgba(0,0,0,0.35)"/>
      <rect x="300" y="140" width="18" height="200" fill="rgba(0,0,0,0.35)"/>
      <rect x="420" y="140" width="18" height="200" fill="rgba(0,0,0,0.35)"/>
      <line x1="100" y1="140" x2="540" y2="140" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      <ellipse cx="320" cy="356" rx="230" ry="14" fill="rgba(0,0,0,0.4)"/>
      <rect x="0" y="0" width="640" height="480" fill="${lightTint}" pointer-events="none"/>
      <text x="320" y="430" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="monospace" font-size="11">ALUMINIUM T-SLOT EXTRUSION 80×40</text>
    </svg>`;

  } else if (visModel === 'louvre') {
    // Louvre blade system — 6 blades
    const bladesSVG = [0,1,2,3,4,5].map(i => {
      const y = 100 + i * 52;
      return `
        <path d="M80,${y} L560,${y} L570,${y-16} L90,${y-16} Z" fill="url(#vFace)" ${i===0?'filter="url(#vs)"':''}/>
        <path d="M560,${y} L570,${y-16} L570,${y+8} L560,${y+24} Z" fill="url(#vSide)"/>
        <line x1="80" y1="${y-16}" x2="560" y2="${y-16}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      `;
    }).join('');
    svg = `<svg viewBox="0 0 640 480" width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vFace" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${hex}" stop-opacity="0.55"/>
          <stop offset="50%"  stop-color="${hex}" stop-opacity="${light}"/>
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.65"/>
        </linearGradient>
        <linearGradient id="vSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${hex}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.15"/>
        </linearGradient>
        <filter id="vs"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.5"/></filter>
      </defs>
      ${bladesSVG}
      <rect x="0" y="0" width="640" height="480" fill="${lightTint}" pointer-events="none"/>
      <text x="320" y="455" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="monospace" font-size="11">ALUMINIUM LOUVRE SYSTEM — 75mm BLADE PITCH</text>
    </svg>`;

  } else if (visModel === 'fixture') {
    // Pendant lighting fixture
    svg = `<svg viewBox="0 0 640 480" width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="vFixture" cx="40%" cy="35%">
          <stop offset="0%"   stop-color="${hex}" stop-opacity="1"/>
          <stop offset="60%"  stop-color="${hex}" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.4"/>
        </radialGradient>
        <filter id="vs"><feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000" flood-opacity="0.7"/></filter>
        <radialGradient id="glow" cx="50%" cy="50%">
          <stop offset="0%"   stop-color="#fffbe0" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#fffbe0" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="320" cy="155" rx="120" ry="22" fill="${hex}" fill-opacity="0.6"/>
      <path d="M200,155 L200,260 Q200,280 320,280 Q440,280 440,260 L440,155 Z" fill="url(#vFixture)" filter="url(#vs)"/>
      <ellipse cx="320" cy="260" rx="120" ry="20" fill="${hex}" fill-opacity="0.5"/>
      <ellipse cx="320" cy="262" rx="60" ry="10" fill="url(#glow)" fill-opacity="${visLighting === 'overcast' ? 0.6 : 0.9}"/>
      <rect x="306" y="80" width="28" height="80" fill="${hex}" fill-opacity="0.7"/>
      <rect x="250" y="72" width="140" height="14" rx="4" fill="${hex}" fill-opacity="0.8"/>
      <ellipse cx="320" cy="380" rx="140" ry="16" fill="rgba(0,0,0,0.5)"/>
      <rect x="0" y="0" width="640" height="480" fill="${lightTint}" pointer-events="none"/>
      <text x="320" y="420" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="monospace" font-size="11">ARCHITECTURAL PENDANT FIXTURE — IP65</text>
    </svg>`;

  } else {
    // Cladding panel grid — 3 rows × 4 cols
    let panels = '';
    for (let r = 0; r < 3; r++) {
      for (let cc = 0; cc < 4; cc++) {
        const x = 80 + cc * 132 + r * 20;
        const y = 80 + r * 100 - cc * 10;
        const shade = light - r * 0.06 - cc * 0.02;
        panels += `<path d="M${x},${y+8} L${x+120},${y} L${x+120},${y+90} L${x},${y+98} Z" fill="${hex}" fill-opacity="${shade}" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>`;
        panels += `<line x1="${x}" y1="${y+8}" x2="${x+120}" y2="${y}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`;
      }
    }
    svg = `<svg viewBox="0 0 640 480" width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <filter id="vs"><feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000" flood-opacity="0.5"/></filter>
      <g filter="url(#vs)">${panels}</g>
      <rect x="0" y="0" width="640" height="480" fill="${lightTint}" pointer-events="none"/>
      <text x="320" y="430" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="monospace" font-size="11">POWDER-COATED ALUMINIUM CLADDING PANEL</text>
    </svg>`;
  }

  area.innerHTML = svg;
}


/* ==============================================
   8. PRODUCTS PAGE
   renderProducts() — generates product cards from PRODUCTS array in data.js
   Edit card HTML here to change layout/content
=============================================== */
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = PRODUCTS.map(p => `
    <div style="background:var(--bg);padding:48px 40px;display:flex;flex-direction:column;gap:20px;">
      <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:3px;background:${p.colour};opacity:0.8"></div>
        <div>
          <div style="font-family:var(--mono);font-size:11px;color:var(--fg3);letter-spacing:0.1em;margin-bottom:2px">${p.short}</div>
          <div style="font-size:20px;font-weight:500">${p.name}</div>
        </div>
      </div>
      <p style="font-size:14px;color:var(--fg2);line-height:1.7">${p.desc}</p>
      <div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--fg3);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px">Applications</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${p.apps.map(a => `<span style="padding:4px 12px;border:1px solid var(--border2);border-radius:100px;font-size:12px;color:var(--fg2)">${a}</span>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn-full ghost" style="flex:1;font-size:12px">↓ TDS</button>
        <button class="btn-full ghost" style="flex:1;font-size:12px" onclick="showPage('colours')">Browse Colours →</button>
      </div>
    </div>
  `).join('');
}


/* ==============================================
   9. HERO MOSAIC
   renderMosaic() — fills the 6×8 colour grid on the home hero
   Randomly shuffles COLOURS and fills 48 cells
   Change 48 to change number of cells (must match grid-template in CSS)
=============================================== */
function renderMosaic() {
  const grid = document.getElementById('mosaicGrid');
  if (!grid) return;
  const shuffle = [...COLOURS].sort(() => Math.random() - 0.5);
  grid.innerHTML = Array.from({length: 48}, (_, i) => {
    const c = shuffle[i % shuffle.length];
    return `<div class="mosaic-cell" style="background:${c.hex}" onclick="openColour('${c.code}')" title="${c.name}"></div>`;
  }).join('');
}


/* ==============================================
   10. MODAL
   openModal()          — shows the sample request modal
   closeModal()         — hides the modal
   closeModalOutside(e) — closes if backdrop clicked
=============================================== */
window.openModal = function() {
  document.getElementById('modalOverlay').classList.add('open');
};
window.closeModal = function() {
  document.getElementById('modalOverlay').classList.remove('open');
};
window.closeModalOutside = function(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
};


/* ==============================================
   11. INIT — runs on page load
   Add any startup functions here
=============================================== */
renderMosaic();       // fills the hero mosaic grid
renderColourGrid();   // fills the colour library on first load
