from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
import os
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()


def build_database_url():
    """Build a SQLAlchemy-compatible database URL for local Postgres or Supabase."""
    raw_url = os.getenv('SUPABASE_DB_URL') or os.getenv('DATABASE_URL')
    if not raw_url:
        raise RuntimeError('DATABASE_URL or SUPABASE_DB_URL must be set')

    # Some providers return postgres://; SQLAlchemy expects postgresql://
    if raw_url.startswith('postgres://'):
        raw_url = raw_url.replace('postgres://', 'postgresql://', 1)

    parsed = urlparse(raw_url)

    # Supabase requires SSL; enforce it when not present.
    if parsed.hostname and parsed.hostname.endswith('supabase.co'):
        query = dict(parse_qsl(parsed.query, keep_blank_values=True))
        query.setdefault('sslmode', 'require')
        raw_url = urlunparse(parsed._replace(query=urlencode(query)))

    return raw_url

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = build_database_url()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
    }

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
