const actions = require('./actions')
const {buildWithEqualRations} = require('creeputil');

const role = 'harvester';

module.exports = {
  run: (creep) => {
      if (creep.memory.working && creep.carry.energy == 0) {
          creep.memory.working = false;
      } else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
          creep.memory.working = true;
      }

      if (creep.memory.working) {
        actions.collect(creep);
      } else {
        actions.mine(creep);
      }
  },
  build: (spawn, energy) => spawn.spawnCreep(buildWithEqualRations(energy,[WORK,WORK,CARRY,MOVE]), `creep${Object.keys(Game.creeps).length}`, {memory:{ role, working: false}}),
  role
};