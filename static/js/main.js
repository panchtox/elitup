document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('articleModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const classifyForm = document.getElementById('classifyForm');
    const reportForm = document.getElementById('reportForm');

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
                articleRow.classList.remove('bold', 'relevante', 'reportable');
                if (status !== 'No relevante') {
                    articleRow.classList.add(status.toLowerCase());
                }
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
        .then(response => {
            if (response.ok) {
                return response.blob();
            } else {
                return response.json().then(data => {
                    throw new Error(`Hay ${data.unclassified} artículos sin clasificar en el período seleccionado.`);
                });
            }
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'report.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            alert(error.message);
        });
    });
});
