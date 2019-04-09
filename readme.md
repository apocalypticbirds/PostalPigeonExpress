[![Build Status](https://travis-ci.com/apocalipticbirds/PostalPigeonExpress.svg?branch=master)](https://travis-ci.com/apocalipticbirds/PostalPigeonExpress)

# PostalPigeon 

## Backend node.js app for chat application

To run go to root directory and type:

`npm start`

To run tests type:

`npm test`

_Warning! You should install npm to run this app_


## Possible backend request

### Add conversation:
`mutation{
  addConversation(name: "Gently conversation"){
    id
	name
  }
}`

### Get conversation:
`{
  conversation(id: "5ca387903805a07cd4526d77") {
    id
    name
    contributors {
      id
      nickname
    }
    messages {
      id
      content
      date
    }
  }
}`

### Get conversations:
`{
  conversations{
    id
    name
    messages {
      id
      content
    }
  }
}`

### Send message:
`mutation($message: MessageInput!){
  addMessage(message: $message){
		content
    id
  }
}`
### with variables:
`{
  "message": {
    "id_conversation": "5ca387903805a07cd4526d77",
    "id_sender": "5ca1c9a11c9d4400003e3590",
    "content": "Hello"
  }
}`


### Sprint V4 9.04.2019

- Change backend configuration to ES6 JS standard
- Add subscription server based on WebSockets
- Rebuild schema to new qgl format
- Move resolvers to another file and rebuild
- Add subscriptions
- Add login endpoint
- Add user authorisation to all endpoints
- Add middleware for auth purposes
- Add context parameter which is sent to resolvers (for auth)

  
