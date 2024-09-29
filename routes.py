from flask import Blueprint, render_template, request, jsonify, send_file
from models import Article, Evidence, db
from sqlalchemy import func, or_
from datetime import datetime
from report_generator import generate_report
import logging

main = Blueprint('main', __name__)

@main.route('/')
def index():
    logging.debug("Entering index route")
    
    search_query = request.args.get('search', '')
    owner_filter = request.args.get('owner', '')
    pais_filter = request.args.get('pais', '')
    producto_filter = request.args.get('producto', '')
    status_filter = request.args.get('status', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')

    query = Article.query.filter_by(is_historical=False)

    if search_query:
        query = query.filter(or_(
            Article.title.ilike(f'%{search_query}%'),
            Article.englishAbstract.ilike(f'%{search_query}%'),
            Article.spanishAbstract.ilike(f'%{search_query}%'),
            Article.portugueseAbstract.ilike(f'%{search_query}%')
        ))

    if owner_filter:
        query = query.filter(Article.owner == owner_filter)
    if pais_filter:
        query = query.filter(Article.pais == pais_filter)
    if producto_filter:
        query = query.filter(Article.producto == producto_filter)
    if status_filter:
        query = query.filter(Article.status == status_filter)
    if start_date:
        query = query.filter(Article.dateOfHit >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Article.dateOfHit <= datetime.strptime(end_date, '%Y-%m-%d').date())

    articles = query.all()
    logging.debug(f"Retrieved {len(articles)} articles from the database")

    owners = db.session.query(Article.owner.distinct()).all()
    paises = db.session.query(Article.pais.distinct()).all()
    productos = db.session.query(Article.producto.distinct()).all()
    logging.debug(f"Retrieved {len(owners)} owners, {len(paises)} paises, and {len(productos)} productos")

    return render_template('index.html', articles=articles, owners=owners, paises=paises, productos=productos,
                           search_query=search_query, owner_filter=owner_filter, pais_filter=pais_filter,
                           producto_filter=producto_filter, status_filter=status_filter,
                           start_date=start_date, end_date=end_date)

@main.route('/get_article/<int:article_id>')
def get_article(article_id):
    article = Article.query.get_or_404(article_id)
    return jsonify({
        'id': article.id,
        'articleSourceId': article.articleSourceId,
        'sourceUrl': article.sourceUrl,
        'title': article.title,
        'englishAbstract': article.englishAbstract,
        'spanishAbstract': article.spanishAbstract,
        'portugueseAbstract': article.portugueseAbstract,
        'owner': article.owner,
        'pais': article.pais,
        'producto': article.producto,
        'dateOfHit': article.dateOfHit.isoformat(),
        'status': article.status
    })

@main.route('/classify', methods=['POST'])
def classify_article():
    article_id = request.form.get('article_id')
    status = request.form.get('status')
    
    article = Article.query.get(article_id)
    if article:
        old_status = article.status
        article.status = status
        db.session.commit()
        return jsonify({'success': True, 'oldStatus': old_status, 'newStatus': status})
    return jsonify({'success': False}), 404

@main.route('/generate_report', methods=['POST'])
def generate_report_route():
    start_date = datetime.strptime(request.form.get('start_date'), '%Y-%m-%d').date()
    end_date = datetime.strptime(request.form.get('end_date'), '%Y-%m-%d').date()
    owner = request.form.get('owner')
    pais = request.form.get('pais')
    productos = request.form.getlist('productos[]')

    articles = Article.query.filter(
        Article.dateOfHit.between(start_date, end_date),
        Article.owner == owner,
        Article.pais == pais,
        Article.producto.in_(productos) if 'All' not in productos else True,
        Article.status != "No clasificado",  # Include all classified articles
        Article.is_historical == False  # Only include current (non-historical) articles
    ).all()

    evidence = Evidence.query.filter(
        Evidence.searchDate.between(start_date, end_date),
        Evidence.owner == owner,
        Evidence.pais == pais,
        Evidence.producto.in_(productos) if 'All' not in productos else True
    ).all()

    report_file = generate_report(articles, evidence)

    for article in articles:
        article.is_historical = True  # Move all classified articles to historical pool
    db.session.commit()

    return send_file(report_file, as_attachment=True, download_name='report.xlsx', mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@main.route('/historical')
def historical():
    articles = Article.query.filter_by(is_historical=True).all()
    return render_template('index.html', articles=articles, historical=True)

@main.route('/download_report/<filename>')
def download_report(filename):
    return send_file(filename, as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
