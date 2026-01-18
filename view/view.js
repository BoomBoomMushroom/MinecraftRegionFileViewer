function handleFileUpload(elementId) {
    const inputElement = document.getElementById(elementId);
    const fileList = inputElement.files;
    //console.log(fileList)
    if(fileList.length > 0){
        readRegionFile(fileList[0]);
    }
}

function readRegionFile(regionFile){
    console.log("Reading `" + regionFile.name + "`...");
    let fileReader = new FileReader();
    fileReader.addEventListener("loadend", regionFileDoneReading);
    fileReader.readAsArrayBuffer(regionFile);
}

async function regionFileDoneReading(event){
    console.log("Finished reading!");
    console.log(event);

    let reader = event.currentTarget;
    let resultArrayBuffer = reader.result;
    let resultByteArray = new Uint8Array(resultArrayBuffer); // <--- This is the region file in bytes!

    let region = new Region();
    region.loadFromByteArray(resultByteArray);
    // `region.chunks` should now be filled with the nbt data of a chunk

    let chunkSqrList = document.getElementById("chunkSquaresList")
    while(chunkSqrList == null){
        chunkSqrList = document.getElementById("chunkSquaresList")
        await sleep(100); // wait 100ms
    }

    for(let i=0; i<region.chunks.length; i++){
        let chunkNBT = region.chunks[i];
        let chunkStatusElement = chunkSqrList.childNodes[i].nextElementSibling;
        let statusClass = "chunkStatus_"

        switch(chunkNBT["Status"].value){
            case "minecraft:empty": statusClass += "empty"; break;
            case "minecraft:structure_starts": statusClass += "structureStarts"; break;
            case "minecraft:structure_references": statusClass += "structureReferences"; break;
            case "minecraft:biomes": statusClass += "biomes"; break;
            case "minecraft:noise": statusClass += "noise"; break;
            case "minecraft:surface": statusClass += "surface"; break;
            case "minecraft:carvers": statusClass += "carvers"; break;
            case "minecraft:features": statusClass += "features"; break;
            case "minecraft:initialize_light": statusClass += "initLight"; break;
            case "minecraft:light": statusClass += "light"; break;
            case "minecraft:spawn": statusClass += "spawn"; break;
            case "minecraft:full": statusClass += "full"; break;
            default:
                console.error("Unknown Chunk Status: `"+ chunkNBT["Status"].value +"`");
                statusClass = "";
                break;
        }
        if(statusClass != ""){ chunkStatusElement.classList.add(statusClass); }
    }
}
