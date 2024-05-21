import React, { useEffect, useState } from "react";
import axios from "axios";

import { BACKEND_URL } from "../config";

import "../index.css";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const [patientUUID, setPatientUUID] = useState("");

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
    const token = sessionStorage.getItem("token");

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

    formData.append("patientUUID", patientUUID);

    const result = await axios.post(`${BACKEND_URL}/predict`, formData, {
      headers: {
        "x-access-token": token,
      },
    });

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

  const goToHistory = () => {
    navigate("history");
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, []);

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
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter Patient UUID"
          value={patientUUID}
          required
          onChange={(e) => {
            setPatientUUID(e.target.value);
          }}
        />

        <button
          className={disableBtn ? "predict-button-disabled" : "predict-button"}
          disabled={disableBtn}
          onClick={resultVisible ? clearData : showResult}
        >
          {resultVisible ? "Clear" : "Predict"}
        </button>

        <button className={"history-button"} onClick={goToHistory}>
          View History
        </button>
      </div>

      <div className="result-container">
        <h2>Result:</h2>
        {<p>{resultVisible && `Patient is ${result}`}</p>}
      </div>
    </div>
  );
};

export default HomePage;
