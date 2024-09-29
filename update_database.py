from app import create_app, db
from models import Article

def update_default_status():
    app = create_app()
    with app.app_context():
        articles = Article.query.filter_by(status="No relevante").all()
        for article in articles:
            article.status = "No clasificado"
        db.session.commit()
        print(f"Updated {len(articles)} articles to 'No clasificado' status.")

if __name__ == "__main__":
    update_default_status()
