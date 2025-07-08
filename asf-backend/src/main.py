import os
import sys
import logging
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db, User
from src.routes.user import user_bp
from src.routes.forum import forum_bp
from src.routes.survey import survey_bp

# Set up logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'asf-consulting-portal-secret-key-2024')
app.config['SESSION_COOKIE_SECURE'] = True  # For HTTPS on Render
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['PREFERRED_URL_SCHEME'] = 'https'

# Enable CORS
CORS(app, 
     supports_credentials=True,
     origins=['https://helpdesk-web-service.onrender.com', 'http://localhost:3000', 'http://169.254.0.21:3000', '*'],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(forum_bp, url_prefix='/api')
app.register_blueprint(survey_bp, url_prefix='/api')

# Database configuration
database_path = os.environ.get('DATABASE_PATH', '/tmp')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', f"sqlite:///{database_path}/app.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    try:
        db.create_all()
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            admin_user = User(
                username='admin',
                email='admin@asfconsulting.tn',
                company='ASF Consulting',
                is_admin=True
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.commit()
            logging.debug("Default admin user created")
        else:
            logging.debug("Admin user already exists")
    except Exception as e:
        logging.error(f"Database initialization error: {str(e)}")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404
    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'message': 'ASF Consulting Portal API is running'}

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
