from flask import Blueprint, request, jsonify, abort
from app import db
from app.models.church import Church, Service, ServiceOrder

church_bp = Blueprint('church', __name__)

def get_or_404(model, id):
    obj = db.session.get(model, id)
    if obj is None:
        abort(404)
    return obj

@church_bp.route('/', methods=['GET'])
def get_church():
    church = Church.query.first()
    if not church:
        return jsonify({'message': 'No church info found'}), 404
    return jsonify(church.to_dict())

@church_bp.route('/', methods=['POST'])
def create_church():
    data = request.get_json()
    church = Church(**data)
    db.session.add(church)
    db.session.commit()
    return jsonify(church.to_dict()), 201

@church_bp.route('/<int:id>', methods=['PUT'])
def update_church(id):
    church = get_or_404(Church, id)
    for key, value in request.get_json().items():
        setattr(church, key, value)
    db.session.commit()
    return jsonify(church.to_dict())

# Services
@church_bp.route('/<int:church_id>/services', methods=['POST'])
def add_service(church_id):
    data = request.get_json()
    order_items = data.pop('order_of_service', [])
    service = Service(church_id=church_id, **data)
    db.session.add(service)
    db.session.flush()
    for i, item in enumerate(order_items):
        db.session.add(ServiceOrder(service_id=service.id, position=i+1, item=item))
    db.session.commit()
    return jsonify(service.to_dict()), 201

@church_bp.route('/services/<int:id>', methods=['PUT'])
def update_service(id):
    service = get_or_404(Service, id)
    data = request.get_json()
    order_items = data.pop('order_of_service', None)
    for key, value in data.items():
        setattr(service, key, value)
    if order_items is not None:
        ServiceOrder.query.filter_by(service_id=id).delete()
        for i, item in enumerate(order_items):
            db.session.add(ServiceOrder(service_id=id, position=i+1, item=item))
    db.session.commit()
    return jsonify(service.to_dict())

@church_bp.route('/services/<int:id>', methods=['DELETE'])
def delete_service(id):
    service = get_or_404(Service, id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({'message': 'Service deleted'})
