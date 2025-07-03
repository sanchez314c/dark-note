const { app, BrowserWindow, ipcMain, screen, Menu, shell } = require('electron');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize store for persistence - simple JSON file implementation
const fs = require('fs');
const userDataPath = app.getPath('userData');
const notesFile = path.join(userDataPath, 'notes.json');

// Validation constants
const MAX_CONTENT_LENGTH = 100000; // 100KB per note
const VALID_HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const VALID_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_COLORS = new Set([
  '#ffeb3b', '#ff9800', '#4caf50', '#2196f3',
  '#e91e63', '#9c27b0', '#ffffff'
]);

// Validate that a note ID is a well-formed UUID owned by an existing window
function isValidNoteId(id) {
  return typeof id === 'string' && VALID_UUID.test(id) && noteWindows.has(id);
}

// Validate a color value — must be a known palette entry or valid 6-digit hex
function isValidColor(color) {
  return typeof color === 'string' && (ALLOWED_COLORS.has(color) || VALID_HEX_COLOR.test(color));
}

// Atomic file write — write to temp file then rename to avoid partial-write corruption
function atomicWriteFile(filePath, data) {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, data, 'utf8');
  fs.renameSync(tmp, filePath);
}

// Validate and sanitize note data loaded from disk
function sanitizeNoteData(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const note = {};
  // id — must be a valid UUID string
  if (typeof raw.id === 'string' && VALID_UUID.test(raw.id)) {
    note.id = raw.id;
  } else {
    return null; // discard notes with invalid IDs
  }
  note.x = Number.isFinite(raw.x) ? Math.round(raw.x) : 100;
  note.y = Number.isFinite(raw.y) ? Math.round(raw.y) : 100;
  note.width = Number.isFinite(raw.width) && raw.width >= 200 ? Math.round(raw.width) : 300;
  note.height = Number.isFinite(raw.height) && raw.height >= 200 ? Math.round(raw.height) : 300;
  note.content = typeof raw.content === 'string'
    ? raw.content.slice(0, MAX_CONTENT_LENGTH)
    : '';
  note.backgroundColor = isValidColor(raw.backgroundColor)
    ? raw.backgroundColor
    : '#ffeb3b';
  note.fontSize = Number.isFinite(raw.fontSize) && raw.fontSize >= 8 && raw.fontSize <= 72
    ? raw.fontSize
    : 14;
  return note;
}

// Simple store implementation
const store = {
  get: (key, defaultValue) => {
    try {
      if (fs.existsSync(notesFile)) {
        const data = JSON.parse(fs.readFileSync(notesFile, 'utf8'));
        // Use hasOwnProperty check so falsy stored values (0, false, '') are preserved
        return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : defaultValue;
      }
    } catch (e) {
      console.error('Error reading notes:', e);
    }
    return defaultValue;
  },
  set: (key, value) => {
    let data = {};
    try {
      if (fs.existsSync(notesFile)) {
        data = JSON.parse(fs.readFileSync(notesFile, 'utf8'));
      }
    } catch (e) {
      console.error('Error reading notes for write:', e);
    }
    data[key] = value;
    try {
      atomicWriteFile(notesFile, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error writing notes:', e);
    }
  }
};

// Store for all note windows
const noteWindows = new Map();

// Default note properties
const DEFAULT_NOTE = {
  width: 300,
  height: 300,
  backgroundColor: '#ffeb3b',
  x: 100,
  y: 100
};

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'Dark Sticky Notes',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => createNote()
        },
        {
          label: 'Save All Notes',
          accelerator: 'CmdOrCtrl+S',
          click: () => saveAllNotes()
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Toggle Developer Tools', accelerator: 'Alt+CmdOrCtrl+I', role: 'toggleDevTools' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create a new note window
function createNote(noteData = null) {
  const id = noteData?.id || uuidv4();
  
  // Get screen dimensions for positioning
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  // Calculate position for new notes
  const existingCount = noteWindows.size;
  const offsetX = (existingCount * 30) % (screenWidth - DEFAULT_NOTE.width);
  const offsetY = (existingCount * 30) % (screenHeight - DEFAULT_NOTE.height);
  
  const noteConfig = {
    id,
    x: noteData?.x ?? (DEFAULT_NOTE.x + offsetX),
    y: noteData?.y ?? (DEFAULT_NOTE.y + offsetY),
    width: noteData?.width ?? DEFAULT_NOTE.width,
    height: noteData?.height ?? DEFAULT_NOTE.height,
    content: noteData?.content || '',
    backgroundColor: noteData?.backgroundColor || DEFAULT_NOTE.backgroundColor,
    fontSize: noteData?.fontSize || 14
  };

  // Create the browser window
  const noteWindow = new BrowserWindow({
    x: noteConfig.x,
    y: noteConfig.y,
    width: noteConfig.width,
    height: noteConfig.height,
    minWidth: 200,
    minHeight: 200,
    frame: false,
    transparent: true,
    show: false,
    backgroundColor: '#00000000',
    alwaysOnTop: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the note HTML using absolute path to prevent path resolution issues
  noteWindow.loadFile(path.join(__dirname, 'note.html'));

  // Show window only after the first non-empty paint. This prevents the
  // transparent frameless window from being "visible" to the WM with zero
  // rendered pixels (invisible to the user).
  const showTimeout = setTimeout(() => {
    if (!noteWindow.isDestroyed() && !noteWindow.isVisible()) {
      console.warn(`Note ${id}: ready-to-show did not fire within 3s, forcing show`);
      noteWindow.show();
    }
  }, 3000);

  noteWindow.once('ready-to-show', () => {
    clearTimeout(showTimeout);
    noteWindow.show();
  });

  // Send initial data to the note
  noteWindow.webContents.on('did-finish-load', () => {
    noteWindow.webContents.send('load-note', noteConfig);
  });

  // If the renderer crashes (sandbox /dev/shm failure, GPU driver issue),
  // attempt one reload instead of leaving a dead invisible window.
  noteWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error(`Note ${id}: renderer crashed - reason: ${details.reason}, exitCode: ${details.exitCode}`);
    if (!noteWindow.isDestroyed()) {
      noteWindow.loadFile(path.join(__dirname, 'note.html'));
    }
  });

  // Store the window reference
  noteWindows.set(id, noteWindow);

  // Handle window close
  noteWindow.on('closed', () => {
    noteWindows.delete(id);
  });

  // Track position changes
  noteWindow.on('moved', () => {
    const [x, y] = noteWindow.getPosition();
    saveNotePosition(id, x, y);
  });

  // Track resize events
  noteWindow.on('resized', () => {
    const [width, height] = noteWindow.getSize();
    saveNoteSize(id, width, height);
  });

  return id;
}

// Save note position
function saveNotePosition(id, x, y) {
  const notes = store.get('notes', {});
  if (!notes[id]) notes[id] = { id };
  notes[id].x = x;
  notes[id].y = y;
  store.set('notes', notes);
}

// Save note size
function saveNoteSize(id, width, height) {
  const notes = store.get('notes', {});
  if (!notes[id]) notes[id] = { id };
  notes[id].width = width;
  notes[id].height = height;
  store.set('notes', notes);
}

// Save all notes — captures position/size synchronously from main process.
// Also reads current textarea content via executeJavaScript so content is
// persisted even if the renderer's IPC response doesn't complete before quit.
// The auto-save debounce (1s) handles normal typing; this is the safety net.
async function saveAllNotes() {
  const notes = store.get('notes', {});

  const savePromises = [];

  noteWindows.forEach((window, id) => {
    if (!window.isDestroyed()) {
      const [x, y] = window.getPosition();
      const [width, height] = window.getSize();

      if (!notes[id]) notes[id] = { id };
      notes[id].x = x;
      notes[id].y = y;
      notes[id].width = width;
      notes[id].height = height;

      // Directly capture content from the renderer — avoids the IPC round-trip
      // race condition where the renderer may not respond before the process exits.
      const p = window.webContents
        .executeJavaScript(
          'document.getElementById("noteTextarea") ? document.getElementById("noteTextarea").value : null'
        )
        .then(content => {
          if (typeof content === 'string') {
            const sanitized = content.slice(0, MAX_CONTENT_LENGTH);
            // Re-read notes in case a parallel save landed between iterations
            const fresh = store.get('notes', {});
            if (!fresh[id]) fresh[id] = { id };
            fresh[id].content = sanitized;
            store.set('notes', fresh);
          }
        })
        .catch(() => {
          // Renderer may be unresponsive — leave persisted content intact
        });

      savePromises.push(p);

      // Also broadcast so the renderer's own debounced save fires if it's still alive
      window.webContents.send('request-save');
    }
  });

  store.set('notes', notes);

  // Await all content captures so quit doesn't race ahead of the writes
  await Promise.allSettled(savePromises);
}

// Load saved notes — validate each note's shape before creating its window
function loadSavedNotes() {
  const notes = store.get('notes', {});

  if (Object.keys(notes).length === 0) {
    // Create a default note if none exist
    createNote();
  } else {
    // Load all saved notes, skipping any with invalid data
    Object.values(notes).forEach(raw => {
      const note = sanitizeNoteData(raw);
      if (note) {
        createNote(note);
      } else {
        console.warn('Skipping note with invalid data:', raw);
      }
    });
  }
}

// IPC Handlers
// Each handler validates inputs before acting.
// Sender identity is verified: only the window that owns a note ID can act on it.

ipcMain.handle('create-note', () => {
  return createNote();
});

ipcMain.handle('close-note', (event, id) => {
  if (!isValidNoteId(id)) return;
  // Verify the sender is the owner of this note
  const window = noteWindows.get(id);
  if (!window || window.isDestroyed()) return;
  if (window.webContents.id !== event.sender.id) return;
  window.close();
});

ipcMain.handle('save-note-content', (event, id, content) => {
  if (!isValidNoteId(id)) return;
  const window = noteWindows.get(id);
  if (!window || window.isDestroyed()) return;
  if (window.webContents.id !== event.sender.id) return;
  if (typeof content !== 'string') return;
  const sanitizedContent = content.slice(0, MAX_CONTENT_LENGTH);
  const notes = store.get('notes', {});
  if (!notes[id]) notes[id] = { id };
  notes[id].content = sanitizedContent;
  store.set('notes', notes);
});

ipcMain.handle('update-note-color', (event, id, color) => {
  if (!isValidNoteId(id)) return;
  const window = noteWindows.get(id);
  if (!window || window.isDestroyed()) return;
  if (window.webContents.id !== event.sender.id) return;
  if (!isValidColor(color)) return;
  const notes = store.get('notes', {});
  if (!notes[id]) notes[id] = { id };
  notes[id].backgroundColor = color;
  store.set('notes', notes);
});

ipcMain.handle('minimize-note', (event, id) => {
  if (!isValidNoteId(id)) return;
  const window = noteWindows.get(id);
  if (!window || window.isDestroyed()) return;
  if (window.webContents.id !== event.sender.id) return;
  window.minimize();
});

ipcMain.handle('toggle-always-on-top', (event, id) => {
  if (!isValidNoteId(id)) return false;
  const window = noteWindows.get(id);
  if (!window || window.isDestroyed()) return false;
  if (window.webContents.id !== event.sender.id) return false;
  const isAlwaysOnTop = window.isAlwaysOnTop();
  window.setAlwaysOnTop(!isAlwaysOnTop);
  return !isAlwaysOnTop;
});

// Open external URLs safely — validates protocol before calling shell.openExternal
ipcMain.handle('open-external', async (event, url) => {
  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      await shell.openExternal(url);
    }
  } catch {
    console.error('Invalid URL for open-external:', url);
  }
});

// ── Platform-specific Chromium flags ──
// Must be set BEFORE app.ready — works in source AND packaged builds.
if (process.platform === 'linux') {
  // Match env var set by run-source-linux.sh — ensures Mutter tracks frameless windows
  process.env.ELECTRON_FORCE_WINDOW_MENU_BAR = '1';

  // Request 32-bit ARGB visual from X11 compositor for transparent windows.
  // Triggers an async X11 round-trip to discover visuals with alpha support.
  app.commandLine.appendSwitch('enable-transparent-visuals');

  // Use SwiftShader (CPU-based GL) instead of disableHardwareAcceleration().
  // disableHardwareAcceleration() kills the GPU compositing pipeline that
  // enable-transparent-visuals depends on, producing all-zero alpha (invisible).
  // SwiftShader keeps the compositing pipeline alive with a software GL backend.
  // The packaged binary ships libvk_swiftshader.so for exactly this purpose.
  app.commandLine.appendSwitch('use-gl', 'angle');
  app.commandLine.appendSwitch('use-angle', 'swiftshader');
  app.commandLine.appendSwitch('disable-gpu-watchdog');

  // Disable sandbox at process level — belt-and-suspenders with per-window sandbox:false
  app.commandLine.appendSwitch('no-sandbox');
}

// App event handlers
app.whenReady().then(() => {
  createMenu();
  // enable-transparent-visuals triggers an async X11 round-trip to discover
  // ARGB visuals. Creating windows before this completes gives them a 24-bit
  // visual (no alpha = invisible). 1000ms is generous; actual wait is ~200ms.
  // Window visibility is gated by ready-to-show, not this timeout.
  if (process.platform === 'linux') {
    setTimeout(() => loadSavedNotes(), 1000);
  } else {
    loadSavedNotes();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (noteWindows.size === 0) {
    loadSavedNotes();
  }
});

// Save notes before quit — prevent app exit until all content is flushed to disk.
// Uses app.quit() re-entry guard so the second quit (after saves complete) proceeds.
let isQuitting = false;
app.on('before-quit', (event) => {
  if (isQuitting) return;
  event.preventDefault();
  isQuitting = true;
  saveAllNotes().finally(() => {
    app.quit();
  });
});