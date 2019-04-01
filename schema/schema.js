const graphql = require('graphql');
const Message = require('../models/message');
const User = require('../models/user');
const Conversation= require('../models/conversation');
const ObjectId = require('mongoose').Types.ObjectId;

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
} = graphql;


const MessageType = new GraphQLObjectType({
    name: 'Message',
    fields: () => ({
        id: {type: GraphQLID},
        content: {type: GraphQLString},
        sender: {
            type: UserType,
            resolve(parent, args){
                return User.findById(parent.id_sender)
            }
        },
        date: {type: GraphQLString}
    })
});


const ConversationType = new GraphQLObjectType({
    name: 'Conversation',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        messages: {
            type: GraphQLList(MessageType),
            resolve(parent, args) {
                console.log(parent);
                const messages = Message.find({id_conversation: parent._id});
                console.log(messages);
                return messages
            }
        },
        contributors: {
            type: GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({_id: {$in: parent.contributorsIds}})
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: GraphQLID},
        username: {type: GraphQLString},
        conversation: {
            type: GraphQLList(ConversationType),
            resolve(parent, args) {
                 return Conversation.find({_id: {$in: parent.conversationsIds}})
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields:{
        user: {
            type: UserType,
            args: { id: {type: GraphQLID}},
            resolve(parent, args){
                return User.findById(args.id)
            }
        },
        conversation: {
            type: ConversationType,
            args: { id: {type: GraphQLID}},
            resolve(parent, args){
                return Conversation.findById(args.id)
            }
        },
        users: {
            type: GraphQLList(UserType),
            resolve(parent, args){
                return User.find({});
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});
