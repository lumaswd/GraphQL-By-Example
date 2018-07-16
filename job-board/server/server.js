const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const { makeExecutableSchema } = require('graphql-tools');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const fs = require('fs');


const port = 9000;
const jwtSecret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');


// ***
// GraphQL

// File schema.graphql ==> for the type definitions
// Extension graphql ==> GraphQL Schema Definition Language // No JS!
const typeDefs = fs.readFileSync('./schema.graphql', { encoding: 'utf8' });
const resolvers = require('./resolvers');
const schema = makeExecutableSchema({ typeDefs, resolvers });

// **
// ***


const app = express();
app.use(cors(), bodyParser.json(), expressJwt({
  secret: jwtSecret,
  credentialsRequired: false
}));


// ***
// GraphQL Endpoints

const graphqlEndpointURL = '/graphql';
// app.use(graphqlEndpointURL, graphqlExpress({ schema }));
app.use(graphqlEndpointURL, graphqlExpress((req, ) => ({
  schema,
  context: {
    // user: req.user // Passing authentication details
    user: req.user && db.users.get(req.user.sub)
  }
})));

app.use('/graphiql', graphiqlExpress({ endpointURL: graphqlEndpointURL }))

// **
// ***

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.list().find((user) => user.email === email);
  if (!(user && user.password === password)) {
    res.sendStatus(401);
    return;
  }
  const token = jwt.sign({ sub: user.id }, jwtSecret);
  res.send({ token });
});

app.listen(port, () => console.info(`Server started on port ${port}`));
