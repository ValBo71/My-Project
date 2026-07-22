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
    localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(data));
}

function loadPapers() {
    try {
        const raw = localStorage.getItem(PAPERS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.papers) && parsed.papers.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        // Corrupt storage - fall through to re-seeding defaults
    }
    const seeded = seedDefaultPapers();
    savePapers(seeded);
    return seeded;
}

function escapeAttr(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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

    // Sync Slider -> Number Input
    pagesRange.addEventListener('input', (e) => {
        pagesInput.value = e.target.value;
        calculate();
    });

    // Sync Number Input -> Slider
    pagesInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value) || 0;
        if (val >= 4 && val <= 1000) {
            pagesRange.value = val;
        }
        calculate();
    });

    // Enforce constraints on blur
    pagesInput.addEventListener('blur', (e) => {
        let val = parseInt(e.target.value) || 200;
        
        if (val < 4) val = 4;
        if (val > 2000) val = 2000;
        
        // Ensure even number
        if (val % 2 !== 0) {
            val = Math.round(val / 2) * 2;
        }
        
        pagesInput.value = val;
        if (val <= 1000) {
            pagesRange.value = val;
        }
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

    // Main calculation function
    function calculate() {
        const pages = parseInt(pagesInput.value) || 0;
        const selectedPaper = getPaperById(paperSelect.value);
        const paperThickness = selectedPaper ? selectedPaper.thickness : 0;
        const signatureSize = parseInt(signatureSizeSelect.value) || 16;
        const isSewn = sewingCheckbox.checked;
        const isHardcover = coverHardRadio.checked;

        if (pages <= 0) {
            resultSpine.textContent = "0.00";
            resultCreep.textContent = "0.00";
            return;
        }

        // 1. Calculate Spine Thread Swelling based on Signature Size
        // Smaller signatures accumulate more thread layers at the fold
        let swellingFactor = 1.0;
        if (isSewn) {
            switch (signatureSize) {
                case 4:
                    swellingFactor = 1.12; // +12%
                    break;
                case 8:
                    swellingFactor = 1.10; // +10%
                    break;
                case 16:
                    swellingFactor = 1.08; // +8%
                    break;
                case 32:
                    swellingFactor = 1.05; // +5%
                    break;
                default:
                    swellingFactor = 1.08;
            }
        }

        let blockThickness = paperThickness * (pages / 2) * swellingFactor;

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

        // 2. Creep Calculation based on Signature Size (nested sheets)
        // Only applies when pages are folded/sewn into signatures - unsewn (single-sheet) binding has no creep
        // Creep = (Signature Size / 4 - 1) * Paper Thickness
        const creepValue = isSewn ? Math.max(0, (signatureSize / 4 - 1) * paperThickness) : 0;

        // Rounding results to 2 decimal places
        const spineFormatted = spineWidth.toFixed(2);
        const creepFormatted = creepValue.toFixed(2);

        // Update UI labels
        resultSpine.textContent = spineFormatted;
        resultCreep.textContent = creepFormatted;
        legendSpine.textContent = `${spineFormatted} мм`;
        legendCreep.textContent = `${creepFormatted} мм`;
        
        previewSpineText.textContent = `ГРЪБЧЕ • ${pages} СТР.`;

        // Update Book Spine Width CSS variable (1mm = 6.5px)
        const spinePixels = Math.max(12, Math.min(190, spineWidth * 6.5));
        document.documentElement.style.setProperty('--spine-width-px', `${spinePixels}px`);
    }

    // Helper for button controls (+4 / -4)
    window.adjustPages = function(delta) {
        let currentVal = parseInt(pagesInput.value) || 200;
        let newVal = currentVal + delta;

        if (newVal < 4) newVal = 4;
        if (newVal > 2000) newVal = 2000;

        pagesInput.value = newVal;
        if (newVal <= 1000) {
            pagesRange.value = newVal;
        }

        calculate();
    };

    // Rebuilds the <select> options from papersData, grouped into <optgroup>s by category.
    // Keeps the previously selected paper selected when it still exists.
    function renderPaperOptions(preserveId) {
        const idToRestore = preserveId !== undefined ? preserveId : (paperSelect.value || papersData.defaultId);

        paperSelect.innerHTML = '';
        const categories = [...new Set(papersData.papers.map(p => p.category))];
        categories.forEach(category => {
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

    function refreshCategoryDatalist() {
        paperCategoriesDatalist.innerHTML = '';
        [...new Set(papersData.papers.map(p => p.category))].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            paperCategoriesDatalist.appendChild(option);
        });
    }

    function renderPaperManagementList() {
        paperListEl.innerHTML = '';
        const categories = [...new Set(papersData.papers.map(p => p.category))];
        categories.forEach(category => {
            const heading = document.createElement('div');
            heading.className = 'paper-list-category';
            heading.textContent = category;
            paperListEl.appendChild(heading);

            papersData.papers
                .filter(p => p.category === category)
                .forEach(p => {
                    const row = document.createElement('div');
                    row.className = 'paper-row';
                    row.dataset.id = p.id;
                    row.innerHTML = `
                        <input type="text" class="paper-row-category" value="${escapeAttr(p.category)}" aria-label="Категория">
                        <input type="text" class="paper-row-name" value="${escapeAttr(p.name)}" aria-label="Име на хартията">
                        <input type="number" class="paper-row-thickness" value="${p.thickness}" step="0.001" min="0.001" aria-label="Дебелина в мм">
                        <button type="button" class="paper-row-delete" aria-label="Изтрий хартия">✕</button>
                    `;
                    paperListEl.appendChild(row);
                });
        });
        refreshCategoryDatalist();
    }

    // Delegated listeners: rows are re-created on every render, so bind once on the container.
    paperListEl.addEventListener('change', (e) => {
        const row = e.target.closest('.paper-row');
        if (!row) return;
        const paper = getPaperById(row.dataset.id);
        if (!paper) return;

        if (e.target.classList.contains('paper-row-category')) {
            const val = e.target.value.trim();
            if (val) paper.category = val;
        } else if (e.target.classList.contains('paper-row-name')) {
            const val = e.target.value.trim();
            if (val) paper.name = val;
        } else if (e.target.classList.contains('paper-row-thickness')) {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val > 0) paper.thickness = val;
        }

        savePapers(papersData);
        renderPaperManagementList();
        renderPaperOptions(paperSelect.value);
        calculate();
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

        const id = 'p' + (papersData.nextId++);
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
