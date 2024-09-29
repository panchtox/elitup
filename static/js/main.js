document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('articleModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const classifyForm = document.getElementById('classifyForm');
    const reportForm = document.getElementById('reportForm');
    const searchFilterForm = document.getElementById('searchFilterForm');

    // Open modal and populate fields
    document.querySelectorAll('.classify-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const articleId = this.getAttribute('data-id');
            fetch(`/get_article/${articleId}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Full data object:', data);
                    console.log('Owner from API:', data.owner);
                    console.log('País from API:', data.pais);
                    document.getElementById('articleId').value = data.id;
                    document.getElementById('articleSourceId').textContent = data.articleSourceId;
                    const sourceUrlLink = document.getElementById('sourceUrl');
                    sourceUrlLink.href = data.sourceUrl;
                    sourceUrlLink.textContent = 'View Source';
                    document.getElementById('title').textContent = data.title;
                    document.getElementById('englishAbstract').textContent = data.englishAbstract;
                    document.getElementById('spanishAbstract').textContent = data.spanishAbstract;
                    document.getElementById('portugueseAbstract').textContent = data.portugueseAbstract;
                    
                    const ownerElement = document.getElementById('owner');
                    const paisElement = document.getElementById('pais');
                    
                    if (ownerElement && paisElement) {
                        ownerElement.textContent = data.owner || 'N/A';
                        paisElement.textContent = data.pais || 'N/A';
                        console.log('Owner element after setting:', ownerElement.textContent);
                        console.log('País element after setting:', paisElement.textContent);
                    } else {
                        console.error('Owner or País element not found in the DOM');
                    }
                    
                    document.getElementById('producto').textContent = data.producto;
                    document.getElementById('dateOfHit').textContent = data.dateOfHit;
                    document.getElementById('status').value = data.status;
                    modal.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error fetching article data:', error);
                    alert('An error occurred while fetching article data. Please try again.');
                });
        });
    });

    // Close modal
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Classify article
    classifyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch('/classify', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const articleId = formData.get('article_id');
                const status = formData.get('status');
                const articleRow = document.querySelector(`tr[data-id="${articleId}"]`);
                articleRow.classList.remove('relevante', 'reportable', 'no-relevante', 'no-clasificado');
                if (status !== 'No clasificado') {
                    articleRow.classList.remove('bold');
                    articleRow.classList.add(status.toLowerCase().replace(' ', '-'));
                } else {
                    articleRow.classList.add('bold');
                }
                const statusCell = articleRow.querySelector('td:nth-child(7)');
                statusCell.textContent = status;
                modal.style.display = 'none';
            }
        });
    });

    // Generate report
    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            fetch('/generate_report', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                const contentDisposition = response.headers.get('Content-Disposition');
                const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/i);
                const filename = filenameMatch ? filenameMatch[1] : 'report.xlsx';
                return response.blob().then(blob => ({ blob, filename }));
            })
            .then(({ blob, filename }) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                alert('Report generated and downloaded successfully.');
                
                // Update article list to reflect new historical status
                updateArticleList();
            })
            .catch(error => {
                console.error('Error generating report:', error);
                alert('An error occurred while generating the report.');
            });
        });
    }

    // Function to update the article list
    function updateArticleList() {
        fetch(window.location.href)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newTable = doc.querySelector('table');
                const oldTable = document.querySelector('table');
                oldTable.innerHTML = newTable.innerHTML;
                
                // Re-attach event listeners to new classify buttons
                attachClassifyButtonListeners();
            });
    }

    // Function to attach event listeners to classify buttons
    function attachClassifyButtonListeners() {
        document.querySelectorAll('.classify-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const articleId = this.getAttribute('data-id');
                fetch(`/get_article/${articleId}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log('Full data object:', data);
                        console.log('Owner from API:', data.owner);
                        console.log('País from API:', data.pais);
                        document.getElementById('articleId').value = data.id;
                        document.getElementById('articleSourceId').textContent = data.articleSourceId;
                        const sourceUrlLink = document.getElementById('sourceUrl');
                        sourceUrlLink.href = data.sourceUrl;
                        sourceUrlLink.textContent = 'View Source';
                        document.getElementById('title').textContent = data.title;
                        document.getElementById('englishAbstract').textContent = data.englishAbstract;
                        document.getElementById('spanishAbstract').textContent = data.spanishAbstract;
                        document.getElementById('portugueseAbstract').textContent = data.portugueseAbstract;
                        
                        const ownerElement = document.getElementById('owner');
                        const paisElement = document.getElementById('pais');
                        
                        if (ownerElement && paisElement) {
                            ownerElement.textContent = data.owner || 'N/A';
                            paisElement.textContent = data.pais || 'N/A';
                            console.log('Owner element after setting:', ownerElement.textContent);
                            console.log('País element after setting:', paisElement.textContent);
                        } else {
                            console.error('Owner or País element not found in the DOM');
                        }
                        
                        document.getElementById('producto').textContent = data.producto;
                        document.getElementById('dateOfHit').textContent = data.dateOfHit;
                        document.getElementById('status').value = data.status;
                        modal.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Error fetching article data:', error);
                        alert('An error occurred while fetching article data. Please try again.');
                    });
            });
        });
    }

    // Search and filter form submission
    searchFilterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const searchParams = new URLSearchParams(formData);
        const url = `${window.location.pathname}?${searchParams.toString()}`;
        
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newTable = doc.querySelector('table');
                const oldTable = document.querySelector('table');
                oldTable.innerHTML = newTable.innerHTML;
                
                // Re-attach event listeners to new classify buttons
                attachClassifyButtonListeners();

                // Update URL without reloading the page
                history.pushState(null, '', url);
            });
    });

    // Initial attachment of classify button listeners
    attachClassifyButtonListeners();
});
