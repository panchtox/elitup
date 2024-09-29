from app import create_app
from models import Article, db

def check_database():
    app = create_app()
    with app.app_context():
        article_count = Article.query.count()
        print(f"Number of articles in the database: {article_count}")
        
        if article_count > 0:
            print("Sample articles:")
            sample_articles = Article.query.limit(5).all()
            for article in sample_articles:
                print(f"ID: {article.id}, Title: {article.title}, Owner: {article.owner}, País: {article.pais}, Producto: {article.producto}, Date of Hit: {article.dateOfHit}")
        else:
            print("No articles found in the database.")

if __name__ == "__main__":
    check_database()
