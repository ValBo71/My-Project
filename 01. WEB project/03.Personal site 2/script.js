document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Playwright Test Simulator Logic
    const btnRunTests = document.getElementById('btn-run-tests');
    const terminalScreen = document.getElementById('terminal-screen');
    const testStatus = document.getElementById('test-status');

    const testLogs = [
        { text: '$ npx playwright test', type: 'command' },
        { text: 'Running 13 tests using 4 workers...', type: 'output' },
        { text: '', type: 'output' },
        { text: '[chromium] › login.spec.ts:12:3 › E2E authentication flow', type: 'header' },
        { text: '  ✔  [chromium] › Navigate to landing page (350ms)', type: 'pass' },
        { text: '  ✔  [chromium] › Fill username and password credentials (420ms)', type: 'pass' },
        { text: '  ✔  [chromium] › Click Submit button (110ms)', type: 'pass' },
        { text: '  ✔  [chromium] › Assert dashboard redirection (80ms)', type: 'pass' },
        { text: '', type: 'output' },
        { text: '[chromium] › checkout.spec.ts:24:5 › credit card transaction integration', type: 'header' },
        { text: '  ✔  [chromium] › Add product to shopping cart (240ms)', type: 'pass' },
        { text: '  ✔  [chromium] › Assert correct cart total (50ms)', type: 'pass' },
        { text: '  ✔  [chromium] › Navigate to checkout portal (310ms)', type: 'pass' },
        { text: '  ✔  [chromium] › Execute Stripe sandbox payment (650ms)', type: 'pass' },
        { text: '  ✔  [chromium] › Assert transaction confirmation ID (140ms)', type: 'pass' },
        { text: '', type: 'output' },
        { text: '[chromium] › api.spec.ts:44:8 › API Gateway contract testing', type: 'header' },
        { text: '  ✔  [chromium] › GET /api/v1/catalog - HTTP 200 OK (110ms)', type: 'pass' },
        { text: '  ✔  [chromium] › POST /api/v1/checkout - Validation check (95ms)', type: 'pass' },
        { text: '  ✔  [chromium] › GET /api/v1/auth/session - Active validation (55ms)', type: 'pass' },
        { text: '', type: 'output' },
        { text: '  13 passed (2.7s)', type: 'summary-pass' },
        { text: '  Result: SUCCESS', type: 'final-pass' }
    ];

    let running = false;

    btnRunTests.addEventListener('click', () => {
        if (running) return;
        running = true;
        
        // Update button & status states
        btnRunTests.classList.add('disabled');
        btnRunTests.textContent = 'Тестване...';
        testStatus.textContent = 'RUNNING';
        testStatus.className = 'test-status-pill running';

        // Clear terminal screen
        terminalScreen.innerHTML = '';
        
        let logIndex = 0;

        function printNextLog() {
            if (logIndex >= testLogs.length) {
                // Done running tests
                running = false;
                btnRunTests.classList.remove('disabled');
                btnRunTests.textContent = 'Рестартирай';
                testStatus.textContent = 'PASSED';
                testStatus.className = 'test-status-pill passed';
                return;
            }

            const log = testLogs[logIndex];
            const logLine = document.createElement('div');
            
            if (log.text === '') {
                logLine.innerHTML = '&nbsp;';
            } else {
                logLine.textContent = log.text;
            }

            // Assign CSS classes based on log type
            if (log.type === 'command') {
                logLine.className = 'line prompt';
            } else if (log.type === 'header') {
                logLine.className = 'line test-running';
            } else if (log.type === 'pass') {
                logLine.className = 'line test-passed';
            } else if (log.type === 'summary-pass' || log.type === 'final-pass') {
                logLine.className = 'line test-passed';
                logLine.style.fontWeight = 'bold';
            } else {
                logLine.className = 'line output';
            }

            terminalScreen.appendChild(logLine);
            
            // Auto scroll to bottom
            terminalScreen.scrollTop = terminalScreen.scrollHeight;

            logIndex++;
            
            // Determine delays dynamically to simulate real timings
            let delay = 150;
            if (log.type === 'command') delay = 400;
            if (log.type === 'header') delay = 350;
            if (log.type === 'summary-pass') delay = 500;

            setTimeout(printNextLog, delay);
        }

        // Start the log print loop
        printNextLog();
    });

    // 2. Tech Stack Filter Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const stackItems = document.querySelectorAll('.stack-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active state from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active state to clicked button
            e.target.classList.add('active');

            const filterValue = e.target.getAttribute('data-filter');

            stackItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 3. Artifacts Tab Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Set clicked button to active
            e.target.classList.add('active');

            // Find matching content area
            const tabId = e.target.getAttribute('data-tab');
            const targetContent = document.getElementById(`tab-${tabId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // 4. Contact Form Submission Mock
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            const name = document.getElementById('name').value;
            alert(`Благодаря Ви, ${name}! Вашето съобщение беше изпратено успешно. Ще се свържа с Вас възможно най-скоро.`);
            contactForm.reset();
        });
    }

});
