const chai = require('chai');
const should = require('should');
const expect = chai.expect;
const url = `http://localhost:4000`;
const request = require('supertest')(url);
const app = require('./app');


describe('GraphQL', () => {
    it('Returns user with id = 5ca1c9a11c9d4400003e3590', (done) => {
        request.post('/graphql')
            .send({
                query: '{ user(id: "5ca1c9a11c9d4400003e3590"){ id nickname } } '
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                should.exist(res.body.data.user);
                should(res.body.data.user).have.property('id');
                should(res.body.data.user).have.property('nickname');
                done();
            })
    }),

        it('Returns all users', (done) => {
            request.post('/graphql')
                .send({
                    query: '{ users{ id nickname } } '
                })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    should.exist(res.body.data.users);
                    should(res.body.data.users).have.length(2);
                    should(res.body.data.users[0]).have.property('id');
                    should(res.body.data.users[0]).have.property('nickname');
                    should(res.body.data.users[1]).have.property('id');
                    should(res.body.data.users[1]).have.property('nickname');
                    done();
                })
        })

    it('Returns conversation with id = 5ca1cfae1c9d440000b498b8', (done) => {
        request.post('/graphql')
            .send({
                query: '{ conversation(id: "5ca1cfae1c9d440000b498b8"){ id name contributors { id } messages { id content } } }  '
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                should.exist(res.body.data.conversation);
                should(res.body.data.conversation).have.property('id');
                should(res.body.data.conversation).have.property('name');
                should(res.body.data.conversation.contributors).have.length(2);
                should(res.body.data.conversation.contributors[0]).have.property('id');
                should(res.body.data.conversation.contributors[1]).have.property('id');
                should(res.body.data.conversation.messages[0]).have.property('id');
                should(res.body.data.conversation.messages[0]).have.property('content');
                done();
            })
    })

    it('Send message to conversation with id = 5ca1cfae1c9d440000b498b8', (done) => {
        request.post('/graphql')
            .send({
                query: 'mutation { sendMessage(content: "Testowa wiadomość", id_conversation: "5ca1cfae1c9d440000b498b8", id_sender: "5ca2575ea5ceed5defdd67c2") { id content } }'
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                should.exist(res.body.data.sendMessage);
                should(res.body.data.sendMessage).have.property('id');
                should(res.body.data.sendMessage).have.property('content');
                done();
            })
    })

    it('Create new conversation', (done) => {
        request.post('/graphql')
            .send({
                query: 'mutation { createConversation(name: "Just another conversation", contributorsIds: ["5ca1c9a11c9d4400003e3590", "5ca1ca3c1c9d4400003e3593"]) { id } } '
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                should.exist(res.body.data.createConversation);
                should(res.body.data.createConversation).have.property('id');
                done();
            })
    })

    // it('update conversation data with id = 5ca1cfae1c9d440000b498b8', (done) => {
    //     request.post('/graphql')
    //         .send({
    //             query: 'mutation { updateConversation(id: "5ca1cfae1c9d440000b498b8", name: "ELO", contributorsIds: [ "5ca1c9a11c9d4400003e3590", "5ca1ca3c1c9d4400003e3593" ]){ id name contributors{ id nickname } messages{ id content date } } } '
    //         })
    //         .expect(200)
    //         .end((err,res) => {
    //             if (err) return done(err);
    //             should.exist(res.body.data.updateConversation);
    //             should(res.body.data.updateConversation).have.property('id');
    //             should(res.body.data.updateConversation).have.property('name');
    //             should(res.body.data.updateConversation).have.property('contributors');
    //             should(res.body.data.updateConversation).have.property('messages');
    //             done();
    //         })
    // });
    return 0
});

