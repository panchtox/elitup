import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///articles.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.urandom(24)

    db.init_app(app)

    with app.app_context():
        from models import Article, Evidence
        db.create_all()

    from routes import main
    app.register_blueprint(main)

    from api import api
    app.register_blueprint(api, url_prefix='/api')

    return app
