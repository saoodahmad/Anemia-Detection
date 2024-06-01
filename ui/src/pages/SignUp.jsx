import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

import { BACKEND_URL } from "../config";
import "../index.css";

const SignUp = () => {
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);

  const handleSignUp = async () => {
    try {
      if (email == "" || password == "" || confirmPassword == "") {
        messageApi.error("Please enter your details");
        setDisableBtn(false);
        return;
      }

      if (password != confirmPassword) {
        messageApi.error("Passwords do not match");
        setDisableBtn(false);
        return;
      }

      messageApi.info("Please wait!");

      const { data } = await axios.post(`${BACKEND_URL}/signup`, {
        email,
        password,
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setDisableBtn(false);

      messageApi.success("Signup success!");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      messageApi.error(err.response.data.message);

      setDisableBtn(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/");
    }
  }, []);

  return (
    <>
      {contextHolder}
      <div className="auth-container">
        <img src="/icon.png" width="34px" height="34px" />
        <h1>Sign Up</h1>
        <form className="auth-form">
          <label htmlFor="username">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            required
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />

          <label htmlFor="password">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          />

          <button
            type="submit"
            className="auth-button"
            style={{ marginBottom: "12px" }}
            disabled={disableBtn}
            onClick={() => {
              setDisableBtn(true);
              handleSignUp();
            }}
          >
            Sign Up
          </button>

          <button
            type="submit"
            className="auth-button"
            disabled={disableBtn}
            onClick={() => {
              setDisableBtn(true);
              navigate("/login");
            }}
          >
            or Login
          </button>
        </form>
      </div>
    </>
  );
};

export default SignUp;
