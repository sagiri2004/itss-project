import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import { jwtDecode } from "jwt-decode";

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  TextField,
  Link,
  FormControlLabel,
  Checkbox,
  Button,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import { loginUser, forgotPassword } from "~/redux/authSlice";
import ForgotPassword from "./ForgotPassword";

function LoginForm({ handleToggle }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClickOpen = (event) => {
    event.preventDefault();
    setOpenForgotPassword(true);
  };

  const handleCloseForgotPassword = (event) => {
    event.preventDefault();
    setOpenForgotPassword(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setSnackbar({
        open: true,
        message: "Email is required",
        type: "error",
      });
      return;
    }

    if (!username) {
      setSnackbar({
        open: true,
        message: "Username is required",
        type: "error",
      });
      return;
    }

    setIsLoading(true); // Start the loading indicator
    try {
      const result = await dispatch(forgotPassword({ email, username }));

      console.log("result", result);

      if (result.payload.success) {
        setSnackbar({
          open: true,
          message: result.payload?.message || "Reset password successful",
          type: "success",
        });
        setOpenForgotPassword(false);
      } else {
        setSnackbar({
          open: true,
          message: result.payload?.message || "Reset password failed",
          type: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An unexpected error occurred",
        type: "error",
      });
      console.error("Failed to reset password:", error);
    } finally {
      setIsLoading(false); // Stop the loading indicator
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: "", type: "success" });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const user = {
      username,
      password,
    };

    setIsLoading(true); // Start the loading indicator

    try {
      const result = await dispatch(loginUser(user));

      if (result.payload.success) {
        setSnackbar({
          open: true,
          message: result.payload?.message || "Login successful",
          type: "success",
        });
        navigate("/");
      } else {
        setSnackbar({
          open: true,
          message: result.payload?.message || "Login failed",
          type: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An unexpected error occurred",
        type: "error",
      });
      console.error("Failed to login:", error);
    } finally {
      setIsLoading(false); // Stop the loading indicator
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      console.log("Google login response:", credentialResponse);
      const user = jwtDecode(credentialResponse.credential);
      console.log("Decoded Google Token:", user);

      // Dispatch a login action with Google data
      const result = await dispatch(loginUser(user));

      if (result.payload.success) {
        setSnackbar({
          open: true,
          message: "Google login successful",
          type: "success",
        });
        navigate("/");
      } else {
        setSnackbar({
          open: true,
          message: "Google login failed",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      setSnackbar({
        open: true,
        message: "An unexpected error occurred with Google login",
        type: "error",
      });
    }
  };

  const handleGoogleLoginError = () => {
    setSnackbar({
      open: true,
      message: "Google login failed",
      type: "error",
    });
  };

  return (
    <Box flex="1">
      {isLoading && <LinearProgress color="secondary" />}
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          px: 3,
          py: 5,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h1"
            align="center"
            gutterBottom
            color="white"
          >
            Hello,
          </Typography>
          <Typography
            variant="h5"
            component="h1"
            align="center"
            gutterBottom
            color="white"
          >
            Welcome!
          </Typography>
        </Box>
        <FormControl sx={{ width: "100%" }} variant="outlined">
          <TextField
            id="outlined-basic"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "white",
                },
              },
            }}
          />
        </FormControl>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Link
            component="button"
            onClick={handleClickOpen}
            variant="body2"
            sx={{
              alignSelf: "baseline",
              color: "white",
            }}
          >
            Forgot your password?
          </Link>
        </Box>

        <FormControl sx={{ width: "100%" }} variant="outlined">
          <InputLabel
            htmlFor="outlined-adornment-password"
            sx={{ color: "white" }}
          >
            Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "white",
                },
              },
            }}
          />
        </FormControl>
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
          sx={{ color: "white" }}
        />
        <Box>
          <Typography variant="body2" align="center" color="white">
            Don't have an account?{" "}
            <Button
              underline="hover"
              onClick={handleToggle}
              sx={{
                textTransform: "none",
                color: "white",
              }}
            >
              Sign up
            </Button>
          </Typography>
        </Box>
        <Typography variant="h6" color="white" align="center" gutterBottom>
          Or sign in with Google
        </Typography>
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading} // Disable button while loading
          sx={{
            width: "100%",
            mt: 2,
            textTransform: "none",
            backgroundColor: "#1976d2",
          }}
        >
          Sign in
        </Button>
      </Box>
      <ForgotPassword
        open={openForgotPassword}
        handleClose={handleCloseForgotPassword}
        handleForgotPassword={handleForgotPassword}
        email={email}
        setEmail={setEmail}
        username={username}
        setUsername={setUsername}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.type}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LoginForm;
