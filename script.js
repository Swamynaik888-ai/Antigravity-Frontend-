// DOM Elements
const codeEditor = document.getElementById('code-editor');
const langSelect = document.getElementById('lang-select');
const fileNameDisplay = document.getElementById('file-name-display');
const debugBtn = document.getElementById('debug-btn');
const clearBtn = document.getElementById('clear-btn');

// State Elements
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const resultsState = document.getElementById('results-state');

// Result Elements
const resErrorType = document.getElementById('res-error-type');
const resErrorCategory = document.getElementById('res-error-category');
const resErrorMsg = document.getElementById('res-error-msg');
const resErrorLine = document.getElementById('res-error-line');
const resExplanation = document.getElementById('res-explanation');
const resFixCode = document.getElementById('res-fix-code');
const resLearning = document.getElementById('res-learning');

// Hybrid Engine Elements
const aiLoadingState = document.getElementById('ai-loading-state');
const aiEngineSection = document.getElementById('ai-engine-section');

const copyBtn = document.querySelector('.copy-btn');

// File extension mapping
const languageMap = {
    'python': 'main.py',
    'java': 'Main.java',
    'c': 'main.c'
};

// Mock Response Data for Prototype based on Language
const mockResponses = {
    'python': {
        type: 'ZeroDivisionError',
        msg: 'division by zero',
        explanation: 'You are trying to calculate the average of an empty list. Because the list has no items, the <code>count</code> is 0. Math doesn\'t allow dividing by zero!',
        fix: 'def calculate_average(numbers):\n    if not numbers:\n        return 0\n    total = sum(numbers)\n    count = len(numbers)\n    return total / count',
        learning: '<strong>Always check your boundaries!</strong> When writing functions that take collections (like lists or arrays), form a habit of asking: <em>"What happens if this is empty?"</em> This prevents unexpected crashes in production.'
    },
    'java': {
        type: 'NullPointerException',
        msg: 'Cannot invoke "String.length()" because "text" is null',
        explanation: 'You are attempting to find the length of a string variable named <code>text</code>, but it hasn\'t been initialized yet (it is `null`). You cannot perform actions on something that doesn\'t exist!',
        fix: 'public int getTextLength(String text) {\n    if (text == null) {\n        return 0;\n    }\n    return text.length();\n}',
        learning: '<strong>Beware the billion-dollar mistake!</strong> Null references cause countless crashes. Always validate inputs or use <code>Optional</code> to explicitly handle cases where data might be missing.'
    },
    'c': {
        type: 'Segmentation fault',
        msg: '(core dumped) Invalid memory reference',
        explanation: 'You are trying to access a memory location that your program isn\'t allowed to touch. This usually happens when an array index goes out of bounds or a pointer is pointing to dead/uninitialized memory.',
        fix: 'int getValue(int arr[], int size, int index) {\n    if (index < 0 || index >= size) {\n        return -1; // Or handle error appropriately\n    }\n    return arr[index];\n}',
        learning: '<strong>Memory is fragile!</strong> C doesn\'t hold your hand. Whenever you access an array or use a pointer, you must explicitly guarantee that the limits are respected. Memory safety is entirely up to you.'
    }
};

// Handle Language Change
langSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    fileNameDisplay.textContent = languageMap[lang];
    
    // Reset editor placeholder to a hint for the selected lang
    if (lang === 'python') {
        codeEditor.value = "def calculate_average(numbers):\n    total = sum(numbers)\n    count = len(numbers)\n    return total / count\n\nprint(calculate_average([]))";
    } else if (lang === 'java') {
        codeEditor.value = "class Main {\n    public static int getTextLength(String text) {\n        return text.length();\n    }\n    public static void main(String[] args) {\n        System.out.println(getTextLength(null));\n    }\n}";
    } else if (lang === 'c') {
        codeEditor.value = "#include <stdio.h>\n\nint getValue(int arr[], int size, int index) {\n    return arr[index];\n}\n\nint main() {\n    int my_array[5] = {1, 2, 3, 4, 5};\n    printf(\"%d\", getValue(my_array, 5, 10));\n    return 0;\n}";
    }
    
    // Automatically hide results to prompt running the new code
    showState(emptyState);
});

// Clear Code
clearBtn.addEventListener('click', () => {
    codeEditor.value = '';
    showState(emptyState);
});

// Hybrid Rule-Based Engine Logic
function runRuleEngine(code, lang) {
    let result = { type: 'Unknown Error', msg: 'Something went wrong', line: 'Line ?', category: 'Runtime Error' };
    
    if (lang === 'python') {
        if (code.includes('/ 0') || (code.includes('sum') && code.includes('[]'))) {
            result = { type: 'ZeroDivisionError', msg: 'division by zero', line: 'Line 4', category: 'Math Error' };
        } else if (code.match(/print\s+[a-zA-Z]/)) {
            result = { type: 'SyntaxError', msg: 'Missing parentheses in call to \'print\'', line: 'Line ' + (code.split('\n').findIndex(l => l.includes('print')) + 1), category: 'Syntax Error' };
        }
    } else if (lang === 'java') {
        if (code.includes('null')) {
            result = { type: 'NullPointerException', msg: 'Cannot invoke method because object is null', line: 'Line 6', category: 'Reference Error' };
        }
    } else if (lang === 'c') {
        if (code.includes('getValue')) {
            result = { type: 'Segmentation fault', msg: 'Invalid memory reference', line: 'Line 8', category: 'Memory Error' };
        }
    }
    
    return result;
}

// Handle Debug Action (Hybrid Flow)
debugBtn.addEventListener('click', () => {
    const code = codeEditor.value.trim();
    if (!code) {
        alert("Please paste some code first!");
        return;
    }

    // 1. Instant Rule Engine Detection
    const lang = langSelect.value;
    const ruleResult = runRuleEngine(code, lang);
    
    // Populate Rule Engine UI immediately
    resErrorType.textContent = ruleResult.type;
    resErrorCategory.textContent = ruleResult.category;
    resErrorMsg.textContent = ruleResult.msg;
    resErrorLine.textContent = ruleResult.line;

    // Reset AI UI visibility for the transition
    aiEngineSection.classList.add('hidden');
    aiLoadingState.classList.remove('hidden');

    // Show Results Panel instantly (Rule Engine part is visible)
    showState(resultsState);

    // 2. Simulated AI Teacher Processing Time
    // (We use a mock timeout here to represent the AI processing without needing an API key)
    setTimeout(() => {
        const response = mockResponses[lang] || mockResponses['python'];
        updateAIUI(response);
    }, 2500); // 2.5 second delay for dramatic AI effect
});

// Helper to update the DOM
function updateAIUI(response) {
    // Populate AI UI
    resExplanation.innerHTML = response.explanation;
    resFixCode.textContent = response.fix;
    resLearning.innerHTML = response.learning;

    // Hide Loading, Show AI Assistant
    aiLoadingState.classList.add('hidden');
    aiEngineSection.classList.remove('hidden');
}

// Copy Code Button
copyBtn.addEventListener('click', () => {
    const codeToCopy = resFixCode.textContent;
    navigator.clipboard.writeText(codeToCopy).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        copyBtn.style.color = 'var(--status-success)';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.color = 'var(--text-secondary)';
        }, 2000);
    });
});

// Helper for UI state switching
function showState(stateElement) {
    emptyState.classList.add('hidden');
    loadingState.classList.add('hidden');
    resultsState.classList.add('hidden');
    
    stateElement.classList.remove('hidden');
}

// Initial setup
showState(emptyState);

// Navigation Elements
const navBtns = document.querySelectorAll('.nav-btn');
const workspaceView = document.getElementById('workspace-view');
const dashboardView = document.getElementById('dashboard-view');

// Navigation Logic
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        navBtns.forEach(b => b.classList.remove('active'));
        // Add to clicked
        btn.classList.add('active');

        // Switch view
        const targetView = btn.getAttribute('data-view');
        if (targetView === 'workspace') {
            workspaceView.classList.remove('hidden');
            dashboardView.classList.add('hidden');
        } else if (targetView === 'dashboard') {
            workspaceView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
        }
    });
});
