from app import db
from datetime import datetime

class Member(db.Model):
    __tablename__ = 'member'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10))               # Male / Female
    date_of_birth = db.Column(db.Date)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    address = db.Column(db.String(300))
    occupation = db.Column(db.String(150))
    membership_date = db.Column(db.Date, default=datetime.utcnow)
    membership_status = db.Column(db.String(20), default='Active')  # Active, Inactive, Transferred
    role = db.Column(db.String(50), default='Member')               # Member, Deacon, Elder, Pastor etc.
    photo_url = db.Column(db.String(300))

    # Family relationships
    family_id = db.Column(db.Integer, db.ForeignKey('family.id'), nullable=True)
    family_role = db.Column(db.String(20))  # Head, Spouse, Child

    def to_dict(self):
        return {
            'id': self.id, 'first_name': self.first_name, 'last_name': self.last_name,
            'gender': self.gender, 'date_of_birth': str(self.date_of_birth) if self.date_of_birth else None,
            'phone': self.phone, 'email': self.email, 'address': self.address,
            'occupation': self.occupation,
            'membership_date': str(self.membership_date) if self.membership_date else None,
            'membership_status': self.membership_status, 'role': self.role,
            'photo_url': self.photo_url, 'family_id': self.family_id, 'family_role': self.family_role
        }


class Family(db.Model):
    __tablename__ = 'family'
    id = db.Column(db.Integer, primary_key=True)
    family_name = db.Column(db.String(150), nullable=False)
    members = db.relationship('Member', backref='family', lazy=True, foreign_keys='Member.family_id')

    def to_dict(self):
        head = next((m for m in self.members if m.family_role == 'Head'), None)
        spouse = next((m for m in self.members if m.family_role == 'Spouse'), None)
        children = [m for m in self.members if m.family_role == 'Child']
        return {
            'id': self.id, 'family_name': self.family_name,
            'head': head.to_dict() if head else None,
            'spouse': spouse.to_dict() if spouse else None,
            'children': [c.to_dict() for c in children]
        }
