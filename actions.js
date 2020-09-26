const mine = (creep) => {
  var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source);
  }
}

const collect = (creep) => {   
  if(creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
    var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => s.energy < s.energyCapacity
    });
  
    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(structure);
    }
  } else {
    upgrade(creep); //default to upgrading if we're at energy cap
  }
}

const upgrade = (creep) => {
  if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller);
  }
}

const build = (creep) => {
  var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
  if (constructionSite) {
      if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
          creep.moveTo(constructionSite);
      }
  } else {
    repair(creep); // default to repairing if there's nothing to build
  }
}

const repair = (creep) => {
  var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
  });

  if (structure) {
      if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
          creep.moveTo(structure);
      }
  } else {
    upgrade(creep); //default to upgrading if there's nothing to repair
  }
}


module.exports = {
  mine,
  collect,
  upgrade,
  build,
  repair
}