/**
 * FIVE NIGHTS AT EPSTEIN'S ISLAND
 * Alpha v1.0 - Persistent Tracking & Goon Logic
 */

let power = 100;
let time = 0;
let monitorOpen = false;
let doorClosed = false;
let currentCam = 0;
let hostLocation = 0; 
let gameStarted = false;

const sounds = {
    ambient: document.getElementById('snd-ambient'),
    door: document.getElementById('snd-door'),
    static: document.getElementById('snd-static'),
    scare: document.getElementById('snd-jumpscare'),
    blip: document.getElementById('snd-blip')
};

const camImages = [
    "https://picsum.photos/id/231/1200/800", // HALLWAY
    "https://picsum.photos/id/232/1200/800", // ROOM
    "https://picsum.photos/id/233/1200/800", // CORRIDOR
    "https://picsum.photos/id/234/1200/800"  // END HALLWAY
];

// Press G to Goon
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g' && gameStarted) {
        power = 0;
        document.getElementById('fail-text').innerText = "YOU GOONED TOO HARD";
        handlePowerOutage();
    }
});

// Start Game
document.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        sounds.ambient.volume = 0.3;
        sounds.ambient.play();
        updateCamView();
    }
}, { once: true });

// Power System
setInterval(() => {
    if (gameStarted && power > 0) {
        let drain = 0.04; 
        if (monitorOpen) drain += 0.15;
        if (doorClosed) drain += 0.45;
        power -= drain;
        document.getElementById('power').innerText = Math.max(0, Math.floor(power));
        if (power <= 0) handlePowerOutage();
    }
}, 1000);

// Enemy Movement (AI)
setInterval(() => {
    if (gameStarted && power > 0) {
        // 40% chance to move every 5 seconds
        if (Math.random() > 0.6) {
            hostLocation++;
            console.log("Enemy Position: " + hostLocation);
            
            // Critical Fix: Update the UI immediately if the monitor is open
            if (monitorOpen) updateCamView();
            
            if (hostLocation > 4) checkAttack();
        }
    }
}, 5000);

function checkAttack() {
    if (!doorClosed) {
        triggerJumpscare();
    } else {
        // Blocked - Reset enemy
        hostLocation = Math.floor(Math.random() * 2); 
        sounds.door.currentTime = 0;
        sounds.door.play();
        if (monitorOpen) updateCamView();
    }
}

// Night Progression (30s per hour)
setInterval(() => {
    if (gameStarted && time < 6) {
        time++;
        document.getElementById('clock').innerText = time;
        if (time === 6) {
            alert("6 AM - YOU SURVIVED");
            location.reload();
        }
    }
}, 30000); 

// Game Actions
function toggleMonitor() {
    if (!gameStarted || power <= 0) return;
    monitorOpen = !monitorOpen;
    sounds.blip.play();
    document.getElementById('camera-system').style.display = monitorOpen ? 'block' : 'none';
    
    if (monitorOpen) {
        sounds.static.volume = 0.1;
        sounds.static.play();
        updateCamView();
    } else {
        sounds.static.pause();
    }
}

function changeCam(id, name) {
    if (!monitorOpen) return;
    currentCam = id;
    sounds.blip.play();
    document.getElementById('cam-name').innerText = `CAM ${id + 1} - ${name}`;
    updateCamView();
}

function updateCamView() {
    const feed = document.getElementById('cam-feed');
    const warning = document.getElementById('host-presence');
    
    feed.src = camImages[currentCam];
    
    // The warning logic now checks every time it runs
    if (hostLocation === currentCam) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
}

function toggleDoor() {
    if (!gameStarted || power <= 0) return;
    doorClosed = !doorClosed;
    sounds.door.currentTime = 0;
    sounds.door.play();
    const doorEl = document.getElementById('actual-door');
    if (doorClosed) doorEl.classList.add('closed');
    else doorEl.classList.remove('closed');
    document.getElementById('door-status-light').style.backgroundColor = doorClosed ? 'red' : '#0f0';
}

function toggleLight(on) {
    if (!gameStarted || power <= 0) return;
    document.querySelector('.room-wrapper').style.filter = on ? "brightness(1.8)" : "brightness(1)";
}

function handlePowerOutage() {
    gameStarted = false;
    document.getElementById('camera-system').style.display = 'none';
    document.getElementById('actual-door').classList.remove('closed');
    document.getElementById('office-view').style.filter = "brightness(0.01)";
    setTimeout(triggerJumpscare, 3000);
}

function triggerJumpscare() {
    gameStarted = false;
    sounds.scare.play();
    document.getElementById('jumpscare-screen').style.display = 'flex';
    setTimeout(() => { location.reload(); }, 4000);
}