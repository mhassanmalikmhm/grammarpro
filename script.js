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

        if (text.split(' ').length < 2) {
            showResult('Please enter at least 2 words for better grammar checking.', 'error');
            return;
        }

        // Show loading state
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
                throw new Error(data.error || 'Something went wrong');
            }

            if (data.error) {
                throw new Error(data.error);
            }

            displayResults(data);
        } catch (error) {
            console.error('Error:', error);
            showResult(`Error: ${error.message}`, 'error');
        }
    }

    function showLoading() {
        resultsSection.innerHTML = `
            <div class="flex flex-col items-center justify-center space-y-4">
                <div class="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p class="text-slate-400">Checking grammar...</p>
            </div>
        `;
        checkButton.disabled = true;
        checkButton.innerHTML = 'Checking...';
    }

    function showResult(message, type = 'info') {
        const colorClass = type === 'error' ? 'text-red-400' : 'text-slate-400';
        resultsSection.innerHTML = `<p class="${colorClass} text-center">${message}</p>`;
        resetButton();
    }

    function displayResults(data) {
        if (data.corrected_text && data.corrected_text !== data.original_text) {
            let html = `
                <div class="space-y-4">
                    <div>
                        <h3 class="text-sm font-medium text-slate-400 mb-2">Original Text:</h3>
                        <p class="text-slate-300 bg-slate-800/50 p-3 rounded-lg">${escapeHtml(data.original_text)}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-slate-400 mb-2">Corrected Text:</h3>
                        <p class="text-slate-300 bg-slate-800/50 p-3 rounded-lg">${escapeHtml(data.corrected_text)}</p>
                    </div>
            `;

            if (data.explanations && data.explanations.length > 0) {
                html += `
                    <div>
                        <h3 class="text-sm font-medium text-slate-400 mb-2">Explanations:</h3>
                        <ul class="space-y-2">
                `;
                data.explanations.forEach(exp => {
                    html += `
                        <li class="text-sm text-slate-300 bg-slate-800/30 p-2 rounded">
                            <span class="text-red-400">"${exp.original}"</span> → 
                            <span class="text-green-400">"${exp.corrected}"</span>
                            <br><span class="text-yellow-400 text-xs">${exp.explanation}</span>
                        </li>
                    `;
                });
                html += `</ul></div>`;
            }

            if (data.note) {
                html += `<p class="text-xs text-yellow-400 text-center">${data.note}</p>`;
            }

            html += `</div>`;
            resultsSection.innerHTML = html;
        } else {
            resultsSection.innerHTML = `
                <div class="text-center">
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

    // Allow Enter key to trigger check (with Ctrl/Cmd)
    textInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            checkGrammar();
        }
    });
});