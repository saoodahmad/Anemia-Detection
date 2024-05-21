import { useEffect, useState } from "react";
import axios from "axios";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);

  const handleSignUp = async () => {
    if (password === confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { data } = await axios.post(`${BACKEND_URL}/signup`, {
      email,
      password,
    });

    if (!data.success) {
      alert(data.message);
      setDisableBtn(true);
      return;
    }

    if (data.token) {
      sessionStorage.setItem("token", data.token);
    }

    setDisableBtn(true);

    navigate("/");
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      navigate("/");
    }
  }, []);

  return (
    <div className="auth-container">
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
  );
};

export default SignUp;
