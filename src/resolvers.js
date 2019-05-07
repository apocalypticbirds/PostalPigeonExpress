import {PubSub} from 'graphql-subscriptions';
import {withFilter} from 'graphql-subscriptions';
import jwt from 'jsonwebtoken';
import Conversation from './models/conversation'
import Message from './models/message'
import User from './models/user'

const SECRET = 'somesupersecretkey';
const pubsub = new PubSub();


export const resolvers = {
    Query: {
        conversation: (root, {id}, req) => {
            if (!req.isAuth){
                throw new Error("Unauthenticated");
            }
            return Conversation.findById(id);
            // return conversations.find(conversation => conversation.id === id)
        },
        me: (root, args, req) => {
            if (!req.isAuth){
                throw new Error("Unauthenticated");
            }
            return User.findById(req.userId);
        },
        conversations: (root, args, req) => {
            if (!req.isAuth){
                throw new Error("Unauthenticated");
            }
            return Conversation.find({})
        },
        users: (root, args, req) => {
            if (!req.isAuth){
                throw new Error("Unauthenticated");
            }
            return User.find({});
        },
        login: async (root, {email, password}) => {
            //here should be DB request to check if user exist in DB
            // const user = User.findById("5ca1ca3c1c9d4400003e3593");
            const user = await User.findOne({email: email});
            // return Message.find({id_conversation: {$in: parent.id}})
            if (!user) {
                throw new Error('User does not exist!');
            }
            //const isEqualPassword = await bcrypt.compare(password, user.password);
            //here should be used bcrypt which can compare plant password to hash password from DB
            const isEqualPassword = password === user.password;
            // console.log(`UserID: ${user._id}`);
            // console.log(`Nickname: ${user.nickname}`);
            // console.log(`${password} vs ${user.password}`);
            if (!isEqualPassword) {
                throw new Error('Password is incorrect!');
            }
            const token = jwt.sign({userId: user._id}, SECRET, {
                expiresIn: '1h'
            });
            return {userId: user._id, token: token, tokenExpiration: 1};
        }
    },
    Mutation: {
        addConversation: (root, args, req) => {
            if (!req.isAuth){
                throw new Error("Unauthenticated");
            }
            const conv = new Conversation({name: args.name, contributorsIds: [req.userId]});
            return conv.save();
        },
        addMessage: (root, {id_conversation, content}, req) => {
            if (!req.isAuth){
                throw new Error("Unauthenticated");
            }
            const mssg = new Message({
                id_conversation: id_conversation,
                id_sender: req.userId,
                content: content,
                date: new Date().toISOString()
            });
            pubsub.publish(
                'messageAdded',
                {messageAdded: mssg, id_conversation: id_conversation}
            );
            console.log(`User ${req.userId} send message ${content}`);
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
        contributors
            (parent, args, ctx, info) {
            return User.find({_id: {$in: parent.contributorsIds}})
        }
    },
    User: {
        conversations(parent, args, ctx, info) {
            return Conversation.find({_id: {$in: parent.conversationsIds}})
        }
    }
    ,
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