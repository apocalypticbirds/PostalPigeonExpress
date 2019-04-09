import {
    makeExecutableSchema,
    addMockFunctionsToSchema,
} from 'graphql-tools';

import {resolvers} from './resolvers';

const typeDefs = `
type Message {  #final
    id: ID!
    content: String
    sender: User
    date: String
}

type Conversation { #final
    id: ID!
    name: String
    messages: [Message]
    contributors: [User]
}

type User { #final
    id: ID!
    nickname: String
    conversations: [Conversation]
}

input MessageInput{
  id_conversation: ID!
  content: String!
  id_sender: String!
}

type Query {
  conversation(id: ID!): Conversation
  conversations: [Conversation]
}

type Mutation {
  addConversation(name: String!): Conversation
  addMessage(message: MessageInput!): Message
}

# The subscription root type, specifying what we can subscribe to
type Subscription {
  messageAdded(id_conversation: ID!): Message
}
`;

const schema = makeExecutableSchema({typeDefs, resolvers});
export {schema};
