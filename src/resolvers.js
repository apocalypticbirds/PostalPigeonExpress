import {PubSub} from 'graphql-subscriptions';
import {withFilter} from 'graphql-subscriptions';
import Conversation from './models/conversation'
import Message from './models/message'
import User from './models/user'


let nextId = 3;
let nextMessageId = 5;

const pubsub = new PubSub();

export const resolvers = {
    Query: {
        conversation: (root, {id}) => {
            return Conversation.findById(id);
            // return conversations.find(conversation => conversation.id === id)
        },
        conversations: () => {
            return Conversation.find({})
        }
    },
    Mutation: {
        addConversation: (root, args) => {
            const conv = new Conversation({name: args.name, contributorsIds: []});
            return conv.save();
        },
        addMessage: (root, {message}) => {
            const mssg = new Message({
                id_conversation: message.id_conversation,
                id_sender: message.id_sender,
                content: message.content,
                date: new Date().toISOString()
            });
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
    }
};
