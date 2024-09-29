from app import create_app
from models import Article, db

def check_database():
    app = create_app()
    with app.app_context():
        article_count = Article.query.count()
        print(f"Number of articles in the database: {article_count}")
        
        if article_count > 0:
            sample_article = Article.query.first()
            if sample_article:
                print(f"Sample article: {sample_article.title}")
            else:
                print("Error: Article found but unable to access its properties.")
        else:
            print("No articles found in the database.")

if __name__ == "__main__":
    check_database()
