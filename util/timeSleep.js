function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function delayedLog(item) {
    await sleep(3000);
    console.log(item);
}
