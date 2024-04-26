import tensorflow as tf
from flask import Flask, request, jsonify
import joblib
import numpy as np
import cv2
from scipy.stats import mode
from flask_cors import CORS

app = Flask(__name__)

cors = CORS(app)

classes = ['Anemic', 'Non Anemic']

conjunctiva_model = joblib.load('models/eye_final.joblib')
palm_model = joblib.load('models/palm_final.joblib')
nail_model = joblib.load('models/nail_final.joblib')


def preprocess_image(image_array):
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    image = cv2.resize(image, (32, 32))
    image = image / 255.0

    image = np.expand_dims(image, axis=0)

    return image

@app.route('/predict', methods=['POST'])
def predict():    
    try:
        predictions = []

        if len(request.files) == 0:
            print('no files')
            return "No files provided", 400
        
        files = request.files.items()
       
        for field_name, file in files:
            if field_name == 'conjunctiva' and file.filename != '':
                image_array = np.frombuffer(file.read(), np.uint8)
                conjunctiva_img = preprocess_image(image_array)
                result = conjunctiva_model.predict(conjunctiva_img)
                predictions.append(result[0])
            elif field_name == 'palm' and file.filename != '':
                image_array = np.frombuffer(file.read(), np.uint8)
                palm_img = preprocess_image(image_array)
                result = palm_model.predict(palm_img)
                predictions.append(result[0])
            elif field_name == 'nail' and file.filename != '':
                image_array = np.frombuffer(file.read(), np.uint8)
                nail_img = preprocess_image(image_array)
                result = nail_model.predict(nail_img)
                predictions.append(result[0])

        prediction_np = np.array(predictions)
        
        
        prediction = int(mode(prediction_np).mode)
       

        return jsonify({'prediction': classes[prediction]})
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=False)
