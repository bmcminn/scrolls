
const helpers = {};


helpers.name = function(char) {
    return char.name;
}
helpers.kingdom = function(char) {
    return char.kingdom;
}
helpers.title = function(char) {
    return char.title;
}
helpers.age = function(char) {
    return char.age;
}
helpers.description = function(char) {
    return char.description;
}
helpers.race = function(char) {
    return char.race;
}


module.exports = helpers;
