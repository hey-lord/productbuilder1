const generateBtn = document.getElementById('generate-btn');
const numberContainer = document.querySelector('.number-container');
const themeToggle = document.getElementById('theme-toggle');
const THEME_KEY = 'lotto-theme';

const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

const applyTheme = (theme) => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
    const isDark = theme === 'dark';
    themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
    themeToggle.setAttribute('aria-pressed', String(isDark));
};

const initTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || getSystemTheme();
    applyTheme(theme);
};

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
});

generateBtn.addEventListener('click', () => {
    numberContainer.innerHTML = '';
    const lottoNumbers = [];
    while (lottoNumbers.length < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        if (!lottoNumbers.includes(randomNumber)) {
            lottoNumbers.push(randomNumber);
        }
    }
    lottoNumbers.sort((a, b) => a - b);
    lottoNumbers.forEach(number => {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('number');
        numberDiv.textContent = number;
        let color;
        if (number <= 10) {
            color = '#fbc400';
        } else if (number <= 20) {
            color = '#69c8f2';
        } else if (number <= 30) {
            color = '#ff7272';
        } else if (number <= 40) {
            color = '#aaa';
        } else {
            color = '#b0d840';
        }
        numberDiv.style.backgroundColor = color;
        numberContainer.appendChild(numberDiv);
    });
});

initTheme();
