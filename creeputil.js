const {partCosts} = require('constants') 

const buildWithEqualRations = (energy, parts) => {
  const res = [];

  let done = false;
  let cost = 0;
  while(!done) {
    done = true;
    for(const part of parts) {
      if(cost + partCosts[part] <= energy) {
        res.push(part);
        done = false;
        cost += partCosts[part];
      }
    }
  }
  res.sort();
  return res;
}

const getUniqueName = (name) => {
  let i = 0;
  while(Game.creeps[`${name}${i}`]) {
    i++;
  }
  return `${name}${i}`;
}


module.exports = {
  buildWithEqualRations,
  getUniqueName
} 