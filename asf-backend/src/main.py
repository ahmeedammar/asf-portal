import os
import sys
from flask import Flask, send_from_directory, request
from flask_cors import CORS
from src.models.user import db, User
from src.routes.user import user_bp
from src.routes.forum import forum_bp
from src.routes.survey import survey_bp

# Initialize Flask app
app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configuration
app.config['SECRET_KEY'] = 'asf-consulting-portal-secret-key-2024'
app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_SESSION_SECURE', 'False').lower() == 'true'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Enable CORS for all routes with specific origins
CORS(app,
     supports_credentials=True,
     origins=[
         "http://localhost:4173",  # Vite dev server
         "http://localhost:3000",  # React dev server
         "https://asfhelpdesk.netlify.app "  # Deployed frontend
     ],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(forum_bp, url_prefix='/api')
app.register_blueprint(survey_bp, url_prefix='/api')

# Database configuration
db_dir = os.getenv("DATABASE_DIR", "/opt/render/project/data")
os.makedirs(db_dir, exist_ok=True)

db_path = os.path.join(db_dir, "app.db")

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

    # Create default admin user if it doesn't exist
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
        print("Default admin user created: admin/admin123")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if not static_folder_path or not os.path.exists(static_folder_path):
        return "Static folder not configured or does not exist", 404

    requested_file = os.path.join(static_folder_path, path)
    if path and os.path.isfile(requested_file):
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
    app.run(host='0.0.0.0', port=5000, debug=True)