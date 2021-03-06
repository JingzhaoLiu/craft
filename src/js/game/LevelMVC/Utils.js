const FacingDirection = require("./FacingDirection.js");

/**
 * Converts entities found within the levelConfig.actionPlane to a
 * levelConfig.entities suitable for loading by the game initializer.
 *
 * ['sheepRight', 'creeperUp] -> [['sheep', 0, 0, 1], ['creeper', 1, 0, 0]]
 *
 * @param levelConfig
 */
module.exports.convertActionPlaneEntitiesToConfig = function (levelConfig) {
  const [width, height] = levelConfig.gridWidth && levelConfig.gridHeight ?
    [levelConfig.gridWidth, levelConfig.gridHeight] : [10, 10];

  var planesToCustomize = [levelConfig.actionPlane];
  planesToCustomize.forEach(function (plane) {
    for (var i = 0; i < plane.length; i++) {
      var item = plane[i];

      if (item.match(/sheep|zombie|ironGolem|creeper|cow|chicken|ghast/)) {
        const suffixToDirection = {
          Up: FacingDirection.North,
          Down: FacingDirection.South,
          Left: FacingDirection.West,
          Right: FacingDirection.East,
        };

        levelConfig.entities = levelConfig.entities || [];
        const x = i % width;
        const y = Math.floor(i / height);

        const directionMatch = item.match(/(.*)(Right|Left|Up|Down)/);
        const directionToUse = directionMatch ?
          suffixToDirection[directionMatch[2]] : FacingDirection.East;
        const entityToUse = directionMatch ? directionMatch[1] : item;
        levelConfig.entities.push([entityToUse, x, y, directionToUse]);
        plane[i] = '';
      }
    }
  });
};

module.exports.randomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};
