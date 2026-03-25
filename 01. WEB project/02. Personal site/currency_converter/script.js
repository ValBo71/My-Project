const bgnInput = document.getElementById('bgn');
const eurInput = document.getElementById('eur');

const EXCHANGE_RATE = 1.95583;

function convertFromBgn() {
    const bgnValue = parseFloat(bgnInput.value);
    if (!isNaN(bgnValue)) {
        const eurValue = bgnValue / EXCHANGE_RATE;
        eurInput.value = eurValue.toFixed(2);
    } else {
        eurInput.value = '';
    }
}

function convertFromEur() {
    const eurValue = parseFloat(eurInput.value);
    if (!isNaN(eurValue)) {
        const bgnValue = eurValue * EXCHANGE_RATE;
        bgnInput.value = bgnValue.toFixed(2);
    } else {
        bgnInput.value = '';
    }
}

bgnInput.addEventListener('input', convertFromBgn);
eurInput.addEventListener('input', convertFromEur);
