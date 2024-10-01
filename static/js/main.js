document.addEventListener('DOMContentLoaded', function() {
    // Existing code...

    // Bulk classify button
    const bulkClassifyBtn = document.getElementById('bulkClassifyBtn');
    if (bulkClassifyBtn) {
        bulkClassifyBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to classify all unclassified articles as "No relevante"?')) {
                fetch('/api/bulk_classify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: 'No relevante',
                        // Include current filter parameters
                        filters: {
                            search: document.querySelector('input[name="search"]').value,
                            owner: document.querySelector('select[name="owner"]').value,
                            pais: document.querySelector('select[name="pais"]').value,
                            producto: document.querySelector('select[name="producto"]').value,
                            status: document.querySelector('select[name="status"]').value,
                            start_date: document.querySelector('input[name="start_date"]').value,
                            end_date: document.querySelector('input[name="end_date"]').value
                        }
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(`Successfully classified ${data.count} articles as "No relevante".`);
                        // Refresh the article list
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
        });
    }

    // Existing code...
});

// Existing functions...
