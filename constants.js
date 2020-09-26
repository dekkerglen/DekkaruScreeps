const structureLimits = [
  { // level 0
    container: 5
  },
  { // level 1
    container: 5,
    spawn: 1,
  },
  { // level 2
    container: 5,
    spawn: 1,
    extension: 10,
  },
  { // level 3
    container: 5,
    spawn: 1,
    extension: 10,
    tower: 1
  },
  { // level 4
    container: 5,
    spawn: 1,
    extension: 20,
    tower: 2,
    storage: 1,
    link: 2
  },
  { // level 5
    container: 5,
    spawn: 1,
    extension: 30,
    tower: 2,
    storage: 1,
    link: 2
  },
  { // level 6
    container: 5,
    spawn: 1,
    extension: 40,
    tower: 2,
    storage: 1,
    link: 3,
    extractor: 1,
    lab: 3,
    terminal: 1
  },
  { // level 7
    container: 5,
    spawn: 1,
    extension: 50,
    tower: 3,
    storage: 1,
    link: 4,
    extractor: 1,
    lab: 6,
    terminal: 1
  },
  { // level 8
    container: 5,
    spawn: 3,
    extension: 60,
    tower: 6,
    storage: 1,
    link: 6,
    extractor: 1,
    lab: 10,
    terminal: 1,
    observer: 1,
    powerspawn: 1,
  },
]

// control level thresholds to build these
const structureThresholds = {
  roads: 0,
  ramparts: 2,
  walls: 2
}

const partCosts = {
  MOVE: 50,
  WORK: 100,
  CARRY: 50,
  ATTACK: 80,
  RANGED_ATTACK: 150,
  HEAL: 250,
  CLAIM: 600,
  TOUGH: 10
}

module.exports = {
  structureLimits,
  structureThresholds,
  partCosts
}