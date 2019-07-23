const BookingModel = require('../../models/booking');
const EventModel = require('../../models/event');

const { transformEvent, transformBooking } = require('./merge');

module.exports = {
  bookings: async () => {
    try {
      const bookings = await BookingModel.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (error) {
      throw error;
    }
  },

  bookEvent: async args => {
    const fetchedEvent = await EventModel.findOne({ _id: args.eventId });
    console.log(fetchedEvent);
    const booking = new BookingModel({
      user: '5d3698bf896b6c2c301e6869',
      event: fetchedEvent
    });
    const result = await booking.save();
    return transformBooking(result);
  },
  cancelBooking: async args => {
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
