function a() {
    return bCallback("A");
}

function aCallback(caller) {
    return `I'm A! You're ${caller}!`;
}