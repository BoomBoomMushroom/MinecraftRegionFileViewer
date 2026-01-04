class RegionChunkHeaderEntry{
    constructor(offset, lengthOfChunk, lastUpdate){
        this.offset = offset // offset in 4 KiB sectors from the start
        this.length = lengthOfChunk // in 4 KiB sectors, rounded up. Chunks are always less than 1MiB in size
        this.lastUpdate = lastUpdate
    }
}

class Region{
    constructor(){
        this.chunks = []
    }

    loadFromByteArray(byteArray){
        // 1024 entries
        // Filled with `RegionChunkHeaderEntry`
        let chunkHeaderInfo = []

        for(let i=0; i<0x0FFF; i+=4){
            let chunkOffset = (byteArray[i+0] << 16) | (byteArray[i+1] << 8) | byteArray[i+2];
            let chunkLength = byteArray[i+3];
            let updateTimestamp = (byteArray[i+0 + 0x1000] << 24) | (byteArray[i+1 + 0x1000] << 16) | (byteArray[i+2 + 0x1000] << 8) | byteArray[i+3 + 0x1000];
            let chunkHeader = new RegionChunkHeaderEntry(chunkOffset, chunkLength, updateTimestamp);
            chunkHeaderInfo.push(chunkHeader);
        }

        console.log(chunkHeaderInfo)
    }
}

