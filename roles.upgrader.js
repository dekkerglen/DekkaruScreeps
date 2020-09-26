const actions = require('./actions')
const {buildWithEqualRations} = require('creeputil');

const role = 'upgrader';

module.exports = {
  run: (creep) => {
      if (creep.memory.working && creep.carry.energy == 0) {
          creep.memory.working = false;
      } else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
          creep.memory.working = true;
      }

      if (creep.memory.working) {
        actions.upgrade(creep);
      } else {
        actions.mine(creep);
      }
  },
  build: (spawn, energy) => spawn.createCreep(buildWithEqualRations(energy,[WORK,CARRY,MOVE,MOVE]), undefined, { role, working: false}), 
  role
};