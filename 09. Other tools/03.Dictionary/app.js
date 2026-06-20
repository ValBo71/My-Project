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

// Session State
let sessionState = {
  isActive: false,
  words: [],
  currentIndex: 0,
  correctCount: 0,
  incorrectCount: 0,
  isFlipped: false
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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
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

      // Special action: if entering Study or Dictionary tab, refresh display
      if (targetPanelId === 'study-tab-content' && !sessionState.isActive) {
        populateStudyLanguages();
        populateStudyFiles();
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
        <span class="lang-badge ${lang.toLowerCase()}">${lang.toUpperCase()}</span>
        <span>${getLanguageName(lang)}</span>
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
    language = addLangOtherInput.value.trim().toLowerCase();
    if (!language) return;
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
});

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
      <td><span class="lang-badge ${w.language}">${w.language.toUpperCase()}</span></td>
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
    // If it's a custom language, dynamically add it to the select options
    let customOption = editLangSelect.querySelector(`option[value="${wordObj.language}"]`);
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
  sessionState.isActive = false;
  
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

        const foreignWord = String(row[0]).trim();
        const bulgarianTranslation = String(row[1]).trim();

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
}
