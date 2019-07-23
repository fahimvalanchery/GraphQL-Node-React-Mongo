const EventModel = require('../../models/event');
const UserModel = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await EventModel.find();
      return events.map(event => {
        return transformEvent(event);
      });
    } catch (error) {
      throw error;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Not Authenticated');
    }
    const event = new EventModel({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await UserModel.findById(req.userId);
      if (!creator) {
        throw new Error('User not Found');
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (error) {
      throw error;
    }
  }
};
