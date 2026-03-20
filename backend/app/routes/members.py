from flask import Blueprint, request, jsonify, abort
from app import db
from app.models.members import Member, Family

members_bp = Blueprint('members', __name__)

def get_or_404(model, id):
    obj = db.session.get(model, id)
    if obj is None:
        abort(404)
    return obj

# Families routes MUST come before /<int:id> to avoid conflict
@members_bp.route('/families', methods=['GET'])
def get_families():
    return jsonify([f.to_dict() for f in Family.query.all()])

@members_bp.route('/families', methods=['POST'])
def create_family():
    data = request.get_json()
    family = Family(family_name=data['family_name'])
    db.session.add(family)
    db.session.flush()
    for member_data in data.get('members', []):
        member_data['family_id'] = family.id
        db.session.add(Member(**member_data))
    db.session.commit()
    return jsonify(family.to_dict()), 201

@members_bp.route('/families/<int:id>', methods=['GET'])
def get_family(id):
    return jsonify(get_or_404(Family, id).to_dict())

@members_bp.route('/families/<int:id>', methods=['DELETE'])
def delete_family(id):
    family = get_or_404(Family, id)
    db.session.delete(family)
    db.session.commit()
    return jsonify({'message': 'Family deleted'})

@members_bp.route('/', methods=['GET'])
def get_members():
    return jsonify([m.to_dict() for m in Member.query.all()])

@members_bp.route('/', methods=['POST'])
def create_member():
    data = request.get_json()
    member = Member(**data)
    db.session.add(member)
    db.session.commit()
    return jsonify(member.to_dict()), 201

@members_bp.route('/<int:id>', methods=['GET'])
def get_member(id):
    return jsonify(get_or_404(Member, id).to_dict())

@members_bp.route('/<int:id>', methods=['PUT'])
def update_member(id):
    member = get_or_404(Member, id)
    for key, value in request.get_json().items():
        setattr(member, key, value)
    db.session.commit()
    return jsonify(member.to_dict())

@members_bp.route('/<int:id>', methods=['DELETE'])
def delete_member(id):
    member = get_or_404(Member, id)
    db.session.delete(member)
    db.session.commit()
    return jsonify({'message': 'Member deleted'})
