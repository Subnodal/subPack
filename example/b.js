function b() {
    return aCallback("B");
}

function bCallback(caller) {
    return `I'm B! You're ${caller}!`;
}