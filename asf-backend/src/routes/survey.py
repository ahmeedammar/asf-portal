from flask import Blueprint, jsonify, request, session
from src.models.user import Survey, SurveyResponse, db
from src.routes.user import login_required, admin_required
import json

survey_bp = Blueprint('survey', __name__)

# Public survey routes
@survey_bp.route('/surveys/active', methods=['GET'])
def get_active_surveys():
    """Get all currently active surveys for public access"""
    surveys = Survey.query.filter_by(is_active=True).all()
    if not surveys:
        return jsonify({'error': 'No active surveys found'}), 404
    
    return jsonify([survey.to_dict() for survey in surveys])

@survey_bp.route('/surveys/active/first', methods=['GET'])
def get_first_active_survey():
    """Get the first currently active survey for public access (backward compatibility)"""
    survey = Survey.query.filter_by(is_active=True).first()
    if not survey:
        return jsonify({'error': 'No active survey found'}), 404
    
    return jsonify(survey.to_dict())

@survey_bp.route('/surveys/<int:survey_id>/submit', methods=['POST'])
def submit_survey_response(survey_id):
    """Submit a response to a survey (public endpoint)"""
    survey = Survey.query.filter_by(id=survey_id, is_active=True).first_or_404()
    
    data = request.json
    if not data.get('responses'):
        return jsonify({'error': 'Responses are required'}), 400
    
    # Check if user is logged in
    user_id = session.get('user_id')
    
    # Get client IP address
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR'))
    
    response = SurveyResponse(
        survey_id=survey_id,
        user_id=user_id,
        responses_json=json.dumps(data['responses']),
        ip_address=ip_address
    )
    
    db.session.add(response)
    db.session.commit()
    
    return jsonify({
        'message': 'Survey response submitted successfully',
        'response_id': response.id
    }), 201

# Admin survey management routes
@survey_bp.route('/admin/surveys', methods=['GET'])
@admin_required
def get_surveys():
    """Get all surveys for admin"""
    surveys = Survey.query.order_by(Survey.created_at.desc()).all()
    return jsonify([survey.to_dict() for survey in surveys])

@survey_bp.route('/admin/surveys', methods=['POST'])
@admin_required
def create_survey():
    """Create a new survey"""
    data = request.json
    
    if not data.get('title') or not data.get('questions'):
        return jsonify({'error': 'Title and questions are required'}), 400
    
    # Deactivate all other surveys if this one should be active
    if data.get('is_active', False):
        Survey.query.update({'is_active': False})
    
    survey = Survey(
        title=data['title'],
        description=data.get('description', ''),
        questions_json=json.dumps(data['questions']),
        is_active=data.get('is_active', False)
    )
    
    db.session.add(survey)
    db.session.commit()
    
    return jsonify(survey.to_dict()), 201

@survey_bp.route('/admin/surveys/<int:survey_id>', methods=['GET'])
@admin_required
def get_survey(survey_id):
    """Get a specific survey"""
    survey = Survey.query.get_or_404(survey_id)
    return jsonify(survey.to_dict())

@survey_bp.route('/admin/surveys/<int:survey_id>', methods=['PUT'])
@admin_required
def update_survey(survey_id):
    """Update a survey"""
    survey = Survey.query.get_or_404(survey_id)
    data = request.json
    
    # Deactivate all other surveys if this one should be active
    if data.get('is_active', False) and not survey.is_active:
        Survey.query.filter(Survey.id != survey_id).update({'is_active': False})
    
    survey.title = data.get('title', survey.title)
    survey.description = data.get('description', survey.description)
    survey.is_active = data.get('is_active', survey.is_active)
    
    if data.get('questions'):
        survey.questions_json = json.dumps(data['questions'])
    
    db.session.commit()
    return jsonify(survey.to_dict())

@survey_bp.route('/admin/surveys/<int:survey_id>', methods=['DELETE'])
@admin_required
def delete_survey(survey_id):
    """Delete a survey"""
    survey = Survey.query.get_or_404(survey_id)
    db.session.delete(survey)
    db.session.commit()
    return '', 204

@survey_bp.route('/admin/surveys/<int:survey_id>/activate', methods=['PUT'])
@admin_required
def activate_survey(survey_id):
    """Activate a survey (deactivates all others)"""
    # Deactivate all surveys
    Survey.query.update({'is_active': False})
    
    # Activate the selected survey
    survey = Survey.query.get_or_404(survey_id)
    survey.is_active = True
    
    db.session.commit()
    return jsonify(survey.to_dict())

@survey_bp.route('/admin/surveys/<int:survey_id>/deactivate', methods=['PUT'])
@admin_required
def deactivate_survey(survey_id):
    """Deactivate a survey"""
    survey = Survey.query.get_or_404(survey_id)
    survey.is_active = False
    
    db.session.commit()
    return jsonify(survey.to_dict())

# Survey responses and statistics
@survey_bp.route('/admin/surveys/<int:survey_id>/responses', methods=['GET'])
@admin_required
def get_survey_responses(survey_id):
    """Get all responses for a survey"""
    survey = Survey.query.get_or_404(survey_id)
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    responses = SurveyResponse.query.filter_by(survey_id=survey_id)\
                                  .order_by(SurveyResponse.submitted_at.desc())\
                                  .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'survey': survey.to_dict(),
        'responses': [response.to_dict() for response in responses.items],
        'total': responses.total,
        'pages': responses.pages,
        'current_page': page
    })

@survey_bp.route('/admin/surveys/<int:survey_id>/statistics', methods=['GET'])
@admin_required
def get_survey_statistics(survey_id):
    """Get detailed statistics for a survey including completion percentage"""
    survey = Survey.query.get_or_404(survey_id)
    responses = SurveyResponse.query.filter_by(survey_id=survey_id).all()
    
    # Parse survey questions
    questions = json.loads(survey.questions_json)
    total_questions = len(questions)
    required_questions = sum(1 for q in questions if q.get('required', False))
    optional_questions = total_questions - required_questions
    
    if not responses:
        return jsonify({
            'survey': survey.to_dict(),
            'total_responses': 0,
            'total_questions': total_questions,
            'required_questions': required_questions,
            'optional_questions': optional_questions,
            'completion_percentage': 0,
            'statistics': {}
        })
    
    statistics = {}
    total_answered_questions = 0
    total_possible_answers = len(responses) * total_questions
    
    # Calculate statistics for each question
    for i, question in enumerate(questions):
        question_key = f"question_{i}"
        question_stats = {
            'question': question,
            'responses': [],
            'answered_count': 0,
            'response_rate': 0
        }
        
        # Collect all responses for this question
        for response in responses:
            response_data = json.loads(response.responses_json)
            # Use question ID as string for matching (responses store IDs as strings)
            question_id = str(question.get('id'))
            if question_id in response_data:
                response_value = response_data[question_id]
                # Check if the response is not empty
                if response_value and response_value != '' and response_value != []:
                    question_stats['responses'].append(response_value)
                    question_stats['answered_count'] += 1
                    total_answered_questions += 1
            # Also check with integer key for backward compatibility
            elif question.get('id') in response_data:
                response_value = response_data[question.get('id')]
                # Check if the response is not empty
                if response_value and response_value != '' and response_value != []:
                    question_stats['responses'].append(response_value)
                    question_stats['answered_count'] += 1
                    total_answered_questions += 1
            # Debug: print what we're looking for vs what we have
            print(f"DEBUG: Looking for question ID {question_id} or {question.get('id')} in response keys: {list(response_data.keys())}")
            print(f"DEBUG: Response data: {response_data}")
        
        # Calculate response rate for this question
        question_stats['response_rate'] = (question_stats['answered_count'] / len(responses)) * 100 if responses else 0
        
        # Calculate statistics based on question type
        if question.get('type') == 'multiple_choice' or question.get('type') == 'radio':
            # Count occurrences of each option
            option_counts = {}
            for response_value in question_stats['responses']:
                option_counts[response_value] = option_counts.get(response_value, 0) + 1
            question_stats['option_counts'] = option_counts
        
        elif question.get('type') == 'checkbox':
            # Count occurrences of each selected option
            option_counts = {}
            for response_value in question_stats['responses']:
                if isinstance(response_value, list):
                    for option in response_value:
                        option_counts[option] = option_counts.get(option, 0) + 1
            question_stats['option_counts'] = option_counts
        
        elif question.get('type') == 'select':
            # Count occurrences of each selected option
            option_counts = {}
            for response_value in question_stats['responses']:
                option_counts[response_value] = option_counts.get(response_value, 0) + 1
            question_stats['option_counts'] = option_counts
        
        elif question.get('type') == 'rating':
            # Calculate average rating
            ratings = [int(r) for r in question_stats['responses'] if str(r).isdigit()]
            if ratings:
                question_stats['average_rating'] = sum(ratings) / len(ratings)
                question_stats['rating_counts'] = {}
                for rating in ratings:
                    question_stats['rating_counts'][str(rating)] = question_stats['rating_counts'].get(str(rating), 0) + 1
        
        elif question.get('type') == 'text':
            # For text questions, just count non-empty responses
            question_stats['text_responses'] = [r for r in question_stats['responses'] if r.strip()]
        
        statistics[question_key] = question_stats
    
    # Calculate overall completion percentage
    completion_percentage = (total_answered_questions / total_possible_answers) * 100 if total_possible_answers > 0 else 0
    
    return jsonify({
        'survey': survey.to_dict(),
        'total_responses': len(responses),
        'total_questions': total_questions,
        'required_questions': required_questions,
        'optional_questions': optional_questions,
        'completion_percentage': round(completion_percentage, 2),
        'total_answered_questions': total_answered_questions,
        'total_possible_answers': total_possible_answers,
        'statistics': statistics
    })


@survey_bp.route('/surveys/<int:survey_id>/public', methods=['GET'])
def get_public_survey(survey_id):
    """Get a survey for public access"""
    survey = Survey.query.filter_by(id=survey_id, is_active=True).first_or_404()
    return jsonify(survey.to_dict())

@survey_bp.route('/surveys/<int:survey_id>/responses', methods=['POST'])
def submit_survey_response_alt(survey_id):
    """Submit a response to a survey (alternative endpoint)"""
    survey = Survey.query.filter_by(id=survey_id, is_active=True).first_or_404()
    
    data = request.json
    if not data.get('responses'):
        return jsonify({'error': 'Responses are required'}), 400
    
    # Check if user is logged in
    user_id = session.get('user_id')
    
    # Get client IP address
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR'))
    
    response = SurveyResponse(
        survey_id=survey_id,
        user_id=user_id,
        responses_json=json.dumps(data['responses']),
        ip_address=ip_address
    )
    
    db.session.add(response)
    db.session.commit()
    
    return jsonify({
        'message': 'Survey response submitted successfully',
        'response_id': response.id
    }), 201

