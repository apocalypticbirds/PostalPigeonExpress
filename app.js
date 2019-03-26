const express = require('express');
const expect = require('chai').expect;
const graphqlHTTP = require('express-graphql');
// const schema = require('./schema/schema.js');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://user1:ZZQLuMDv5dOJEEmB@cluster0-jhmtv.mongodb.net/postalpigeon?retryWrites=true');
mongoose.connection.once('open', () => {
    console.log('Connected to Mongo')
});

const app = express();

app.use('/graphql', graphqlHTTP({
    // schema: schema,
    graphiql: true
}));

app.listen(4005, () => {
    console.log('Im on port 4005')
});


