/**
 * import the model
 */
const UserModel = require('../../models/user');
/**
 * hash password
 */
const bcrypt = require('bcryptjs');

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
  }
};
