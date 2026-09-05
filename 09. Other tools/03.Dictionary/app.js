/**
 * FlashCards Vocabulary Learning App
 * Pure Javascript logic utilizing IndexedDB and SheetJS (xlsx)
 */

// --- Constants & State ---
const DB_NAME = 'FlashCardsDB';
const DB_VERSION = 1;
const ITEMS_PER_PAGE = 10;

let db = null;
let allWords = [];
let filteredWords = [];
let currentPage = 1;
let selectedImportFile = null;
let studyAutoplayTimer = null;

// Session State
let sessionState = {
  isActive: false,
  words: [],
  currentIndex: 0,
  correctCount: 0,
  incorrectCount: 0,
  isFlipped: false
};

// Exam State
let examState = {
  isActive: false,
  questions: [],
  currentIndex: 0,
  correctCount: 0,
  incorrectCount: 0,
  errors: []
};

// --- DOM Elements ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanels = document.querySelectorAll('.tab-panel');

// Study Panel Elements
const studySetupContainer = document.getElementById('study-setup-container');
const studySessionContainer = document.getElementById('study-session-container');
const studyResultsContainer = document.getElementById('study-results-container');
const studyLangSelect = document.getElementById('study-lang-select');
const studyTypeSelect = document.getElementById('study-type-select');
const studyFilesDropdown = document.getElementById('study-files-dropdown');
const studyFilesDropdownToggle = document.getElementById('study-files-dropdown-toggle');
const studyFilesSelectedText = document.getElementById('multiselect-selected-text');
const studyFilesOptions = document.getElementById('study-files-options');
const btnStartStudy = document.getElementById('btn-start-study');
const btnQuitSession = document.getElementById('btn-quit-session');

const studyTtsVoiceSelect = document.getElementById('study-tts-voice-select');
const studyTtsAutoplay = document.getElementById('study-tts-autoplay');
const btnSpeakWord = document.getElementById('btn-speak-word');

const speechPractice = createSpeechPractice({
  button: document.getElementById('btn-practice-word'),
  feedback: document.getElementById('speech-practice-feedback'),
  getTarget: () => {
    if (!sessionState.isActive) return null;
    const word = sessionState.words[sessionState.currentIndex];
    return word ? { word: word.word, language: word.language, locale: studyTtsVoiceSelect.value } : null;
  },
  beforeStart: () => {
    clearTimeout(studyAutoplayTimer);
    window.speechSynthesis?.cancel();
  }
});
navTabs.forEach(tab => tab.addEventListener('click', () => {
  clearTimeout(studyAutoplayTimer);
  speechPractice.cancel();
  window.speechSynthesis?.cancel();
}));


const currentCardNumSpan = document.getElementById('current-card-num');
const totalCardsNumSpan = document.getElementById('total-cards-num');
const correctCountSpan = document.getElementById('correct-count');
const incorrectCountSpan = document.getElementById('incorrect-count');
const sessionProgressBar = document.getElementById('session-progress-bar');

const flashcardElement = document.getElementById('flashcard-element');
const cardWordText = document.getElementById('card-word-text');
const cardTranslationText = document.getElementById('card-translation-text');
const cardLangBadge = document.getElementById('card-lang-badge');
const sessionActionsContainer = document.getElementById('session-actions-container');
const btnActionCorrect = document.getElementById('btn-action-correct');
const btnActionIncorrect = document.getElementById('btn-action-incorrect');

// Study Results Elements
const resultSummaryText = document.getElementById('result-summary-text-element');
const resultPercentage = document.getElementById('result-percentage');
const resultKnowCount = document.getElementById('result-know-count');
const resultDontknowCount = document.getElementById('result-dontknow-count');
const btnRestartSession = document.getElementById('btn-restart-session');
const btnGoToDictionary = document.getElementById('btn-go-to-dictionary');

// Dictionary Panel Elements
const formAddWord = document.getElementById('form-add-word');
const addWordInput = document.getElementById('add-word-input');
const addTranslationInput = document.getElementById('add-translation-input');
const addLangSelect = document.getElementById('add-lang-select');
const otherLangContainer = document.getElementById('other-lang-container');
const addLangOtherInput = document.getElementById('add-lang-other-input');

const statsTotalWords = document.getElementById('stats-total-words');
const statsMasteredWords = document.getElementById('stats-mastered-words');
const statsLanguagesBreakdown = document.getElementById('stats-languages-breakdown');

const dictSearchInput = document.getElementById('dict-search-input');
const dictFilterLang = document.getElementById('dict-filter-lang');
const dictFilterFile = document.getElementById('dict-filter-file');
const dictWordsTbody = document.getElementById('dict-words-tbody');
const paginationShowingCount = document.getElementById('pagination-showing-count');
const paginationTotalCount = document.getElementById('pagination-total-count');
const paginationButtonsContainer = document.getElementById('pagination-buttons-container');

// Edit Word Modal Elements
const editWordModal = document.getElementById('edit-word-modal');
const formEditWord = document.getElementById('form-edit-word');
const editWordIdInput = document.getElementById('edit-word-id');
const editWordInput = document.getElementById('edit-word-input');
const editTranslationInput = document.getElementById('edit-translation-input');
const editLangSelect = document.getElementById('edit-lang-select');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

// Import & Backup Panel Elements
const importLangSelect = document.getElementById('import-lang-select');
const importHasHeadersSelect = document.getElementById('import-has-headers-select');
const excelDragDropZone = document.getElementById('excel-drag-drop-zone');
const excelFileSelector = document.getElementById('excel-file-selector');
const importFileName = document.getElementById('import-file-name');
const btnProcessImport = document.getElementById('btn-process-import');

const btnBackupExportJson = document.getElementById('btn-backup-export-json');
const btnTriggerJsonFile = document.getElementById('btn-trigger-json-file');
const jsonFileSelector = document.getElementById('json-file-selector');
const btnBackupExportExcel = document.getElementById('btn-backup-export-excel');
const btnDangerClearDatabase = document.getElementById('btn-danger-clear-database');

// Exam Panel Elements
const examLangSelect = document.getElementById('exam-lang-select');
const examFilesDropdown = document.getElementById('exam-files-dropdown');
const examFilesDropdownToggle = document.getElementById('exam-files-dropdown-toggle');
const examFilesSelectedText = document.getElementById('exam-files-selected-text');
const examFilesOptions = document.getElementById('exam-files-options');
const examSizeSelect = document.getElementById('exam-size-select');
const examDirectionSelect = document.getElementById('exam-direction-select');
const btnStartExam = document.getElementById('btn-start-exam');

const examSessionContainer = document.getElementById('exam-session-container');
const examSetupContainer = document.getElementById('exam-setup-container');
const btnQuitExam = document.getElementById('btn-quit-exam');
const currentExamNum = document.getElementById('current-exam-num');
const totalExamNum = document.getElementById('total-exam-num');
const examCorrectCount = document.getElementById('exam-correct-count');
const examIncorrectCount = document.getElementById('exam-incorrect-count');
const examProgressBar = document.getElementById('exam-progress-bar');
const examDirectionBadge = document.getElementById('exam-direction-badge');
const examPromptText = document.getElementById('exam-prompt-text');
const btnSpeakExamWord = document.getElementById('btn-speak-exam-word');

const formExamAnswer = document.getElementById('form-exam-answer');
const examAnswerInput = document.getElementById('exam-answer-input');
const btnSubmitExamAnswer = document.getElementById('btn-submit-exam-answer');

const examFeedbackContainer = document.getElementById('exam-feedback-container');
const examFeedbackTitle = document.getElementById('exam-feedback-title');
const examFeedbackDetail = document.getElementById('exam-feedback-detail');
const btnNextExamQuestion = document.getElementById('btn-next-exam-question');

const examResultsContainer = document.getElementById('exam-results-container');
const examResultSummaryText = document.getElementById('exam-result-summary-text');
const examResultPercentage = document.getElementById('exam-result-percentage');
const examResultCorrectCount = document.getElementById('exam-result-correct-count');
const examResultIncorrectCount = document.getElementById('exam-result-incorrect-count');
const btnRestartExam = document.getElementById('btn-restart-exam');
const btnExamGoToDictionary = document.getElementById('btn-exam-go-to-dictionary');
const examErrorsPanel = document.getElementById('exam-errors-panel');
const examErrorsTbody = document.getElementById('exam-errors-tbody');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTtsSettings();
  setupNavigation();
  setupEventListeners();
  
  // Init DB and load data
  initIndexedDB()
    .then(() => {
      refreshData();
    })
    .catch(err => {
      console.error('Неуспешна инициализация на базата данни:', err);
      alert('Грешка при зареждане на базата данни. Моля, презаредете страницата.');
    });
});

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem('flashcards-theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }
}

themeToggleBtn.addEventListener('click', () => {
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('flashcards-theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('flashcards-theme', 'dark');
  }
});

// --- Navigation / Tabs ---
function setupNavigation() {
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanelId = tab.getAttribute('data-tab');
      
      // Stop speech when navigating away
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // Update active nav button
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active panel
      tabPanels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      // Special action: if entering Study, Exam or Dictionary tab, refresh display
      if (targetPanelId === 'study-tab-content' && !sessionState.isActive) {
        populateStudyLanguages();
        populateStudyFiles();
        populateTtsOptions();
      } else if (targetPanelId === 'exam-tab-content' && !examState.isActive) {
        populateExamLanguages();
        populateExamFiles();
      } else if (targetPanelId === 'dictionary-tab-content') {
        populateDictLanguageFilters();
        populateDictFileFilters();
        renderDictionary();
        renderStats();
      }
    });
  });
}

// --- IndexedDB Operations ---
function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (e) => reject(e.target.error);
    
    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (e) => {
      const dbInstance = e.target.result;
      const store = dbInstance.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
      store.createIndex('language', 'language', { unique: false });
      store.createIndex('status', 'status', { unique: false });
    };
  });
}

function getAllWordsFromDB() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['words'], 'readonly');
    const store = transaction.objectStore('words');
    const request = store.getAll();
    
    request.onsuccess = () => {
      // Ensure all objects have the sourceFile property (fallback migration)
      const migrated = request.result.map(w => {
        if (!w.hasOwnProperty('sourceFile')) {
          w.sourceFile = 'Ръчно добавени';
        }
        return w;
      });
      resolve(migrated);
    };
    request.onerror = () => reject(request.error);
  });
}

function addWordToDB(wordObj) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['words'], 'readwrite');
    const store = transaction.objectStore('words');
    const request = store.add(wordObj);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Batch add helper to optimize multiple inserts
function addWordsBatchToDB(wordsList) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['words'], 'readwrite');
    const store = transaction.objectStore('words');
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    
    wordsList.forEach(w => {
      store.add(w);
    });
  });
}

function updateWordInDB(wordObj) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['words'], 'readwrite');
    const store = transaction.objectStore('words');
    const request = store.put(wordObj);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteWordFromDB(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['words'], 'readwrite');
    const store = transaction.objectStore('words');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearDatabaseInDB() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['words'], 'readwrite');
    const store = transaction.objectStore('words');
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- Data Refresh ---
function refreshData() {
  return getAllWordsFromDB().then(words => {
    allWords = words;
    populateStudyLanguages();
    populateStudyFiles();
    populateTtsOptions();
    populateExamLanguages();
    populateExamFiles();
    populateDictLanguageFilters();
    populateDictFileFilters();
    renderStats();
    renderDictionary();
  });
}

// --- Stats Recalculation ---
function renderStats() {
  const total = allWords.length;
  const mastered = allWords.filter(w => w.status === 'mastered').length;
  
  statsTotalWords.textContent = total;
  statsMasteredWords.textContent = mastered;

  // Language Breakdown
  const counts = {};
  allWords.forEach(w => {
    counts[w.language] = (counts[w.language] || 0) + 1;
  });

  statsLanguagesBreakdown.innerHTML = '';
  Object.keys(counts).sort().forEach(lang => {
    const count = counts[lang];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    
    const row = document.createElement('div');
    row.className = 'lang-stat-row';
    row.innerHTML = `
      <div>
        <span class="lang-badge ${escapeHTML(lang.toLowerCase())}">${escapeHTML(lang.toUpperCase())}</span>
        <span>${escapeHTML(getLanguageName(lang))}</span>
      </div>
      <div><strong>${count}</strong> <span class="text-muted">(${percentage}%)</span></div>
    `;
    statsLanguagesBreakdown.appendChild(row);
  });
}

function getLanguageName(code) {
  const mapping = {
    en: 'Английски',
    de: 'Немски',
    fr: 'Френски',
    es: 'Испански',
    ru: 'Руски',
    it: 'Италиански'
  };
  return mapping[code.toLowerCase()] || code.toUpperCase();
}

// --- Dictionary Management Logic ---

// Toggle Custom Language Input
addLangSelect.addEventListener('change', () => {
  if (addLangSelect.value === 'other') {
    otherLangContainer.classList.remove('hidden');
    addLangOtherInput.setAttribute('required', 'true');
  } else {
    otherLangContainer.classList.add('hidden');
    addLangOtherInput.removeAttribute('required');
  }
});

// Add Word Form
formAddWord.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const word = addWordInput.value.trim();
  const translation = addTranslationInput.value.trim();
  let language = addLangSelect.value;
  
  if (language === 'other') {
    // Restrict to letters/digits: language codes are short identifiers, not free text,
    // and this keeps the value safe wherever it's later rendered.
    language = addLangOtherInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!language) {
      alert('Моля, въведете валиден код на езика (само букви/цифри) в полето "Име на езика".');
      addLangOtherInput.focus();
      return;
    }
  }

  // Duplicate Check
  const existingWords = allWords.filter(w => 
    w.language === language && 
    w.word.toLowerCase().trim() === word.toLowerCase()
  );

  if (existingWords.length > 0) {
    const hasExactDuplicate = existingWords.some(w => 
      w.translation.toLowerCase().trim() === translation.toLowerCase()
    );

    if (hasExactDuplicate) {
      alert(`Думата "${word}" с този превод ("${translation}") вече съществува в речника!`);
      return;
    } else {
      const existingTranslations = existingWords.map(w => w.translation).join(', ');
      if (!confirm(`Думата "${word}" вече съществува в речника с превод: "${existingTranslations}".\nЖелаете ли все пак да я добавите с новия превод "${translation}"?`)) {
        return;
      }
    }
  }

  const newWord = {
    word: word,
    translation: translation,
    language: language,
    sourceFile: "Ръчно добавени",
    addedAt: Date.now(),
    status: 'learning',
    correctStreak: 0
  };

  addWordToDB(newWord)
    .then(() => {
      addWordInput.value = '';
      addTranslationInput.value = '';
      if (addLangSelect.value === 'other') {
        addLangOtherInput.value = '';
        addLangSelect.value = 'en';
        otherLangContainer.classList.add('hidden');
      }
      addWordInput.focus();
      return refreshData();
    })
    .catch(err => {
      console.error(err);
      alert('Грешка при добавянето на думата.');
    });
});

// Populators for selects & checklists
function populateStudyLanguages() {
  const activeLang = studyLangSelect.value;
  const langs = [...new Set(allWords.map(w => w.language))];
  
  studyLangSelect.innerHTML = '';
  
  if (langs.length === 0) {
    studyLangSelect.innerHTML = '<option value="">(Няма добавени езици)</option>';
    return;
  }

  langs.sort().forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = `${getLanguageName(lang)} (${lang.toUpperCase()})`;
    if (lang === activeLang) opt.selected = true;
    studyLangSelect.appendChild(opt);
  });
}

function populateStudyFiles() {
  const selectedLang = studyLangSelect.value;
  
  if (!selectedLang) {
    studyFilesOptions.innerHTML = '<div class="text-muted p-3">Първо изберете език.</div>';
    studyFilesSelectedText.textContent = 'Няма източници';
    return;
  }

  const wordsForLang = allWords.filter(w => w.language === selectedLang);
  const uniqueFiles = [...new Set(wordsForLang.map(w => w.sourceFile || 'Ръчно добавени'))].sort();

  studyFilesOptions.innerHTML = '';
  
  if (uniqueFiles.length === 0) {
    studyFilesOptions.innerHTML = '<div class="text-muted p-3">Няма открити източници.</div>';
    studyFilesSelectedText.textContent = 'Няма източници';
    return;
  }

  // Create "Всички" (All) option
  const allOption = document.createElement('label');
  allOption.className = 'multiselect-option';
  allOption.innerHTML = `
    <input type="checkbox" id="cb-all-files" checked>
    <span><strong>Всички</strong></span>
  `;
  studyFilesOptions.appendChild(allOption);

  // Create individual file options
  uniqueFiles.forEach(file => {
    const option = document.createElement('label');
    option.className = 'multiselect-option';
    option.innerHTML = `
      <input type="checkbox" name="study-file-cb" value="${escapeHTML(file)}" checked>
      <span>${escapeHTML(file)}</span>
    `;
    studyFilesOptions.appendChild(option);
  });

  // Attach checkbox logic
  const cbAll = document.getElementById('cb-all-files');
  const cbs = studyFilesOptions.querySelectorAll('input[name="study-file-cb"]');

  cbAll.addEventListener('change', () => {
    cbs.forEach(cb => cb.checked = cbAll.checked);
    updateSelectedText();
  });

  cbs.forEach(cb => {
    cb.addEventListener('change', () => {
      const allChecked = Array.from(cbs).every(c => c.checked);
      cbAll.checked = allChecked;
      updateSelectedText();
    });
  });

  function updateSelectedText() {
    const checkedBoxes = Array.from(cbs).filter(c => c.checked);
    if (checkedBoxes.length === 0) {
      studyFilesSelectedText.textContent = 'Няма избрани файлове';
    } else if (checkedBoxes.length === cbs.length) {
      studyFilesSelectedText.textContent = 'Всички';
    } else if (checkedBoxes.length === 1) {
      studyFilesSelectedText.textContent = checkedBoxes[0].value;
    } else {
      studyFilesSelectedText.textContent = `Избрани: ${checkedBoxes.length} файла`;
    }
  }

  // Initial call
  updateSelectedText();
}

studyLangSelect.addEventListener('change', () => {
  populateStudyFiles();
  populateTtsOptions();
});

function populateExamLanguages() {
  if (!examLangSelect) return;
  const activeLang = examLangSelect.value;
  const langs = [...new Set(allWords.map(w => w.language))];
  
  examLangSelect.innerHTML = '';
  
  if (langs.length === 0) {
    examLangSelect.innerHTML = '<option value="">(Няма добавени езици)</option>';
    return;
  }

  langs.sort().forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = `${getLanguageName(lang)} (${lang.toUpperCase()})`;
    if (lang === activeLang) opt.selected = true;
    examLangSelect.appendChild(opt);
  });
}

function populateExamFiles() {
  if (!examLangSelect || !examFilesOptions || !examFilesSelectedText) return;
  const selectedLang = examLangSelect.value;
  
  if (!selectedLang) {
    examFilesOptions.innerHTML = '<div class="text-muted p-3">Първо изберете език.</div>';
    examFilesSelectedText.textContent = 'Няма източници';
    return;
  }

  const wordsForLang = allWords.filter(w => w.language === selectedLang);
  const uniqueFiles = [...new Set(wordsForLang.map(w => w.sourceFile || 'Ръчно добавени'))].sort();

  examFilesOptions.innerHTML = '';
  
  if (uniqueFiles.length === 0) {
    examFilesOptions.innerHTML = '<div class="text-muted p-3">Няма открити източници.</div>';
    examFilesSelectedText.textContent = 'Няма източници';
    return;
  }

  // Create "Всички" (All) option
  const allOption = document.createElement('label');
  allOption.className = 'multiselect-option';
  allOption.innerHTML = `
    <input type="checkbox" id="cb-all-exam-files" checked>
    <span><strong>Всички</strong></span>
  `;
  examFilesOptions.appendChild(allOption);

  // Create individual file options
  uniqueFiles.forEach(file => {
    const option = document.createElement('label');
    option.className = 'multiselect-option';
    option.innerHTML = `
      <input type="checkbox" name="exam-file-cb" value="${escapeHTML(file)}" checked>
      <span>${escapeHTML(file)}</span>
    `;
    examFilesOptions.appendChild(option);
  });

  // Attach checkbox logic
  const cbAll = document.getElementById('cb-all-exam-files');
  const cbs = examFilesOptions.querySelectorAll('input[name="exam-file-cb"]');

  cbAll.addEventListener('change', () => {
    cbs.forEach(cb => cb.checked = cbAll.checked);
    updateSelectedText();
  });

  cbs.forEach(cb => {
    cb.addEventListener('change', () => {
      const allChecked = Array.from(cbs).every(c => c.checked);
      cbAll.checked = allChecked;
      updateSelectedText();
    });
  });

  function updateSelectedText() {
    const checkedBoxes = Array.from(cbs).filter(c => c.checked);
    if (checkedBoxes.length === 0) {
      examFilesSelectedText.textContent = 'Няма избрани файлове';
    } else if (checkedBoxes.length === cbs.length) {
      examFilesSelectedText.textContent = 'Всички';
    } else if (checkedBoxes.length === 1) {
      examFilesSelectedText.textContent = checkedBoxes[0].value;
    } else {
      examFilesSelectedText.textContent = `Избрани: ${checkedBoxes.length} файла`;
    }
  }

  // Initial call
  updateSelectedText();
}

if (examLangSelect) {
  examLangSelect.addEventListener('change', () => {
    populateExamFiles();
  });
}

function populateDictLanguageFilters() {
  const activeFilter = dictFilterLang.value;
  const langs = [...new Set(allWords.map(w => w.language))];
  
  dictFilterLang.innerHTML = '<option value="all">Всички езици</option>';
  
  langs.sort().forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = `${getLanguageName(lang)} (${lang.toUpperCase()})`;
    if (lang === activeFilter) opt.selected = true;
    dictFilterLang.appendChild(opt);
  });
}

function populateDictFileFilters() {
  const activeFileFilter = dictFilterFile.value;
  const selectedLang = dictFilterLang.value;

  let wordsForFilter = allWords;
  if (selectedLang !== 'all') {
    wordsForFilter = allWords.filter(w => w.language === selectedLang);
  }

  const files = [...new Set(wordsForFilter.map(w => w.sourceFile || 'Ръчно добавени'))].sort();
  
  dictFilterFile.innerHTML = '<option value="all">Всички източници</option>';
  files.forEach(file => {
    const opt = document.createElement('option');
    opt.value = file;
    opt.textContent = file;
    if (file === activeFileFilter) opt.selected = true;
    dictFilterFile.appendChild(opt);
  });
}

dictFilterLang.addEventListener('change', () => {
  populateDictFileFilters();
  currentPage = 1;
  renderDictionary();
});

dictFilterFile.addEventListener('change', () => {
  currentPage = 1;
  renderDictionary();
});

// Dictionary Filtering, Pagination and Rendering
function renderDictionary() {
  const searchQuery = dictSearchInput.value.trim().toLowerCase();
  const filterLang = dictFilterLang.value;
  const filterFile = dictFilterFile.value;
  
  // Filter
  filteredWords = allWords.filter(w => {
    const matchSearch = w.word.toLowerCase().includes(searchQuery) || w.translation.toLowerCase().includes(searchQuery);
    const matchLang = (filterLang === 'all') || (w.language === filterLang);
    
    const wordFile = w.sourceFile || 'Ръчно добавени';
    const matchFile = (filterFile === 'all') || (wordFile === filterFile);
    
    return matchSearch && matchLang && matchFile;
  });

  // Sort: newest first
  filteredWords.sort((a, b) => b.addedAt - a.addedAt);

  const total = filteredWords.length;
  paginationTotalCount.textContent = total;
  
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, total);
  
  paginationShowingCount.textContent = endIdx - startIdx;
  
  // Render Table Rows
  dictWordsTbody.innerHTML = '';
  if (filteredWords.length === 0) {
    dictWordsTbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">Няма намерени думи.</td>
      </tr>
    `;
    paginationButtonsContainer.innerHTML = '';
    return;
  }

  const pageWords = filteredWords.slice(startIdx, endIdx);
  pageWords.forEach(w => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="lang-badge ${escapeHTML(w.language)}">${escapeHTML(w.language.toUpperCase())}</span></td>
      <td class="font-weight-bold">${escapeHTML(w.word)}</td>
      <td>${escapeHTML(w.translation)}</td>
      <td><span class="source-file-badge" title="${escapeHTML(w.sourceFile || 'Ръчно добавени')}">${escapeHTML(w.sourceFile || 'Ръчно добавени')}</span></td>
      <td class="text-center">
        ${w.correctStreak > 0 ? `<span class="streak-badge"><i class="fa-solid fa-fire"></i> ${w.correctStreak}</span>` : '<span class="text-muted">–</span>'}
      </td>
      <td class="text-center">
        <span class="status-badge ${w.status}">
          ${w.status === 'mastered' ? 'Научена' : 'За учене'}
        </span>
      </td>
      <td class="text-center">
        <div class="table-actions">
          <button class="btn-icon-action btn-edit-word" data-id="${w.id}" title="Редактирай">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-icon-action btn-delete-word" data-id="${w.id}" title="Изтрий">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    dictWordsTbody.appendChild(tr);
  });

  // Render Pagination Buttons
  renderPagination(totalPages);
  setupTableActionListeners();
}

function renderPagination(totalPages) {
  paginationButtonsContainer.innerHTML = '';
  if (totalPages <= 1) return;

  // Prev button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderDictionary();
    }
  });
  paginationButtonsContainer.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderDictionary();
    });
    paginationButtonsContainer.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderDictionary();
    }
  });
  paginationButtonsContainer.appendChild(nextBtn);
}

// Edit & Delete Action Handlers
function setupTableActionListeners() {
  document.querySelectorAll('.btn-edit-word').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openEditModal(id);
    });
  });

  document.querySelectorAll('.btn-delete-word').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const wordObj = allWords.find(w => w.id === id);
      if (confirm(`Сигурни ли сте, че искате да изтриете думата "${wordObj.word}"?`)) {
        deleteWordFromDB(id)
          .then(() => refreshData())
          .catch(err => console.error(err));
      }
    });
  });
}

// Modal logic
function openEditModal(id) {
  const wordObj = allWords.find(w => w.id === id);
  if (!wordObj) return;

  editWordIdInput.value = wordObj.id;
  editWordInput.value = wordObj.word;
  editTranslationInput.value = wordObj.translation;
  
  // Populate select and select correct value
  const standardLangs = ['en', 'de', 'fr', 'es', 'ru', 'it'];
  if (standardLangs.includes(wordObj.language)) {
    editLangSelect.value = wordObj.language;
  } else {
    // If it's a custom language, dynamically add it to the select options.
    // Found via a JS comparison (not a CSS attribute-selector string) so a language value
    // containing quotes or other special characters can't break the query.
    let customOption = Array.from(editLangSelect.options).find(opt => opt.value === wordObj.language);
    if (!customOption) {
      customOption = document.createElement('option');
      customOption.value = wordObj.language;
      customOption.textContent = `${wordObj.language.toUpperCase()} (Персонализиран)`;
      editLangSelect.insertBefore(customOption, editLangSelect.lastElementChild);
    }
    editLangSelect.value = wordObj.language;
  }

  editWordModal.classList.add('active');
}

function closeEditModal() {
  editWordModal.classList.remove('active');
}

btnCloseModal.addEventListener('click', closeEditModal);
btnCancelEdit.addEventListener('click', closeEditModal);
window.addEventListener('click', (e) => {
  if (e.target === editWordModal) closeEditModal();
});

formEditWord.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const id = parseInt(editWordIdInput.value);
  const oldWord = allWords.find(w => w.id === id);
  if (!oldWord) return;

  const updatedWord = {
    ...oldWord,
    word: editWordInput.value.trim(),
    translation: editTranslationInput.value.trim(),
    language: editLangSelect.value
  };

  updateWordInDB(updatedWord)
    .then(() => {
      closeEditModal();
      return refreshData();
    })
    .catch(err => {
      console.error(err);
      alert('Грешка при редактирането на думата.');
    });
});

// Search & Filter event listeners
dictSearchInput.addEventListener('input', () => {
  currentPage = 1;
  renderDictionary();
});

// --- Study Session Logic ---

btnStartStudy.addEventListener('click', () => {
  const selectedLang = studyLangSelect.value;
  if (!selectedLang) {
    alert('Първо добавете думи в речника!');
    return;
  }

  // Get selected files from dropdown checklist
  const checkedBoxes = studyFilesOptions.querySelectorAll('input[name="study-file-cb"]:checked');
  if (checkedBoxes.length === 0) {
    alert('Моля, изберете поне един файл/източник за учене!');
    return;
  }

  const selectedFiles = Array.from(checkedBoxes).map(cb => cb.value);
  const sessionType = studyTypeSelect.value;
  
  // Filter by language AND selected source files
  const wordsForLangAndFiles = allWords.filter(w => {
    const wordFile = w.sourceFile || 'Ръчно добавени';
    return w.language === selectedLang && selectedFiles.includes(wordFile);
  });

  if (wordsForLangAndFiles.length === 0) {
    alert(`Няма намерени думи за избраните източници. Добавете думи преди да започнете!`);
    return;
  }

  // Choose 20 words (or less if not enough available)
  let chosenWords = [];
  if (wordsForLangAndFiles.length <= 20) {
    chosenWords = [...wordsForLangAndFiles];
  } else {
    if (sessionType === 'random') {
      chosenWords = shuffleArray([...wordsForLangAndFiles]).slice(0, 20);
    } else if (sessionType === 'newest') {
      chosenWords = [...wordsForLangAndFiles].sort((a, b) => b.addedAt - a.addedAt).slice(0, 20);
    } else if (sessionType === 'difficult') {
      chosenWords = [...wordsForLangAndFiles].sort((a, b) => a.correctStreak - b.correctStreak).slice(0, 20);
    } else { // all-sequential
      chosenWords = [...wordsForLangAndFiles].sort((a, b) => a.word.localeCompare(b.word)).slice(0, 20);
    }
  }

  // Shuffle selected words for learning session if not sequential
  if (sessionType !== 'all-sequential' && sessionType !== 'newest') {
    chosenWords = shuffleArray(chosenWords);
  }

  // Setup Session State
  sessionState = {
    isActive: true,
    words: chosenWords,
    currentIndex: 0,
    correctCount: 0,
    incorrectCount: 0,
    isFlipped: false
  };

  // UI Setup
  studySetupContainer.classList.add('hidden');
  studyResultsContainer.classList.add('hidden');
  studySessionContainer.classList.remove('hidden');
  
  loadCard(0);
});

function loadCard(index) {
  clearTimeout(studyAutoplayTimer);
  speechPractice.cancel();
  const currentWord = sessionState.words[index];
  sessionState.isFlipped = false;
  sessionState.currentIndex = index;

  // Reset elements
  flashcardElement.classList.remove('flipped');
  sessionActionsContainer.classList.add('hidden');

  // Load texts
  cardWordText.textContent = currentWord.word;
  cardTranslationText.textContent = currentWord.translation;
  cardLangBadge.textContent = currentWord.language.toUpperCase();

  // Progress UI
  currentCardNumSpan.textContent = index + 1;
  totalCardsNumSpan.textContent = sessionState.words.length;
  correctCountSpan.textContent = sessionState.correctCount;
  incorrectCountSpan.textContent = sessionState.incorrectCount;
  
  const progressPercent = (index / sessionState.words.length) * 100;
  sessionProgressBar.style.width = `${progressPercent}%`;

  // Autoplay voice if checked and not set to off
  if (studyTtsAutoplay.checked && studyTtsVoiceSelect.value !== 'off') {
    studyAutoplayTimer = setTimeout(() => {
      speakCurrentWord();
    }, 200);
  }
}

// Flip flashcard
flashcardElement.addEventListener('click', () => {
  if (sessionState.isActive) {
    sessionState.isFlipped = !sessionState.isFlipped;
    if (sessionState.isFlipped) {
      flashcardElement.classList.add('flipped');
      sessionActionsContainer.classList.remove('hidden');
    } else {
      flashcardElement.classList.remove('flipped');
      sessionActionsContainer.classList.add('hidden');
    }
  }
});

// Flip support for enter key (accessibility)
flashcardElement.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    flashcardElement.click();
  }
});

// Action Buttons Guessed
btnActionCorrect.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent flipping card again
  processAnswer(true);
});

btnActionIncorrect.addEventListener('click', (e) => {
  e.stopPropagation();
  processAnswer(false);
});

function processAnswer(isCorrect) {
  clearTimeout(studyAutoplayTimer);
  speechPractice.cancel();
  const currentWord = sessionState.words[sessionState.currentIndex];

  // Update Stats in memory & Database
  if (isCorrect) {
    sessionState.correctCount++;
    currentWord.correctStreak++;
    if (currentWord.correctStreak >= 3) {
      currentWord.status = 'mastered';
    }
  } else {
    sessionState.incorrectCount++;
    currentWord.correctStreak = 0;
    currentWord.status = 'learning';
  }

  // Update DB entry in background
  updateWordInDB(currentWord).catch(err => console.error('Грешка при запис на прогрес:', err));

  // Proceed to next card or finish
  const nextIdx = sessionState.currentIndex + 1;
  if (nextIdx < sessionState.words.length) {
    // Flip card back to front
    flashcardElement.classList.remove('flipped');
    sessionActionsContainer.classList.add('hidden');

    // Wait exactly halfway through flip-back animation (300ms) to load the next word text.
    // This avoids flash of translation text.
    setTimeout(() => {
      loadCard(nextIdx);
    }, 300);
  } else {
    // Finish session
    // Set final progress to 100%
    sessionProgressBar.style.width = '100%';
    setTimeout(() => {
      showResults();
    }, 500);
  }
}

function showResults() {
  clearTimeout(studyAutoplayTimer);
  speechPractice.cancel();
  sessionState.isActive = false;
  
  // Cancel active speech
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  studySessionContainer.classList.add('hidden');
  studyResultsContainer.classList.remove('hidden');

  const total = sessionState.words.length;
  const correct = sessionState.correctCount;
  const incorrect = sessionState.incorrectCount;
  
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  resultPercentage.textContent = `${percentage}%`;
  resultKnowCount.textContent = correct;
  resultDontknowCount.textContent = incorrect;

  resultSummaryText.textContent = `Поздравления! Вие преминахте през сета от ${total} думи с ${correct} верни отговора.`;

  refreshData(); // Recalculate stats and table in background
}

btnQuitSession.addEventListener('click', () => {
  if (confirm('Сигурни ли сте, че искате да прекратите тази сесия? Прогресът за вече отговорените думи ще бъде запазен.')) {
    sessionState.isActive = false;
    clearTimeout(studyAutoplayTimer);
    speechPractice.cancel();
    // Cancel active speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    studySessionContainer.classList.add('hidden');
    studySetupContainer.classList.remove('hidden');
    refreshData();
  }
});

btnRestartSession.addEventListener('click', () => {
  studyResultsContainer.classList.add('hidden');
  studySetupContainer.classList.remove('hidden');
  populateStudyLanguages();
  populateStudyFiles();
});

btnGoToDictionary.addEventListener('click', () => {
  studyResultsContainer.classList.add('hidden');
  studySetupContainer.classList.remove('hidden');
  
  // Trigger dictionary tab click
  document.getElementById('nav-btn-dictionary').click();
});

// --- Excel Import Logic ---

// Drag and drop events
['dragenter', 'dragover'].forEach(eventName => {
  excelDragDropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    excelDragDropZone.classList.add('dragover');
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  excelDragDropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    excelDragDropZone.classList.remove('dragover');
  }, false);
});

excelDragDropZone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length > 0) {
    handleImportFileSelection(files[0]);
  }
});

excelDragDropZone.addEventListener('click', () => {
  excelFileSelector.click();
});

excelFileSelector.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleImportFileSelection(e.target.files[0]);
  }
});

function handleImportFileSelection(file) {
  const fileExt = file.name.split('.').pop().toLowerCase();
  const allowed = ['xlsx', 'xls', 'csv'];
  
  if (!allowed.includes(fileExt)) {
    alert('Невалиден файлов формат. Моля качете .xlsx, .xls или .csv файл.');
    importFileName.textContent = 'Няма избран файл';
    btnProcessImport.setAttribute('disabled', 'true');
    selectedImportFile = null;
    return;
  }

  selectedImportFile = file;
  importFileName.textContent = `${file.name} (${formatBytes(file.size)})`;
  btnProcessImport.removeAttribute('disabled');
}

btnProcessImport.addEventListener('click', () => {
  if (!selectedImportFile) return;

  const selectedLang = importLangSelect.value;
  const skipHeader = importHasHeadersSelect.value === 'yes';
  const importFilename = selectedImportFile.name; // Keep filename for sourceFile tracking

  btnProcessImport.setAttribute('disabled', 'true');
  btnProcessImport.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Обработване...';

  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert worksheet to raw array of arrays
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (rows.length === 0) {
        alert('Файлът е празен.');
        resetImportUI();
        return;
      }

      let importedCount = 0;
      let skippedCount = 0;
      const startIdx = skipHeader ? 1 : 0;
      
      const wordsToInsert = [];

      // Gather current words to prevent duplicate inserts
      const existingWordPairs = new Set(
        allWords
          .filter(w => w.language === selectedLang)
          .map(w => `${w.word.toLowerCase().trim()}::${w.translation.toLowerCase().trim()}`)
      );

      for (let i = startIdx; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) {
          skippedCount++;
          continue;
        }

        // row[i] can be `undefined` for a blank cell (sparse array from SheetJS) - stringifying
        // it directly would produce the literal text "undefined" instead of an empty string.
        const foreignWord = row[0] != null ? String(row[0]).trim() : '';
        const bulgarianTranslation = row[1] != null ? String(row[1]).trim() : '';

        if (!foreignWord || !bulgarianTranslation) {
          skippedCount++;
          continue;
        }

        const uniqueKey = `${foreignWord.toLowerCase()}::${bulgarianTranslation.toLowerCase()}`;
        if (existingWordPairs.has(uniqueKey)) {
          skippedCount++;
          continue; // Duplicate, skip
        }

        const newWord = {
          word: foreignWord,
          translation: bulgarianTranslation,
          language: selectedLang,
          sourceFile: importFilename, // track import source
          addedAt: Date.now(),
          status: 'learning',
          correctStreak: 0
        };

        wordsToInsert.push(newWord);
        importedCount++;
      }

      if (wordsToInsert.length > 0) {
        addWordsBatchToDB(wordsToInsert)
          .then(() => {
            alert(`Импортирането приключи успешно!\nДобавени думи: ${importedCount}\nПропуснати (празни или дубликати): ${skippedCount}`);
            resetImportUI();
            refreshData();
          })
          .catch(err => {
            console.error(err);
            alert('Грешка при запис на думите в базата данни.');
            resetImportUI();
          });
      } else {
        alert(`Не бяха намерени нови думи за добавяне.\nПропуснати/дублирани реда: ${skippedCount}`);
        resetImportUI();
      }

    } catch (err) {
      console.error(err);
      alert('Грешка при четенето на Excel файла. Проверете структурата му.');
      resetImportUI();
    }
  };

  reader.onerror = () => {
    alert('Грешка при четене на файла.');
    resetImportUI();
  };

  reader.readAsArrayBuffer(selectedImportFile);
});

function resetImportUI() {
  selectedImportFile = null;
  importFileName.textContent = 'Няма избран файл';
  excelFileSelector.value = '';
  btnProcessImport.removeAttribute('disabled');
  btnProcessImport.innerHTML = '<i class="fa-solid fa-circle-check"></i> Изпълни импортирането';
  btnProcessImport.setAttribute('disabled', 'true');
}

// --- Backup & Restore Logic ---

// Export JSON Backup
btnBackupExportJson.addEventListener('click', () => {
  if (allWords.length === 0) {
    alert('Няма данни за експортиране.');
    return;
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allWords, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `flashcards_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

// Import JSON Backup
btnTriggerJsonFile.addEventListener('click', () => {
  jsonFileSelector.click();
});

jsonFileSelector.addEventListener('change', (e) => {
  if (e.target.files.length === 0) return;

  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(evt) {
    try {
      const importedData = JSON.parse(evt.target.result);
      if (!Array.isArray(importedData)) {
        alert('Невалиден формат. Очаква се JSON масив от думи.');
        return;
      }

      // Validate objects roughly and insert
      let importCount = 0;
      const wordsToRestore = [];
      
      importedData.forEach(item => {
        if (item.word && item.translation && item.language) {
          const newObj = {
            word: String(item.word).trim(),
            translation: String(item.translation).trim(),
            language: String(item.language).trim().toLowerCase(),
            sourceFile: item.sourceFile || "Ръчно добавени",
            addedAt: item.addedAt || Date.now(),
            status: item.status || 'learning',
            correctStreak: typeof item.correctStreak === 'number' ? item.correctStreak : 0
          };
          wordsToRestore.push(newObj);
          importCount++;
        }
      });

      if (wordsToRestore.length > 0) {
        addWordsBatchToDB(wordsToRestore)
          .then(() => {
            alert(`Успешно възстановени ${importCount} думи!`);
            jsonFileSelector.value = '';
            refreshData();
          })
          .catch(err => {
            console.error(err);
            alert('Грешка при записване в базата данни.');
          });
      } else {
        alert('Не бяха намерени валидни думи в файла.');
      }

    } catch (err) {
      alert('Грешка при декодиране на JSON файла.');
    }
  };

  reader.readAsText(file);
});

// Export to Excel Backup
btnBackupExportExcel.addEventListener('click', () => {
  if (allWords.length === 0) {
    alert('Речникът е празен. Няма данни за експортиране.');
    return;
  }

  try {
    const exportRows = allWords.map(w => ({
      'Дума': w.word,
      'Превод': w.translation,
      'Език': w.language.toUpperCase(),
      'Източник': w.sourceFile || 'Ръчно добавени',
      'Стрийк': w.correctStreak,
      'Статус': w.status === 'mastered' ? 'Научена' : 'За учене'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Речник');
    
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `flashcards_export_${dateStr}.xlsx`);
  } catch (err) {
    console.error(err);
    alert('Грешка при експортиране на Excel.');
  }
});

// Danger Zone - Clear database
btnDangerClearDatabase.addEventListener('click', () => {
  if (confirm('ВНИМАНИЕ! Сигурни ли сте, че искате да ИЗТРИЕТЕ ЦЕЛИЯ РЕЧНИК?\nТова ще изтрие всички думи от браузъра и това действие е НЕОБРАТИМО!')) {
    if (confirm('Моля, потвърдете ОЩЕ ВЕДНЪЖ, че искате да изтриете всичко.')) {
      clearDatabaseInDB()
        .then(() => {
          alert('Базата данни е изтрита успешно.');
          refreshData();
        })
        .catch(err => {
          console.error(err);
          alert('Грешка при изтриване на базата данни.');
        });
    }
  }
});

// --- Helper Functions ---

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Event Listeners setup that aren't direct property assigns
function setupEventListeners() {
  // Setup focus-visible border for elements
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
  });

  // Toggle study files multiselect dropdown
  if (studyFilesDropdownToggle && studyFilesDropdown) {
    studyFilesDropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      studyFilesDropdown.classList.toggle('active');
      const expanded = studyFilesDropdown.classList.contains('active');
      studyFilesDropdownToggle.setAttribute('aria-expanded', expanded);
    });

    document.addEventListener('click', (e) => {
      if (!studyFilesDropdown.contains(e.target)) {
        studyFilesDropdown.classList.remove('active');
        studyFilesDropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Toggle exam files multiselect dropdown
  if (examFilesDropdownToggle && examFilesDropdown) {
    examFilesDropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      examFilesDropdown.classList.toggle('active');
      const expanded = examFilesDropdown.classList.contains('active');
      examFilesDropdownToggle.setAttribute('aria-expanded', expanded);
    });

    document.addEventListener('click', (e) => {
      if (!examFilesDropdown.contains(e.target)) {
        examFilesDropdown.classList.remove('active');
        examFilesDropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Speak word button click handler
  if (btnSpeakWord) {
    btnSpeakWord.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card from flipping
      speakCurrentWord();
    });
  }
}

// --- Text-to-Speech (TTS) Helpers ---

// Initialize user preferences for TTS
function initTtsSettings() {
  if (!studyTtsAutoplay) return;

  const savedAutoplay = localStorage.getItem('flashcards-tts-autoplay');
  if (savedAutoplay === 'false') {
    studyTtsAutoplay.checked = false;
  } else {
    studyTtsAutoplay.checked = true; // default is true
  }

  studyTtsAutoplay.addEventListener('change', () => {
    localStorage.setItem('flashcards-tts-autoplay', studyTtsAutoplay.checked);
  });

  // Listen to voice loading (SpeechSynthesis is asynchronous on some browsers)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      populateTtsOptions();
    };
  }
}

// Populate voice selections dynamically based on the active language
function populateTtsOptions() {
  if (!studyTtsVoiceSelect || !studyLangSelect) return;

  const selectedLang = studyLangSelect.value;
  if (!selectedLang) {
    studyTtsVoiceSelect.innerHTML = '<option value="off">Без произношение</option>';
    return;
  }

  studyTtsVoiceSelect.innerHTML = '';
  const savedTtsPref = localStorage.getItem(`flashcards-tts-voice-${selectedLang}`);

  if (selectedLang.toLowerCase() === 'en') {
    // English gets US and UK accents
    const optUS = document.createElement('option');
    optUS.value = 'en-US';
    optUS.textContent = 'Американски английски (US)';

    const optUK = document.createElement('option');
    optUK.value = 'en-GB';
    optUK.textContent = 'Британски английски (UK)';

    studyTtsVoiceSelect.appendChild(optUS);
    studyTtsVoiceSelect.appendChild(optUK);

    if (savedTtsPref === 'en-GB') {
      optUK.selected = true;
    } else {
      optUS.selected = true; // default US
    }
  } else {
    // Other languages get one native option
    const optNative = document.createElement('option');
    let locale = selectedLang;
    
    // Map code to standard speech synthesis locales
    const lowerLang = selectedLang.toLowerCase();
    if (lowerLang === 'de') locale = 'de-DE';
    else if (lowerLang === 'es') locale = 'es-ES';
    else if (lowerLang === 'fr') locale = 'fr-FR';
    else if (lowerLang === 'ru') locale = 'ru-RU';
    else if (lowerLang === 'it') locale = 'it-IT';

    optNative.value = locale;
    optNative.textContent = `${getLanguageName(selectedLang)} (${selectedLang.toUpperCase()}) - Оригинален`;
    studyTtsVoiceSelect.appendChild(optNative);
    optNative.selected = true;
  }

  // Add the "off" option at the end
  const optOff = document.createElement('option');
  optOff.value = 'off';
  optOff.textContent = 'Без произношение';
  studyTtsVoiceSelect.appendChild(optOff);

  if (savedTtsPref === 'off') {
    optOff.selected = true;
  }

  // Event listener to save voice preference
  studyTtsVoiceSelect.addEventListener('change', () => {
    localStorage.setItem(`flashcards-tts-voice-${selectedLang}`, studyTtsVoiceSelect.value);
  });
}

// Pronounce the current flashcard word
function speakCurrentWord() {
  speechPractice.cancel();
  if (!('speechSynthesis' in window)) return;

  const currentIdx = sessionState.currentIndex;
  if (!sessionState.isActive || sessionState.words.length === 0) return;

  const currentWord = sessionState.words[currentIdx];
  const ttsSetting = studyTtsVoiceSelect.value;

  if (ttsSetting === 'off') return;

  // Cancel any active speech synthesis
  window.speechSynthesis.cancel();

  // Create utterance with target word
  const utterance = new SpeechSynthesisUtterance(currentWord.word);
  utterance.lang = ttsSetting;

  // Find matching voice
  const voices = window.speechSynthesis.getVoices();
  
  // Filter voices matching exact locale (e.g. en-US)
  let matchingVoices = voices.filter(v => v.lang.replace('_', '-').toLowerCase() === ttsSetting.toLowerCase());
  
  if (matchingVoices.length === 0) {
    // Prefix fallback (e.g. starts with "en-US")
    matchingVoices = voices.filter(v => v.lang.replace('_', '-').toLowerCase().startsWith(ttsSetting.toLowerCase()));
  }
  
  if (matchingVoices.length === 0) {
    // General language code fallback (e.g. starts with "en")
    const langPrefix = ttsSetting.split('-')[0].toLowerCase();
    matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
  }

  if (matchingVoices.length > 0) {
    // Prioritize natural, online, google, neural, premium, or siri voices
    const naturalKeywords = ['natural', 'google', 'neural', 'premium', 'online', 'siri'];
    const bestVoice = matchingVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      return naturalKeywords.some(keyword => nameLower.includes(keyword));
    });
    
    utterance.voice = bestVoice || matchingVoices[0];
  }

  // Speech settings
  utterance.rate = 0.9; // slightly slower for better learning clarity
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

// --- Exam Session Logic ---

if (btnStartExam) {
  btnStartExam.addEventListener('click', () => {
    const selectedLang = examLangSelect.value;
    if (!selectedLang) {
      alert('Първо добавете думи в речника!');
      return;
    }

    // Get selected files from dropdown checklist
    const checkedBoxes = examFilesOptions.querySelectorAll('input[name="exam-file-cb"]:checked');
    if (checkedBoxes.length === 0) {
      alert('Моля, изберете поне един файл/източник за изпита!');
      return;
    }

    const selectedFiles = Array.from(checkedBoxes).map(cb => cb.value);
    const sizeSetting = examSizeSelect.value;
    const directionSetting = examDirectionSelect.value;

    // Filter by language AND selected source files
    const wordsForExam = allWords.filter(w => {
      const wordFile = w.sourceFile || 'Ръчно добавени';
      return w.language === selectedLang && selectedFiles.includes(wordFile);
    });

    if (wordsForExam.length === 0) {
      alert(`Няма намерени думи за избраните източници. Добавете думи преди да започнете!`);
      return;
    }

    // Select words of sizeSetting
    let chosenWords = shuffleArray([...wordsForExam]);
    if (sizeSetting !== 'all') {
      const targetSize = parseInt(sizeSetting);
      if (chosenWords.length > targetSize) {
        chosenWords = chosenWords.slice(0, targetSize);
      }
    }

    // Construct questions
    const questions = chosenWords.map(w => {
      // Determine direction
      let dir = directionSetting;
      if (directionSetting === 'mixed') {
        dir = Math.random() < 0.5 ? 'foreign-to-bg' : 'bg-to-foreign';
      }

      let prompt = '';
      let correctAnswer = '';
      
      if (dir === 'foreign-to-bg') {
        prompt = w.word;
        correctAnswer = w.translation;
      } else {
        prompt = w.translation;
        correctAnswer = w.word;
      }

      return {
        wordObj: w,
        direction: dir,
        prompt: prompt,
        correctAnswer: correctAnswer
      };
    });

    // Setup Exam State
    examState = {
      isActive: true,
      questions: questions,
      currentIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      errors: []
    };

    // UI Setup
    examSetupContainer.classList.add('hidden');
    examResultsContainer.classList.add('hidden');
    examSessionContainer.classList.remove('hidden');
    
    loadExamQuestion(0);
  });
}

function loadExamQuestion(index) {
  const currentQuestion = examState.questions[index];
  examState.currentIndex = index;

  // Reset elements
  examAnswerInput.value = '';
  examAnswerInput.disabled = false;
  btnSubmitExamAnswer.disabled = false;
  examFeedbackContainer.classList.add('hidden');

  // Load texts
  examPromptText.textContent = currentQuestion.prompt;
  
  if (currentQuestion.direction === 'foreign-to-bg') {
    examDirectionBadge.textContent = `Преведете на български`;
    examDirectionBadge.className = `card-lang-tag bg-to-bg`; // default light style
  } else {
    const langName = getLanguageName(currentQuestion.wordObj.language);
    examDirectionBadge.textContent = `Преведете на ${langName}`;
    examDirectionBadge.className = `card-lang-tag ${currentQuestion.wordObj.language}`;
  }

  // Progress UI
  currentExamNum.textContent = index + 1;
  totalExamNum.textContent = examState.questions.length;
  examCorrectCount.textContent = examState.correctCount;
  examIncorrectCount.textContent = examState.incorrectCount;
  
  const progressPercent = (index / examState.questions.length) * 100;
  examProgressBar.style.width = `${progressPercent}%`;

  // Focus input
  setTimeout(() => {
    examAnswerInput.focus();
  }, 100);
}

// Speak exam word
if (btnSpeakExamWord) {
  btnSpeakExamWord.addEventListener('click', (e) => {
    e.stopPropagation();
    speakExamWord();
  });
}

function speakExamWord() {
  if (!('speechSynthesis' in window)) return;
  if (!examState.isActive || examState.questions.length === 0) return;

  const currentQuestion = examState.questions[examState.currentIndex];
  // We can only speak the foreign word.
  // The foreign word is either in the prompt or in the correctAnswer.
  const foreignWord = currentQuestion.wordObj.word;
  const langCode = currentQuestion.wordObj.language;

  // Get matching TTS settings/voices
  const savedTtsPref = localStorage.getItem(`flashcards-tts-voice-${langCode}`) || 'en-US';
  let ttsSetting = savedTtsPref;
  
  if (ttsSetting === 'off') {
    // If preference is off, fallback to default locale
    if (langCode.toLowerCase() === 'en') ttsSetting = 'en-US';
    else if (langCode.toLowerCase() === 'de') ttsSetting = 'de-DE';
    else if (langCode.toLowerCase() === 'es') ttsSetting = 'es-ES';
    else if (langCode.toLowerCase() === 'fr') ttsSetting = 'fr-FR';
    else if (langCode.toLowerCase() === 'ru') ttsSetting = 'ru-RU';
    else if (langCode.toLowerCase() === 'it') ttsSetting = 'it-IT';
    else ttsSetting = langCode;
  }

  // Cancel any active speech synthesis
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(foreignWord);
  utterance.lang = ttsSetting;

  const voices = window.speechSynthesis.getVoices();
  let matchingVoices = voices.filter(v => v.lang.replace('_', '-').toLowerCase() === ttsSetting.toLowerCase());
  
  if (matchingVoices.length === 0) {
    matchingVoices = voices.filter(v => v.lang.replace('_', '-').toLowerCase().startsWith(ttsSetting.toLowerCase()));
  }
  
  if (matchingVoices.length === 0) {
    const langPrefix = ttsSetting.split('-')[0].toLowerCase();
    matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
  }

  if (matchingVoices.length > 0) {
    const naturalKeywords = ['natural', 'google', 'neural', 'premium', 'online', 'siri'];
    const bestVoice = matchingVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      return naturalKeywords.some(keyword => nameLower.includes(keyword));
    });
    utterance.voice = bestVoice || matchingVoices[0];
  }

  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Answer Submission
if (formExamAnswer) {
  formExamAnswer.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!examState.isActive) return;

    const userInput = examAnswerInput.value.trim();
    if (!userInput) return;

    // Disable input and button
    examAnswerInput.disabled = true;
    btnSubmitExamAnswer.disabled = true;

    const currentQuestion = examState.questions[examState.currentIndex];
    const isCorrect = checkExamAnswer(userInput, currentQuestion.correctAnswer);

    // Update streak and status in database to reward user
    const wordObj = currentQuestion.wordObj;
    if (isCorrect) {
      examState.correctCount++;
      wordObj.correctStreak++;
      if (wordObj.correctStreak >= 3) {
        wordObj.status = 'mastered';
      }
    } else {
      examState.incorrectCount++;
      wordObj.correctStreak = 0;
      wordObj.status = 'learning';
      
      // Save error details
      examState.errors.push({
        prompt: currentQuestion.prompt,
        userAnswer: userInput,
        correctAnswer: currentQuestion.correctAnswer
      });
    }

    // Save progress to IndexedDB
    updateWordInDB(wordObj).catch(err => console.error('Грешка при запис на прогрес от изпит:', err));

    // Show feedback
    examFeedbackContainer.classList.remove('hidden');
    
    if (isCorrect) {
      examFeedbackTitle.textContent = 'Правилно!';
      examFeedbackTitle.className = 'text-success';
      examFeedbackDetail.textContent = `Вашият отговор съвпада с речника.`;
    } else {
      examFeedbackTitle.textContent = 'Грешно!';
      examFeedbackTitle.className = 'text-danger';
      examFeedbackDetail.innerHTML = `Правилният отговор е: <strong>${escapeHTML(currentQuestion.correctAnswer)}</strong>`;
    }

    // Focus next button
    setTimeout(() => {
      btnNextExamQuestion.focus();
    }, 100);
  });
}

function checkExamAnswer(userInput, correctAnswer) {
  const clean = str => {
    return str
      .toLowerCase()
      .replace(/\([^)]*\)/g, "") // remove text in parentheses e.g. (мъжки кон)
      .replace(/\s+/g, " ")       // normalize multiple spaces to a single space
      .trim();
  };

  const userClean = clean(userInput);
  
  // Split by common delimiters in translations
  const synonyms = correctAnswer.split(/[/,;]/).map(s => clean(s));
  
  // Match if the user's cleaned input matches any cleaned synonym
  return synonyms.some(syn => syn === userClean);
}

if (btnNextExamQuestion) {
  btnNextExamQuestion.addEventListener('click', () => {
    const nextIdx = examState.currentIndex + 1;
    if (nextIdx < examState.questions.length) {
      loadExamQuestion(nextIdx);
    } else {
      // Finish Exam
      examProgressBar.style.width = '100%';
      setTimeout(() => {
        showExamResults();
      }, 500);
    }
  });
}

function showExamResults() {
  examState.isActive = false;
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  examSessionContainer.classList.add('hidden');
  examResultsContainer.classList.remove('hidden');

  const total = examState.questions.length;
  const correct = examState.correctCount;
  const incorrect = examState.incorrectCount;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  examResultPercentage.textContent = `${percentage}%`;
  examResultCorrectCount.textContent = correct;
  examResultIncorrectCount.textContent = incorrect;
  examResultSummaryText.textContent = `Завършихте изпита с ${correct} верни отговора от общо ${total} въпроса.`;

  // Render errors panel
  examErrorsTbody.innerHTML = '';
  if (examState.errors.length > 0) {
    examErrorsPanel.classList.remove('hidden');
    examState.errors.forEach(err => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-weight-bold">${escapeHTML(err.prompt)}</td>
        <td class="text-danger">${escapeHTML(err.userAnswer)}</td>
        <td class="text-success">${escapeHTML(err.correctAnswer)}</td>
      `;
      examErrorsTbody.appendChild(tr);
    });
  } else {
    examErrorsPanel.classList.add('hidden');
  }

  refreshData(); // Refresh UI dictionary stats
}

if (btnQuitExam) {
  btnQuitExam.addEventListener('click', () => {
    if (confirm('Сигурни ли сте, че искате да прекратите изпита? Прогресът за вече отговорените въпроси ще бъде запазен.')) {
      examState.isActive = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      examSessionContainer.classList.add('hidden');
      examSetupContainer.classList.remove('hidden');
      refreshData();
    }
  });
}

if (btnRestartExam) {
  btnRestartExam.addEventListener('click', () => {
    examResultsContainer.classList.add('hidden');
    examSetupContainer.classList.remove('hidden');
    populateExamLanguages();
    populateExamFiles();
  });
}

if (btnExamGoToDictionary) {
  btnExamGoToDictionary.addEventListener('click', () => {
    examResultsContainer.classList.add('hidden');
    examSetupContainer.classList.remove('hidden');
    
    // Trigger dictionary tab click
    document.getElementById('nav-btn-dictionary').click();
  });
}
