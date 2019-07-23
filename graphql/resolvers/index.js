/**
 * import mongoose library to connect mongoDB
 */
const mongoose = require('mongoose');
/**
 * import the model
 */

const EventModel = require('../../models/event');
const UserModel = require('../../models/user');
/**
 * hash password
 */
const bcrypt = require('bcryptjs');

const user = async userId => {
  try {
    const user = await UserModel.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (error) {
    throw error;
  }
};

const events = async eventIds => {
  const events = await EventModel.find({ _id: { $in: eventIds } });

  try {
    events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
    return events;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await EventModel.find();
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    } catch (error) {
      throw error;
    }
  },
  createEvent: async args => {
    const event = new EventModel({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5d3698bf896b6c2c301e6869'
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        _id: result.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };
      const creator = await UserModel.findById('5d3698bf896b6c2c301e6869');
      if (!creator) {
        throw new Error('User not Found');
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (error) {
      throw error;
    }
  },
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
