import numpy as np
import tensorflow as tf
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.ensemble import VotingClassifier
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras import regularizers
import joblib
import os
import cv2
from sklearn.model_selection import train_test_split

# Common Functions

def load_images_and_split(directory, test_size=0.2, random_state=42):
    X = []
    y = []
    labels = sorted(os.listdir(directory))
    for label_idx, label in enumerate(labels):
        label_dir = os.path.join(directory, label)
        if os.path.isdir(label_dir):  
            for image_file in os.listdir(label_dir):
                image_path = os.path.join(label_dir, image_file)
                if os.path.isfile(image_path):  
                    image = cv2.imread(image_path)
                    image = cv2.resize(image, (32, 32))  
                    X.append(image)
                    y.append(label_idx)

    X = np.array(X)
    y = np.array(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)

    return X_train, X_test, y_train, y_test

def create_model():
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),
        MaxPooling2D((2, 2)),
        Dropout(0.25),
        Conv2D(64, (3, 3), activation='relu', kernel_regularizer=regularizers.l2(0.001)),
        MaxPooling2D((2, 2)),
        Dropout(0.25),
        Conv2D(64, (3, 3), activation='relu', kernel_regularizer=regularizers.l2(0.001)),
        Flatten(),
        Dense(64, activation='relu'),
        Dropout(0.5),
        Dense(2, activation='softmax')  
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

class TensorFlowCNNClassifier(BaseEstimator, ClassifierMixin):
    def __init__(self, model, epochs, verbose=1):
        self.model = model
        self.epochs = epochs
        self.verbose = verbose
        
    def fit(self, X, y):
        self.model.fit(X, y, epochs=self.epochs, batch_size=64, verbose=self.verbose)
        return self
        
    def predict_proba(self, X):
        return self.model.predict(X)
    

# For Conjunctiva 

CONJUNCTIVA_EPOCHS = 255

X_train, X_test, y_train, y_test = load_images_and_split('../images/conjunctiva_dataset')

X_train = X_train / 255.0
X_test = X_test / 255.0

conjunctiva_cnn_classifier1 = TensorFlowCNNClassifier(create_model(), CONJUNCTIVA_EPOCHS)  
conjunctiva_cnn_classifier2 = TensorFlowCNNClassifier(create_model(), CONJUNCTIVA_EPOCHS)  
conjunctiva_cnn_classifier3 = TensorFlowCNNClassifier(create_model(), CONJUNCTIVA_EPOCHS)  

conjunctiva_voting_classifier = VotingClassifier(estimators=[
    ('cnn1', conjunctiva_cnn_classifier1),
    ('cnn2', conjunctiva_cnn_classifier2),
    ('cnn3', conjunctiva_cnn_classifier3)
], voting='soft')

conjunctiva_voting_classifier.fit(X_train, y_train)

joblib.dump(conjunctiva_voting_classifier, 'eye_final.joblib')

# For Palm

PALM_EPOCHS = 400

X_train, X_test, y_train, y_test = load_images_and_split('../images/palm_dataset')

X_train = X_train / 255.0
X_test = X_test / 255.0


palm_cnn_classifier1 = TensorFlowCNNClassifier(create_model(), PALM_EPOCHS)  
palm_cnn_classifier2 = TensorFlowCNNClassifier(create_model(), PALM_EPOCHS)  
palm_cnn_classifier3 = TensorFlowCNNClassifier(create_model(), PALM_EPOCHS) 

palm_voting_classifier = VotingClassifier(estimators=[
    ('cnn1', palm_cnn_classifier1),
    ('cnn2', palm_cnn_classifier2),
    ('cnn3', palm_cnn_classifier3)
], voting='soft')

palm_voting_classifier.fit(X_train, y_train)

joblib.dump(palm_voting_classifier, 'palm_final.joblib')

# For Nail

NAIL_EPOCHS = 600

X_train, X_test, y_train, y_test = load_images_and_split('../images/nail_dataset')

X_train = X_train / 255.0
X_test = X_test / 255.0

nail_cnn_classifier1 = TensorFlowCNNClassifier(create_model(), NAIL_EPOCHS)  
nail_cnn_classifier2 = TensorFlowCNNClassifier(create_model(), NAIL_EPOCHS)  
nail_cnn_classifier3 = TensorFlowCNNClassifier(create_model(), NAIL_EPOCHS)

nail_voting_classifier = VotingClassifier(estimators=[
    ('cnn1', nail_cnn_classifier1),
    ('cnn2', nail_cnn_classifier2),
    ('cnn3', nail_cnn_classifier3)
], voting='soft')

nail_voting_classifier.fit(X_train, y_train)

joblib.dump(nail_voting_classifier, 'nail_final.joblib')