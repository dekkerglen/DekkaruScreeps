const {structureLimits, structureThresholds} = require('constants');
const { upgrade } = require('./actions');

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

const getSpiralAroundSpot = (x, y, room, index) => {
  let direction = RIGHT;
  let distance = 1;
  let amount = 0;

  const current = {
    x,
    y:y-1,
    room: room.name
  }

  for(let i = 0; i < index; i++) {
    switch(direction) {
      case UP:
        current.y--;
        break;
      case DOWN:
        current.y++;
        break;
      case LEFT:
        current.x--;
        break;
      case RIGHT:
        current.x++;
        break;
    }

    amount ++;
    if(amount >= distance) {
      amount = 0;
      switch(direction) {
        case UP:
          direction = RIGHT;
          break;
        case DOWN:
          direction = LEFT;
          break;
        case LEFT:
          distance++;
          direction = UP;
          break;
        case RIGHT:
          distance++;
          direction = DOWN;
          break;
      }
    }
  }

  return current;
}

const distance = (pos1, pos2) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y-pos2.y);;
}

const getPlan = (room) => {
  if(!Memory.plans) {
    Memory.plans = {};
  }

  if(true || !Memory.plans[room.name] || Memory.plans[room.name].level < room.controller.level) {
    Memory.plans[room.name] = { constructions:[], level:room.controller.level };

    // make road from each spawn to each energy source and the controller
    const energySources = room.find(FIND_SOURCES_ACTIVE);
    const spawn = room.find(FIND_MY_SPAWNS)[0];

    for(const energySource of energySources) {
      const { path } = PathFinder.search(spawn.pos, {pos:energySource.pos,range:1}, {swampCost: 2});
      for(const pos of path) {
        Memory.plans[room.name].constructions.push({
          type: STRUCTURE_ROAD,
          pos
        })
      }
    }
      
    const { path } = PathFinder.search(spawn.pos, {pos:room.controller.pos,range:1}, {swampCost: 2});
    for(const pos of path) {
      Memory.plans[room.name].constructions.push({
        type: STRUCTURE_ROAD,
        pos
      })
    }


    const structures = room.find(FIND_MY_STRUCTURES);
    const constructions = room.find(FIND_MY_CONSTRUCTION_SITES);
    const positions = structures.map((item) => item.pos)
      .concat(constructions.map((item) => item.pos))
      .concat(Memory.plans[room.name].constructions.map((item) => item.pos));

    const extensions = structures.filter((obj) => obj.structureType == STRUCTURE_EXTENSION)
    const extensionConstructions = constructions.filter((obj) =>  obj.structureType == STRUCTURE_EXTENSION)

    let extensionCount = extensions.length + extensionConstructions.length;
    const terrain = room.getTerrain();

    let index = 0;    
    while(index < 1000 && extensionCount < (structureLimits[room.controller.level].extension || 0)) {
      const coord= getSpiralAroundSpot(spawn.pos.x, spawn.pos.y, room, index);
      index++;
      // ensure checkerboard pattern,
      // and on floor terrain, 
      // and not too close to spawn, 
      // and it doesn't take up a slot we have
      // and not too close to any source
      if((coord.x+coord.y) % 2 == 0 
        && terrain.get(coord.x, coord.y) == 0 
        && distance(spawn.pos, coord) > 2 
        && positions.every((position) => !(coord.x == position.x && coord.y == position.y))
        && energySources.every((source) => distance(source.pos, coord) > 2)) {                  
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_EXTENSION,
            pos:coord
          });
          extensionCount++;
      }
    }
  } 

  return Memory.plans[room.name].constructions;
}

const buildSites = (room) => {
  const plan = getPlan(room);

  //builds roads
      // from spawn to energy sources
      // from upgrader to energy sources
  for(const site of plan) {
    const current = room.lookAt(site.pos).filter((obj) => obj.type == 'constructionSite' || obj.type =='structure');
    if(current.length == 0) {
      const res = room.createConstructionSite(site.pos.x, site.pos.y, site.type);
    }    
  }


  // build max extensions


  // build walls w/ double ramparts?

}

module.exports= {
  buildSites
}