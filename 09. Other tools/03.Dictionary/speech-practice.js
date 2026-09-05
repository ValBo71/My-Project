/** Text recognition practice; deliberately does not score pronunciation or learning progress. */
function createSpeechPractice({ button, feedback, getTarget, beforeStart }) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const ready = 'Натиснете „Кажи думата“ и разрешете микрофона.';
  const unavailable = !Recognition
    ? 'Браузърът не поддържа разпознаване на реч. Опитайте с актуален Google Chrome.'
    : window.isSecureContext === false
      ? 'За достъп до микрофона отворете приложението през localhost или HTTPS.'
      : '';
  let active = null;
  let timeout = null;

  function show(message, state = 'idle') {
    feedback.textContent = message;
    feedback.dataset.state = state;
  }

  function normalize(text) {
    return String(text).normalize('NFC').toLowerCase()
      .replace(/[’‘ʼ]/gu, "'")
      .replace(/'/gu, '')
      .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
      .replace(/\s+/gu, ' ').trim();
  }

  function cancel(message = unavailable || ready, state = 'idle') {
    const previous = active;
    active = null; // Invalidate callbacks before aborting, including late network results.
    clearTimeout(timeout);
    button.textContent = 'Кажи думата';
    button.setAttribute('aria-pressed', 'false');
    if (previous) {
      try { previous.abort(); } catch (_) { /* Already stopped by browser. */ }
    }
    show(message, state);
  }

  function localeFor(target) {
    const language = String(target.language).toLowerCase();
    const selected = target.locale;
    if (selected && selected !== 'off' && selected.split('-')[0].toLowerCase() === language.split('-')[0]) {
      return selected;
    }
    return { en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', it: 'it-IT', bg: 'bg-BG' }[language] || language;
  }

  const errors = {
    'not-allowed': 'Микрофонът не е разрешен. Разрешете го от настройките на сайта и опитайте отново.',
    'service-not-allowed': 'Услугата за разпознаване е недостъпна или забранена в този браузър. Опитайте с Google Chrome.',
    'audio-capture': 'Няма достъпен микрофон. Проверете дали е свързан и разрешен.',
    'no-speech': 'Не беше чут говор. Натиснете „Кажи думата“ и опитайте отново.',
    network: 'Грешка във връзката с услугата за разпознаване. Проверете интернет и опитайте отново.',
    'language-not-supported': 'Услугата на браузъра не поддържа избрания език.',
    aborted: 'Слушането е прекратено. Можете да опитате отново.'
  };

  button.disabled = Boolean(unavailable);
  show(unavailable || ready);
  button.addEventListener('click', () => {
    if (active) {
      cancel('Слушането е прекратено. Можете да опитате отново.');
      return;
    }
    if (unavailable) return;
    const target = getTarget();
    if (!target) return;
    const variants = String(target.word).replace(/\([^)]*\)/gu, '').split(/[/,;]/u)
      .map(normalize).filter(Boolean);
    if (!variants.length) {
      show('Този запис няма текст за разпознаване.', 'error');
      return;
    }
    beforeStart();
    let recognition;
    try {
      recognition = new Recognition();
      recognition.lang = localeFor(target);
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      active = recognition;
      button.textContent = 'Откажи слушането';
      button.setAttribute('aria-pressed', 'true');
      show('Подготвям микрофона… Разрешете достъпа, ако браузърът попита.', 'listening');
      recognition.onstart = () => {
        if (active === recognition) show(`Слушам… Кажете думата (${recognition.lang}).`, 'listening');
      };
      recognition.onresult = event => {
        if (active !== recognition) return;
        const result = event.results[event.resultIndex || 0];
        if (!result || !result.isFinal) return;
        const transcript = result[0]?.transcript || '';
        if (!normalize(transcript)) {
          cancel('Не беше разпозната дума. Опитайте отново.', 'error');
          return;
        }
        const matches = variants.includes(normalize(transcript));
        cancel(matches
          ? `Думата е разпозната: „${transcript}“. Съвпада с картата.`
          : `Разпознато: „${transcript}“. Очаква се: „${target.word}“. Опитайте отново.`,
        matches ? 'match' : 'mismatch');
      };
      recognition.onerror = event => {
        if (active === recognition) cancel(errors[event.error] || 'Разпознаването не успя. Опитайте отново.', 'error');
      };
      recognition.onnomatch = () => {
        if (active === recognition) cancel('Не беше разпозната дума. Опитайте отново.', 'error');
      };
      recognition.onend = () => {
        if (active === recognition) cancel('Слушането приключи без разпозната дума. Опитайте отново.', 'error');
      };
      timeout = setTimeout(() => {
        if (active === recognition) cancel('Времето за този опит изтече. Натиснете „Кажи думата“ отново.', 'error');
      }, 20000);
      recognition.start();
    } catch (error) {
      cancel(error.name === 'NotAllowedError'
        ? errors['not-allowed']
        : 'Микрофонът или услугата не могат да се стартират. Проверете разрешенията и опитайте отново.', 'error');
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancel();
  });
  window.addEventListener('pagehide', () => cancel());
  return { cancel };
}
