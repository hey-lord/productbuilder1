const generateBtn = document.getElementById('generate-btn');
const numberContainer = document.querySelector('.number-container');

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
