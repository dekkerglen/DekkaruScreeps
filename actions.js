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

const build = (creep) => {
  var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
    filter: (s) => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
  });
  if (constructionSite) {
      if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
          creep.moveTo(constructionSite);
      }
  } else {
    repair(creep); // default to repairing if there's nothing to build
  }
}

const repair = (creep) => {
  var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
  });

  if (structure) {
      if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
          creep.moveTo(structure);
      }
  } else {
    repairWalls(creep); //fix walls if we can
  }
}


const transferTower = (creep) => {
  target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  });
  
  if (target) {
    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        // move towards it
        creep.moveTo(target);
    }
    return;
  }

  upgrade(creep); //default reparing upgrading if there's no tower to fill
}

const repairWalls = (creep) => {
  var target = undefined;

  // loop with increasing percentages
  for (let percentage = 0.00001; percentage <= 1; percentage = percentage + 0.0001){
    // find a wall with less than percentage hits
    target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType == (STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits / s.hitsMax < percentage
    });
    
    if (target) {
      if (creep.repair(target) == ERR_NOT_IN_RANGE) {
          // move towards it
          creep.moveTo(target);
      }
      return;
    }
  }

  upgrade(creep); //default reparing upgrading if there's no walls or ramparts to repair
}

const upgrade = (creep) => {
  if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller);
  }
}


module.exports = {
  mine,
  collect,
  upgrade,
  build,
  repair,
  repairWalls,
  transferTower
}