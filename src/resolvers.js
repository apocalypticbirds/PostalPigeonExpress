import {PubSub} from 'graphql-subscriptions';
import {withFilter} from 'graphql-subscriptions';
import jwt from 'jsonwebtoken';

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

const users = [
  {
    _id: "5ca1c9a11c9d4400003e3590",
    nickname: "Monteth",
    first_name: "Jan",
    last_name: "Kowalski",
    email: "monteth@gmail.com",
    password: "tralala", 
    conversationsIds: ["5c98f6721c9d440000626e2e"]
  },
  {
    _id: "5ca1ca3c1c9d4400003e3593",
    nickname: "Dima",
    first_name: "Bartosz",
    last_name: "Jakubowicz",
    email:"bartek@gmail.com",
    password: "passw0rd",
    conversationsIds: ["5c98f6721c9d440000626e2e"]
  }
];


let nextId = 3;
let nextMessageId = 5;

const pubsub = new PubSub();

export const resolvers = {
    Query: {
        conversation: (root, {id}) => {
            return conversations.find(conversation => conversation.id === id)
        },
        conversations: () => {
            return conversations
        },
        login: (root, args) => {
            //here should be DB request to check if user exist in DB
            //const user = await User.findOne({email: email});
            const user = users.find(user => user.email == args.email);
            if(!user){
                throw new Error('User does not exist!');
            }
            //here should be used bcrypt which can compare plant password to hash password from DB
            //const isEqualPassword = await bcrypt.compare(password, user.password);
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
            const newConversation = {id: String(nextId++), messages: [], name: args.name};
            conversations.push(newConversation);
            return newConversation;
        },
        addMessage: (root, {message}) => {
            const conversation = conversations
                .find(conversation => conversation.id === message.id_conversation);
            const newMessage = {id: String(nextMessageId++), content: message.content};
            conversation.messages.push(newMessage);
            pubsub.publish(
                'messageAdded',
                {messageAdded: newMessage, id_conversation: message.id_conversation});
            return newMessage;
        }
    },
    Subscription: {
        messageAdded: {
            subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'), (payload, variables) => {
                return payload.id_conversation === variables.id_conversation;
            }),
        },
    },
};
