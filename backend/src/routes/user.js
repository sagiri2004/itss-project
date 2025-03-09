const express = require("express");
const router = express.Router();
const userController = require("~/controllers/UserController");

router.get("/me", userController.getMe);
// find user by name
router.post("/find", userController.findUserByName);
// update user
router.put("/", userController.updateUser);

// get user by id
router.get("/:id", userController.getUserById);

module.exports = router;
