const BookingModel = require('../../models/booking');
const EventModel = require('../../models/event');

const { transformEvent, transformBooking } = require('./merge');

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Not Authenticated');
    }
    try {
      const bookings = await BookingModel.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (error) {
      throw error;
    }
  },

  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Not Authenticated');
    }
    const fetchedEvent = await EventModel.findOne({ _id: args.eventId });
    console.log(fetchedEvent);
    const booking = new BookingModel({
      user: req.userId,
      event: fetchedEvent
    });
    const result = await booking.save();
    return transformBooking(result);
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Not Authenticated');
    }
    try {
      const booking = await BookingModel.findById(args.bookingId).populate(
        'event'
      );
      const event = transformEvent(booking.event);
      await BookingModel.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {
      throw error;
    }
  }
};
