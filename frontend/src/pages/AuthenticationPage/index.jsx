import styles from "./Authentication.module.scss";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import LoginForm from "./LoginForm";
import SignUpForm from "./SignupForm";
import { Button } from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import { useNavigate } from "react-router-dom";

function AuthenticationPage() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const navigate = useNavigate();

  const variants = {
    login: { x: 0 },
    signup: { x: "100%" },
  };

  const formVariants = {
    login: { opacity: 1, x: 0 },
    signup: { opacity: 1, x: "-100%" },
  };

  const handleToggle = () => {
    setIsLogin((isLogin) => !isLogin);
    window.history.pushState({}, "", isLogin ? "/signup" : "/login");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.back}>
        <Button
          variant="text"
          startIcon={<FirstPageIcon />}
          sx={{
            textTransform: "none",
          }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </div>
      <div className={styles.container}>
        <motion.div
          className={`${styles["form-image"]} ${
            !isLogin ? styles["form-image-animation-complete"] : ""
          }`}
          initial={isLogin ? "login" : "signup"}
          animate={isLogin ? "login" : "signup"}
          variants={variants}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          className={styles["form"]}
          initial={isLogin ? "login" : "signup"}
          animate={isLogin ? "login" : "signup"}
          variants={formVariants}
          transition={{ duration: 0.5 }}
        >
          {isLogin ? (
            <LoginForm handleToggle={handleToggle} />
          ) : (
            <SignUpForm handleToggle={handleToggle} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AuthenticationPage;
