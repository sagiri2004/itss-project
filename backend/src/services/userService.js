require("dotenv").config();
const db = require("~/models");

async function getMe(userId) {
  try {
    const user = await db.User.findByPk(userId, {
      attributes: ["id", "username", "name", "avatar"],
    });

    return {
      message: "User found",
      data: user,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function findUserByName(name) {
  try {
    const users = await db.User.findAll({
      where: {
        name: {
          [db.Sequelize.Op.like]: `%${name}%`,
        },
      },
      attributes: ["id", "username", "name", "avatar"],
    });

    return {
      message: "Users found",
      data: users,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function updateUser(userId, user) {
  try {
    await db.User.update(user, {
      where: {
        id: userId,
      },
    });

    const newUser = await db.User.findByPk(userId, {
      attributes: ["id", "username", "name", "avatar"],
    });

    return {
      message: "User updated successfully",
      user: newUser,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getUserById(userId) {
  try {
    const user = await db.User.findByPk(userId, {
      attributes: ["id", "username", "name", "avatar", "email"],
    });

    // lay ra nhung classroom ma user da tao tu trong userClassroom voi isAdmin = true
    const classrooms = await db.UserClassroom.findAll({
      where: {
        userId,
        isAdmin: true,
      },
      include: {
        model: db.Classroom,
        attributes: ["id", "name", "description"],
      },
    });

    // lay ra nhung flashcardSet ma user da tao tu trong flashcardSetUser voi isCreator = true
    const flashcardSets = await db.FlashcardSetUser.findAll({
      where: {
        userId,
        isCreator: true,
      },
      include: {
        model: db.FlashcardSet,
        as: "flashcardSet", // Thêm alias
        attributes: ["id", "title", "description"],
      },
    });

    return {
      message: "User found",
      data: {
        user,
        classrooms,
        flashcardSets,
      },
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  getMe,
  findUserByName,
  updateUser,
  getUserById,
};
