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

function regionFileDoneReading(event){
    console.log("Finished reading!");
    console.log(event);

    let reader = event.currentTarget;
    let resultArrayBuffer = reader.result;
    let resultByteArray = new Uint8Array(resultArrayBuffer); // <--- This is the region file in bytes!

    let region = new Region();
    region.loadFromByteArray(resultByteArray);
    //createNBTFromByteArray(resultByteArray);
}

