const themeToggle = document.getElementById('theme-toggle');
const statusPill = document.getElementById('status-pill');
const labelContainer = document.getElementById('label-container');
const previewContainer = document.getElementById('preview-container');
const photoInput = document.getElementById('photo-input');

const THEME_KEY = 'animal-test-theme';
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/M9Ltpfr5A/';

let model;

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

const initModel = async () => {
    if (model) {
        return;
    }
    const modelURL = `${MODEL_URL}model.json`;
    const metadataURL = `${MODEL_URL}metadata.json`;
    model = await window.tmImage.load(modelURL, metadataURL);
};

const showPlaceholder = (message) => {
    previewContainer.innerHTML = `<div class="webcam-placeholder">${message}</div>`;
};

const renderImage = (src) => {
    previewContainer.innerHTML = '';
    const img = document.createElement('img');
    img.alt = 'Uploaded photo';
    img.src = src;
    previewContainer.appendChild(img);
    return img;
};

const handleFile = async (file) => {
    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        setStatus('Invalid');
        showPlaceholder('Please upload a valid image file.');
        return;
    }

    setStatus('Loading');
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            await initModel();
            const img = renderImage(reader.result);
            img.onload = async () => {
                const prediction = await model.predict(img);
                buildLabelRows(prediction);
                updatePredictionUI(prediction);
                setStatus('Ready');
            };
        } catch (error) {
            console.error(error);
            setStatus('Error');
            showPlaceholder('Something went wrong. Please try another photo.');
        }
    };
    reader.readAsDataURL(file);
};

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
});

photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handleFile(file);
});

showPlaceholder('Upload a selfie to begin.');
initTheme();
