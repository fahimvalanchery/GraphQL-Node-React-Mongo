import React from 'react';
import './eventList.css';
import EventItem from './eventItem/eventItem';
const eventList = props => {
  const events = props.events.map(event => {
    return (
      <EventItem key={event._id} eventId={event._id} title={event.title} />
    );
  });
  return <ul className="event__list">{events}</ul>;
};

export default eventList;
