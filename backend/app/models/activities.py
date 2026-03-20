from app import db
from datetime import datetime

class Activity(db.Model):
    __tablename__ = 'activity'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))   # e.g. Outreach, Conference, Youth, Prayer
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.String(20))
    end_time = db.Column(db.String(20))
    venue = db.Column(db.String(200))
    organizer = db.Column(db.String(150))
    status = db.Column(db.String(20), default='Upcoming')  # Upcoming, Ongoing, Completed, Cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'description': self.description,
            'category': self.category, 'date': str(self.date),
            'start_time': self.start_time, 'end_time': self.end_time,
            'venue': self.venue, 'organizer': self.organizer, 'status': self.status
        }
