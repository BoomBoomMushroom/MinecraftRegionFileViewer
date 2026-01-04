const NBT_TAG_TYPE = {
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

class NBT_READ_TAG_DATA{
    constructor(){}

    getTagReadFunction(nbtTagType){
        switch (nbtTagType) {
            case NBT_TAG_TYPE.TAG_END:
                return this.readEndTag;
            case NBT_TAG_TYPE.TAG_BYTE:
                return this.readByteTag;
            case NBT_TAG_TYPE.TAG_SHORT:
                return this.readShortTag;
            case NBT_TAG_TYPE.TAG_INT:
                return this.readIntTag;
            case NBT_TAG_TYPE.TAG_LONG:
                return this.readLongTag;
            case NBT_TAG_TYPE.TAG_FLOAT:
                return this.readFloatTag;
            case NBT_TAG_TYPE.TAG_DOUBLE:
                return this.readDoubleTag;
            case NBT_TAG_TYPE.TAG_BYTE_ARRAY:
                return this.readByteArrayTag;
            case NBT_TAG_TYPE.TAG_STRING:
                return this.readStringTag;
            case NBT_TAG_TYPE.TAG_LIST:
                return this.readListTag;
            case NBT_TAG_TYPE.TAG_COMPOUND:
                return this.readCompoundTag;
            case NBT_TAG_TYPE.TAG_INT_ARRAY:
                return this.readIntArrayTag;
            case NBT_TAG_TYPE.TAG_LONG_ARRAY:
                return this.readLongArrayTag;
            default:
                console.error("Unknown NBT tag type, so I cannot give a function! `0x"+ nbtTagType.toString(16) +"`")
                return null;
        }
    }

    // all of these return the value and the amount of bytes read
    readEndTag(byteArray, startOffset){}
    readByteTag(byteArray, startOffset){}
    readShortTag(byteArray, startOffset){}
    readIntTag(byteArray, startOffset){
        let value = (byteArray[startOffset+0] << 24) | (byteArray[startOffset+1] << 16) | (byteArray[startOffset+2] << 8) | byteArray[startOffset+3]
        if(value > ((2**32)/2)-1){ value -= 2**32 } // converted from uint32 to int32. make it signed

        return [value, 4]
    }
    readLongTag(byteArray, startOffset){
        let longTagValue = (BigInt(byteArray[startOffset+0]) << 56n)
                        |  (BigInt(byteArray[startOffset+1]) << 48n)
                        |  (BigInt(byteArray[startOffset+2]) << 40n)
                        |  (BigInt(byteArray[startOffset+3]) << 32n)
                        |  (BigInt(byteArray[startOffset+4]) << 24n)
                        |  (BigInt(byteArray[startOffset+5]) << 16n)
                        |  (BigInt(byteArray[startOffset+6]) << 8n)
                        |  (BigInt(byteArray[startOffset+7]) << 0n)
        if(longTagValue > ((2**64)/2)-1){ longTagValue -= 2**64 } // converted from uint64 to int64. make it signed
        return [longTagValue, 8]
    }
    readFloatTag(byteArray, startOffset){}
    readDoubleTag(byteArray, startOffset){}
    readByteArrayTag(byteArray, startOffset){}
    readStringTag(byteArray, startOffset){
        let stringTagLength = (byteArray[startOffset + 0] << 8) | byteArray[startOffset + 1]
        let stringTagValue = "";
        for(let stringTagValueIndex=0; stringTagValueIndex<stringTagLength; stringTagValueIndex++){
            stringTagValue += String.fromCharCode( byteArray[startOffset + 2 + stringTagValueIndex] );
        }

        // 2 bytes for the length, and then how many we are going to read for the name
        let bytesRead = 2 + stringTagLength;
        return [stringTagValue, bytesRead]
    }
    readListTag(byteArray, startOffset){
        let listTagType = byteArray[startOffset + 0];
        let lengthOfList = (byteArray[startOffset+1] << 24) | (byteArray[startOffset+2] << 16) | (byteArray[startOffset+3] << 8) | byteArray[startOffset+4]
        
        let bytesRead = 5;
        let listValues = []
        for(let i=0; i<lengthOfList; i++){
            let [valueOfObj, bytesReadForValue] = (this.getTagReadFunction(listTagType))(byteArray, startOffset+bytesRead);
            let valueTag = new NBT_TAG(listTagType, i.toString());
            if(Array.isArray(valueOfObj) == false){ valueOfObj = [valueOfObj] } // put into array if it's not an array
            valueTag.values = valueOfObj;
            
            listValues.push(valueTag);
            bytesRead += bytesReadForValue;
        }
        
        // 1 byte for the type of tag in the list, and 4 bytes for the length of the list
        return [listValues, bytesRead]
    }
    readCompoundTag(byteArray, startOffset){}
    readIntArrayTag(byteArray, startOffset){}
    readLongArrayTag(byteArray, startOffset){
        let longArrayLength = (byteArray[startOffset+0] << 24) | (byteArray[startOffset+1] << 16) | (byteArray[startOffset+2] << 8) | byteArray[startOffset+3]
        if(longArrayLength > ((2**32)/2)-1){ longArrayLength -= 2**32 } // converted from uint32 to int32. make it signed

        // 4 bytes for the amount to read (will add to the return also)
        startOffset += 4

        let valuesArray = [];
        for(let i=0; i<longArrayLength; i++){
            let longArrOffset = startOffset + i*8
            let longTagReadValue = this.readLongTag(byteArray, longArrOffset)[0] // index 0 b/c thats the value

            /*
            let longTagReadValue = (BigInt(byteArray[longArrOffset+0]) << 56n)
                                |  (BigInt(byteArray[longArrOffset+1]) << 48n)
                                |  (BigInt(byteArray[longArrOffset+2]) << 40n)
                                |  (BigInt(byteArray[longArrOffset+3]) << 32n)
                                |  (BigInt(byteArray[longArrOffset+4]) << 24n)
                                |  (BigInt(byteArray[longArrOffset+5]) << 16n)
                                |  (BigInt(byteArray[longArrOffset+6]) << 8n)
                                |  (BigInt(byteArray[longArrOffset+7]) << 0n)
            if(longTagReadValue > ((2**64)/2)-1){ longTagReadValue -= 2**64 } // converted from uint64 to int64. make it signed
            */
            valuesArray.push(longTagReadValue);
        }

        // 4 bytes for the amount to read, amount of bytes read for the list
        let longArrayBytesRead = 4 + 8 * longArrayLength;

        return [valuesArray, longArrayBytesRead]
    }
}

function createNBTFromByteArray(byteArray){
    console.log(byteArray);

    let nbtTagValueReader = new NBT_READ_TAG_DATA();

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
            case NBT_TAG_TYPE.TAG_END:
                endTag();
                // end tags cannot have a name so we must remove it
                amountToAddToIndex -= (2 + tagNameLength)
                console.log("End tag made, backing out of 1 compound")
                break;
            case NBT_TAG_TYPE.TAG_BYTE:
                //newNBT.addTag_BYTE();
                break;
            case NBT_TAG_TYPE.TAG_SHORT:
                //newNBT.addTag_SHORT();
                break;
            case NBT_TAG_TYPE.TAG_INT:
                let intTag = new NBT_TAG(NBT_TAG_TYPE.TAG_INT, tagName);

                let [intTagValue, intTagBytesRead] = nbtTagValueReader.readIntTag(byteArray, index+amountToAddToIndex);
                intTag.values = [intTagValue];

                addTag(intTag);

                // 4 bytes for the value
                amountToAddToIndex += intTagBytesRead;
                
                console.log("Created an Int Tag w/ name: `" + tagName + "` and a value of: `" + intTagValue + "`");
                break;
            case NBT_TAG_TYPE.TAG_LONG:
                let longTag = new NBT_TAG(NBT_TAG_TYPE.TAG_LONG, tagName);
                let [longTagValue, longTagBytesRead] = nbtTagValueReader.readLongTag(byteArray, index+amountToAddToIndex)
                longTag.values = [longTagValue];

                addTag(longTagValue);

                // 8 bytes for the value
                amountToAddToIndex += longTagBytesRead;
                
                console.log("Created an Long Tag w/ name: `" + tagName + "` and a value of: `" + longTagValue + "`");
                break;
            case NBT_TAG_TYPE.TAG_FLOAT:
                //newNBT.addTag_FLOAT();
                break;
            case NBT_TAG_TYPE.TAG_DOUBLE:
                //newNBT.addTag_DOUBLE();
                break;
            case NBT_TAG_TYPE.TAG_BYTE_ARRAY:
                //newNBT.addTag_BYTE_ARRAY();

                let amountOfElementsByteArr = 0; // todo fill this out
                
                break;
            case NBT_TAG_TYPE.TAG_STRING:
                let stringTag = new NBT_TAG(NBT_TAG_TYPE.TAG_STRING, tagName);
                let [stringTagValue, stringTagBytesRead] = nbtTagValueReader.readStringTag(byteArray, index + amountToAddToIndex);
                stringTag.values = [stringTagValue];
                console.log(stringTagValue, stringTagBytesRead)
                
                addTag(stringTag);
                amountToAddToIndex += stringTagBytesRead;
                
                console.log("Created String Tag w/ name: `" + tagName + "` and a value of: `" + stringTagValue + "`");
                break;
            case NBT_TAG_TYPE.TAG_LIST:
                let listTagType = byteArray[index + amountToAddToIndex]; // here so i can log it

                let listTag = new NBT_TAG(NBT_TAG_TYPE.TAG_LIST, tagName);
                let [listTagValue, listTagBytesRead] = nbtTagValueReader.readListTag(byteArray, index + amountToAddToIndex);
                listTag.values = listTagValue

                addTag(listTag)
                
                // 1 byte for the type of tag in the list, and 4 bytes for the length of the list
                amountToAddToIndex += listTagBytesRead;

                //console.log("[MISSING FEATURE] The list tag isn't fully implemented! Come and finish it!!!")

                console.log("Created List Tag w/ name: `" + tagName + "`, a list type of: `0x" + listTagType.toString(16) + "`, a length of `"+ listTag.values.length +"`, and values of: ");
                console.log(listTag.values);
                break;
            case NBT_TAG_TYPE.TAG_COMPOUND:
                // compounds are basically just an NBT themselves, and so i will reuse it (and basically the root is always a compound)
                let newCompoundTag = new NBT(tagName);
                stackOfCompounds.push(newCompoundTag);

                console.log("Created Compound Tag w/ name: `" + tagName + "`");
                break;
            case NBT_TAG_TYPE.TAG_INT_ARRAY:
                //newNBT.addTag_INT_ARRAY();

                let amountOfElementsIntArr = 0; // todo fill this out

                break;
            case NBT_TAG_TYPE.TAG_LONG_ARRAY:
                let longArrayTag = new NBT_TAG(NBT_TAG_TYPE.TAG_LONG_ARRAY, tagName);
                let [longArrayValues, longArrayBytesRead] = nbtTagValueReader.readLongArrayTag(byteArray, index+amountToAddToIndex);
                longArrayTag.values = longArrayValues
                addTag(longArrayTag)

                amountToAddToIndex += longArrayBytesRead

                console.log("Created Long Array Tag w/ name: `" + tagName + "`, a length of `"+longArrayValues.length+"`, and and values of: ");
                console.log(longArrayTag.values)
                break;
            default:
                console.error("Unknown tag `0x"+ tagTypeByte.toString(16) +"`! Either data isn't NBT or there is an error! Index: "+index);
                breakFromError = true;
                break;
        }

        index += amountToAddToIndex;
    }
}