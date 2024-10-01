document.addEventListener('DOMContentLoaded', function() {
    // Existing code...

    // Add event listener for bulk classification
    const classifyAllUnclassifiedBtn = document.getElementById('classifyAllUnclassified');
    if (classifyAllUnclassifiedBtn) {
        classifyAllUnclassifiedBtn.addEventListener('click', classifyAllUnclassified);
    }

    // Function to classify all unclassified articles as 'No relevante'
    function classifyAllUnclassified() {
        if (!confirm('Are you sure you want to classify all unclassified articles as "No relevante"?')) {
            return;
        }

        const currentUrl = new URL(window.location.href);
        const searchParams = currentUrl.searchParams;

        fetch('/api/classify_all_unclassified', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(searchParams))
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Successfully classified ${data.count} articles as "No relevante".`);
                updateArticleList();
            } else {
                alert('An error occurred while classifying articles.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while classifying articles.');
        });
    }

    // Existing code...
});

// Existing code...
