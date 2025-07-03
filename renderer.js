// Get DOM elements
const noteContainer = document.getElementById('noteContainer');
const noteTextarea = document.getElementById('noteTextarea');
const newBtn = document.getElementById('newBtn');
const pinBtn = document.getElementById('pinBtn');
const minBtn = document.getElementById('minBtn');
const closeBtn = document.getElementById('closeBtn');
const pinIndicator = document.getElementById('pinIndicator');
const colorOptions = document.querySelectorAll('.color-option');

// About modal elements
const aboutBtn = document.getElementById('aboutBtn');
const aboutOverlay = document.getElementById('aboutOverlay');
const aboutCloseBtn = document.getElementById('aboutCloseBtn');
const aboutGithubLink = document.getElementById('aboutGithubLink');

// Note state
let noteId = null;
let currentColor = '#ffeb3b';
let isPinned = false;
let saveTimeout = null;

// ── About Modal ──────────────────────────────────────────────────────────────

function openAboutModal() {
  if (aboutOverlay) aboutOverlay.classList.add('active');
}

function closeAboutModal() {
  if (aboutOverlay) aboutOverlay.classList.remove('active');
}

if (aboutBtn) aboutBtn.addEventListener('click', openAboutModal);
if (aboutCloseBtn) aboutCloseBtn.addEventListener('click', closeAboutModal);

// Close on overlay click
if (aboutOverlay) {
  aboutOverlay.addEventListener('click', (e) => {
    if (e.target === aboutOverlay) closeAboutModal();
  });
}

// GitHub link opens in external browser
if (aboutGithubLink) {
  aboutGithubLink.addEventListener('click', (e) => {
    e.preventDefault();
    const url = 'https://github.com/sanchez314c/dark-sticky-notes';
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      // Fallback — not expected in production
      window.open(url, '_blank');
    }
  });
}

// ── Initialize note ──────────────────────────────────────────────────────────

window.electronAPI.onLoadNote((data) => {
  noteId = data.id;

  if (data.content) {
    noteTextarea.value = data.content;
  }

  if (data.backgroundColor) {
    currentColor = data.backgroundColor;
    updateNoteColor(currentColor);
  }

  if (data.fontSize) {
    noteTextarea.style.fontSize = data.fontSize + 'px';
  }
});

// Handle save requests from main process
window.electronAPI.onRequestSave(() => {
  saveNoteContent();
});

// Auto-save on content change
noteTextarea.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveNoteContent();
  }, 1000); // Save after 1 second of inactivity
});

// ── Save ─────────────────────────────────────────────────────────────────────

function saveNoteContent() {
  if (noteId) {
    window.electronAPI.saveNoteContent(noteId, noteTextarea.value);
  }
}

// ── Control Buttons ──────────────────────────────────────────────────────────

newBtn.addEventListener('click', () => {
  window.electronAPI.createNote();
});

pinBtn.addEventListener('click', async () => {
  if (noteId) {
    isPinned = await window.electronAPI.toggleAlwaysOnTop(noteId);
    // Update visual pin state
    pinBtn.classList.toggle('active', isPinned);
    if (pinIndicator) pinIndicator.style.display = isPinned ? 'inline' : 'none';
    if (noteContainer) noteContainer.classList.toggle('pinned', isPinned);
  }
});

minBtn.addEventListener('click', () => {
  if (noteId) {
    window.electronAPI.minimizeNote(noteId);
  }
});

closeBtn.addEventListener('click', () => {
  if (noteId) {
    // Save before closing
    saveNoteContent();
    window.electronAPI.closeNote(noteId);
  }
});

// ── Color Picker ─────────────────────────────────────────────────────────────

colorOptions.forEach(option => {
  option.addEventListener('click', () => {
    const color = option.dataset.color;
    updateNoteColor(color);

    if (noteId) {
      window.electronAPI.updateNoteColor(noteId, color);
    }
  });
});

// Map original hex palette to neo-noir theme names
const COLOR_THEME_MAP = {
  '#ffeb3b': 'yellow',
  '#ff9800': 'orange',
  '#4caf50': 'green',
  '#2196f3': 'blue',
  '#e91e63': 'pink',
  '#9c27b0': 'purple',
  '#ffffff': 'white'
};

function updateNoteColor(color) {
  currentColor = color;

  // Update active color indicator in footer
  colorOptions.forEach(option => {
    option.classList.toggle('active', option.dataset.color === color);
  });

  // Apply theme attribute to container (drives CSS color variants)
  const themeName = COLOR_THEME_MAP[color] || 'teal';
  if (noteContainer) {
    noteContainer.setAttribute('data-color', themeName);
  }

  // NOTE: We do NOT apply background color to the container.
  // The dark glass aesthetic is preserved regardless of color selection.
  // Color identity is expressed through the accent dot glow and top-edge
  // highlight tint only — keeping the dark theme intact.
}

// ── Keyboard Shortcuts ───────────────────────────────────────────────────────
// Support both Cmd (macOS) and Ctrl (Windows/Linux) modifier keys

document.addEventListener('keydown', (e) => {
  const mod = e.metaKey || e.ctrlKey;

  // Escape closes About modal if open
  if (e.key === 'Escape') {
    closeAboutModal();
    return;
  }

  // Cmd/Ctrl+N for new note
  if (mod && e.key === 'n') {
    e.preventDefault();
    window.electronAPI.createNote();
  }

  // Cmd/Ctrl+W to close note
  if (mod && e.key === 'w') {
    e.preventDefault();
    if (noteId) {
      saveNoteContent();
      window.electronAPI.closeNote(noteId);
    }
  }

  // Cmd/Ctrl+S to save
  if (mod && e.key === 's') {
    e.preventDefault();
    saveNoteContent();
  }

  // Cmd/Ctrl+M to minimize
  if (mod && e.key === 'm') {
    e.preventDefault();
    if (noteId) {
      window.electronAPI.minimizeNote(noteId);
    }
  }

  // Cmd/Ctrl+T to toggle pin
  if (mod && e.key === 't') {
    e.preventDefault();
    pinBtn.click();
  }
});

// ── Drag Prevention ──────────────────────────────────────────────────────────

document.addEventListener('dragover', (e) => {
  e.preventDefault();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
});

// ── Focus textarea on load ───────────────────────────────────────────────────

window.addEventListener('load', () => {
  noteTextarea.focus();
});
