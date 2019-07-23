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
const UserModel = require('./models/user');
/**
 * hash password
 */
const bcrypt = require('bcryptjs');
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

      type User{
        _id:ID
        email:String!
        password:String
      }

      input EventInput{
        title:String!
        description:String!,
        price:Float!,
        date:String!
      }

      input UserInput{
        email:String!
        password:String!
      }

        type RootQuery{
            events:[Event!]!
        }
        type RootMutation{
            createEvent(eventInput:EventInput):Event
            createUser(userInput:UserInput):User
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
