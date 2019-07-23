const express = require('express');
const bodyParser = require('body-parser');
/**
 * import GraphQL middleware
 */
const graphqlHttp = require('express-graphql');

/**
 * import GraphQL
 */
const { buildSchema } = require('graphql');

/**
 * import mongoose library to connect mongoDB
 */
const mongoose = require('mongoose');

/**
 * import the model
 */

const EventModel = require('./models/event');

const app = express();

app.use(bodyParser.json());

/**
 * first argument is api endpoint name, Here iam using '/graphql'
 * second argument is middleware function
 *
 */
app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(
      `
      type Event{
        _id:ID!
        title:String!
        description:String!,
        price:Float!,
        date:String!
      }

      input EventInput{
        title:String!
        description:String!,
        price:Float!,
        date:String!
      }

        type RootQuery{
            events:[Event!]!
        }
        type RootMutation{
            createEvent(eventInput:EventInput):Event
        }

        schema{
            query:RootQuery
            mutation:RootMutation
        }
        `
    ),
    rootValue: {
      events: () => {
        return EventModel.find()
          .then(events => {
            return events.map(event => {
              return { ...event._doc, _id: event.id };
            });
          })
          .catch(err => {
            console.log(err);
          });
      },
      createEvent: args => {
        const event = new EventModel({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        });
        return event
          .save()
          .then(result => {
            console.log(result);
            return { ...result._doc, _id: result.id };
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect('mongodb://127.0.0.1:27017/events', { useNewUrlParser: true })
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
