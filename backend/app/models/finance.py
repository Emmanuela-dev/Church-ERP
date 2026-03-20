from app import db
from datetime import datetime

class FinanceRecord(db.Model):
    __tablename__ = 'finance_record'
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('member.id'), nullable=True)  # nullable for anonymous
    type = db.Column(db.String(50), nullable=False)   # Tithe, Offering, Donation, Pledge
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    currency = db.Column(db.String(10), default='USD')
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    description = db.Column(db.String(300))
    recorded_by = db.Column(db.String(150))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    member = db.relationship('Member', backref='finance_records', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'member_id': self.member_id,
            'member_name': f"{self.member.first_name} {self.member.last_name}" if self.member else 'Anonymous',
            'type': self.type, 'amount': float(self.amount),
            'currency': self.currency, 'date': str(self.date),
            'description': self.description, 'recorded_by': self.recorded_by
        }
