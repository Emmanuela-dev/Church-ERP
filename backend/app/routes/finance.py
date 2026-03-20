from flask import Blueprint, request, jsonify, abort
from app import db
from app.models.finance import FinanceRecord
from sqlalchemy import func

finance_bp = Blueprint('finance', __name__)

def get_or_404(model, id):
    obj = db.session.get(model, id)
    if obj is None:
        abort(404)
    return obj

# /summary MUST be before /<int:id> to avoid route conflict
@finance_bp.route('/summary', methods=['GET'])
def summary():
    results = db.session.query(
        FinanceRecord.type,
        func.sum(FinanceRecord.amount).label('total')
    ).group_by(FinanceRecord.type).all()
    return jsonify({r.type: float(r.total) for r in results})

@finance_bp.route('/', methods=['GET'])
def get_records():
    type_filter = request.args.get('type')
    query = FinanceRecord.query
    if type_filter:
        query = query.filter_by(type=type_filter)
    return jsonify([r.to_dict() for r in query.order_by(FinanceRecord.date.desc()).all()])

@finance_bp.route('/', methods=['POST'])
def create_record():
    record = FinanceRecord(**request.get_json())
    db.session.add(record)
    db.session.commit()
    return jsonify(record.to_dict()), 201

@finance_bp.route('/<int:id>', methods=['GET'])
def get_record(id):
    return jsonify(get_or_404(FinanceRecord, id).to_dict())

@finance_bp.route('/<int:id>', methods=['PUT'])
def update_record(id):
    record = get_or_404(FinanceRecord, id)
    for key, value in request.get_json().items():
        setattr(record, key, value)
    db.session.commit()
    return jsonify(record.to_dict())

@finance_bp.route('/<int:id>', methods=['DELETE'])
def delete_record(id):
    record = get_or_404(FinanceRecord, id)
    db.session.delete(record)
    db.session.commit()
    return jsonify({'message': 'Record deleted'})
