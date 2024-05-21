import tensorflow as tf
from flask import Flask, request, jsonify
import joblib
import numpy as np
import cv2
from scipy.stats import mode
from flask_cors import CORS
from mongoengine import connect, Document, StringField, EmailField
import hashlib
import jwt
from datetime import datetime, timedelta
from functools import wraps
import base64

app = Flask(__name__)

cors = CORS(app)

connection_string = "mongodb+srv://user:user123@cluster0.gzetnpa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

connect(host=connection_string)

class User(Document):
    email = EmailField(required=True)
    password = StringField(required=True)

class PredictionHistory(Document):
    patientUUID = StringField(required=True)
    palmImg = StringField(required=True)
    nailImg = StringField(required=True)
    conjunctivaImg = StringField(required=True)
    prediction =  StringField(required=True)


classes = ['Anemic', 'Non Anemic']

secret_key = 'some_secret'

conjunctiva_model = joblib.load('models/eye_final.joblib')
palm_model = joblib.load('models/palm_final.joblib')
nail_model = joblib.load('models/nail_final.joblib')


def preprocess_image(image_array):
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    image = cv2.resize(image, (32, 32))
    image = image / 255.0

    image = np.expand_dims(image, axis=0)

    return image

def hash_string(string):
    return hashlib.sha256(string.encode()).hexdigest()

def generate_token(email):
    payload = {
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=1)  # Token expiry in 1 day
    }

    token = jwt.encode(payload, secret_key, algorithm='HS256')

    return token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('x-access-token')

        if not token:
            return jsonify({'success': False, 'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, secret_key, algorithms=['HS256'])
            current_user = User.objects(email=data['email']).first()
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    hashed_password = hash_string(password)

    user = User.objects(email=email).first()

    if not hashed_password == user['password']:
        return jsonify({ 'success': False, 'message': 'Invalid password'}), 400

    if not user:
        return jsonify({ 'success': False, 'message': 'User not found.'}), 404
    
    token = generate_token(email=email)

    return jsonify({ 'success': True, 'token': token, 'message': 'Login success' }), 200


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    hashed_password = hash_string(password)

    user = User.objects(email=email).first()

    if user:
        return jsonify({ 'success': False, 'message': 'User already exists.'}), 400
    
    user = User(email=email, password=hashed_password)

    user.save()
    
    token = generate_token(email=email)

    return jsonify({ 'success': True, 'token': token, 'message': 'Login success' }), 201

@app.route('/predict', methods=['POST'])
@token_required
def predict(current_user):    
    try:
        predictions = []

        if 'patientUUID' not in request.form:
            return jsonify({'success': False, 'message': 'Incomplete data'}), 400


        if len(request.files) == 0:
            print('no files')
            return jsonify({ 'success': False, 'message': 'No files provided'}), 400
        
        files = request.files.items()
       
        patientUUID = request.form['patientUUID']

 
        conjunctiva_b64 = None
        palm_b64 = None
        nail_b64 = None
        # conjunctiva_buf = None
        # palm_buf = None
        # nail_buf = None

        for field_name, file in files:
            if field_name == 'conjunctiva' and file.filename != '':
                buf = file.read()
                conjunctiva_b64 =  base64.b64encode(buf).decode('utf-8')
                image_array = np.frombuffer(buf, np.uint8)
                conjunctiva_img = preprocess_image(image_array)
                result = conjunctiva_model.predict(conjunctiva_img)
                predictions.append(result[0])
            elif field_name == 'palm' and file.filename != '':
                buf = file.read()
                palm_b64 = base64.b64encode(buf).decode('utf-8')
                image_array = np.frombuffer(buf, np.uint8)
                palm_img = preprocess_image(image_array)
                result = palm_model.predict(palm_img)
                predictions.append(result[0])
            elif field_name == 'nail' and file.filename != '':
                buf = file.read()
                nail_b64 = base64.b64encode(buf).decode('utf-8')
                image_array = np.frombuffer(buf, np.uint8)
                nail_img = preprocess_image(image_array)
                result = nail_model.predict(nail_img)
                predictions.append(result[0])

        prediction_np = np.array(predictions)

        prediction = int(mode(prediction_np).mode)
        prediction_class = classes[prediction]
       
        # print(f"data:{palm_b64}")
        # print(f"data:${nail_b64}")
        # print(f"data:${conjunctiva_b64}")
    
    
        history = PredictionHistory(
            patientUUID=patientUUID, 
            palmImg=palm_b64 if palm_b64 is not None else "",
            nailImg = nail_b64 if nail_b64 is not None else "",
            conjunctivaImg = conjunctiva_b64 if conjunctiva_b64 is not None else "",
            prediction = prediction_class, 
        )

        history.save()

        return jsonify({ 'success': True,  'message': 'Success', 'prediction': prediction_class})
    except Exception as e:
        print(e)
        return jsonify({ 'success': False, 'message': 'Something went wrong!'}), 500

@app.route('/history', methods=['GET'])
@token_required
def get_history(current_user):    
    try:
        history_records = PredictionHistory.objects()
        history_list = []
        for record in history_records:
            history_list.append({
                'patientUUID': record.patientUUID,
                'palmImg': record.palmImg,
                'nailImg': record.nailImg,
                'conjunctivaImg': record.conjunctivaImg,
                'prediction': record.prediction
            })

        return jsonify({'success': True, 'history': history_list}), 200
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Something went wrong!'}), 500
    

if __name__ == '__main__':
    app.run(port=5000, debug=False)
