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

const NBT_TAG_TO_BYTES_READ = {
    TAG_END: 1,
    TAG_BYTE: 2,
    TAG_SHORT: 3,
    TAG_INT: 5,
    TAG_LONG: 9,
    TAG_FLOAT: 5,
    TAG_DOUBLE: 9,
    TAG_BYTE_ARRAY: 5, // add the amount of elements to the bytes read
    TAG_STRING: 3, // add the length of the string to the bytes read
    TAG_LIST: 6, // ts is complicated. varies by tag type. good luck future me
    TAG_COMPOUND: 1, // also complicated, good luck again future me
    TAG_INT_ARRAY: 5, // add the amount of elements times 4 to the bytes read
    TAG_LONG_ARRAY: 5, // add the amount of elements times 8 to the bytes read
}

class NBT_TAG{
    constructor(tagType, id){
        this.tagType = tagType
        this.id = id
        this.values = []; // an array b/c of array and list tags; if it is just an int tag or something it'll just have one element, being it's value
        this.childrenTags = []; // usually only for the compound tag
    }
}
class NBT{
    constructor(){
        this.tags = []
    }

    // the id is just their index in the list
    generateNextTagId(){ return this.tags.length; }

    // nbtTag is of type `NBT_TAG`
    addTagAndGetId(nbtTag){
        this.tags.push(nbtTag);
        return nbtTag.id;
    }

    // these return the tag uuid/index of the one created
    addTag_END(){
        // idk what to do. "Used to mark the end of compound tags."
        // so like i'll figure it out
        return this.addTagAndGetId( new NBT_TAG(NBT_TAG_TYPE_TO_ID.TAG_END, this.generateNextTagId()) )
    }
    addTag_BYTE(){}
    addTag_SHORT(){}
    addTag_INT(){}
    addTag_LONG(){}
    addTag_FLOAT(){}
    addTag_DOUBLE(){}
    addTag_BYTE_ARRAY(){}
    addTag_STRING(){}
    addTag_LIST(){}
    addTag_COMPOUND(){}
    addTag_INT_ARRAY(){}
    addTag_LONG_ARRAY(){}
}

function createNBTFromByteArray(byteArray){
    console.log(byteArray);
    let newNBT = new NBT(); // NBT object we'll return and fill with our tags
    let index = 0; // int
    let breakFromError = false;

    while(index < byteArray.length){
        if(breakFromError==true){ break; }

        let tagTypeByte = byteArray[index];
        console.log("Reading tag with id: 0x" + tagTypeByte.toString(16));
        switch (tagTypeByte) {
            case NBT_TAG_TYPE_TO_ID.TAG_END:
                newNBT.addTag_END();
                index += NBT_TAG_TO_BYTES_READ.TAG_END
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_BYTE:
                newNBT.addTag_BYTE();
                index += NBT_TAG_TO_BYTES_READ.TAG_BYTE
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_SHORT:
                newNBT.addTag_SHORT();
                index += NBT_TAG_TO_BYTES_READ.TAG_SHORT
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_INT:
                newNBT.addTag_INT();
                index += NBT_TAG_TO_BYTES_READ.TAG_INT
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_LONG:
                newNBT.addTag_LONG();
                index += NBT_TAG_TO_BYTES_READ.TAG_LONG
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_FLOAT:
                newNBT.addTag_FLOAT();
                index += NBT_TAG_TO_BYTES_READ.TAG_FLOAT
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_DOUBLE:
                newNBT.addTag_DOUBLE();
                index += NBT_TAG_TO_BYTES_READ.TAG_DOUBLE
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_BYTE_ARRAY:
                newNBT.addTag_BYTE_ARRAY();

                let amountOfElementsByteArr = 0; // todo fill this out
                index += NBT_TAG_TO_BYTES_READ.TAG_BYTE_ARRAY + amountOfElementsByteArr
                
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_STRING:
                newNBT.addTag_STRING();

                let stringLength = 0 // todo also do this
                index += NBT_TAG_TO_BYTES_READ.TAG_STRING + stringLength;
                
                break;
            case NBT_TAG_TYPE_TO_ID.TAG_LIST:
                newNBT.addTag_LIST();
                
                // faaah i will do this later
                index += NBT_TAG_TO_BYTES_READ.TAG_LIST

                break;
            case NBT_TAG_TYPE_TO_ID.TAG_COMPOUND:
                newNBT.addTag_COMPOUND();

                // later please 😭
                index += NBT_TAG_TO_BYTES_READ.TAG_COMPOUND

                break;
            case NBT_TAG_TYPE_TO_ID.TAG_INT_ARRAY:
                newNBT.addTag_INT_ARRAY();

                let amountOfElementsIntArr = 0; // todo fill this out
                index += NBT_TAG_TO_BYTES_READ.TAG_INT_ARRAY + amountOfElementsIntArr*4

                break;
            case NBT_TAG_TYPE_TO_ID.TAG_LONG_ARRAY:
                newNBT.addTag_LONG_ARRAY();

                let amountOfElementsLongArr = 0; // todo fill this out
                index += NBT_TAG_TO_BYTES_READ.TAG_INT + amountOfElementsLongArr*8

                break;
            default:
                console.error("Unknown tag `"+ tagTypeByte +"`! Either data isn't NBT or there is an error! Index: "+index);
                breakFromError = true;
                break;
        }
    }

    return newNBT;
}