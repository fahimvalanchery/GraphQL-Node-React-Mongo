/**
 * import the model
 */
const UserModel = require('../../models/user');
/**
 * hash password
 */
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

module.exports = {
  createUser: async args => {
    try {
      const existingUser = await UserModel.findOne({
        email: args.userInput.email
      });
      if (existingUser) {
        throw new Error('User Exists Already');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new UserModel({
        email: args.userInput.email,
        password: hashedPassword
      });
      const result = await user.save();
      return { ...result._doc, password: null, _id: result.id };
    } catch (error) {
      throw error;
    }
  },
  login: async ({ email, password }) => {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      throw new Error('User does not exist');
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'mysecretkey',
      {
        expiresIn: '1h'
      }
    );
    return {
      userId: user.id,
      token: token,
      tokenExpiration: 1
    };
  }
};
