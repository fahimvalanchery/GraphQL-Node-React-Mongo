import React from 'react';
import './eventItem.css';
const eventItem = props => (
  <li key={props.eventId} className="event__list-item">
    <div>
      <h1>{props.title}</h1>
      <h2>4</h2>
    </div>
    <div>
      {props.userId === props.creatorId ? (
        <p>You are the Owner of the event</p>
      ) : (
        <button className="btn">View Details</button>
      )}
    </div>
  </li>
);

export default eventItem;
