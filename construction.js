const {structureLimits, structureThresholds} = require('constants');
const { 
  getSpiralAroundSpot,
  distance,
  getPositionsAround,
  getOrthogonalPositionsAround,
  groupConsecutivePos
 } = require('./util');

const attemptWall = (constructions, pos, terrain) => {  
  if(terrain.get(pos.x,pos.y) != 1) {
    constructions.push({
      type: STRUCTURE_WALL,
      pos
    });
  }
}

const getPlan = (room) => {
  if(!Memory.plans) {
    Memory.plans = {};
  }

  if(!Memory.plans[room.name] || Memory.plans[room.name].level < room.controller.level) {
    Memory.plans[room.name] = { constructions:[], level:room.controller.level };

    const terrain = room.getTerrain();
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
      //build roads around this position
      const positions = getPositionsAround(terrain, energySource.pos);
      for(const pos of positions) {
        Memory.plans[room.name].constructions.push({
          type: STRUCTURE_ROAD,
          pos
        });
      }
    }
      
    const { path } = PathFinder.search(spawn.pos, {pos:room.controller.pos,range:1}, {swampCost: 2});
    for(const pos of path) {
      Memory.plans[room.name].constructions.push({
        type: STRUCTURE_ROAD,
        pos
      })
    }
    //build roads around this position
    const around = getPositionsAround(terrain, spawn.pos);
    for(const pos of around) {
      Memory.plans[room.name].constructions.push({
        type: STRUCTURE_ROAD,
        pos
      });
    }

    const structures = room.find(FIND_MY_STRUCTURES);
    const constructions = room.find(FIND_MY_CONSTRUCTION_SITES);
    const positions = structures.map((item) => item.pos)
      .concat(constructions.map((item) => item.pos))
      .concat(Memory.plans[room.name].constructions.map((item) => item.pos));

    const extensions = structures.filter((obj) => obj.structureType == STRUCTURE_EXTENSION)
    const extensionConstructions = constructions.filter((obj) =>  obj.structureType == STRUCTURE_EXTENSION)

    let extensionCount = extensions.length + extensionConstructions.length;

    const towers = structures.filter((obj) => obj.structureType == STRUCTURE_TOWER)
    const towerConstructions = constructions.filter((obj) =>  obj.structureType == STRUCTURE_TOWER)

    let towerCount = towers.length + towerConstructions.length;

    let index = 0;    
    while(index < 1000 && towerCount < (structureLimits[room.controller.level].tower || 0)) {
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
          type: STRUCTURE_TOWER,
          pos:coord
        });
        towerCount++;
      }
    }

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

    // build roads around all extensions
    for(const site of Memory.plans[room.name].constructions) {
      if(site.type == STRUCTURE_EXTENSION || site.type == STRUCTURE_TOWER) {

        //build roads around this position
        const around = getOrthogonalPositionsAround(terrain, site.pos);
        for(const pos of around) {
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_ROAD,
            pos
          });
        }
      }
    }


    // build walls and ramparts
    // LEFT /////
    const leftExits = groupConsecutivePos(room.find(FIND_EXIT_LEFT));
    for(const group of leftExits) {  
      // fence post first
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x + 2,
        y: group[0].y - 1,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x + 2,
        y: group[0].y - 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x + 1,
        y: group[0].y - 2,
      }, terrain);
      // fence post last
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x + 2,
        y: group[group.length - 1].y + 1,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x + 2,
        y: group[group.length - 1].y + 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x + 1,
        y: group[group.length - 1].y + 2,
      }, terrain);

      for(let i = 0; i < group.length; i++) {
        // if this is one of the two middle pieces, we need place a rampart
        if(group.length <= 2 || i == Math.floor(group.length/2) || i == Math.floor(group.length/2) + 1) {
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_RAMPART,
            pos: {
              x: group[i].x + 2,
              y: group[i].y
            }
          });
        } else {
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_WALL,
            pos: {
              x: group[i].x + 2,
              y: group[i].y
            }
          });
        }
      }
    }

    // build walls and ramparts
    // RIGHT /////
    const rightExits = groupConsecutivePos(room.find(FIND_EXIT_RIGHT));
    for(const group of rightExits) {  
      // fence post first
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x - 2,
        y: group[0].y - 1,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x - 2,
        y: group[0].y - 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x - 1,
        y: group[0].y - 2,
      }, terrain);
      // fence post last
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x - 2,
        y: group[group.length - 1].y + 1,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x - 2,
        y: group[group.length - 1].y + 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x - 1,
        y: group[group.length - 1].y + 2,
      }, terrain);

      for(let i = 0; i < group.length; i++) {
        // if this is one of the two middle pieces, we need place a rampart
        if(group.length <= 2 || i == Math.floor(group.length/2) || i == Math.floor(group.length/2) + 1) {
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_RAMPART,
            pos: {
              x: group[i].x - 2,
              y: group[i].y
            }
          });
        } else {
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_WALL,
            pos: {
              x: group[i].x - 2,
              y: group[i].y
            }
          });
        }
      }
    }

    // DOWN /////
    const botExits = groupConsecutivePos(room.find(FIND_EXIT_BOTTOM));
    for(const group of botExits) {  
      // fence post first
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x - 1,
        y: group[0].y - 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x - 2,
        y: group[0].y - 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x - 2,
        y: group[0].y - 1,
      }, terrain);
      // fence post last
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x + 1,
        y: group[group.length - 1].y - 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x + 2,
        y: group[group.length - 1].y - 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x + 2,
        y: group[group.length - 1].y - 1,
      }, terrain);

      for(let i = 0; i < group.length; i++) {
        // if this is one of the two middle pieces, we need place a rampart
        if(group.length <= 2 || i == Math.floor(group.length/2) || i == Math.floor(group.length/2) + 1) {
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_RAMPART,
            pos: {
              x: group[i].x,
              y: group[i].y - 2
            }
          });
        } else {
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_WALL,
            pos: {
              x: group[i].x,
              y: group[i].y - 2
            }
          });
        }
      }
    }

    // UP /////
    const topExits = groupConsecutivePos(room.find(FIND_EXIT_TOP));
    for(const group of topExits) {  
      // fence post first
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x - 1,
        y: group[0].y + 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x - 2,
        y: group[0].y + 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[0].x - 2,
        y: group[0].y + 1,
      }, terrain);
      // fence post last
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x + 1,
        y: group[group.length - 1].y + 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x + 2,
        y: group[group.length - 1].y + 2,
      }, terrain);
      attemptWall(Memory.plans[room.name].constructions, {
        x: group[group.length - 1].x + 2,
        y: group[group.length - 1].y + 1,
      }, terrain);

      for(let i = 0; i < group.length; i++) {
        // if this is one of the two middle pieces, we need place a rampart
        if(group.length <= 2 || i == Math.floor(group.length/2) || i == Math.floor(group.length/2) + 1) {
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_RAMPART,
            pos: {
              x: group[i].x,
              y: group[i].y + 2
            }
          });
        } else {
          Memory.plans[room.name].constructions.push({
            type: STRUCTURE_WALL,
            pos: {
              x: group[i].x,
              y: group[i].y + 2
            }
          });
        }
      }
    }
  } 

  // we only put down sites if we have a new plan
  return Memory.plans[room.name].constructions;
}

const fromEntries = (items) => {
  const res = [];

  for(const item of items) {
    res[item[0]] = item[1];
  }

  return res;
}

const convertPos = (pos) => {
  return `(${pos.x}, ${pos.y})`;
}

const buildSites = (room) => {
  const plan = getPlan(room);

  const structures = fromEntries(room.find(FIND_MY_STRUCTURES).map((item) => [convertPos(item.pos), item]));
  const constructions = fromEntries(room.find(FIND_MY_CONSTRUCTION_SITES).map((item) => [convertPos(item.pos), item]));

  for(const site of plan) {
    const current = structures[convertPos(site.pos)];
    if(current) {
      if(current.structureType != site.type) {
        current.destroy();
        room.createConstructionSite(site.pos.x, site.pos.y, site.type);
      }
    } else {
      // we haven't build this
      const construction = constructions[convertPos(site.pos)];
      if(construction) {
        if(construction.structureType != site.type) {
          construction.remove();
          room.createConstructionSite(site.pos.x, site.pos.y, site.type);
        }
      } else {
        room.createConstructionSite(site.pos.x, site.pos.y, site.type);
      }
    }  
  }
}

module.exports= {
  buildSites
}