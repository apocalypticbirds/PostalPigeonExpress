import {PubSub} from 'graphql-subscriptions';
import {withFilter} from 'graphql-subscriptions';
import jwt from 'jsonwebtoken';
import Conversation from './models/conversation'
import Message from './models/message'
import User from './models/user'

const conversations = [{
    id: '1',
    name: 'soccer',
    messages: [{
        id: '1',
        content: 'soccer is football',
        sender: 'inneid'
    }, {
        id: '2',
        content: 'hello soccer world cup',
        sender: 'idsenderafan'
    }]
}, {
    id: '2',
    name: 'baseball',
    messages: [{
        id: '3',
        content: 'baseball is life',
    }, {
        id: '4',
        content: 'hello baseball world series',
    }]
}];


let nextId = 3;
let nextMessageId = 5;

const pubsub = new PubSub();

export const resolvers = {
    Query: {
        conversation: (root, {id}) => {
            return Conversation.findById(id);
            // return conversations.find(conversation => conversation.id === id)
        },
        me: (root, {id_user}) => {
            return User.findById(id_user);
        },
        conversations: () => {
            return Conversation.find({})
        },
        users: () => {
            return User.find({})
        login: (root, args) => {
            //here should be DB request to check if user exist in DB
            const user = users.find(user => user.email == args.email);
            //const user = await User.findOne({email: email});
                throw new Error('User does not exist!');
            }
            if(!user){
            //const isEqualPassword = await bcrypt.compare(password, user.password);
            //here should be used bcrypt which can compare plant password to hash password from DB
            const isEqualPassword = args.password == user.password;
            if(!isEqualPassword){
                throw new Error('Password is incorrect!');
            }
            const token = jwt.sign({userId: user._id}, 'somesupersecretkey', {
                expiresIn: '1h'
            });
            return {userId: user._id, token: token, tokenExpiration: 1};
        }
    },
    Mutation: {
        addConversation: (root, args) => {
            const conv = new Conversation({name: args.name, contributorsIds: []});
            return conv.save();
        },
        addMessage: (root, {id_conversation, content, id_sender}) => {
            const mssg = new Message({
                id_conversation: id_conversation,
                id_sender: id_sender,
                content: content,
                date: new Date().toISOString()
            });
            pubsub.publish(
                'messageAdded',
                {messageAdded: mssg, id_conversation: id_conversation}
            );
            return mssg.save();
        }
    },
    Subscription: {
        messageAdded: {
            subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'), (payload, variables) => {
                return payload.id_conversation === variables.id_conversation;
            }),
        },
    },
    Conversation: {
        messages(parent, args, ctx, info) {
            return Message.find({id_conversation: {$in: parent.id}})
        },
        contributors(parent, args, ctx, info) {
            return User.find({_id: {$in: parent.contributorsIds}})
        }
    },
    User: {
        conversations(parent, args, ctx, info) {
            return Conversation.find({_id: {$in: parent.conversationsIds}})
        }
    },
    Message: {
        sender(parent, args, ctx, info) {
            return User.findById(parent.id_sender)
        }
    }
};


/*
======Test requests for postman=====
{
	"query": "query {login(email:\"bartek@gmail.com\", password:\"passw0rd\") {token}}"
}

{
	"query": "query {conversations {id, name}}"
}
*/