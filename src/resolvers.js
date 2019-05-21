import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'graphql-subscriptions';
import jwt from 'jsonwebtoken';
import Conversation from './models/conversation'
import Message from './models/message'
import User from './models/user'

const SECRET = 'somesupersecretkey';
const pubsub = new PubSub();


export const resolvers = {
    Query: {
        conversation: async (root, { id }, req) => {
            if (!req.isAuth) {
                throw new Error("Unauthenticated");
            }
            return await Conversation.findById(id);
            // return conversations.find(conversation => conversation.id === id)
        },
        me: (root, args, req) => {
            if (!req.isAuth) {
                throw new Error("Unauthenticated");
            }
            return User.findById(req.userId);
        },
        conversations: (root, args, req) => {
            if (!req.isAuth) {
                throw new Error("Unauthenticated");
            }
            return Conversation.find({})
        },
        users: (root, args, req) => {
            if (!req.isAuth) {
                throw new Error("Unauthenticated");
            }
            return User.find({});
        },
        login: async (root, { email, password }) => {
            //here should be DB request to check if user exist in DB
            // const user = User.findById("5ca1ca3c1c9d4400003e3593");
            const user = await User.findOne({ email: email });
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
            const token = jwt.sign({ userId: user._id }, SECRET, {
                expiresIn: '1h'
            });
            return { userId: user._id, token: token, tokenExpiration: 1 };
        }
    },
    Mutation: {
        addConversation: async (root, args, req) => {
            if (!req.isAuth) {
                throw new Error("Unauthenticated");
            }
            const conv = new Conversation({ name: args.name, contributorsIds: [req.userId] });
            const convId = conv._id;
            const user = await User.findById(req.userId);
            user.conversationsIds.push(convId);
            user.save();
            return conv.save();
        },
        addUserToConv: async (root, { id_conv, id_user }, req) => {
            if (!req.isAuth) {
                throw new Error("Unauthenticated");
            }
            const applicant = await User.findById(req.userId);
            if (applicant.conversationsIds.includes(id_conv)) {
                const newUser = await User.findById(id_user);
                const conv = await Conversation.findById(id_conv);
                newUser.conversationsIds.push(id_conv);
                conv.contributorsIds.push(id_user);
                newUser.save();
                return conv.save();
            }
            return null;
        },

        addUsernameToConv: async (root, { nickname, id_conv }, req) => {
            if (!req.isAuth) {
                throw new Error("Unauthenticated");
            }
            const applicant = await User.findById(req.userId);
            if (applicant.conversationsIds.includes(id_conv)) {
                const newUser = await User.findOne({ nickname: nickname });
                const conv = await Conversation.findById(id_conv);
                newUser.conversationsIds.push(id_conv);
                conv.contributorsIds.push(newUser._id);
                newUser.save();
                return conv.save();
            }
            return null;
        },
        addMessage: (root, { id_conversation, content }, req) => {
            if (!req.isAuth) {
                throw new Error("Unauthenticated");
            }
            //changed from const to let
            let mssg = new Message({
                id_conversation: id_conversation,
                id_sender: req.userId,
                content: content,
                tags: [],
                date: new Date().toISOString()
            });

            //here is a bot
            const bot = require('./bot/bot');
            mssg = bot.hideProfanities(mssg);
            mssg = bot.findTags(mssg);

            pubsub.publish(
                'messageAdded',
                { messageAdded: mssg, id_conversation: id_conversation }
            );
            console.log(`User ${req.userId} send message ${content}`);
            return mssg.save();
        },
        addUser: async (root, { email, password, nickname}) => {
            if (email == "" || password == "" || nickname == "") {
                throw new Error("You sent empty field");
            }
            if (!email.includes("@")){
                throw new Error("That's not an e-mail");
            }

            const isFoundEmail = await User.findOne({ email: email });
            if (isFoundEmail){
                throw new Error("User with this e-mail already exist");
            } 
            
            const isFoundnickName = await User.findOne({ nickname: nickname });
            if (isFoundnickName) {
                throw new Error("User with this nickname already exist");
            } 

            const newUser = new User({
                nickname: nickname,
                conversationsIds: [],
                email: email,
                password: password,
            });

            return newUser.save();
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
        async messages(parent, args, ctx, info) {
            const result = await Message.find({ id_conversation: { $in: parent.id } }).sort({ date: 'desc' }).limit(30);
            return result.reverse();
        },
        async contributors
            (parent, args, ctx, info) {
            return await User.find({ _id: { $in: parent.contributorsIds } })
        }
    },
    User: {
        conversations(parent, args, ctx, info) {
            return Conversation.find({ _id: { $in: parent.conversationsIds } })
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
