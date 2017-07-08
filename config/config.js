const nconf = require('nconf');

nconf.env().file(`./config/development.json`);

module.exports = function(key){
  return nconf.get(key);
}
