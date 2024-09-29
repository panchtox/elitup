import csv
from datetime import datetime
from app import db, create_app
from models import Article, Evidence

def populate_database():
    app = create_app()
    with app.app_context():
        # Populate Articles
        with open('articles_structure_20240928.csv', 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                article = Article(
                    articleSourceId=row['articleSourceId'],
                    sourceUrl=row['sourceUrl'],
                    title=row['title'],
                    englishAbstract=row['englishAbstract'],
                    spanishAbstract=row['spanishAbstract'],
                    portugueseAbstract=row['portugueseAbstract'],
                    owner=row['owner'],
                    pais=row['pais'],
                    producto=row['producto'],
                    dateOfHit=datetime.strptime(row['dateOfHit'], '%Y-%m-%d').date()
                )
                db.session.add(article)

        # Populate Evidence
        with open('evidence_20240928.csv', 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                evidence = Evidence(
                    owner=row['owner'],
                    pais=row['pais'],
                    producto=row['producto'],
                    searchStrategy=row['searchStrategy'],
                    scope=row['scope'],
                    searchUrl=row['searchUrl'],
                    searchDate=datetime.strptime(row['searchDate'], '%Y-%m-%d').date(),
                    articles_number=int(row['articles_number'])
                )
                db.session.add(evidence)

        db.session.commit()

if __name__ == '__main__':
    populate_database()
    print("Database population complete.")
