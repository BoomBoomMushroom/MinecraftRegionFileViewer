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
const NBT_TAG_TYPE_TO_NAME = {
    0x00: "TAG_END",
    0x01: "TAG_BYTE",
    0x02: "TAG_SHORT",
    0x03: "TAG_INT",
    0x04: "TAG_LONG",
    0x05: "TAG_FLOAT",
    0x06: "TAG_DOUBLE",
    0x07: "TAG_BYTE_ARRAY",
    0x08: "TAG_STRING",
    0x09: "TAG_LIST",
    0x0A: "TAG_COMPOUND",
    0x0B: "TAG_INT_ARRAY",
    0x0C: "TAG_LONG_ARRAY",
}

class NBT_TAG{
    constructor(tagType, name){
        this.tagType = tagType;
        this.tagTypeName = NBT_TAG_TYPE_TO_NAME[tagType];
        this.name = name;
        this.value = null;
    }
}

class NBT_READ_TAG_DATA{
    constructor(){}

    getTagReadFunction(nbtTagType){
        switch (nbtTagType) {
            case NBT_TAG_TYPE.TAG_END:
                return this.readEndTag.bind(this);
            case NBT_TAG_TYPE.TAG_BYTE:
                return this.readByteTag.bind(this);
            case NBT_TAG_TYPE.TAG_SHORT:
                return this.readShortTag.bind(this);
            case NBT_TAG_TYPE.TAG_INT:
                return this.readIntTag.bind(this);
            case NBT_TAG_TYPE.TAG_LONG:
                return this.readLongTag.bind(this);
            case NBT_TAG_TYPE.TAG_FLOAT:
                return this.readFloatTag.bind(this);
            case NBT_TAG_TYPE.TAG_DOUBLE:
                return this.readDoubleTag.bind(this);
            case NBT_TAG_TYPE.TAG_BYTE_ARRAY:
                return this.readByteArrayTag.bind(this);
            case NBT_TAG_TYPE.TAG_STRING:
                return this.readStringTag.bind(this);
            case NBT_TAG_TYPE.TAG_LIST:
                return this.readListTag.bind(this);
            case NBT_TAG_TYPE.TAG_COMPOUND:
                return this.readCompoundTag.bind(this);
            case NBT_TAG_TYPE.TAG_INT_ARRAY:
                return this.readIntArrayTag.bind(this);
            case NBT_TAG_TYPE.TAG_LONG_ARRAY:
                return this.readLongArrayTag.bind(this);
            default:
                console.error("Unknown NBT tag type, so I cannot give a function! `0x"+ nbtTagType.toString(16) +"`")
                return null;
        }
    }

    // all of these return the value and the amount of bytes read
    readEndTag(byteArray, startOffset){ console.error("[!!!] Why are we calling `NBT_READ_TAG_DATA.readEndTag`? This shouldn't be called!") }
    readByteTag(byteArray, startOffset){
        let value = byteArray[startOffset]
        if(value > ((2**8)/2)-1){ value -= 2**8 } // converted from uint8 to int8. make it signed

        return [value, 1]
    }
    readShortTag(byteArray, startOffset){
        let value = (byteArray[startOffset+0] << 8) | byteArray[startOffset+1]
        if(value > ((2**16)/2)-1){ value -= 2**16 } // converted from uint16 to int16. make it signed

        return [value, 2]
    }
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
        if(longTagValue > ((2**64)/2)-1){ longTagValue -= BigInt(2**64); } // converted from uint64 to int64. make it signed
        return [longTagValue, 8]
    }
    readFloatTag(byteArray, startOffset){
        console.error("Float Tag is not implemented! Implement it now!");
    }
    readDoubleTag(byteArray, startOffset){
        console.error("Double Tag is not implemented! Implement it now!");
    }
    readByteArrayTag(byteArray, startOffset){
        let [byteArrayLength, bytesReadForLength] = this.readIntTag(byteArray, startOffset)
        startOffset += bytesReadForLength

        let valuesArray = [];
        for(let i=0; i<byteArrayLength; i++){
            let byteArrOffset = startOffset + i;
            let byteTagReadValue = this.readByteTag(byteArray, byteArrOffset)[0] // index 0 b/c thats the value
            valuesArray.push(byteTagReadValue);
        }

        // bytes to know the length of the array, amount of bytes read for the list
        let longArrayBytesRead = bytesReadForLength + byteArrayLength;

        return [valuesArray, longArrayBytesRead]
    }
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
            let decodeTagFunction = this.getTagReadFunction(listTagType)
            let [valueOfObj, bytesReadForValue] = decodeTagFunction(byteArray, startOffset+bytesRead);
            let valueTag = new NBT_TAG(listTagType, i.toString());
            valueTag.value = valueOfObj;
            
            listValues.push(valueTag);
            bytesRead += bytesReadForValue;
        }
        
        // 1 byte for the type of tag in the list, and 4 bytes for the length of the list
        return [listValues, bytesRead]
    }
    readCompoundTag(byteArray, startOffset){
        let currentByteIndex = startOffset;
        let jsonRepresentation = {}

        while(true){
            let tagType = byteArray[currentByteIndex]
            currentByteIndex += 1;

            if(tagType == NBT_TAG_TYPE.TAG_END){
                console.log("End of this compound tag!")
                break;
            }

            let [tagName, tagNameBytesRead] = this.readStringTag(byteArray, currentByteIndex);
            currentByteIndex += tagNameBytesRead;

            console.log("Making tag named `" + tagName + "` and of type `0x" + tagType.toString(16) + "`");

            let tagDecodeFunction = this.getTagReadFunction(tagType);
            let [tagValue, tagBytesRead] = tagDecodeFunction(byteArray, currentByteIndex);
            currentByteIndex += tagBytesRead;

            console.log("Tag Name: `"+ tagName +"` | Tag Type: `0x"+ tagType.toString(16) +"` | Tag Bytes Used: `"+ tagBytesRead +"` | Tag Value: ", tagValue);
            
            let tagObject = new NBT_TAG(tagType, tagName)
            tagObject.value = tagValue
            jsonRepresentation[tagName] = tagObject;
        }

        // end - start = how many bytes read
        return [jsonRepresentation, currentByteIndex-startOffset];
    }
    readIntArrayTag(byteArray, startOffset){
        /*
        let [intArrayLength, bytesReadForLength] = this.readIntTag(byteArray, startOffset)
        startOffset += bytesReadForLength

        let valuesArray = [];
        for(let i=0; i<intArrayLength; i++){
            let intArrOffset = startOffset + i*4
            let intArrOffset = this.readIntTag(byteArray, intArrOffset)[0] // index 0 b/c thats the value
            valuesArray.push(intArrOffset);
        }

        // bytes to know the length of the array, amount of bytes read for the list
        let longArrayBytesRead = bytesReadForLength + 4 * intArrayLength;

        return [valuesArray, longArrayBytesRead]
        */
    }
    readLongArrayTag(byteArray, startOffset){
        let [longArrayLength, bytesReadForLength] = this.readIntTag(byteArray, startOffset)
        startOffset += bytesReadForLength

        let valuesArray = [];
        for(let i=0; i<longArrayLength; i++){
            let longArrOffset = startOffset + i*8
            let longTagReadValue = this.readLongTag(byteArray, longArrOffset)[0] // index 0 b/c thats the value
            valuesArray.push(longTagReadValue);
        }

        // bytes to know the length of the array, amount of bytes read for the list
        let longArrayBytesRead = bytesReadForLength + 8 * longArrayLength;

        return [valuesArray, longArrayBytesRead]
    }
}

function createNBTFromByteArray(byteArray){
    let nbtTagValueReader = new NBT_READ_TAG_DATA();
    // skip the first 3 bytes `0a 00 00`
    // it starts a compound tag a name that has a length of 0x0000 (so no name)
    let index = 3;

    let [compoundOut, bytesRead] = nbtTagValueReader.readCompoundTag(byteArray, index);
    console.log(compoundOut);
}

