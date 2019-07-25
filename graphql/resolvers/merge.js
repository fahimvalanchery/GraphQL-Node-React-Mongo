const EventModel = require('../../models/event');
const UserModel = require('../../models/user');
const { dateToString } = require('../../helpers/date');
const DataLoader = require('dataloader');
const eventLoader = new DataLoader(eventIds => {
  return events(eventIds);
});
const userLoader = new DataLoader(userIds => {
  return UserModel.find({ _id: { $in: userIds } });
});
const user = async userId => {
  try {
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: () => eventLoader.loadMany(user, _doc.createdEvents)
    };
  } catch (error) {
    throw error;
  }
};

const events = async eventIds => {
  const events = await EventModel.find({ _id: { $in: eventIds } });

  try {
    return events.map(event => {
      return transformEvent(event);
    });
  } catch (error) {
    throw error;
  }
};

const singleEvent = async eventId => {
  try {
    const event = await eventLoader.load(eventId.toString());
    return event;
  } catch (error) {
    throw error;
  }
};

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event._doc.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;

// exports.user = user;
// exports.events = events;
// exports.singleEvent = singleEvent;
