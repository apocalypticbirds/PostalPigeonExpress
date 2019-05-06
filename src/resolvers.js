import {PubSub} from 'graphql-subscriptions';
import {withFilter} from 'graphql-subscriptions';
import Conversation from './models/conversation'
import Message from './models/message'
import User from './models/user'

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
