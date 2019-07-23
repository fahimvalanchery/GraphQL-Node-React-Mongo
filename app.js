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
          creator: user.bind(this, event.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};
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
        creator:User!
      }

      type User{
        _id:ID
        email:String!
        password:String
        createdEvents:[Event!]
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
        return (
          EventModel.find()
            // .populate('creator')
            .then(events => {
              return events.map(event => {
                return {
                  ...event._doc,
                  _id: event.id,
                  creator: user.bind(this, event._doc.creator)
                  // creator: {
                  //   ...event._doc.creator._doc,
                  //   _id: event._doc.id
                  // }
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
