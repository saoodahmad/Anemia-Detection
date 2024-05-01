import React, { useState } from "react";
import axios from "axios";

import { BACKEND_URL } from "./config";

const AnemiaPrediction = () => {
  const [images, setImages] = useState({
    conjunctiva: { url: null, file: "" },
    palm: { url: null, file: "" },
    nail: { url: null, file: "" },
  });

  const [result, setResult] = useState("");

  const [resultVisible, setResultVisible] = useState(false);

  const [disableUpload, setDisableUpload] = useState(false);

  const [disableBtn, setDisableBtn] = useState(true);

  const handleImageChange = (event, part) => {
    const file = event.target.files[0];

    setImages((prevImages) => ({
      ...prevImages,
      [part]: { url: URL.createObjectURL(file), file: file },
    }));

    if (disableBtn) {
      setDisableBtn(false);
    }
  };

  const showResult = async () => {
    setDisableUpload(true);
    setDisableBtn(true);

    const formData = new FormData();

    if (images.conjunctiva) {
      formData.append("conjunctiva", images.conjunctiva.file);
    }

    if (images.palm) {
      formData.append("palm", images.palm.file);
    }

    if (images.nail) {
      formData.append("nail", images.nail.file);
    }

    const result = await axios.post(`${BACKEND_URL}/predict`, formData);

    setResult(result.data.prediction);
    setResultVisible(true);
    setDisableBtn(false);
  };

  const clearData = () => {
    setImages({
      conjunctiva: { url: null, file: "" },
      palm: { url: null, file: "" },
      nail: { url: null, file: "" },
    });
    setDisableBtn(true);
    setResultVisible(false);
    setDisableUpload(false);
  };

  return (
    <div>
      <div className="heading-container">
        <img src="/icon.png" width="34px" height="34px" />
        <h1>Anemia Prediction using Deep Learning</h1>
      </div>
      <div className="container">
        <div className="card">
          <div className="card-title">Conjunctiva</div>
          <div className="image-upload">
            <div
              className="overlay"
              style={{ display: images.conjunctiva.url ? "none" : "flex" }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "conjunctiva")}
                disabled={disableUpload}
              />
              <div className="overlay-text">
                {resultVisible ? "None" : "Upload Image"}
              </div>
            </div>
            {images.conjunctiva.url && (
              <img src={images.conjunctiva.url} alt="Uploaded Image" />
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Palm</div>
          <div className="image-upload">
            <div
              className="overlay"
              style={{ display: images.palm.url ? "none" : "flex" }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "palm")}
                disabled={disableUpload}
              />
              <div className="overlay-text">
                {resultVisible ? "None" : "Upload Image"}
              </div>
            </div>
            {images.palm.url && (
              <img src={images.palm.url} alt="Uploaded Image" />
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Nail</div>
          <div className="image-upload">
            <div
              className="overlay"
              style={{ display: images.nail.url ? "none" : "flex" }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "nail")}
                disabled={disableUpload}
              />
              <div className="overlay-text">
                {resultVisible ? "None" : "Upload Image"}
              </div>
            </div>
            {images.nail.url && (
              <img src={images.nail.url} alt="Uploaded Image" />
            )}
          </div>
        </div>
      </div>

      <div className="button-container">
        <button
          className={disableBtn ? "predict-button-disabled" : "predict-button"}
          disabled={disableBtn}
          onClick={resultVisible ? clearData : showResult}
        >
          {resultVisible ? "Clear" : "Predict"}
        </button>
      </div>

      <div
        // className={
        //   resultVisible ? "result-container active" : "result-container"
        // }
        className="result-container"
      >
        <h2>Result:</h2>
        {<p>{resultVisible && `Patient is ${result}`}</p>}
      </div>
    </div>
  );
};

export default AnemiaPrediction;
