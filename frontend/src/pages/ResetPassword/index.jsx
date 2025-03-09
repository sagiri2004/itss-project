import styles from "./Authentication.module.scss";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import apiClient from "~/api/apiClient";

import { Button, TextField, Typography, CircularProgress } from "@mui/material";

function ResetPassword() {
  const { token } = useParams(); // Extract token from URL params
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Submit password reset
  const handlePasswordReset = async () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      if (response.data.success) {
        alert("Password reset successful. Please log in again.");
        navigate("/login"); // Redirect to login page
      } else {
        setErrorMessage(response.data.message || "Password reset failed.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error resetting password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Typography variant="h5" className={styles.title}>
          Reset Password
        </Typography>
        {errorMessage && (
          <Typography color="error" className={styles.error}>
            {errorMessage}
          </Typography>
        )}
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{ style: { color: "white" } }} // Fix color issue
          InputLabelProps={{ style: { color: "white" } }}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{ style: { color: "white" } }} // Fix color issue
          InputLabelProps={{ style: { color: "white" } }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handlePasswordReset}
          disabled={!password || !confirmPassword || loading}
        >
          {loading ? <CircularProgress size={24} /> : "Reset Password"}
        </Button>
      </div>
    </div>
  );
}

export default ResetPassword;
