const themeToggle = document.getElementById('theme-toggle');
const startBtn = document.getElementById('start-btn');
const statusPill = document.getElementById('status-pill');
const labelContainer = document.getElementById('label-container');
const webcamContainer = document.getElementById('webcam-container');

const THEME_KEY = 'animal-test-theme';
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/M9Ltpfr5A/';

let model;
let webcam;
let maxPredictions = 0;
let rafId;

const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

const applyTheme = (theme) => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    const isDark = theme === 'dark';
    themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
    themeToggle.setAttribute('aria-pressed', String(isDark));
};

const initTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || getSystemTheme();
    applyTheme(theme);
};

const setStatus = (text) => {
    statusPill.textContent = text;
};

const buildLabelRows = (predictions) => {
    labelContainer.innerHTML = '';
    predictions.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'label-row';

        const label = document.createElement('span');
        label.textContent = item.className;

        const meter = document.createElement('div');
        meter.className = 'meter';

        const fill = document.createElement('div');
        fill.className = 'meter-fill';
        fill.style.width = '0%';

        meter.appendChild(fill);
        row.appendChild(label);
        row.appendChild(meter);
        labelContainer.appendChild(row);
    });

    const result = document.createElement('div');
    result.className = 'result-text';
    result.id = 'result-text';
    labelContainer.appendChild(result);
};

const updatePredictionUI = (prediction) => {
    const rows = labelContainer.querySelectorAll('.label-row');
    let top = prediction[0];

    prediction.forEach((item, index) => {
        if (item.probability > top.probability) {
            top = item;
        }
        const fill = rows[index].querySelector('.meter-fill');
        fill.style.width = `${Math.round(item.probability * 100)}%`;
    });

    const result = document.getElementById('result-text');
    const confidence = Math.round(top.probability * 100);
    result.textContent = `${top.className} vibe: ${confidence}%`;
};

const attachWebcam = () => {
    webcamContainer.innerHTML = '';
    webcamContainer.appendChild(webcam.canvas);
};

const initModel = async () => {
    const modelURL = `${MODEL_URL}model.json`;
    const metadataURL = `${MODEL_URL}metadata.json`;
    model = await window.tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
};

const startCamera = async () => {
    startBtn.disabled = true;
    startBtn.textContent = 'Starting...';
    setStatus('Loading');

    try {
        if (!model) {
            await initModel();
        }

        if (!webcam) {
            webcam = new window.tmImage.Webcam(280, 280, true);
            await webcam.setup();
        }

        await webcam.play();
        attachWebcam();
        const prediction = await model.predict(webcam.canvas);
        buildLabelRows(prediction);
        setStatus('Live');
        startBtn.textContent = 'Restart Camera';
        startBtn.disabled = false;
        loop();
    } catch (error) {
        console.error(error);
        setStatus('Blocked');
        startBtn.textContent = 'Retry Camera';
        startBtn.disabled = false;
        webcamContainer.innerHTML = '<div class="webcam-placeholder">Camera access is required. Please allow permissions and try again.</div>';
    }
};

const loop = async () => {
    webcam.update();
    const prediction = await model.predict(webcam.canvas);
    updatePredictionUI(prediction);
    rafId = window.requestAnimationFrame(loop);
};

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
});

startBtn.addEventListener('click', () => {
    if (rafId) {
        window.cancelAnimationFrame(rafId);
    }
    startCamera();
});

webcamContainer.innerHTML = '<div class="webcam-placeholder">Click Start Camera to begin.</div>';
initTheme();
