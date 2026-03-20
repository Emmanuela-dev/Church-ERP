from app import db
from datetime import datetime

class Church(db.Model):
    __tablename__ = 'church'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    motto = db.Column(db.String(300))
    vision = db.Column(db.Text)
    mission = db.Column(db.Text)
    address = db.Column(db.String(300))
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    website = db.Column(db.String(200))
    founded_year = db.Column(db.Integer)
    pastor = db.Column(db.String(150))

    services = db.relationship('Service', backref='church', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'motto': self.motto,
            'vision': self.vision, 'mission': self.mission,
            'address': self.address, 'city': self.city, 'country': self.country,
            'phone': self.phone, 'email': self.email, 'website': self.website,
            'founded_year': self.founded_year, 'pastor': self.pastor,
            'services': [s.to_dict() for s in self.services]
        }


class Service(db.Model):
    __tablename__ = 'service'
    id = db.Column(db.Integer, primary_key=True)
    church_id = db.Column(db.Integer, db.ForeignKey('church.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)  # e.g. Sunday Service, Bible Study
    day = db.Column(db.String(20))                    # e.g. Sunday
    time = db.Column(db.String(20))                   # e.g. 9:00 AM
    description = db.Column(db.Text)
    order_of_service = db.relationship('ServiceOrder', backref='service', lazy=True,
                                        cascade='all, delete-orphan', order_by='ServiceOrder.position')

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'day': self.day,
            'time': self.time, 'description': self.description,
            'order_of_service': [o.to_dict() for o in self.order_of_service]
        }


class ServiceOrder(db.Model):
    __tablename__ = 'service_order'
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    position = db.Column(db.Integer, nullable=False)
    item = db.Column(db.String(200), nullable=False)  # e.g. Opening Prayer, Worship, Sermon

    def to_dict(self):
        return {'id': self.id, 'position': self.position, 'item': self.item}
