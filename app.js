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

const app = express();
/**
 * temporary storage
 */
const eventsArray = [];

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
        return eventsArray;
      },
      createEvent: args => {
        const event = {
          _id: Math.random().toString(),
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: args.eventInput.date
        };
        eventsArray.push(event);
        return event;
      }
    },
    graphiql: true
  })
);

app.listen(3000);
