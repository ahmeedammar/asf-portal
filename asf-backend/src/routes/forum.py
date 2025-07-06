from flask import Blueprint, jsonify, request, session
from src.models.user import Question, Comment, User, db
from src.routes.user import login_required, admin_required

forum_bp = Blueprint('forum', __name__)

# Questions routes
@forum_bp.route('/questions', methods=['GET'])
@login_required
def get_questions():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    questions = Question.query.filter_by(is_active=True)\
                            .order_by(Question.created_at.desc())\
                            .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'questions': [q.to_dict() for q in questions.items],
        'total': questions.total,
        'pages': questions.pages,
        'current_page': page
    })

@forum_bp.route('/questions', methods=['POST'])
@login_required
def create_question():
    data = request.json
    
    if not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Title and content are required'}), 400
    
    question = Question(
        title=data['title'],
        content=data['content'],
        user_id=session['user_id']
    )
    
    db.session.add(question)
    db.session.commit()
    
    return jsonify(question.to_dict()), 201

@forum_bp.route('/questions/<int:question_id>', methods=['GET'])
@login_required
def get_question(question_id):
    question = Question.query.filter_by(id=question_id, is_active=True).first_or_404()
    
    # Get comments for this question
    comments = Comment.query.filter_by(question_id=question_id, is_active=True)\
                          .order_by(Comment.created_at.asc()).all()
    
    question_dict = question.to_dict()
    question_dict['comments'] = [comment.to_dict() for comment in comments]
    
    return jsonify(question_dict)

@forum_bp.route('/questions/<int:question_id>', methods=['PUT'])
@login_required
def update_question(question_id):
    question = Question.query.filter_by(id=question_id, is_active=True).first_or_404()
    
    # Check if user owns the question or is admin
    if question.user_id != session['user_id'] and not session.get('is_admin'):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.json
    question.title = data.get('title', question.title)
    question.content = data.get('content', question.content)
    
    db.session.commit()
    return jsonify(question.to_dict())

@forum_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@login_required
def delete_question(question_id):
    question = Question.query.filter_by(id=question_id, is_active=True).first_or_404()
    
    # Check if user owns the question or is admin
    if question.user_id != session['user_id'] and not session.get('is_admin'):
        return jsonify({'error': 'Permission denied'}), 403
    
    question.is_active = False
    db.session.commit()
    return '', 204

# Comments routes
@forum_bp.route('/questions/<int:question_id>/comments', methods=['POST'])
@login_required
def create_comment(question_id):
    # Check if question exists and is active
    question = Question.query.filter_by(id=question_id, is_active=True).first_or_404()
    
    data = request.json
    if not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400
    
    comment = Comment(
        content=data['content'],
        user_id=session['user_id'],
        question_id=question_id
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201

@forum_bp.route('/comments/<int:comment_id>', methods=['PUT'])
@login_required
def update_comment(comment_id):
    comment = Comment.query.filter_by(id=comment_id, is_active=True).first_or_404()
    
    # Check if user owns the comment or is admin
    if comment.user_id != session['user_id'] and not session.get('is_admin'):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.json
    comment.content = data.get('content', comment.content)
    
    db.session.commit()
    return jsonify(comment.to_dict())

@forum_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
    comment = Comment.query.filter_by(id=comment_id, is_active=True).first_or_404()
    
    # Check if user owns the comment or is admin
    if comment.user_id != session['user_id'] and not session.get('is_admin'):
        return jsonify({'error': 'Permission denied'}), 403
    
    comment.is_active = False
    db.session.commit()
    return '', 204

# Admin routes for managing forum content
@forum_bp.route('/admin/questions', methods=['GET'])
@admin_required
def admin_get_questions():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    questions = Question.query.order_by(Question.created_at.desc())\
                            .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'questions': [q.to_dict() for q in questions.items],
        'total': questions.total,
        'pages': questions.pages,
        'current_page': page
    })

@forum_bp.route('/admin/questions/<int:question_id>/toggle', methods=['PUT'])
@admin_required
def admin_toggle_question(question_id):
    question = Question.query.get_or_404(question_id)
    question.is_active = not question.is_active
    db.session.commit()
    return jsonify(question.to_dict())

@forum_bp.route('/admin/comments', methods=['GET'])
@admin_required
def admin_get_comments():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    comments = Comment.query.order_by(Comment.created_at.desc())\
                          .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'comments': [c.to_dict() for c in comments.items],
        'total': comments.total,
        'pages': comments.pages,
        'current_page': page
    })

@forum_bp.route('/admin/comments/<int:comment_id>/toggle', methods=['PUT'])
@admin_required
def admin_toggle_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    comment.is_active = not comment.is_active
    db.session.commit()
    return jsonify(comment.to_dict())

