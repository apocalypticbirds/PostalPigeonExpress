import {PubSub} from 'graphql-subscriptions';
import {withFilter} from 'graphql-subscriptions';

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
            return conversations.find(conversation => conversation.id === id)
        },
        conversations: () => {
            return conversations
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
