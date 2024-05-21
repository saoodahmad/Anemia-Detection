import React, { useState } from "react";
import axios from "axios";

import "./index.css";

import HomePage from "./pages/HomePage";
import PredictionHistory from "./pages/PredictionHistory";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/history",
    element: <PredictionHistory />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
