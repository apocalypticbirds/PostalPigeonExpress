

/*Message object example in DB
{
    _id:"5ca1d6321c9d440000b498b9",
    id_conversation: "5ca1cfae1c9d440000b498b8"
    id_sender: "5ca1c9a11c9d4400003e3590"
    content: "Hello"
    tags:[] //to nowe
    date: "2019-04-01T18:18:28.716Z"
}*/

//This method searching '#' symbols, read text after it until meet ' ' or next '#'
export const findTags = (message) => {
    let tag = "";
    let isTag = false;
    let endContent = '';
    for(let letter of message.content){
        //reading chars for tag
        if(isTag){
            if(letter !==" " && letter !=="#")
                tag += letter;
            else{
                message.tags.push(tag);
                isTag = !isTag;
                tag = "";
            }
        }
        if(letter === "#"){
            isTag = !isTag;
        }
        if(!isTag)
            endContent += letter;
    }

    if(tag !=="")
        message.tags.push(tag);

    message.content = endContent;

    return message;
};

//This method hide profanities in message
//docs https://www.npmjs.com/package/bad-words
export const hideProfanities = (message) => {
    let Filter = require('bad-words'),
        filter = new Filter();

    message.content = filter.clean(message.content);
    return message;
};