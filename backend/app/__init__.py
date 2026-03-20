from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    from app.routes.church import church_bp
    from app.routes.members import members_bp
    from app.routes.activities import activities_bp
    from app.routes.finance import finance_bp

    app.register_blueprint(church_bp, url_prefix='/api/church')
    app.register_blueprint(members_bp, url_prefix='/api/members')
    app.register_blueprint(activities_bp, url_prefix='/api/activities')
    app.register_blueprint(finance_bp, url_prefix='/api/finance')

    return app
