const Cache2Q = require('../index');

let test = (callback, expected,...props) => {
    let actual = JSON.stringify(callback(props));
    return JSON.stringify(expected) === actual;
}
