const graphql = require('graphql');
const Message = require('../models/message');
const User = require('../models/user');
const Conversation = require('../models/conversation');
const ObjectId = require('mongoose').Types.ObjectId;

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
} = graphql;


const MessageType = new GraphQLObjectType({
    name: 'Message',
    fields: () => ({
        id: {type: GraphQLID},
        content: {type: GraphQLString},
        sender: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.id_sender)
            }
        },
        date: {type: GraphQLString}
    })
});


const ConversationType = new GraphQLObjectType({
    name: 'Conversation',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        messages: {
            type: GraphQLList(MessageType),
            resolve(parent, args) {
                const messages = Message.find({id_conversation: parent._id});
                return messages
            }
        },
        contributors: {
            type: GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({_id: {$in: parent.contributorsIds}})
            }
        }
    })
});

const AuthData = new GraphQLObjectType({
    name: 'AuthData',
    fields: () => ({
        userId: {type: GraphQLID},
        token: {type: GraphQLString},
        tokenExpiration: {type: GraphQLInt}
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: GraphQLID},
        nickname: {type: GraphQLString},
        conversation: {
            type: GraphQLList(ConversationType),
            resolve(parent, args) {
                return Conversation.find({_id: {$in: parent.conversationsIds}})
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        user: {
            type: UserType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return User.findById(args.id)
            }
        },
        conversation: {
            type: ConversationType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                return Conversation.findById(args.id)
            }
        },
        conversations: {
            type: GraphQLList(ConversationType),
            resolve(parent, args) {
                return Conversation.find({});
            }
        },
        users: {
            type: GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        },
        login:{
            type:GraphQLList(AuthData),
            resolve(parent, args){
                return W
            }
        }
    }
});

/*type RootQuery{
    login(email: String!, password: String!):
}*/

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    sendMessage: {
      type: MessageType,
      args: {
        content: { type: GraphQLNonNull(GraphQLString) },
        id_conversation: { type: GraphQLNonNull(GraphQLString) },
        id_sender: { type: GraphQLNonNull(GraphQLString) } //temporary until the authorization starts working
      },
      resolve(parent, args) {
        const msg = new Message({
          id_conversation: args.id_conversation,
          id_sender: args.id_sender,
          content: args.content,
          date: new Date().toISOString()
        });
        return msg.save();
      }
    },
    createConversation: {
      type: ConversationType,
      args: {
            name: { type: GraphQLNonNull(GraphQLString) },
            contributorsIds:{type: GraphQLList(GraphQLID)} 
      },
      resolve(parent, args) {
          const conversation = new Conversation({
              name: args.name,
              contributorsIds: args.contributorsIds
          }
          );
          return conversation.save();
      }   
    },
    //does not work
    updateConversation: {
        type: ConversationType,
        args: {
            id: {type: GraphQLNonNull(GraphQLID)},
            name: {type: GraphQLString},
            contributorsIds: {type: GraphQLList(GraphQLString)}
        },
        async resolve(parent, args) {
            let doc = Conversation.findById(args.id);
            doc.name = args.name;
            await doc.save();
        }
    }
  }
});



module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
