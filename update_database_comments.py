from app import create_app, db
from models import Article
from sqlalchemy import text

def add_comments_field():
    app = create_app()
    with app.app_context():
        # Check if the column already exists
        inspector = db.inspect(db.engine)
        columns = [c['name'] for c in inspector.get_columns('article')]
        if 'comments' not in columns:
            # Add the new column
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE article ADD COLUMN comments TEXT'))
                conn.commit()
            print("Added 'comments' column to the Article table.")
        else:
            print("'comments' column already exists in the Article table.")

if __name__ == "__main__":
    add_comments_field()
