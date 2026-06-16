document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Inputs
    const coverSoftRadio = document.getElementById('cover-soft');
    const coverHardRadio = document.getElementById('cover-hard');
    const pagesInput = document.getElementById('pages');
    const pagesRange = document.getElementById('pages-range');
    const paperSelect = document.getElementById('paper');
    
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
        const paperThickness = parseFloat(paperSelect.value) || 0;
        const isSewn = sewingCheckbox.checked;
        const isHardcover = coverHardRadio.checked;

        if (pages <= 0) {
            resultSpine.textContent = "0.00";
            resultCreep.textContent = "0.00";
            return;
        }

        // 1. Calculate Book Block Thickness
        let blockThickness = paperThickness * (pages / 2);
        
        // Apply 8% thread swelling if sewn
        if (isSewn) {
            blockThickness *= 1.08;
        }

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

        // 2. Creep Calculation
        const creepValue = (pages / 4) * paperThickness;

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

    // Run initial calculation
    calculate();
});
