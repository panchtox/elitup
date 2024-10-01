document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');

    // Function to update the article list
    function updateArticleList() {
        console.log('updateArticleList function called');
        const articlesTable = document.getElementById('articlesTable');
        if (!articlesTable) {
            console.error('Articles table not found in the DOM');
            return;
        }

        const tableBody = articlesTable.querySelector('tbody');
        if (!tableBody) {
            console.error('Table body not found in the articles table');
            return;
        }

        // Clear existing rows
        tableBody.innerHTML = '';

        // Get all article rows
        const articleRows = document.querySelectorAll('.article-row');
        console.log(`Found ${articleRows.length} article rows`);

        articleRows.forEach((row, index) => {
            const newRow = document.createElement('tr');
            newRow.className = 'article-row';
            newRow.setAttribute('data-id', row.getAttribute('data-id'));

            // Add row number
            const rowNumberCell = document.createElement('td');
            rowNumberCell.textContent = index + 1;
            newRow.appendChild(rowNumberCell);

            // Add other cells
            ['owner', 'pais', 'producto', 'title', 'dateOfHit'].forEach(field => {
                const cell = document.createElement('td');
                const fieldElement = row.querySelector(`.${field}`);
                if (fieldElement) {
                    cell.textContent = fieldElement.textContent;
                } else {
                    console.warn(`Field ${field} not found for article ${row.getAttribute('data-id')}`);
                    cell.textContent = 'N/A';
                }
                newRow.appendChild(cell);
            });

            // Add status cell
            const statusCell = document.createElement('td');
            statusCell.className = 'status';
            const statusElement = row.querySelector('.status');
            if (statusElement) {
                statusCell.textContent = statusElement.textContent;
            } else {
                console.warn(`Status not found for article ${row.getAttribute('data-id')}`);
                statusCell.textContent = 'Unknown';
            }
            newRow.appendChild(statusCell);

            // Add action buttons
            const actionCell = document.createElement('td');
            actionCell.innerHTML = `
                <button class="classify-btn" data-status="Relevante">Relevante</button>
                <button class="classify-btn" data-status="Reportable">Reportable</button>
                <button class="view-btn">View</button>
            `;
            newRow.appendChild(actionCell);

            tableBody.appendChild(newRow);
        });

        // Add event listeners for the new buttons
        addEventListeners();
    }

    // Function to add event listeners
    function addEventListeners() {
        console.log('Adding event listeners');
        const classifyButtons = document.querySelectorAll('.classify-btn');
        const viewButtons = document.querySelectorAll('.view-btn');

        classifyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const articleId = this.closest('.article-row').getAttribute('data-id');
                const newStatus = this.getAttribute('data-status');
                console.log(`Classifying article ${articleId} as ${newStatus}`);
                classifyArticle(articleId, newStatus);
            });
        });

        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const articleId = this.closest('.article-row').getAttribute('data-id');
                console.log(`Viewing article ${articleId}`);
                viewArticle(articleId);
            });
        });
    }

    // Function to classify an article
    function classifyArticle(articleId, newStatus) {
        console.log(`classifyArticle called with articleId: ${articleId}, newStatus: ${newStatus}`);
        fetch('/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `article_id=${articleId}&status=${newStatus}`
        })
        .then(response => response.json())
        .then(data => {
            console.log('Classification response:', data);
            if (data.success) {
                const articleRow = document.querySelector(`.article-row[data-id="${articleId}"]`);
                if (articleRow) {
                    const statusCell = articleRow.querySelector('.status');
                    if (statusCell) {
                        statusCell.textContent = newStatus;
                        articleRow.classList.remove(data.oldStatus);
                        articleRow.classList.add(newStatus);
                    } else {
                        console.error(`Status cell not found for article ${articleId}`);
                    }
                } else {
                    console.error(`Article row not found for article ${articleId}`);
                }
            } else {
                console.error('Classification failed:', data);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // Function to view an article
    function viewArticle(articleId) {
        console.log(`viewArticle called with articleId: ${articleId}`);
        fetch(`/get_article/${articleId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Article data:', data);
            const modal = document.getElementById('articleModal');
            if (!modal) {
                console.error('Modal element not found');
                return;
            }
            for (const [key, value] of Object.entries(data)) {
                const element = modal.querySelector(`#${key}`);
                if (element) {
                    if (key === 'sourceUrl') {
                        element.href = value;
                        element.textContent = value;
                    } else if (key === 'status') {
                        element.value = value;
                    } else {
                        element.textContent = value;
                    }
                } else {
                    console.warn(`Element with id '${key}' not found in modal`);
                }
            }
            modal.style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
    }

    // Add event listener for bulk classification
    const classifyAllUnclassifiedBtn = document.getElementById('classifyAllUnclassified');
    if (classifyAllUnclassifiedBtn) {
        classifyAllUnclassifiedBtn.addEventListener('click', classifyAllUnclassified);
    } else {
        console.warn('Classify All Unclassified button not found');
    }

    // Function to classify all unclassified articles as 'No relevante'
    function classifyAllUnclassified() {
        console.log('classifyAllUnclassified function called');
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
            console.log('Bulk classification response:', data);
            if (data.success) {
                alert(`Successfully classified ${data.count} articles as "No relevante".`);
                updateArticleList();
            } else {
                console.error('Bulk classification failed:', data);
                alert('An error occurred while classifying articles.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while classifying articles.');
        });
    }

    // Function to close the modal
    function closeModal() {
        const modal = document.getElementById('articleModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Add event listener for closing the modal
    const closeButton = document.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    } else {
        console.warn('Close button for modal not found');
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('articleModal');
        if (event.target == modal) {
            closeModal();
        }
    });

    // Initial setup
    updateArticleList();
    console.log('Initial setup completed');
});
