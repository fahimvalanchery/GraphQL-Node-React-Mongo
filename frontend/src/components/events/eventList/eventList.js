import React from 'react';
import './eventList.css';
import EventItem from './eventItem/eventItem';
const eventList = props => {
  const events = props.events.map(event => {
    console.log(props.authUserId);
    return (
      <EventItem
        key={event._id}
        eventId={event._id}
        title={event.title}
        userId={props.authUserId}
        creatorId={event.creator._id}
      />
    );
  });
  return <ul className="event__list">{events}</ul>;
};

export default eventList;
