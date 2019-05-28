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
    tags: [String]
    date: String
}

type Conversation { #final
    id: ID!
    name: String
    messages: [Message]
    contributors: [User]
    avatarUrl: String
}

type User { #final
    id: ID!
    nickname: String
    email: String!
    conversations: [Conversation]
}

type AuthData {
  userId: ID!
  token: String!
  tokenExpiration: Int!
}

input MessageInput{
  id_conversation: ID!
  content: String!
  id_sender: ID!
}

type Query {
  conversation(id: ID!): Conversation
  me: User
  conversations: [Conversation]
  login(email: String!, password: String!): AuthData!
  users: [User]
}

type Mutation {
  addConversation(name: String!): Conversation
  addUserToConv(id_conv: ID!, id_user: ID!): Conversation
  addUsernameToConv(id_conv: ID!, nickname: String!): Conversation
  addMessage(id_conversation: ID!, content: String!): Message
  leaveConversation(id_conv: ID!): Conversation
  addUser(email: String!, password: String!, password2: String!, nickname: String!): User
}

# The subscription root type, specifying what we can subscribe to
type Subscription {
  messageAdded(id_conversation: ID!): Message
}
`;

const schema = makeExecutableSchema({typeDefs, resolvers});
export {schema};
