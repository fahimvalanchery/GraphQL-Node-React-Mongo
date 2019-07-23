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

const user = userId => {
  return UserModel.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

const events = eventIds => {
  return EventModel.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

module.exports = {
  events: () => {
    return (
      EventModel.find()
        // .populate('creator')
        .then(events => {
          return events.map(event => {
            return {
              ...event._doc,
              _id: event.id,
              date: new Date(event._doc.date).toISOString(),
              creator: user.bind(this, event._doc.creator)
            };
          });
        })
        .catch(err => {
          console.log(err);
        })
    );
  },
  createEvent: args => {
    const event = new EventModel({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5d3698bf896b6c2c301e6869'
    });
    let createdEvent;
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          _id: result.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, result._doc.creator)
        };
        return UserModel.findById('5d3698bf896b6c2c301e6869');
      })
      .then(user => {
        if (!user) {
          throw new Error('User not Found');
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then(result => {
        return createdEvent;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  },
  createUser: args => {
    return UserModel.findOne({
      email: args.userInput.email
    })
      .then(user => {
        if (user) {
          throw new Error('User Exists Already');
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashedPassword => {
        const user = new UserModel({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        return { ...result._doc, password: null, _id: result.id };
      })
      .catch(err => {
        throw err;
      });
  }
};
