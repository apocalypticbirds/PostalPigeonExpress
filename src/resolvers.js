import {PubSub} from 'graphql-subscriptions';
import {withFilter} from 'graphql-subscriptions';
import Conversation from './models/conversation'
import Message from './models/message'
import User from './models/user'
import Advert from './models/advert'

const pubsub = new PubSub();

export const resolvers = {
    Query: {
        conversation: (root, {id}) => {
            return Conversation.findById(id);
            // return conversations.find(conversation => conversation.id === id)
        },
        conversations: () => {
            return Conversation.find({})
        },
        searchConversation: (root, {search}) => {
            // console.log(search);
            // return Conversation.find({})
            // return Conversation
            //     .find( { text: { $search : search.name } },
            //         { score : { $meta: "textScore" } } )
            // return Conversation.find({name: new RegExp('^'+search.name+'$', "i")});
            // return Conversation.find({name: {$in: search.name}});
            // return Conversation.find({name: {$in: search.name}, tags: {$in: search.tags}})
            // {$or:[{region: "NA"},{sector:"Some Sector"}]}
            // return User.find({_id: {$in: parent.contributorsIds}})

            return Conversation.find(
                {
                    $and: [
                        {name: {"$regex": search.name, "$options": "i"}},
                        {tags: {"$in": search.tags}}
                    ]
                },
            );

            // {
            //     $and: [
            //         {$or: [{a: 1}, {b: 1}]},
            //         {$or: [{c: 1}, {d: 1}]}
            //     ]
            // }

            // PersonModel.find({ favouriteFoods: { "$in" : ["sushi"]} }, ...);
        }

    },
    Mutation: {
        addConversation: (root, {conversation}) => {
            const conv = new Conversation({
                name: conversation.name,
                description: conversation.description,
                tags: conversation.tags,
                avatar: conversation.avatar,
                contributorsIds: conversation.contributorsIds
            });
            return conv.save();
        },
        addMessage: (root, {message}) => {
            const mssg = new Message({
                id_conversation: message.id_conversation,
                id_sender: message.id_sender,
                content: message.content,
                date: new Date().toISOString()
            });
            pubsub.publish(
                'messageAdded',
                {messageAdded: mssg, id_conversation: message.id_conversation}
            );
            console.log("Message received");
            return mssg.save();
        },

        // addAdvert: (root, {advert}) => {
        //     const newAdv = new Advert({
        //         title: advert.title,
        //         description: advert.description,
        //         tags: advert.tags,
        //         date: new Date().toISOString(),
        //         id_sender: advert.id_sender
        //     });
        //     console.log(`Advert added ${advert.title}`);
        //     return newAdv.save()
        // }
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
