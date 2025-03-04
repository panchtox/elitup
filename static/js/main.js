document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('articleModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const classifyForm = document.getElementById('classifyForm');
    const reportForm = document.getElementById('reportForm');
    const searchFilterForm = document.getElementById('searchFilterForm');

    function attachClassifyButtonListeners() {
        document.querySelectorAll('.classify-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const articleId = this.getAttribute('data-id');
                fetch(`/get_article/${articleId}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log('Full data object:', data);
                        document.getElementById('articleId').value = data.id;
                        document.getElementById('articleSourceId').textContent = data.articleSourceId;
                        const sourceUrlLink = document.getElementById('sourceUrl');
                        sourceUrlLink.href = data.sourceUrl;
                        sourceUrlLink.textContent = 'View Source';
                        document.getElementById('title').textContent = data.title;
                        document.getElementById('englishAbstract').textContent = data.englishAbstract;
                        document.getElementById('spanishAbstract').textContent = data.spanishAbstract;
                        document.getElementById('portugueseAbstract').textContent = data.portugueseAbstract;
                        document.querySelector('span#owner').textContent = data.owner || 'N/A';
                        document.querySelector('span#pais').textContent = data.pais || 'N/A';
                        document.getElementById('producto').textContent = data.producto;
                        document.getElementById('dateOfHit').textContent = data.dateOfHit;
                        document.getElementById('status').value = data.status;
                        document.getElementById('comments').value = data.comments || '';
                        modal.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Error fetching article data:', error);
                        alert('An error occurred while fetching article data. Please try again.');
                    });
            });
        });
    }

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    classifyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        classifyArticle(formData.get('article_id'), formData.get('status'), formData.get('comments'));
    });

    function attachQuickClassifyListeners() {
        document.querySelectorAll('.quick-classify-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const articleId = this.getAttribute('data-id');
                const status = this.getAttribute('data-status');
                classifyArticle(articleId, status, '');
            });
        });
    }

    function classifyArticle(articleId, status, comments) {
        fetch('/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `article_id=${articleId}&status=${status}&comments=${encodeURIComponent(comments)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const articleRow = document.querySelector(`tr[data-id="${articleId}"]`);
                articleRow.classList.remove('relevante', 'reportable', 'no-relevante', 'no-clasificado', 'bold');
                if (status === 'Relevante' || status === 'Reportable') {
                    articleRow.classList.add(status.toLowerCase());
                } else if (status === 'No clasificado') {
                    articleRow.classList.add('bold');
                }
                const statusCell = articleRow.querySelector('td:nth-child(8)');
                statusCell.textContent = status;
                modal.style.display = 'none';

                articleRow.style.transition = 'background-color 0.5s ease';
                articleRow.style.backgroundColor = '#ffff99';
                setTimeout(() => {
                    articleRow.style.backgroundColor = '';
                }, 1000);
            }
        });
    }

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
                
                updateArticleList();
            })
            .catch(error => {
                console.error('Error generating report:', error);
                alert('An error occurred while generating the report.');
            });
        });
    }

    function updateArticleList() {
        fetch(window.location.href)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newTable = doc.querySelector('table');
                const oldTable = document.querySelector('table');
                oldTable.innerHTML = newTable.innerHTML;
                
                attachClassifyButtonListeners();
                attachQuickClassifyListeners();
                attachSortingFunctionality();
                updateRowNumbers();
            });
    }

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
                
                attachClassifyButtonListeners();
                attachQuickClassifyListeners();
                attachSortingFunctionality();
                updateRowNumbers();

                history.pushState(null, '', url);
            });
    });

    function updateRowNumbers() {
        const rows = document.querySelectorAll('#articlesTable tbody tr');
        rows.forEach((row, index) => {
            const rowNumberCell = row.querySelector('.row-number');
            if (rowNumberCell) {
                rowNumberCell.textContent = index + 1;
            }
        });
    }

    attachClassifyButtonListeners();
    attachQuickClassifyListeners();
    attachSortingFunctionality();
    updateRowNumbers();
});

function attachSortingFunctionality() {
    const table = document.getElementById('articlesTable');
    const headers = table.querySelectorAll('th[data-sort]');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            const order = header.classList.contains('asc') ? 'desc' : 'asc';
            
            headers.forEach(h => h.classList.remove('asc', 'desc'));
            
            header.classList.add(order);
            
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            rows.sort((a, b) => {
                if (column === 'row-number') {
                    return order === 'asc' ? 
                        parseInt(a.querySelector('.row-number').textContent) - parseInt(b.querySelector('.row-number').textContent) : 
                        parseInt(b.querySelector('.row-number').textContent) - parseInt(a.querySelector('.row-number').textContent);
                }
                const aValue = a.querySelector(`td:nth-child(${Array.from(headers).indexOf(header) + 1})`).textContent.trim();
                const bValue = b.querySelector(`td:nth-child(${Array.from(headers).indexOf(header) + 1})`).textContent.trim();
                
                if (column === 'dateOfHit') {
                    return order === 'asc' ? 
                        new Date(aValue) - new Date(bValue) : 
                        new Date(bValue) - new Date(aValue);
                } else if (column === 'status') {
                    const statusOrder = ['No clasificado', 'No relevante', 'Relevante', 'Reportable'];
                    return order === 'asc' ?
                        statusOrder.indexOf(aValue) - statusOrder.indexOf(bValue) :
                        statusOrder.indexOf(bValue) - statusOrder.indexOf(aValue);
                } else {
                    return order === 'asc' ? 
                        aValue.localeCompare(bValue) : 
                        bValue.localeCompare(aValue);
                }
            });
            
            rows.forEach(row => tbody.appendChild(row));

            updateRowNumbers();
        });
    });
}