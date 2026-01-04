const NBT_TAG_TYPE_TO_ID = {
    TAG_END: 0x00,
    TAG_BYTE: 0x01,
    TAG_SHORT: 0x02,
    TAG_INT: 0x03,
    TAG_LONG: 0x04,
    TAG_FLOAT: 0x05,
    TAG_DOUBLE: 0x06,
    TAG_BYTE_ARRAY: 0x07,
    TAG_STRING: 0x08,
    TAG_LIST: 0x09,
    TAG_COMPOUND: 0x0A,
    TAG_INT_ARRAY: 0x0B,
    TAG_LONG_ARRAY: 0x0C,
}

class NBT_TAG{
    constructor(tagType, name){
        this.tagType = tagType
        this.name = name
        this.values = []; // an array b/c of array and list tags; if it is just an int tag or something it'll just have one element, being it's value
    }
}

class NBT{
    constructor(name){
        this.tags = {}
        this.name = name
    }

    // the id is just their index in the list
    generateNextTagId(){ return this.tags.length; }

    // nbtTag is of type `NBT_TAG`
    addTag(nbtTag){
        let tagName = nbtTag.name
        this.tags[ tagName ] = nbtTag;
    }
}

function createNBTFromByteArray(byteArray){
    console.log(byteArray);

    let stackOfCompounds = []; // stack/heap of compound tags.
    // All tags will be added to the compound at the bottom
    // When we hit an end tag we will remove the bottom one and add it as a child to the one above it.
    //      if there is no one above it then we will end the NBT and return it.

    let addTag = (tagToAdd)=>{
        // add to the most recent compound
        stackOfCompounds[ stackOfCompounds.length-1 ].addTag(tagToAdd);
    }
    let endTag = ()=>{
        if(stackOfCompounds.length == 0){ console.error("No compound tags to close!"); }
        if(stackOfCompounds.length == 1){ 
            // only 1 compound tag left and we're closing it. I'm assuming we're done so we're going to return now
            return stackOfCompounds[0]; 
        }
        let tagWeAreClosing = stackOfCompounds.pop();
        addTag( tagWeAreClosing ); // add the compound we just closed to the compound tag above it
    }

    let index = 0; // int
    let breakFromError = false;

    while(index < byteArray.length){
        if(breakFromError==true){ break; }

        let amountToAddToIndex = 0;

        let tagTypeByte = byteArray[index];
        let tagNameLength = (byteArray[index + 1] << 8) | byteArray[index + 2];
        let tagName = "";
        for(let tagNameIndex=0; tagNameIndex<tagNameLength; tagNameIndex++){
            tagName += String.fromCharCode( byteArray[index + 3 + tagNameIndex] );
        }
        // tag type, 2 bytes for tag name length, and the how long the name is
        amountToAddToIndex += 1 + 2 + tagNameLength;

        console.log("Reading tag with id: 0x" + tagTypeByte.toString(16));
        switch (tagTypeByte) {
            case NBT_TAG_TYPE_TO_ID.TAG_END:
                endTag();
                // end tags cannot have a name so we must remove it
                amountToAddToIndex -= (2 + tagNameLength)
                console.log("End tag made, backing out of 1 compound")
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_BYTE:
                //newNBT.addTag_BYTE();
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_SHORT:
                //newNBT.addTag_SHORT();
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_INT:
                let intTag = new NBT_TAG(NBT_TAG_TYPE_TO_ID.TAG_INT, tagName);

                let intTagValue = (byteArray[index+amountToAddToIndex+0] << 24) | (byteArray[index+amountToAddToIndex+1] << 16) | (byteArray[index+amountToAddToIndex+2] << 8) | byteArray[index+amountToAddToIndex+3]
                if(intTagValue > ((2**32)/2)-1){ intTagValue -= 2**32 } // converted from uint32 to int32. make it signed

                intTag.values = [intTagValue];

                addTag(intTag);

                // 4 bytes for the value
                amountToAddToIndex += 4;
                
                console.log("Created an Int Tag w/ name: `" + tagName + "` and a value of: `" + intTagValue + "`");
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_LONG:
                let longTag = new NBT_TAG(NBT_TAG_TYPE_TO_ID.TAG_LONG, tagName);

                let longTagValue = (byteArray[index+amountToAddToIndex+0] << 56)
                    | (byteArray[index+amountToAddToIndex+1] << 48)
                    | (byteArray[index+amountToAddToIndex+2] << 40)
                    | (byteArray[index+amountToAddToIndex+3] << 32)
                    | (byteArray[index+amountToAddToIndex+4] << 24)
                    | (byteArray[index+amountToAddToIndex+5] << 16)
                    | (byteArray[index+amountToAddToIndex+6] << 8)
                    | (byteArray[index+amountToAddToIndex+7] << 0)
                if(longTagValue > ((2**64)/2)-1){ longTagValue -= 2**64 } // converted from uint64 to int64. make it signed

                longTag.values = [longTagValue];

                addTag(longTag);

                // 8 bytes for the value
                amountToAddToIndex += 8;
                
                console.log("Created an Long Tag w/ name: `" + tagName + "` and a value of: `" + longTagValue + "`");
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_FLOAT:
                //newNBT.addTag_FLOAT();
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_DOUBLE:
                //newNBT.addTag_DOUBLE();
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_BYTE_ARRAY:
                //newNBT.addTag_BYTE_ARRAY();

                let amountOfElementsByteArr = 0; // todo fill this out
                
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_STRING:
                let stringTagLength = (byteArray[index + amountToAddToIndex + 0] << 8) | byteArray[index + amountToAddToIndex + 1]
                let stringTagValue = "";
                for(let stringTagValueIndex=0; stringTagValueIndex<stringTagLength; stringTagValueIndex++){
                    stringTagValue += String.fromCharCode( byteArray[index + amountToAddToIndex + 2 + stringTagValueIndex] );
                }

                let stringTag = new NBT_TAG(NBT_TAG_TYPE_TO_ID.TAG_STRING, tagName);
                stringTag.values = [stringTagValue];
                
                addTag(stringTag)

                // 2 bytes for the length, and then how many we are going to read for the name
                amountToAddToIndex += 2 + stringTagLength;
                
                console.log("Created String Tag w/ name: `" + tagName + "` and a value of: `" + stringTagValue + "`");
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_LIST:
                let listTagTypes = byteArray[index + amountToAddToIndex + 0];
                let lengthOfList = (byteArray[index+amountToAddToIndex+1] << 24) | (byteArray[index+amountToAddToIndex+2] << 16) | (byteArray[index+amountToAddToIndex+3] << 8) | byteArray[index+amountToAddToIndex+4]

                let listTag = new NBT_TAG(NBT_TAG_TYPE_TO_ID.TAG_LIST, tagName);
                
                // todo: fill values array with tags

                addTag(listTag)
                
                // 1 byte for the type of tag in the list, and 4 bytes for the length of the list
                amountToAddToIndex += 5;

                console.log("[MISSING FEATURE] The list tag isn't fully implemented! Come and finish it!!!")

                console.log("Created List Tag w/ name: `" + tagName + "`, a list type of: `" + listTagTypes + "` and a length of `"+lengthOfList+"`");
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_COMPOUND:
                // compounds are basically just an NBT themselves, and so i will reuse it (and basically the root is always a compound)
                let newCompoundTag = new NBT(tagName);
                stackOfCompounds.push(newCompoundTag);

                console.log("Created Compound Tag w/ name: `" + tagName + "`");
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_INT_ARRAY:
                //newNBT.addTag_INT_ARRAY();

                let amountOfElementsIntArr = 0; // todo fill this out

                break;
            case NBT_TAG_TYPE_TO_ID.TAG_LONG_ARRAY:
                let longArrayLength = (byteArray[index+amountToAddToIndex+0] << 24) | (byteArray[index+amountToAddToIndex+1] << 16) | (byteArray[index+amountToAddToIndex+2] << 8) | byteArray[index+amountToAddToIndex+3]
                if(longArrayLength > ((2**32)/2)-1){ longArrayLength -= 2**32 } // converted from uint32 to int32. make it signed

                // 4 bytes for the amount to read
                amountToAddToIndex += 4

                let longArrayTag = new NBT_TAG(NBT_TAG_TYPE_TO_ID.TAG_LONG_ARRAY, tagName);
                for(let i=0; i<longArrayLength; i++){
                    let longTagReadValue = (byteArray[index+amountToAddToIndex+0 + i*8] << 56)
                                        |  (byteArray[index+amountToAddToIndex+1 + i*8] << 48)
                                        |  (byteArray[index+amountToAddToIndex+2 + i*8] << 40)
                                        |  (byteArray[index+amountToAddToIndex+3 + i*8] << 32)
                                        |  (byteArray[index+amountToAddToIndex+4 + i*8] << 24)
                                        |  (byteArray[index+amountToAddToIndex+5 + i*8] << 16)
                                        |  (byteArray[index+amountToAddToIndex+6 + i*8] << 8)
                                        |  (byteArray[index+amountToAddToIndex+7 + i*8] << 0)
                    console.log(longTagReadValue.toString(16))
                    if(longTagReadValue > ((2**64)/2)-1){ longTagReadValue -= 2**64 } // converted from uint64 to int64. make it signed
                    longArrayTag.values.push(longTagReadValue);
                }

                // amount of bytes read for the list
                amountToAddToIndex += 4 + 8 * longArrayLength;

                addTag(longArrayTag)

                console.log("Created Long Array Tag w/ name: `" + tagName + "`, a length of `"+longArrayLength+"`, and and values of: ");
                console.log(longArrayTag.values)
                break;
            default:
                console.error("Unknown tag `"+ tagTypeByte +"`! Either data isn't NBT or there is an error! Index: "+index);
                breakFromError = true;
                break;
        }

        index += amountToAddToIndex;
    }

    return newNBT;
}