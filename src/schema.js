import {
    makeExecutableSchema,
    addMockFunctionsToSchema,
} from 'graphql-tools';

import {resolvers} from './resolvers';

// type Conversation { #final
//     id: ID!
//     name: String
//     messages: [Message]
//     contributors: [User]
// }

// addAdvert(advert: AdvertInput!): Advert

const typeDefs = `
type Message {  #final
    id: ID!
    content: String
    sender: User
    date: String
}

type User { #final
    id: ID!
    nickname: String
    conversations: [Conversation]
}

type Conversation { #final
    id: ID
    name: String
    description: String
    tags: [String]
    messages: [Message]
    avatar: String
    contributors: [User]
}

input ConversationInput { #final
    name: String!
    description: String
    tags: [String]
    avatar: String
    contributorsIds: [String]!
}

input MessageInput{
  id_conversation: ID!
  content: String!
  id_sender: String!
}

input SearchConversation{
    name: String!
    tags: [String]
}

type Query {
  conversation(id: ID!): Conversation
  searchConversation(search: SearchConversation!): [Conversation]
  conversations: [Conversation]
}

type Mutation {
  addConversation(conversation: ConversationInput!): Conversation
  addMessage(message: MessageInput!): Message
}

# The subscription root type, specifying what we can subscribe to
type Subscription {
  messageAdded(id_conversation: ID!): Message
}
`;

const schema = makeExecutableSchema({typeDefs, resolvers});
export {schema};
