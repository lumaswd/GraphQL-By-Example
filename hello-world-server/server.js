const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { makeExecutableSchema } = require('graphql-tools');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const app = express();
const port = 9000;

const typeDefs = `
    type Query {
        greeting: String
    }
`;

const resolvers = {
    Query: {
        greeting: () => 'Hello World!'
    }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(cors(), bodyParser.json());
app.use('/graphql', graphqlExpress({ schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(port, () => console.log(`Server is running on port ${port}!`));