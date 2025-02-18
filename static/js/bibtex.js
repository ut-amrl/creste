document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copyBibtexBtn');
    const bibtexCode = document.getElementById('bibtexCode');

    copyBtn.addEventListener('click', () => {
        const text = bibtexCode.innerText;
        navigator.clipboard.writeText(text).then(() => {
            // Optional: provide visual feedback, e.g., temporarily change the icon or show a message
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch((err) => {
            console.error('Error copying text: ', err);
            alert('Failed to copy text. Please try manually.');
        });
    });
});
