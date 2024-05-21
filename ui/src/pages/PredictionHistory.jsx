import React, { useEffect, useState } from "react";
import axios from "axios";
import "../index.css";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";

const HistoryPredictionTable = () => {
  const navigate = useNavigate();

  const [predictionHistory, setPredictionHistory] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/");
    }

    const fetch = async () => {
      const result = await axios.get(`${BACKEND_URL}/history`, {
        headers: {
          "x-access-token": token,
        },
      });

      if (result.data.success) {
        setPredictionHistory(result.data.history);
      }
    };

    fetch();
  }, []);
  return (
    <div className="history-table-container">
      <h1>Prediction History</h1>

      <table className="history-table">
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Patient UUID</th>
            <th>Palm</th>
            <th>Nail</th>
            <th>Conjunctiva</th>
            <th>Prediction</th>
          </tr>
        </thead>
        <tbody>
          {predictionHistory.map((row, idx) => (
            <tr key={idx + 1}>
              <td>{idx + 1}</td>
              <td>{row.patientUUID}</td>
              <td>
                {row.palmImg != "" && (
                  <img
                    src={`data:image/jpeg;base64,${row.palmImg}`}
                    className="history-image"
                    alt="Nail"
                  />
                )}
              </td>
              <td>
                {row.nailImg != "" && (
                  <img
                    src={`data:image/jpeg;base64,${row.nailImg}`}
                    className="history-image"
                    alt="Nail"
                  />
                )}
              </td>
              <td>
                {row.conjunctivaImg != "" && (
                  <img
                    src={`data:image/jpeg;base64,${row.conjunctivaImg}`}
                    className="history-image"
                    alt="Conjunctiva"
                  />
                )}
              </td>
              <td>{row.prediction}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
          type="submit"
          className="history-button"
          onClick={() => {
            navigate("/");
          }}
        >
          Predict
        </button>
    </div>
  );
};

export default HistoryPredictionTable;
