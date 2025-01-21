from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

# Initialize Flask application
app = Flask(__name__)

# Enable CORS for cross-origin requests
CORS(app, origins=["http://localhost:4200"])  # Update this with your Angular app URL

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "tasks.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Task model definition
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    entity_name = db.Column(db.String(100), nullable=False)
    task_type = db.Column(db.String(100), nullable=False)
    time_of_task = db.Column(db.DateTime, nullable=False)
    contact_person = db.Column(db.String(100), nullable=False)
    note = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(10), default='open')

# Home Route
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Task Manager API!"})

# Create Task Route (POST)
@app.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['entity_name', 'task_type', 'time_of_task', 'contact_person']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        if missing_fields:
            return jsonify({'message': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Ensure valid time_of_task format
        try:
            time_of_task = datetime.strptime(data['time_of_task'], '%Y-%m-%dT%H:%M:%S')
        except ValueError:
            return jsonify({'message': 'Invalid time_of_task format. Use "YYYY-MM-DDTHH:MM:SS".'}), 400

        # Create new task
        new_task = Task(
            entity_name=data['entity_name'],
            task_type=data['task_type'],
            time_of_task=time_of_task,
            contact_person=data['contact_person'],
            note=data.get('note', ''),  # Default to empty string if note is not provided
            status=data.get('status', 'open')  # Default to "open"
        )

        db.session.add(new_task)
        db.session.commit()

        return jsonify({'message': 'Task created successfully!', 'task_id': new_task.id}), 201
    except Exception as e:
        app.logger.error(f"Error creating task: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 400
    

# Get All Tasks Route (GET)
@app.route('/tasks', methods=['GET'])
def get_tasks():
    sort_by = request.args.get('sort_by', 'entity_name')
    contact_person = request.args.get('contact_person')
    task_type = request.args.get('task_type')
    status = request.args.get('status')

    query = Task.query

    if contact_person:
        query = query.filter(Task.contact_person == contact_person)
    if task_type:
        query = query.filter(Task.task_type == task_type)
    if status:
        query = query.filter(Task.status == status)

    tasks = query.order_by(sort_by).all()

    return jsonify([{
        'id': task.id,
        'created_at': task.created_at.isoformat(),
        'entity_name': task.entity_name,
        'task_type': task.task_type,
        'time_of_task': task.time_of_task.isoformat(),
        'contact_person': task.contact_person,
        'note': task.note,
        'status': task.status
    } for task in tasks])

# Update Task Route (PUT)
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()

    task.entity_name = data['entity_name']
    task.task_type = data['task_type']
    task.time_of_task = datetime.strptime(data['time_of_task'], '%Y-%m-%dT%H:%M:%S')
    task.contact_person = data['contact_person']
    task.note = data.get('note', '')
    task.status = data['status']

    db.session.commit()
    return jsonify({'message': 'Task updated successfully!'})

# Delete Task Route (DELETE)
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully!'})

# Main entry point to create database tables and run the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True, host='0.0.0.0', port=5000)
