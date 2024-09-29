import io
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

def generate_report(articles, evidence):
    wb = Workbook()
    
    # Evidence sheet
    ws_evidence = wb.active
    ws_evidence.title = "Evidence"
    headers = ["Owner", "País", "Producto", "Search Strategy", "Scope", "Search URL", "Search Date", "Articles Number"]
    ws_evidence.append(headers)
    for e in evidence:
        ws_evidence.append([e.owner, e.pais, e.producto, e.searchStrategy, e.scope, e.searchUrl, e.searchDate, e.articles_number])

    # Summary sheet
    ws_summary = wb.create_sheet("Summary")
    total_articles = len(articles)
    relevant_articles = len([a for a in articles if a.status == "Relevante"])
    reportable_articles = len([a for a in articles if a.status == "Reportable"])
    ws_summary.append(["Total Articles", total_articles])
    ws_summary.append(["Relevant Articles", relevant_articles])
    ws_summary.append(["Reportable Articles", reportable_articles])

    # Detail sheet
    ws_detail = wb.create_sheet("Detail")
    headers = ["Título", "Abstract", "Fecha de hit", "sourceUrl", "Categoría"]
    ws_detail.append(headers)
    for a in articles:
        abstract = a.spanishAbstract or a.englishAbstract or a.portugueseAbstract or ""
        ws_detail.append([a.title, abstract, a.dateOfHit, a.sourceUrl, a.status])

    # Style the sheets
    for ws in wb.worksheets:
        for cell in ws[1]:
            cell.font = Font(bold=True)
            cell.fill = PatternFill(start_color="DDDDDD", end_color="DDDDDD", fill_type="solid")

    # Save to memory
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return output
