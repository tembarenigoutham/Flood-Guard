// Flood Emergency Mock Real-Time Database
// Automatically syncs across all open browser tabs using localStorage events.

const initialDB = {
  sosRequests: [],     // { id, userName, lat, lng, status: pending/assigned/rescued, workerName }
  workers: [],         // { name, status: available/busy }
  globalAlert: 'Normal' // Normal, Moderate, Critical
};

function getDB() {
  const data = localStorage.getItem('floodDb');
  return data ? JSON.parse(data) : initialDB;
}

function saveDB(state) {
  localStorage.setItem('floodDb', JSON.stringify(state));
  // Manually trigger local update since "storage" event only fires on OTHER tabs
  if(window.onDbUpdate) window.onDbUpdate(state);
}

// Global Cross-Tab Listener
window.addEventListener('storage', (e) => {
  if (e.key === 'floodDb') {
    if(window.onDbUpdate) window.onDbUpdate(JSON.parse(e.newValue));
  }
});

// Helper Actions
function createSOS(userName, lat, lng) {
  const db = getDB();
  // remove old if exists
  db.sosRequests = db.sosRequests.filter(s => s.userName !== userName);
  
  db.sosRequests.push({
    id: Date.now().toString(),
    userName: userName,
    lat: lat,
    lng: lng,
    status: 'pending',
    workerName: null
  });
  saveDB(db);
}

function acceptSOS(sosId, workerName) {
  const db = getDB();
  const req = db.sosRequests.find(s => s.id === sosId);
  if (req && req.status === 'pending') {
    req.status = 'assigned';
    req.workerName = workerName;
    saveDB(db);
  }
}

function resolveSOS(sosId) {
  const db = getDB();
  const req = db.sosRequests.find(s => s.id === sosId);
  if (req) {
    req.status = 'rescued';
    saveDB(db);
  }
}

function setGlobalAlert(level) {
  const db = getDB();
  db.globalAlert = level;
  saveDB(db);
}

// Clear DB for demo purposes
function resetSystem() {
  localStorage.setItem('floodDb', JSON.stringify(initialDB));
  if(window.onDbUpdate) window.onDbUpdate(initialDB);
}

window.db = {
  get: getDB,
  save: saveDB,
  createSOS,
  acceptSOS,
  resolveSOS,
  setGlobalAlert,
  resetSystem
};
