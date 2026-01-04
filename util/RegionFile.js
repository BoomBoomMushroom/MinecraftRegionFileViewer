const COMPRESSION_TYPE = {
    GZIP: 1,
    ZLIB: 2,
    UNCOMPRESSED: 3,
    LZ4: 4,

    // "Custom compression algorithm (since 24w05a, for third-party servers) ; A namespaced string must follow representing the algorithm used. The string is preceded by its length, encoded as an unsigned 16-bit integer."
    // Will i actually support this? No.
    CUSTOM: 127,
}

class RegionChunkHeaderEntry{
    constructor(offset, lengthOfChunk, lastUpdate){
        this.offset = offset // offset in 4 KiB sectors from the start
        this.length = lengthOfChunk // in 4 KiB sectors, rounded up. Chunks are always less than 1MiB in size
        this.lastUpdate = lastUpdate
    }
}

class Region{
    constructor(){
        this.rawBytes = new Uint8Array();
        this.regionChunkHeaders = []
        this.chunks = []
    }

    // HELPER DEV FUNCTIONS
    downloadURL(data, fileName) {
        var a;
        a = document.createElement('a');
        a.href = data;
        a.download = fileName;
        document.body.appendChild(a);
        a.style = 'display: none';
        a.click();
        a.remove();
    };
    downloadRawBytes(data, fileName, mimeType) {
        var blob, url;
        blob = new Blob([data], {
            type: mimeType
        });
        url = window.URL.createObjectURL(blob);
        this.downloadURL(url, fileName);
        setTimeout(function() {
            return window.URL.revokeObjectURL(url);
        }, 1000);
    };
    // EOF HELPER DEV FUNCTIONS

    loadFromByteArray(byteArray){
        this.rawBytes = byteArray;
        this.loadRegionChunkHeaders();

        // just read0 for now, later we can iterate over all the items in `regionChunkHeaders`
        let rawChunkNTB = this.getRawChunkBytesFromRegionIndex(0); // Uint8Array of bytes, that is NBT; we need to convert it now
        //this.downloadRawBytes(rawChunkNTB, "rawNBT.nbt", "application/octet-stream");

        let chunkNBT = createNBTFromByteArray(rawChunkNTB); // get the NBT object using the bytes from the fetch above
    }

    loadRegionChunkHeaders(){
        // regionChunkHeaders is filled with 1024 entries of type `RegionChunkHeaderEntry`
        for(let i=0; i<0x0FFF; i+=4){
            let chunkOffset = (this.rawBytes[i+0] << 16) | (this.rawBytes[i+1] << 8) | this.rawBytes[i+2];
            let chunkLength = this.rawBytes[i+3];
            let updateTimestamp = (this.rawBytes[i+0 + 0x1000] << 24) | (this.rawBytes[i+1 + 0x1000] << 16) | (this.rawBytes[i+2 + 0x1000] << 8) | this.rawBytes[i+3 + 0x1000];
            let chunkHeader = new RegionChunkHeaderEntry(chunkOffset, chunkLength, updateTimestamp);
            this.regionChunkHeaders.push(chunkHeader);
        }

        console.log(this.regionChunkHeaders);
    }

    getRawChunkBytesFromRegionIndex(chunkIndex){
        let regionChunkHeader = this.regionChunkHeaders[chunkIndex];
        let readStartIndex = regionChunkHeader.offset * 0x1000; // 0x1000 = 4 * 1024 = 4 KiB
        
        let readLength = (this.rawBytes[readStartIndex+0] << 24) | (this.rawBytes[readStartIndex+1] << 16) | (this.rawBytes[readStartIndex+2] << 8) | this.rawBytes[readStartIndex+3]
        if(readLength > ((2**32)/2)-1){ readLength -= 2**32 } // converted from uint32 to int32. make it signed
        let compressionType = this.rawBytes[readStartIndex+4]; // unsigned 1 byte

        // start: startIndex + 4 bytes for length + 1 byte for the compression type
        // end: startIndex + 4 bytes for length + readLength
        // reminder: it's exclusive on the end of the slice, let's make sure that won't cause problems later
        let chunkDataRaw = this.rawBytes.slice(readStartIndex + 4 + 1, readStartIndex + 4 + readLength);
        let chunkData = null; // we need to set this!

        switch(compressionType){
            case COMPRESSION_TYPE.GZIP:
                console.error("GZIP is not supported! Please implement it!");
                break;
            case COMPRESSION_TYPE.ZLIB:
                console.log("ZLIB Compression detected! Using Pako to decompress now");
                chunkData = pako.inflate(chunkDataRaw); // zlib decompress the data
                break;
            case COMPRESSION_TYPE.UNCOMPRESSED:
                // nothing to do, it's already good
                break;
            case COMPRESSION_TYPE.LZ4:
                console.error("LZ4 is not supported! Please implement it!");
                break;
            case COMPRESSION_TYPE.CUSTOM:
                console.error("Custom compression types are not supported! Please implement it!");
                break;
        }

        console.log("Chunk; Read Length: " + readLength + " | Compression Type: " + compressionType + " | Chunk Data Bytes: ");
        console.log(chunkData);

        return chunkData
    }
}

