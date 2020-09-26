const {partCosts} = require('constants') 

const buildWithEqualRations = (energy, parts) => {
  const res = [];

  let done = false;
  let cost = 0;
  while(!done) {
    done = true;
    for(const part of parts) {
      if(cost + partCosts[part] < energy) {
        res.push(part);
        done = false;
      }
    }
  }

  return res;
}

module.exports = {
  buildWithEqualRations
}