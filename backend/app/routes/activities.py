from flask import Blueprint, request, jsonify, abort
from app import db
from app.models.activities import Activity

activities_bp = Blueprint('activities', __name__)

def get_or_404(model, id):
    obj = db.session.get(model, id)
    if obj is None:
        abort(404)
    return obj

@activities_bp.route('/', methods=['GET'])
def get_activities():
    status = request.args.get('status')
    query = Activity.query
    if status:
        query = query.filter_by(status=status)
    return jsonify([a.to_dict() for a in query.order_by(Activity.date).all()])

@activities_bp.route('/<int:id>', methods=['GET'])
def get_activity(id):
    return jsonify(get_or_404(Activity, id).to_dict())

@activities_bp.route('/', methods=['POST'])
def create_activity():
    activity = Activity(**request.get_json())
    db.session.add(activity)
    db.session.commit()
    return jsonify(activity.to_dict()), 201

@activities_bp.route('/<int:id>', methods=['PUT'])
def update_activity(id):
    activity = get_or_404(Activity, id)
    for key, value in request.get_json().items():
        setattr(activity, key, value)
    db.session.commit()
    return jsonify(activity.to_dict())

@activities_bp.route('/<int:id>', methods=['DELETE'])
def delete_activity(id):
    activity = get_or_404(Activity, id)
    db.session.delete(activity)
    db.session.commit()
    return jsonify({'message': 'Activity deleted'})
