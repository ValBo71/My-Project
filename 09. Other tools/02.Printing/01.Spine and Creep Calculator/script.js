// Factory-default paper catalogue. Seeded into localStorage on first run,
// and used again whenever the user chooses "Възстанови по подразбиране".
const DEFAULT_PAPERS = [
    { category: 'Офсетови хартии', name: '70 г Офсет', thickness: 0.085 },
    { category: 'Офсетови хартии', name: '80 г Офсет', thickness: 0.095, default: true },
    { category: 'Офсетови хартии', name: '90 г Офсет', thickness: 0.105 },
    { category: 'Офсетови хартии', name: '100 г Офсет', thickness: 0.12 },
    { category: 'Офсетови хартии', name: '120 г Офсет', thickness: 0.132 },
    { category: 'Офсетови хартии', name: '140 г Офсет', thickness: 0.145 },
    { category: 'Хромови хартии (Гланц)', name: '80 г Хром Гланц', thickness: 0.06 },
    { category: 'Хромови хартии (Гланц)', name: '90 г Хром Гланц', thickness: 0.065 },
    { category: 'Хромови хартии (Гланц)', name: '100 г Хром Гланц', thickness: 0.071 },
    { category: 'Хромови хартии (Гланц)', name: '115 г Хром Гланц', thickness: 0.085 },
    { category: 'Хромови хартии (Гланц)', name: '130 г Хром Гланц', thickness: 0.1 },
    { category: 'Хромови хартии (Гланц)', name: '150 г Хром Гланц', thickness: 0.12 },
    { category: 'Хромови хартии (Гланц)', name: '170 г Хром Гланц', thickness: 0.13 },
    { category: 'Хромови хартии (Гланц)', name: '200 г Хром Гланц', thickness: 0.145 },
    { category: 'Хромови хартии (Мат)', name: '80 г Хром Мат', thickness: 0.065 },
    { category: 'Хромови хартии (Мат)', name: '90 г Хром Мат', thickness: 0.072 },
    { category: 'Хромови хартии (Мат)', name: '100 г Хром Мат', thickness: 0.08 },
    { category: 'Хромови хартии (Мат)', name: '115 г Хром Мат', thickness: 0.1 },
    { category: 'Хромови хартии (Мат)', name: '130 г Хром Мат', thickness: 0.112 },
    { category: 'Хромови хартии (Мат)', name: '150 г Хром Мат', thickness: 0.125 },
    { category: 'Хромови хартии (Мат)', name: '170 г Хром Мат', thickness: 0.15 },
    { category: 'Хромови хартии (Мат)', name: '200 г Хром Мат', thickness: 0.18 },
    { category: 'Обемни хартии', name: '55 г Обемна хартия', thickness: 0.095 },
    { category: 'Обемни хартии', name: '70 г Обемна хартия', thickness: 0.135 },
    { category: 'Обемни хартии', name: '80 г Обемна хартия', thickness: 0.155 },
];

const PAPERS_STORAGE_KEY = 'spineCalc_papers_v1';

// Page count limits (the slider covers only the most common range)
const MIN_PAGES = 4;
const MAX_PAGES = 2000;
const SLIDER_MAX_PAGES = 1000;

// Thread swelling of the book block when sewn, by signature size (pages per signature).
// Smaller signatures mean more folds and more thread layers. Single sheets cannot be sewn.
const SEWING_SWELLING = { 2: 1.0, 4: 1.12, 8: 1.10, 16: 1.08, 32: 1.05 };

// False when localStorage is blocked (disabled site data, some file:// or sandboxed modes).
// The calculator still works then; custom papers just are not kept after a reload.
let storageAvailable = true;

function seedDefaultPapers() {
    const papers = DEFAULT_PAPERS.map((p, i) => ({
        id: 'p' + i,
        category: p.category,
        name: p.name,
        thickness: p.thickness,
    }));
    const defaultIndex = DEFAULT_PAPERS.findIndex(p => p.default);
    return {
        nextId: papers.length,
        defaultId: defaultIndex >= 0 ? 'p' + defaultIndex : (papers[0] && papers[0].id),
        papers,
    };
}

function savePapers(data) {
    try {
        localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(data));
        storageAvailable = true;
    } catch (e) {
        storageAvailable = false;
    }
}

// Keeps only well-formed papers (string category/name, positive numeric thickness),
// gives every paper a unique id and makes nextId larger than any existing id, so data
// from an older version or edited by hand can never break the app or collide.
function sanitizePapersData(parsed) {
    if (!parsed || !Array.isArray(parsed.papers)) return null;

    const usedIds = new Set();
    const papers = [];
    parsed.papers.forEach(p => {
        if (!p || typeof p !== 'object') return;
        const thickness = Number(p.thickness);
        const category = p.category != null ? String(p.category).trim() : '';
        const name = p.name != null ? String(p.name).trim() : '';
        if (!category || !name || !Number.isFinite(thickness) || thickness <= 0) return;
        const id = typeof p.id === 'string' && p.id && !usedIds.has(p.id) ? p.id : null;
        papers.push({ id, category, name, thickness });
        if (id) usedIds.add(id);
    });
    if (papers.length === 0) return null;

    const maxNumericId = papers.reduce((max, p) => {
        const m = p.id && /^p(\d+)$/.exec(p.id);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, -1);
    let nextId = Number.isInteger(parsed.nextId) && parsed.nextId > maxNumericId ? parsed.nextId : maxNumericId + 1;
    papers.forEach(p => {
        if (!p.id) {
            while (usedIds.has('p' + nextId)) nextId++;
            p.id = 'p' + nextId++;
            usedIds.add(p.id);
        }
    });

    const defaultId = papers.some(p => p.id === parsed.defaultId) ? parsed.defaultId : papers[0].id;
    return { nextId, defaultId, papers };
}

function loadPapers() {
    try {
        const raw = localStorage.getItem(PAPERS_STORAGE_KEY);
        if (raw) {
            const sanitized = sanitizePapersData(JSON.parse(raw));
            if (sanitized) return sanitized;
        }
    } catch (e) {
        // Blocked or corrupt storage - fall through to the factory papers
    }
    const seeded = seedDefaultPapers();
    savePapers(seeded);
    return seeded;
}

// Unique categories in their first-appearance order
function getCategories(papers) {
    return [...new Set(papers.map(p => p.category))];
}

// Parses the page field. Number() (unlike parseInt) understands "1e3".
// Returns NaN for an empty or non-numeric value.
function parsePages(value) {
    const trimmed = String(value).trim();
    return trimmed === '' ? NaN : Math.round(Number(trimmed));
}

// Brings any page count into the allowed range and makes it even (a leaf has 2 pages)
function clampPages(val) {
    if (!Number.isFinite(val)) return 200;
    val = Math.min(MAX_PAGES, Math.max(MIN_PAGES, val));
    return val % 2 === 0 ? val : val + 1;
}

document.addEventListener('DOMContentLoaded', () => {
    let papersData = loadPapers();

    function getPaperById(id) {
        return papersData.papers.find(p => p.id === id);
    }

    // DOM Elements - Inputs
    const coverSoftRadio = document.getElementById('cover-soft');
    const coverHardRadio = document.getElementById('cover-hard');
    const pagesInput = document.getElementById('pages');
    const pagesRange = document.getElementById('pages-range');
    const paperSelect = document.getElementById('paper');
    const signatureSizeSelect = document.getElementById('signature-size');

    // Softcover options
    const softcoverOptions = document.getElementById('softcover-options');
    const coverPaperSelect = document.getElementById('cover-paper');
    const glueTypeSelect = document.getElementById('glue-type');

    // Hardcover options
    const hardcoverOptions = document.getElementById('hardcover-options');
    const boardThicknessSelect = document.getElementById('board-thickness');
    const spineShapeSelect = document.getElementById('spine-shape');

    // Sewing
    const sewingCheckbox = document.getElementById('sewing-checkbox');

    // DOM Elements - Outputs & Preview
    const resultSpine = document.getElementById('result-spine');
    const resultCreep = document.getElementById('result-creep');
    const legendSpine = document.getElementById('legend-spine');
    const legendCreep = document.getElementById('legend-creep');
    const previewSpineText = document.getElementById('preview-spine-text');
    const bookModel = document.getElementById('book-model');
    const pagesWarning = document.getElementById('pages-warning');

    function syncSlider(val) {
        // Values above the slider range park it at its maximum instead of leaving it stale
        pagesRange.value = Math.min(SLIDER_MAX_PAGES, Math.max(MIN_PAGES, val));
    }

    function showWarning(message) {
        pagesWarning.textContent = message;
        pagesWarning.classList.toggle('hidden', !message);
    }

    // Sync Slider -> Number Input
    pagesRange.addEventListener('input', (e) => {
        pagesInput.value = e.target.value;
        calculate();
    });

    // Sync Number Input -> Slider
    pagesInput.addEventListener('input', () => {
        const val = parsePages(pagesInput.value);
        if (Number.isFinite(val)) syncSlider(val);
        calculate();
    });

    // Enforce constraints on blur
    pagesInput.addEventListener('blur', () => {
        const val = clampPages(parsePages(pagesInput.value));
        pagesInput.value = val;
        syncSlider(val);
        calculate();
    });

    // Toggle conditional options when Cover Type changes
    const handleCoverTypeChange = () => {
        if (coverSoftRadio.checked) {
            softcoverOptions.classList.remove('hidden');
            hardcoverOptions.classList.add('hidden');
            bookModel.classList.remove('hardcover');
        } else {
            softcoverOptions.classList.add('hidden');
            hardcoverOptions.classList.remove('hidden');
            bookModel.classList.add('hardcover');
        }
        calculate();
    };

    coverSoftRadio.addEventListener('change', handleCoverTypeChange);
    coverHardRadio.addEventListener('change', handleCoverTypeChange);

    // General listener for all recalculation events
    const recalculateElements = [
        paperSelect,
        signatureSizeSelect,
        coverPaperSelect,
        glueTypeSelect,
        boardThicknessSelect,
        spineShapeSelect,
        sewingCheckbox
    ];

    recalculateElements.forEach(elem => {
        elem.addEventListener('change', calculate);
    });

    // Shows the same "no result" state everywhere, so tiles, legend and 3D model never disagree
    function showInvalidState(message) {
        resultSpine.textContent = '—';
        resultCreep.textContent = '—';
        legendSpine.textContent = '— мм';
        legendCreep.textContent = '— мм';
        previewSpineText.textContent = 'ГРЪБЧЕ';
        showWarning(message);
    }

    // Main calculation function
    function calculate() {
        const rawPages = parsePages(pagesInput.value);
        const selectedPaper = getPaperById(paperSelect.value);
        const paperThickness = selectedPaper ? selectedPaper.thickness : 0;
        const signatureSize = parseInt(signatureSizeSelect.value, 10) || 16;
        const isSingleSheets = signatureSize === 2;
        const isSewn = sewingCheckbox.checked && !isSingleSheets;
        const isHardcover = coverHardRadio.checked;

        // Out-of-range values are not calculated while typing (e.g. "5000" or "1");
        // the field is corrected on blur.
        if (!Number.isFinite(rawPages) || rawPages < MIN_PAGES || rawPages > MAX_PAGES) {
            showInvalidState(`Въведете брой страници между ${MIN_PAGES} и ${MAX_PAGES}.`);
            return;
        }
        if (!selectedPaper) {
            showInvalidState('Изберете хартия за тялото.');
            return;
        }

        // A leaf always has 2 pages, so an odd count is calculated as the next even one
        const pages = rawPages % 2 === 0 ? rawPages : rawPages + 1;

        // Warnings about page counts that cannot be produced as entered
        const warnings = [];
        if (pages !== rawPages) {
            warnings.push(`Нечетен брой страници – изчислено е за ${pages} стр.`);
        }
        if (!isSingleSheets) {
            if (pages % 4 !== 0) {
                // A folded sheet always has 4 pages - such a book cannot be made of signatures
                warnings.push(`${pages} стр. не се делят на 4, а сгънатите коли изискват кратност на 4 – използвайте ${pages - 2} или ${pages + 2} стр.`);
            } else if (pages % signatureSize !== 0) {
                // Common in practice: full signatures plus one smaller last signature
                const fullSignatures = Math.floor(pages / signatureSize);
                const remainder = pages - fullSignatures * signatureSize;
                warnings.push(`${fullSignatures} коли × ${signatureSize} стр. + 1 кола от ${remainder} стр.`);
            }
        }
        if (sewingCheckbox.checked && isSingleSheets) {
            warnings.push('Единични листове не се шият с конци – набухване не е добавено.');
        }

        // 1. Thread swelling of the book block (only when sewn)
        const swellingFactor = isSewn ? (SEWING_SWELLING[signatureSize] || 1.0) : 1.0;

        const blockThickness = paperThickness * (pages / 2) * swellingFactor;

        let spineWidth = 0;

        if (!isHardcover) {
            // Softcover spine formula
            const coverPaperThickness = parseFloat(coverPaperSelect.value) || 0;
            const glueThickness = parseFloat(glueTypeSelect.value) || 0;

            spineWidth = blockThickness + (2 * coverPaperThickness) + glueThickness;

            // Clean visualizer states for softcover
            bookModel.classList.remove('rounded');
        } else {
            // Hardcover spine formula
            const boardThickness = parseFloat(boardThicknessSelect.value) || 0;
            const isRounded = spineShapeSelect.value === 'rounded';
            const margin = 1.5; // Spine margin covering glue and wrap overlap

            if (isRounded) {
                spineWidth = (blockThickness * 1.15) + (2 * boardThickness) + margin;
                bookModel.classList.add('rounded');
            } else {
                spineWidth = blockThickness + (2 * boardThickness) + margin;
                bookModel.classList.remove('rounded');
            }
        }

        // 2. Creep of the nested sheets inside one signature. It comes from folding the sheets
        // into each other, so it applies to glued books made of folded signatures too - not
        // only to sewn ones. Single sheets (no folding) have no creep.
        // Creep = (Signature Size / 4 - 1) * Paper Thickness
        const creepValue = Math.max(0, (signatureSize / 4 - 1) * paperThickness);

        // Rounding results to 2 decimal places
        const spineFormatted = spineWidth.toFixed(2);
        const creepFormatted = creepValue.toFixed(2);

        // Update UI labels
        resultSpine.textContent = spineFormatted;
        resultCreep.textContent = creepFormatted;
        legendSpine.textContent = `${spineFormatted} мм`;
        legendCreep.textContent = `${creepFormatted} мм`;

        previewSpineText.textContent = `ГРЪБЧЕ • ${pages} СТР.`;
        showWarning(warnings.join(' '));

        // Update Book Spine Width CSS variable (1mm = 6.5px)
        const spinePixels = Math.max(12, Math.min(190, spineWidth * 6.5));
        document.documentElement.style.setProperty('--spine-width-px', `${spinePixels}px`);
    }

    // Helper for button controls (+4 / -4): moves to the next/previous multiple of 4,
    // so stepping from an uneven value like 202 lands on 204/200 instead of 206/198.
    window.adjustPages = function(delta) {
        const current = clampPages(parsePages(pagesInput.value));
        const step = Math.abs(delta);
        let newVal = delta > 0
            ? Math.floor(current / step) * step + step
            : Math.ceil(current / step) * step - step;
        newVal = clampPages(Math.max(MIN_PAGES, newVal));

        pagesInput.value = newVal;
        syncSlider(newVal);
        calculate();
    };

    // Rebuilds the <select> options from papersData, grouped into <optgroup>s by category.
    // Keeps the previously selected paper selected when it still exists.
    function renderPaperOptions(preserveId) {
        const idToRestore = preserveId !== undefined ? preserveId : (paperSelect.value || papersData.defaultId);

        paperSelect.innerHTML = '';
        getCategories(papersData.papers).forEach(category => {
            const group = document.createElement('optgroup');
            group.label = category;
            papersData.papers
                .filter(p => p.category === category)
                .forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id;
                    option.textContent = `${p.name} (${p.thickness.toFixed(3)} мм)`;
                    group.appendChild(option);
                });
            paperSelect.appendChild(group);
        });

        if (idToRestore && getPaperById(idToRestore)) {
            paperSelect.value = idToRestore;
        } else if (papersData.defaultId && getPaperById(papersData.defaultId)) {
            paperSelect.value = papersData.defaultId;
        } else if (paperSelect.options.length > 0) {
            paperSelect.selectedIndex = 0;
        }
    }

    // --- Paper Management Modal ---
    const paperModalOverlay = document.getElementById('paper-modal-overlay');
    const manageBtn = document.getElementById('manage-papers-btn');
    const modalCloseBtn = document.getElementById('paper-modal-close');
    const modalDoneBtn = document.getElementById('paper-modal-done');
    const resetPapersBtn = document.getElementById('reset-papers-btn');
    const addPaperBtn = document.getElementById('add-paper-btn');
    const paperListEl = document.getElementById('paper-list');
    const newPaperCategoryInput = document.getElementById('new-paper-category');
    const newPaperNameInput = document.getElementById('new-paper-name');
    const newPaperThicknessInput = document.getElementById('new-paper-thickness');
    const paperCategoriesDatalist = document.getElementById('paper-categories-list');
    const storageWarning = document.getElementById('storage-warning');

    // Set when a category was renamed: the list is regrouped once focus leaves it,
    // not on every change, so keyboard navigation between fields keeps working.
    let categoryRegroupPending = false;

    function refreshCategoryDatalist() {
        paperCategoriesDatalist.innerHTML = '';
        getCategories(papersData.papers).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            paperCategoriesDatalist.appendChild(option);
        });
    }

    function createInput(className, type, value, label) {
        const input = document.createElement('input');
        input.type = type;
        input.className = className;
        input.value = value;
        input.setAttribute('aria-label', label);
        return input;
    }

    function renderPaperManagementList() {
        categoryRegroupPending = false;
        paperListEl.innerHTML = '';
        getCategories(papersData.papers).forEach(category => {
            const heading = document.createElement('div');
            heading.className = 'paper-list-category';
            heading.textContent = category;
            paperListEl.appendChild(heading);

            papersData.papers
                .filter(p => p.category === category)
                .forEach(p => {
                    // Built with DOM properties (no innerHTML), so stored values cannot inject markup
                    const row = document.createElement('div');
                    row.className = 'paper-row';
                    row.dataset.id = p.id;

                    const thicknessInput = createInput('paper-row-thickness', 'number', String(p.thickness), 'Дебелина в мм');
                    thicknessInput.step = '0.001';
                    thicknessInput.min = '0.001';

                    const deleteBtn = document.createElement('button');
                    deleteBtn.type = 'button';
                    deleteBtn.className = 'paper-row-delete';
                    deleteBtn.setAttribute('aria-label', 'Изтрий хартия');
                    deleteBtn.textContent = '✕';

                    row.append(
                        createInput('paper-row-category', 'text', p.category, 'Категория'),
                        createInput('paper-row-name', 'text', p.name, 'Име на хартията'),
                        thicknessInput,
                        deleteBtn
                    );
                    paperListEl.appendChild(row);
                });
        });
        refreshCategoryDatalist();
        storageWarning.classList.toggle('hidden', storageAvailable);
    }

    // Delegated listeners: rows are re-created on every render, so bind once on the container.
    paperListEl.addEventListener('change', (e) => {
        const row = e.target.closest('.paper-row');
        if (!row) return;
        const paper = getPaperById(row.dataset.id);
        if (!paper) return;

        if (e.target.classList.contains('paper-row-category')) {
            const val = e.target.value.trim();
            if (val && val !== paper.category) {
                paper.category = val;
                categoryRegroupPending = true;
            } else {
                e.target.value = paper.category;
            }
        } else if (e.target.classList.contains('paper-row-name')) {
            const val = e.target.value.trim();
            if (val) paper.name = val;
            else e.target.value = paper.name;
        } else if (e.target.classList.contains('paper-row-thickness')) {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val > 0) paper.thickness = val;
            else e.target.value = String(paper.thickness);
        }

        // The edited row stays in place (no re-render), so focus moves on normally with Tab
        savePapers(papersData);
        renderPaperOptions(paperSelect.value);
        refreshCategoryDatalist();
        storageWarning.classList.toggle('hidden', storageAvailable);
        calculate();
    });

    // Regroup rows under their new category once focus has left the list
    paperListEl.addEventListener('focusout', (e) => {
        if (categoryRegroupPending && !paperListEl.contains(e.relatedTarget)) {
            renderPaperManagementList();
        }
    });

    paperListEl.addEventListener('click', (e) => {
        if (!e.target.classList.contains('paper-row-delete')) return;
        const row = e.target.closest('.paper-row');
        if (!row) return;

        if (papersData.papers.length <= 1) {
            alert('Трябва да остане поне една хартия в списъка.');
            return;
        }

        papersData.papers = papersData.papers.filter(p => p.id !== row.dataset.id);
        if (!getPaperById(papersData.defaultId)) papersData.defaultId = papersData.papers[0].id;
        savePapers(papersData);
        renderPaperManagementList();
        renderPaperOptions();
        calculate();
    });

    addPaperBtn.addEventListener('click', () => {
        const category = newPaperCategoryInput.value.trim();
        const name = newPaperNameInput.value.trim();
        const thickness = parseFloat(newPaperThicknessInput.value);

        if (!category || !name || isNaN(thickness) || thickness <= 0) {
            alert('Моля, попълнете категория, име и валидна дебелина (в мм).');
            return;
        }

        let id;
        do {
            id = 'p' + (papersData.nextId++);
        } while (getPaperById(id));
        papersData.papers.push({ id, category, name, thickness });
        savePapers(papersData);

        newPaperCategoryInput.value = '';
        newPaperNameInput.value = '';
        newPaperThicknessInput.value = '';

        renderPaperManagementList();
        renderPaperOptions(id);
        calculate();
    });

    resetPapersBtn.addEventListener('click', () => {
        const confirmed = confirm('Сигурни ли сте, че искате да върнете фабричните хартии? Всички добавени и редактирани хартии ще бъдат изтрити.');
        if (!confirmed) return;

        papersData = seedDefaultPapers();
        savePapers(papersData);
        renderPaperManagementList();
        renderPaperOptions(papersData.defaultId);
        calculate();
    });

    function openPaperModal() {
        renderPaperManagementList();
        paperModalOverlay.classList.remove('hidden');
    }

    function closePaperModal() {
        paperModalOverlay.classList.add('hidden');
    }

    manageBtn.addEventListener('click', openPaperModal);
    modalCloseBtn.addEventListener('click', closePaperModal);
    modalDoneBtn.addEventListener('click', closePaperModal);
    paperModalOverlay.addEventListener('click', (e) => {
        if (e.target === paperModalOverlay) closePaperModal();
    });

    // Build the paper dropdown, then run the initial calculation
    renderPaperOptions();
    calculate();
});
