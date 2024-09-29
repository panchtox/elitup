from flask import Blueprint, jsonify, request
from models import Article, Evidence, db
from sqlalchemy import func, or_
from datetime import datetime
from report_generator import generate_report

api = Blueprint('api', __name__)

@api.route('/articles', methods=['GET'])
def get_articles():
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
    return jsonify([{
        'id': article.id,
        'articleSourceId': article.articleSourceId,
        'sourceUrl': article.sourceUrl,
        'title': article.title,
        'owner': article.owner,
        'pais': article.pais,
        'producto': article.producto,
        'dateOfHit': article.dateOfHit.isoformat(),
        'status': article.status
    } for article in articles])

@api.route('/articles/<int:article_id>', methods=['GET'])
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

@api.route('/articles/<int:article_id>/classify', methods=['POST'])
def classify_article(article_id):
    article = Article.query.get_or_404(article_id)
    status = request.json.get('status')
    if status not in ['No relevante', 'Relevante', 'Reportable']:
        return jsonify({'error': 'Invalid status'}), 400
    article.status = status
    db.session.commit()
    return jsonify({'success': True, 'status': article.status})

@api.route('/report', methods=['POST'])
def generate_report_api():
    data = request.json
    start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date()
    end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date()
    owner = data.get('owner')
    pais = data.get('pais')
    productos = data.get('productos', [])

    articles = Article.query.filter(
        Article.dateOfHit.between(start_date, end_date),
        Article.owner == owner,
        Article.pais == pais,
        Article.producto.in_(productos) if 'All' not in productos else True,
        Article.status != 'No relevante'
    ).all()

    unclassified = Article.query.filter(
        Article.dateOfHit.between(start_date, end_date),
        Article.owner == owner,
        Article.pais == pais,
        Article.producto.in_(productos) if 'All' not in productos else True,
        Article.status == 'No relevante'
    ).count()

    if unclassified > 0:
        return jsonify({'error': f'There are {unclassified} unclassified articles in the selected period'}), 400

    evidence = Evidence.query.filter(
        Evidence.searchDate.between(start_date, end_date),
        Evidence.owner == owner,
        Evidence.pais == pais,
        Evidence.producto.in_(productos) if 'All' not in productos else True
    ).all()

    report_file = generate_report(articles, evidence)

    for article in articles:
        article.is_historical = True
    db.session.commit()

    return jsonify({'message': 'Report generated successfully', 'file': 'report.xlsx'})

