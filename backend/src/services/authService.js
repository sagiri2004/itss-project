require("dotenv").config();
const db = require("~/models");
const jwt = require("jsonwebtoken");
const { comparePasswords, hashPassword } = require("~/utils/passwordUtils");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "izumisagiri2004@gmail.com",
    pass: "dlbajuxcecstomoa",
  },
});

const mailOptions = (email, token) => ({
  from: "izumisagiri2004@gmail.com",
  to: email,
  subject: "Reset password",
  text: `Click this link to reset your password: https://group-web-project-omega.vercel.app/reset-password/${token}`,
});

async function loginUser(rawUserData) {
  // check truong hoop nguoi dung login bang google
  if (rawUserData.sub) {
    // neu user chua ton tai thi tao moi
    let user = await db.User.findOne({
      where: { username: rawUserData.email },
    });

    if (!user) {
      //check email
      const user2 = await db.User.findOne({
        where: { email: rawUserData.email },
      });

      if (user2) {
        return {
          message: "Email already exists",
          success: false,
        };
      }

      user = await db.User.create({
        username: rawUserData.email,
        email: rawUserData.email,
        password: rawUserData.sub,
        avatar: rawUserData.picture,
        name: rawUserData.given_name,
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "100h" }
    );

    return {
      message: "Login successfully",
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          roleId: user.roleId,
        },
      },
    };
  }

  const { username, password } = rawUserData;
  if (!username || !password) {
    return {
      message: "Username or password missing",
      success: false,
    };
  }

  const user = await db.User.findOne({
    where: { username: username },
  });

  if (!user) {
    return {
      message: "Username does not exist",
      success: false,
    };
  }

  // neu user bi suspended
  if (user.status === "suspended") {
    return {
      message: "User is suspended",
      success: false,
    };
  }

  const match = await comparePasswords(password, user.password);
  if (!match) {
    return {
      message: "Password is incorrect",
      success: false,
    };
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "100h" }
  );

  return {
    message: "Login successfully",
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        roleId: user.roleId,
      },
    },
  };
}

async function logoutUser() {
  return {
    message: "Logout successfully",
    success: true,
  };
}

async function registerUser(rawUserData) {
  const { username, password, email } = rawUserData;
  if (!username || !password || !email) {
    return {
      message: "Username, password or email missing",
      success: false,
    };
  }

  const user = await db.User.findOne({
    where: { username: username },
  });
  if (user) {
    return {
      message: "Username already exists",
      success: false,
    };
  }

  // check email
  const user2 = await db.User.findOne({
    where: { email: email },
  });

  if (user2) {
    return {
      message: "Email already exists",
      success: false,
    };
  }

  const defaultAvatar =
    "https://assets.quizlet.com/static/i/animals/126.70ed6cbb19b8447.jpg";
  const defaultName = username;
  const hashedPassword = await hashPassword(password);

  await db.User.create({
    username,
    email,
    password: hashedPassword,
    avatar: defaultAvatar,
    name: defaultName,
  });

  return {
    message: "Register successfully",
    success: true,
  };
}

async function changePassword(rawUserData) {
  const { username, oldPassword, newPassword } = rawUserData;
  if (!username || !oldPassword || !newPassword) {
    return {
      message: "Username or password missing",
      success: false,
    };
  }

  const user = await db.User.findOne({
    where: { username: username },
  });

  if (!user) {
    return {
      message: "Username does not exist",
      success: false,
    };
  }

  const match = await comparePasswords(oldPassword, user.password);
  if (!match) {
    return {
      message: "Old password is incorrect",
      success: false,
    };
  }

  const hashedPassword = await hashPassword(newPassword);
  await db.User.update(
    { password: hashedPassword },
    {
      where: { username: username },
    }
  );

  return {
    message: "Change password successfully",
    success: true,
  };
}

async function forgotPassword(rawUserData) {
  const { username } = rawUserData;
  if (!username) {
    return {
      message: "Username missing",
      success: false,
    };
  }

  const user = await db.User.findOne({
    where: { username: username },
  });

  if (!user) {
    return {
      message: "Username does not exist",
      success: false,
    };
  }

  // Tạo token JWT dành cho reset password
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Token hết hạn sau 1 giờ
  );

  // Gửi email chứa link reset mật khẩu
  const email = user.email; // Giả sử username là email
  console.log("email", email);
  await transporter.sendMail(mailOptions(email, token));

  return {
    message: "Email sent. Please check your inbox for reset instructions.",
    success: true,
  };
}

async function resetPassword(rawUserData) {
  const { token, newPassword } = rawUserData;
  if (!token || !newPassword) {
    return {
      message: "Token or new password missing",
      success: false,
    };
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return {
        message: "Invalid token or user does not exist",
        success: false,
      };
    }

    // Cập nhật mật khẩu mới
    const hashedPassword = await hashPassword(newPassword);
    await db.User.update(
      { password: hashedPassword },
      {
        where: { id: user.id },
      }
    );

    return {
      message: "Password reset successfully",
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Invalid or expired token",
      success: false,
    };
  }
}

module.exports = {
  loginUser,
  logoutUser,
  registerUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
