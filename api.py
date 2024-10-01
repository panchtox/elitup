from flask import Blueprint, jsonify, request
from models import Article, Evidence, db
from sqlalchemy import func, or_
from datetime import datetime
from report_generator import generate_report
from marshmallow import Schema, fields, ValidationError

api = Blueprint('api', __name__)

# Existing code...

@api.route('/bulk_classify', methods=['POST'])
def bulk_classify():
    data = request.json
    status = data.get('status')
    filters = data.get('filters', {})

    if status not in ['No relevante', 'Relevante', 'Reportable']:
        return jsonify({'error': 'Invalid status'}), 400

    query = Article.query.filter_by(is_historical=False, status='No clasificado')

    # Apply filters
    if filters.get('search'):
        search_query = filters['search']
        query = query.filter(or_(
            Article.title.ilike(f'%{search_query}%'),
            Article.englishAbstract.ilike(f'%{search_query}%'),
            Article.spanishAbstract.ilike(f'%{search_query}%'),
            Article.portugueseAbstract.ilike(f'%{search_query}%')
        ))
    if filters.get('owner'):
        query = query.filter(Article.owner == filters['owner'])
    if filters.get('pais'):
        query = query.filter(Article.pais == filters['pais'])
    if filters.get('producto'):
        query = query.filter(Article.producto == filters['producto'])
    if filters.get('start_date'):
        query = query.filter(Article.dateOfHit >= datetime.strptime(filters['start_date'], '%Y-%m-%d').date())
    if filters.get('end_date'):
        query = query.filter(Article.dateOfHit <= datetime.strptime(filters['end_date'], '%Y-%m-%d').date())

    articles = query.all()
    count = len(articles)

    for article in articles:
        article.status = status

    try:
        db.session.commit()
        return jsonify({'success': True, 'count': count}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An error occurred while classifying articles', 'details': str(e)}), 500

# Existing code...
