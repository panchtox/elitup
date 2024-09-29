from app import db

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    articleSourceId = db.Column(db.String(255), nullable=False)
    sourceUrl = db.Column(db.String(255), nullable=False)
    title = db.Column(db.Text, nullable=False)
    englishAbstract = db.Column(db.Text)
    spanishAbstract = db.Column(db.Text)
    portugueseAbstract = db.Column(db.Text)
    owner = db.Column(db.String(255), nullable=False)
    pais = db.Column(db.String(255), nullable=False)
    producto = db.Column(db.String(255), nullable=False)
    dateOfHit = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default="No relevante")
    is_historical = db.Column(db.Boolean, default=False)

    def __init__(self, **kwargs):
        super(Article, self).__init__(**kwargs)

class Evidence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner = db.Column(db.String(255), nullable=False)
    pais = db.Column(db.String(255), nullable=False)
    producto = db.Column(db.String(255), nullable=False)
    searchStrategy = db.Column(db.Text, nullable=False)
    scope = db.Column(db.String(255), nullable=False)
    searchUrl = db.Column(db.Text, nullable=False)
    searchDate = db.Column(db.Date, nullable=False)
    articles_number = db.Column(db.Integer, nullable=False)

    def __init__(self, **kwargs):
        super(Evidence, self).__init__(**kwargs)
