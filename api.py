from flask import Blueprint, jsonify, request
from models import Article, Evidence, db
from sqlalchemy import func, or_
from datetime import datetime
from report_generator import generate_report
from marshmallow import Schema, fields, ValidationError

api = Blueprint('api', __name__)

# Existing code...

@api.route('/classify_all_unclassified', methods=['POST'])
def classify_all_unclassified():
    data = request.json
    search_query = data.get('search', '')
    owner_filter = data.get('owner', '')
    pais_filter = data.get('pais', '')
    producto_filter = data.get('producto', '')
    start_date = data.get('start_date', '')
    end_date = data.get('end_date', '')

    query = Article.query.filter_by(is_historical=False, status='No clasificado')

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
    if start_date:
        query = query.filter(Article.dateOfHit >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Article.dateOfHit <= datetime.strptime(end_date, '%Y-%m-%d').date())

    count = query.update({Article.status: 'No relevante'}, synchronize_session=False)
    db.session.commit()

    return jsonify({'success': True, 'count': count})

# Existing code...
