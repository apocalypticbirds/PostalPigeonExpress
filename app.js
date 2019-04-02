const express = require('express');
const expect = require('chai').expect;
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema.js');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect('mongodb+srv://user1:ZZQLuMDv5dOJEEmB@cluster0-jhmtv.mongodb.net/postalpigeon?retryWrites=true');
// mongoose.connect('mongodb+srv://user123:xRTUFSAdVrlaud8F@postalpigeon-zj3rz.mongodb.net/test?retryWrites=true');
mongoose.connection.once('open', () => {
    console.log('Connected to Mongo')
});

const app = express();

app.use(cors());

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

const port = 4000;
app.listen(port, () => {
    console.log(`Im on port ${port}`)
});


