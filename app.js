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
        type RootQuery{
            events:[String!]
        }
        type RootMutation{
            createEvent(name:String):String
        }

        schema{
            query:RootQuery
            mutation:RootMutation
        }
        `
    ),
    rootValue: {
      events: () => {
        return ['event 1', 'event 2', 'event 3'];
      },
      createEvent: args => {
        const eventName = args.name;
        return eventName;
      }
    },
    graphiql: true
  })
);

app.listen(3000);
