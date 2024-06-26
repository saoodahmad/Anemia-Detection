import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

import { BACKEND_URL } from "../config";
import "../index.css";

const Login = () => {
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);

  const handleLogin = async () => {
    try {
      if (email == "" || password == "") {
        messageApi.error("Please enter you details");
        setDisableBtn(false);
        return;
      }

      messageApi.info("Please wait!");

      const { data } = await axios.post(`${BACKEND_URL}/login`, {
        email,
        password,
      });

      if (data.token) {
        sessionStorage.setItem("token", data.token);
      }

      setDisableBtn(false);

      messageApi.success("Login success!");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      messageApi.error(err.response.data.message);
      setDisableBtn(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      navigate("/");
    }
  }, []);

  return (
    <>
      {contextHolder}
      <div className="auth-container">
        <img src="/icon.png" width="34px" height="34px" />
        <h1>Login</h1>
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

          <button
            type="submit"
            className="auth-button"
            style={{ marginBottom: "12px" }}
            disabled={disableBtn}
            onClick={() => {
              setDisableBtn(true);
              handleLogin();
            }}
          >
            Login
          </button>

          <button
            type="submit"
            className="auth-button"
            disabled={disableBtn}
            onClick={() => {
              setDisableBtn(true);
              navigate("/signup");
            }}
          >
            or Sign Up
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
