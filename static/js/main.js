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
                    document.getElementById('articleId').value = data.id;
                    document.getElementById('articleSourceId').value = data.articleSourceId;
                    const sourceUrlLink = document.getElementById('sourceUrl');
                    sourceUrlLink.href = data.sourceUrl;
                    sourceUrlLink.textContent = 'View Source';
                    document.getElementById('title').value = data.title;
                    document.getElementById('englishAbstract').value = data.englishAbstract;
                    document.getElementById('spanishAbstract').value = data.spanishAbstract;
                    document.getElementById('portugueseAbstract').value = data.portugueseAbstract;
                    document.getElementById('owner').value = data.owner;
                    document.getElementById('pais').value = data.pais;
                    document.getElementById('producto').value = data.producto;
                    document.getElementById('dateOfHit').value = data.dateOfHit;
                    document.getElementById('status').value = data.status;
                    modal.style.display = 'block';
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
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch('/generate_report', {
            method: 'POST',
            body: formData
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'report.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            alert('Report generated and downloaded successfully.');
            
            // Update article list to reflect new historical status
            location.reload();
        })
        .catch(error => {
            alert('An error occurred while generating the report.');
        });
    });

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
                document.querySelectorAll('.classify-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const articleId = this.getAttribute('data-id');
                        fetch(`/get_article/${articleId}`)
                            .then(response => response.json())
                            .then(data => {
                                // Populate modal fields (same as before)
                                document.getElementById('articleId').value = data.id;
                                document.getElementById('articleSourceId').value = data.articleSourceId;
                                const sourceUrlLink = document.getElementById('sourceUrl');
                                sourceUrlLink.href = data.sourceUrl;
                                sourceUrlLink.textContent = 'View Source';
                                document.getElementById('title').value = data.title;
                                document.getElementById('englishAbstract').value = data.englishAbstract;
                                document.getElementById('spanishAbstract').value = data.spanishAbstract;
                                document.getElementById('portugueseAbstract').value = data.portugueseAbstract;
                                document.getElementById('owner').value = data.owner;
                                document.getElementById('pais').value = data.pais;
                                document.getElementById('producto').value = data.producto;
                                document.getElementById('dateOfHit').value = data.dateOfHit;
                                document.getElementById('status').value = data.status;
                                modal.style.display = 'block';
                            });
                    });
                });

                // Update URL without reloading the page
                history.pushState(null, '', url);
            });
    });
});
