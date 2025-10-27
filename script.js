document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('text-input');
    const checkButton = document.getElementById('check-button');
    const resultsSection = document.getElementById('results-section');

    checkButton.addEventListener('click', checkGrammar);

    async function checkGrammar() {
        const text = textInput.value.trim();
        
        if (!text) {
            showResult('Please enter some text to check.', 'error');
            return;
        }

        if (text.split(/\s+/).length < 2) {
            showResult('Please enter at least 2 words for better checking.', 'error');
            return;
        }

        showLoading();

        try {
            const response = await fetch('/api/grammar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Error: ${response.status}`);
            }

            if (data.error) {
                throw new Error(data.error);
            }

            displayResults(data);
        } catch (error) {
            console.error('Error:', error);
            showResult(error.message, 'error');
        }
    }

    function showLoading() {
        resultsSection.innerHTML = `
            <div class="flex flex-col items-center justify-center space-y-4 py-4">
                <div class="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p class="text-slate-400 text-sm">Checking grammar...</p>
            </div>
        `;
        checkButton.disabled = true;
        checkButton.innerHTML = 'Checking...';
    }

    function showResult(message, type = 'info') {
        const colorClass = type === 'error' ? 'text-red-400' : 'text-green-400';
        resultsSection.innerHTML = `
            <div class="text-center py-4">
                <p class="${colorClass}">${message}</p>
            </div>
        `;
        resetButton();
    }

    function displayResults(data) {
        if (data.has_corrections) {
            resultsSection.innerHTML = `
                <div class="space-y-4 py-2">
                    <div>
                        <h3 class="text-sm font-medium text-slate-400 mb-2">Original Text:</h3>
                        <p class="text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700">${escapeHtml(data.original_text)}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-slate-400 mb-2">Corrected Text:</h3>
                        <p class="text-green-300 bg-slate-800/50 p-3 rounded-lg border border-green-900/50">${escapeHtml(data.corrected_text)}</p>
                    </div>
                    <div class="text-center">
                        <span class="inline-flex items-center gap-1 text-green-400 text-sm">
                            <span class="material-symbols-outlined text-sm">check_circle</span>
                            Grammar check completed
                        </span>
                    </div>
                </div>
            `;
        } else {
            resultsSection.innerHTML = `
                <div class="text-center py-4">
                    <span class="material-symbols-outlined text-green-400 text-4xl mb-2">check_circle</span>
                    <p class="text-green-400 font-medium">No grammar errors found!</p>
                    <p class="text-slate-400 text-sm mt-2">Your text looks perfect.</p>
                </div>
            `;
        }
        resetButton();
    }

    function resetButton() {
        checkButton.disabled = false;
        checkButton.innerHTML = 'Check Grammar';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Ctrl+Enter to check
    textInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            checkGrammar();
        }
    });
});