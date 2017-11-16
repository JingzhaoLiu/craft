(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var PlaceBlockCommand = require("../CommandQueue/PlaceBlockCommand.js");
var PlaceInFrontCommand = require("../CommandQueue/PlaceInFrontCommand.js");
var PlaceDirectionCommand = require("../CommandQueue/PlaceDirectionCommand.js");
var MoveForwardCommand = require("../CommandQueue/MoveForwardCommand.js");
var MoveBackwardCommand = require("../CommandQueue/MoveBackwardCommand.js");
var MoveDirectionCommand = require("../CommandQueue/MoveDirectionCommand.js");
var WhileCommand = require("../CommandQueue/WhileCommand.js");
var IfBlockAheadCommand = require("../CommandQueue/IfBlockAheadCommand.js");
var CallbackCommand = require("../CommandQueue/CallbackCommand.js");
var RepeatCommand = require("../CommandQueue/RepeatCommand.js");

module.exports.get = function (controller) {
  return {
    /**
     * Called before a list of user commands will be issued.
     */
    startCommandCollection: function startCommandCollection() {
      if (controller.DEBUG) {
        console.log("Collecting commands.");
      }
    },

    /**
     * Called when an attempt should be started, and the entire set of
     * command-queue API calls have been issued.
     *
     * @param {Function} onAttemptComplete - callback with two parameters,
     * "success", i.e., true if attempt was successful (level completed),
     * false if unsuccessful (level not completed), and the current level model.
     */
    startAttempt: function startAttempt(onAttemptComplete) {
      controller.OnCompleteCallback = onAttemptComplete;
      controller.setPlayerActionDelayByQueueLength();
      controller.queue.begin();
      controller.run();
      controller.attemptRunning = true;
      controller.resultReported = false;
    },

    resetAttempt: function resetAttempt() {
      controller.reset();
      controller.queue.reset();
      controller.OnCompleteCallback = null;
      controller.attemptRunning = false;
    },

    /**
     * @param highlightCallback
     * @param codeBlockCallback - for example:
     *  (e) => {
     *    if (e.type !== 'blockDestroyed') {
     *      return;
     *    }
     *
     *    if (e.blockType !== '[dropdown value, e.g. logOak') {
     *      return;
     *    }
     *
     *    evalUserCode(e.block);
     *  }
     */
    registerEventCallback: function registerEventCallback(highlightCallback, codeBlockCallback) {
      // TODO(bjordan): maybe need to also handle top-level event block highlighting
      controller.events.push(codeBlockCallback);

      // in controller:
      // this.events.forEach((e) => e({ type: EventType.BLOCK_DESTROYED, blockType: 'logOak' });
      // (and clear out on reset)
    },

    onEventTriggered: function onEventTriggered(highlightCallback, type, eventType, callback) {
      this.registerEventCallback(highlightCallback, function (event) {
        if (event.eventType === eventType && event.targetType === type) {
          callback(event);
        }
      });
    },

    // helper functions for event
    isEventTriggered: function isEventTriggered(event, eventType) {
      return event.eventType === eventType;
    },

    // command list
    moveDirection: function moveDirection(highlightCallback, targetEntity, direction) {
      controller.addCommand(new MoveDirectionCommand(controller, highlightCallback, targetEntity, direction), targetEntity);
    },

    moveForward: function moveForward(highlightCallback, targetEntity) {
      controller.addCommand(new MoveForwardCommand(controller, highlightCallback, targetEntity), targetEntity);
    },

    moveBackward: function moveBackward(highlightCallback, targetEntity) {
      controller.addCommand(new MoveBackwardCommand(controller, highlightCallback, targetEntity), targetEntity);
    },

    moveAway: function moveAway(highlightCallback, targetEntity, moveAwayFrom) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.moveAway(callbackCommand, moveAwayFrom);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    moveToward: function moveToward(highlightCallback, targetEntity, moveTowardTo) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.moveToward(callbackCommand, moveTowardTo);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    flashEntity: function flashEntity(highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.flashEntity(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    explodeEntity: function explodeEntity(highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.explodeEntity(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    use: function use(highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.use(callbackCommand, targetEntity);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    playSound: function playSound(highlightCallback, sound, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.playSound(callbackCommand, sound);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    turn: function turn(highlightCallback, direction, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.turn(callbackCommand, direction === 'right' ? 1 : -1);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    turnRandom: function turnRandom(highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.turnRandom(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    turnRight: function turnRight(highlightCallback, targetEntity) {
      this.turn(highlightCallback, 'right', targetEntity);
    },

    turnLeft: function turnLeft(highlightCallback, targetEntity) {
      this.turn(highlightCallback, 'left', targetEntity);
    },

    destroyBlock: function destroyBlock(highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.destroyBlock(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    placeBlock: function placeBlock(highlightCallback, blockType, targetEntity) {
      controller.addCommand(new PlaceBlockCommand(controller, highlightCallback, blockType, targetEntity), targetEntity);
    },

    placeDirection: function placeDirection(highlightCallback, blockType, targetEntity, direction) {
      controller.addCommand(new PlaceDirectionCommand(controller, highlightCallback, blockType, targetEntity, direction), targetEntity, direction);
    },

    placeInFront: function placeInFront(highlightCallback, blockType, targetEntity) {
      controller.addCommand(new PlaceInFrontCommand(controller, highlightCallback, blockType, targetEntity), targetEntity);
    },

    tillSoil: function tillSoil(highlightCallback, targetEntity) {
      controller.addCommand(new PlaceInFrontCommand(controller, highlightCallback, 'watering', targetEntity));
    },

    whilePathAhead: function whilePathAhead(highlightCallback, blockType, targetEntity, codeBlock) {
      controller.addCommand(new WhileCommand(controller, highlightCallback, blockType, targetEntity, codeBlock), targetEntity);
    },

    ifBlockAhead: function ifBlockAhead(highlightCallback, blockType, targetEntity, codeBlock) {
      controller.addCommand(new IfBlockAheadCommand(controller, highlightCallback, blockType, targetEntity, codeBlock), targetEntity);
    },
    // -1 for infinite repeat
    repeat: function repeat(highlightCallback, codeBlock, iteration, targetEntity) {
      controller.addCommand(new RepeatCommand(controller, highlightCallback, codeBlock, iteration, targetEntity));
    },
    // -1 for infinite repeat
    repeatRandom: function repeatRandom(highlightCallback, codeBlock, targetEntity) {
      var maxIteration = 10;
      var randomIteration = Math.floor(Math.random() * maxIteration) + 1;
      controller.addCommand(new RepeatCommand(controller, highlightCallback, codeBlock, randomIteration, targetEntity));
    },

    getScreenshot: function getScreenshot() {
      return controller.getScreenshot();
    },

    spawnEntity: function spawnEntity(highlightCallback, type, spawnDirection) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.spawnEntity(callbackCommand, type, spawnDirection);
      });
      controller.addCommand(callbackCommand);
    },

    destroyEntity: function destroyEntity(highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.destroyEntity(callbackCommand, targetEntity);
      }, targetEntity);
      controller.addGlobalCommand(callbackCommand);
    },

    drop: function drop(highlightCallback, itemType, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.drop(callbackCommand, itemType);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    startDay: function startDay(highlightCallback) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.startDay(callbackCommand);
      });
      controller.addGlobalCommand(callbackCommand);
    },

    startNight: function startNight(highlightCallback) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.startNight(callbackCommand);
      });
      controller.addGlobalCommand(callbackCommand);
    },

    wait: function wait(highlightCallback, time, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.wait(callbackCommand, time);
      }, targetEntity);
      controller.addGlobalCommand(callbackCommand);
    },

    attack: function attack(highlightCallback, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.attack(callbackCommand);
      }, targetEntity);
      controller.addCommand(callbackCommand);
    },

    setDayNightCycle: function setDayNightCycle(firstDelay, delayInSecond, startTime) {
      if (!controller.dayNightCycle) {
        controller.dayNightCycle = true;
        controller.initiateDayNightCycle(firstDelay, delayInSecond, startTime);
      }
    },

    addScore: function addScore(highlightCallback, score, targetEntity) {
      var callbackCommand = new CallbackCommand(controller, highlightCallback, function () {
        controller.addScore(callbackCommand, score);
      }, targetEntity);
      controller.addGlobalCommand(callbackCommand);
    },

    arrowDown: function arrowDown(direction) {
      controller.arrowDown(direction);
    },

    arrowUp: function arrowUp(direction) {
      controller.arrowUp(direction);
    },

    clickDown: function clickDown() {
      controller.clickDown();
    },

    clickUp: function clickUp() {
      controller.clickUp();
    }
  };
};

},{"../CommandQueue/CallbackCommand.js":3,"../CommandQueue/IfBlockAheadCommand.js":6,"../CommandQueue/MoveBackwardCommand.js":7,"../CommandQueue/MoveDirectionCommand.js":8,"../CommandQueue/MoveForwardCommand.js":9,"../CommandQueue/PlaceBlockCommand.js":10,"../CommandQueue/PlaceDirectionCommand.js":11,"../CommandQueue/PlaceInFrontCommand.js":12,"../CommandQueue/RepeatCommand.js":13,"../CommandQueue/WhileCommand.js":14}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CommandState = require("./CommandState.js");

module.exports = (function () {
  function BaseCommand(gameController, highlightCallback, targetEntity) {
    _classCallCheck(this, BaseCommand);

    this.GameController = gameController;
    this.Game = gameController.game;
    this.HighlightCallback = highlightCallback;
    this.state = CommandState.NOT_STARTED;
    this.target = targetEntity;
    this.repeat = false;
  }

  _createClass(BaseCommand, [{
    key: "tick",
    value: function tick() {}
  }, {
    key: "begin",
    value: function begin() {
      if (this.HighlightCallback) {
        this.HighlightCallback();
      }
      this.state = CommandState.WORKING;
    }

    /**
     * Whether the command has started working.
     * @returns {boolean}
     */
  }, {
    key: "isStarted",
    value: function isStarted() {
      return this.state !== CommandState.NOT_STARTED;
    }

    /**
     * Whether the command has succeeded or failed, and is
     * finished with its work.
     * @returns {boolean}
     */
  }, {
    key: "isFinished",
    value: function isFinished() {
      return this.isSucceeded() || this.isFailed();
    }

    /**
     * Whether the command has finished with its work and reported success.
     * @returns {boolean}
     */
  }, {
    key: "isSucceeded",
    value: function isSucceeded() {
      return this.state === CommandState.SUCCESS;
    }

    /**
     * Whether the command has finished with its work and reported failure.
     * @returns {boolean}
     */
  }, {
    key: "isFailed",
    value: function isFailed() {
      return this.state === CommandState.FAILURE;
    }
  }, {
    key: "succeeded",
    value: function succeeded() {
      this.state = CommandState.SUCCESS;
    }
  }, {
    key: "failed",
    value: function failed() {
      this.state = CommandState.FAILURE;
    }
  }]);

  return BaseCommand;
})();

},{"./CommandState.js":5}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(CallbackCommand, _BaseCommand);

  function CallbackCommand(gameController, highlightCallback, actionCallback, targetEntity) {
    _classCallCheck(this, CallbackCommand);

    _get(Object.getPrototypeOf(CallbackCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity);
    this.actionCallback = actionCallback;
  }

  _createClass(CallbackCommand, [{
    key: "tick",
    value: function tick() {
      // do stuff
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(CallbackCommand.prototype), "begin", this).call(this);
      this.actionCallback();
    }
  }]);

  return CallbackCommand;
})(BaseCommand);

},{"./BaseCommand.js":2}],4:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CommandState = require("./CommandState.js");

module.exports = (function () {
  function CommandQueue(gameController) {
    _classCallCheck(this, CommandQueue);

    this.gameController = gameController;
    this.game = gameController.game;
    this.reset();
    this.repeatCommands = [];
    this.setUnshiftState = false;
    this.highPriorityCommands = [];
  }

  _createClass(CommandQueue, [{
    key: "addCommand",
    value: function addCommand(command) {
      var repeat = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      command.repeat = repeat;
      // if we're handling a while command, add to the while command's queue instead of this queue
      if (this.whileCommandQueue) {
        this.whileCommandQueue.addCommand(command);
      } else {
        if (this.setUnshiftState) {
          this.highPriorityCommands.push(command);
        } else {
          this.commandList_.push(command);
        }
      }
    }
  }, {
    key: "setWhileCommandInsertState",
    value: function setWhileCommandInsertState(queue) {
      this.whileCommandQueue = queue;
    }
  }, {
    key: "begin",
    value: function begin() {
      this.state = CommandState.WORKING;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.state = CommandState.NOT_STARTED;
      this.currentCommand = null;
      this.commandList_ = [];
      this.highPriorityCommands = [];
      if (this.whileCommandQueue) {
        this.whileCommandQueue.reset();
      }
      this.repeatCommands = [];
      this.whileCommandQueue = null;
    }
  }, {
    key: "startPushHighPriorityCommands",
    value: function startPushHighPriorityCommands() {
      this.setUnshiftState = true;
      // clear existing highPriorityCommands
      this.highPriorityCommands = [];
    }
  }, {
    key: "endPushHighPriorityCommands",
    value: function endPushHighPriorityCommands() {
      // unshift highPriorityCommands to the command list
      for (var i = this.highPriorityCommands.length - 1; i >= 0; i--) {
        this.commandList_.unshift(this.highPriorityCommands[i]);
      }
      this.setUnshiftState = false;
    }
  }, {
    key: "tick",
    value: function tick() {
      if (this.state === CommandState.WORKING) {
        // if there is no command
        if (!this.currentCommand) {
          // if command list is empty
          if (this.commandList_.length === 0) {
            // mark this queue as a success if there is no repeat command
            if (this.repeatCommands.length === 0) {
              this.state = CommandState.SUCCESS;
            }
            // if there are repeat command for this queue, add them
            this.gameController.startPushRepeatCommand();
            for (var i = 0; i < this.repeatCommands.length; i++) {
              if (this.repeatCommands[i][1] > 0) {
                this.repeatCommands[i][0]();
                this.repeatCommands[i][1]--;
              } else if (this.repeatCommands[i][1] === -1) {
                this.repeatCommands[i][0]();
              } else {
                this.repeatCommands.splice(i, 1);
              }
            }
            this.gameController.endPushRepeatCommand();
            return;
          }
          // get new command from the command list
          this.currentCommand = this.commandList_.shift();
        }

        if (!this.currentCommand.isStarted()) {
          this.currentCommand.begin();
        } else {
          this.currentCommand.tick();
        }

        // check if command is done
        if (this.currentCommand.isSucceeded()) {
          this.currentCommand = null;
        } else if (this.currentCommand.isFailed()) {
          this.state = CommandState.FAILURE;
        }
      }
    }
  }, {
    key: "getLength",
    value: function getLength() {
      return this.commandList_ ? this.commandList_.length : 0;
    }

    /**
     * Whether the command has started working.
     * @returns {boolean}
     */
  }, {
    key: "isStarted",
    value: function isStarted() {
      return this.state !== CommandState.NOT_STARTED;
    }

    /**
     * Whether the command has succeeded or failed, and is
     * finished with its work.
     * @returns {boolean}
     */
  }, {
    key: "isFinished",
    value: function isFinished() {
      return this.isSucceeded() || this.isFailed();
    }

    /**
     * Whether the command has finished with its work and reported success.
     * @returns {boolean}
     */
  }, {
    key: "isSucceeded",
    value: function isSucceeded() {
      return this.state === CommandState.SUCCESS;
    }

    /**
     * Whether the command has finished with its work and reported failure.
     * @returns {boolean}
     */
  }, {
    key: "isFailed",
    value: function isFailed() {
      return this.state === CommandState.FAILURE;
    }
  }, {
    key: "addRepeatCommands",
    value: function addRepeatCommands(codeBlock, iteration) {
      // forever loop cancel existing forever loops
      if (iteration === -1) {
        for (var i = 0; i < this.repeatCommands.length; i++) {
          if (this.repeatCommands[i][1] === -1) {
            this.repeatCommands.splice(i, 1);
            break;
          }
        }
      }
      this.repeatCommands.push([codeBlock, iteration]);
      this.begin();
    }
  }]);

  return CommandQueue;
})();

},{"./CommandState.js":5}],5:[function(require,module,exports){
"use strict";

module.exports = Object.freeze({
  NOT_STARTED: 0,
  WORKING: 1,
  SUCCESS: 2,
  FAILURE: 3
});

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommandState = require("./CommandState.js");
var CommandQueue = require("./CommandQueue.js");
var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(IfBlockAheadCommand, _BaseCommand);

  function IfBlockAheadCommand(gameController, highlightCallback, blockType, targetEntity, callback) {
    _classCallCheck(this, IfBlockAheadCommand);

    _get(Object.getPrototypeOf(IfBlockAheadCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity);

    this.blockType = blockType;
    this.ifCodeCallback = callback;

    this.queue = new CommandQueue(gameController);
  }

  _createClass(IfBlockAheadCommand, [{
    key: "tick",
    value: function tick() {
      if (this.state === CommandState.WORKING) {
        // tick our command queue
        this.queue.tick();
      }

      if (this.queue.isFailed()) {
        this.state = CommandState.FAILURE;
      }

      if (this.queue.isSucceeded()) {
        this.state = CommandState.SUCCESS;
      }
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(IfBlockAheadCommand.prototype), "begin", this).call(this);
      if (this.GameController.DEBUG) {
        console.log("WHILE command: BEGIN");
      }

      // setup the "if" check
      this.handleIfCheck();
    }
  }, {
    key: "handleIfCheck",
    value: function handleIfCheck() {
      if (this.GameController.isPathAhead(this.blockType)) {
        var targetQueue = this.GameController.getEntity(this.target).queue;
        this.queue.reset();
        targetQueue.setWhileCommandInsertState(this.queue);
        this.ifCodeCallback(); // inserts commands via CodeOrgAPI
        targetQueue.setWhileCommandInsertState(null);
        this.queue.begin();
      } else {
        this.state = CommandState.SUCCESS;
      }
    }
  }]);

  return IfBlockAheadCommand;
})(BaseCommand);

},{"./BaseCommand.js":2,"./CommandQueue.js":4,"./CommandState.js":5}],7:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(MoveBackwardCommand, _BaseCommand);

  function MoveBackwardCommand(gameController, highlightCallback, targetEntity) {
    _classCallCheck(this, MoveBackwardCommand);

    _get(Object.getPrototypeOf(MoveBackwardCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity);
  }

  _createClass(MoveBackwardCommand, [{
    key: "tick",
    value: function tick() {
      // do stuff
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(MoveBackwardCommand.prototype), "begin", this).call(this);
      this.GameController.moveBackward(this);
    }
  }]);

  return MoveBackwardCommand;
})(BaseCommand);

},{"./BaseCommand.js":2}],8:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(MoveDirectionCommand, _BaseCommand);

  function MoveDirectionCommand(gameController, highlightCallback, targetEntity, direction) {
    _classCallCheck(this, MoveDirectionCommand);

    _get(Object.getPrototypeOf(MoveDirectionCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity, direction);
    this.Direciton = direction;
  }

  _createClass(MoveDirectionCommand, [{
    key: "tick",
    value: function tick() {
      // do stuff
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(MoveDirectionCommand.prototype), "begin", this).call(this);
      this.GameController.moveDirection(this, this.Direciton);
    }
  }]);

  return MoveDirectionCommand;
})(BaseCommand);

},{"./BaseCommand.js":2}],9:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(MoveForwardCommand, _BaseCommand);

  function MoveForwardCommand(gameController, highlightCallback, targetEntity) {
    _classCallCheck(this, MoveForwardCommand);

    _get(Object.getPrototypeOf(MoveForwardCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity);
  }

  _createClass(MoveForwardCommand, [{
    key: "tick",
    value: function tick() {
      // do stuff
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(MoveForwardCommand.prototype), "begin", this).call(this);
      this.GameController.moveForward(this);
    }
  }]);

  return MoveForwardCommand;
})(BaseCommand);

},{"./BaseCommand.js":2}],10:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(PlaceBlockCommand, _BaseCommand);

  function PlaceBlockCommand(gameController, highlightCallback, blockType, targetEntity) {
    _classCallCheck(this, PlaceBlockCommand);

    _get(Object.getPrototypeOf(PlaceBlockCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity);

    this.BlockType = blockType;
  }

  _createClass(PlaceBlockCommand, [{
    key: "tick",
    value: function tick() {
      // do stuff??
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(PlaceBlockCommand.prototype), "begin", this).call(this);
      this.GameController.placeBlock(this, this.BlockType);
    }
  }]);

  return PlaceBlockCommand;
})(BaseCommand);

},{"./BaseCommand.js":2}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(PlaceDirectionCommand, _BaseCommand);

  function PlaceDirectionCommand(gameController, highlightCallback, blockType, targetEntity, direction) {
    _classCallCheck(this, PlaceDirectionCommand);

    _get(Object.getPrototypeOf(PlaceDirectionCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity);

    this.BlockType = blockType;
    this.Direction = direction;
  }

  _createClass(PlaceDirectionCommand, [{
    key: "tick",
    value: function tick() {
      // do stuff??
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(PlaceDirectionCommand.prototype), "begin", this).call(this);
      this.GameController.placeBlockDirection(this, this.BlockType, this.Direction);
    }
  }]);

  return PlaceDirectionCommand;
})(BaseCommand);

},{"./BaseCommand.js":2}],12:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(PlaceInFrontCommand, _BaseCommand);

  function PlaceInFrontCommand(gameController, highlightCallback, blockType, targetEntity) {
    _classCallCheck(this, PlaceInFrontCommand);

    _get(Object.getPrototypeOf(PlaceInFrontCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity);

    this.BlockType = blockType;
  }

  _createClass(PlaceInFrontCommand, [{
    key: "tick",
    value: function tick() {
      // do stuff??
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(PlaceInFrontCommand.prototype), "begin", this).call(this);
      this.GameController.placeBlockForward(this, this.BlockType);
    }
  }]);

  return PlaceInFrontCommand;
})(BaseCommand);

},{"./BaseCommand.js":2}],13:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(RepeatCommand, _BaseCommand);

  function RepeatCommand(gameController, highlightCallback, actionCallback, iteration, targetEntity) {
    _classCallCheck(this, RepeatCommand);

    _get(Object.getPrototypeOf(RepeatCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity);
    this.actionCallback = actionCallback;
    this.iteration = iteration;
  }

  _createClass(RepeatCommand, [{
    key: "tick",
    value: function tick() {
      // do stuff
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(RepeatCommand.prototype), "begin", this).call(this);
      this.succeeded();
      this.addRepeatCommand();
    }
  }, {
    key: "addRepeatCommand",
    value: function addRepeatCommand() {
      var entity = this.GameController.levelEntity.entityMap.get(this.target);
      // if target is undefined, push this command to the master queue
      if (entity === undefined) {
        this.GameController.queue.addRepeatCommands(this.actionCallback, this.iteration);
      } else {
        entity.queue.addRepeatCommands(this.actionCallback, this.iteration);
      }
    }
  }]);

  return RepeatCommand;
})(BaseCommand);

},{"./BaseCommand.js":2}],14:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommandState = require("./CommandState.js");
var CommandQueue = require("./CommandQueue.js");
var BaseCommand = require("./BaseCommand.js");

module.exports = (function (_BaseCommand) {
  _inherits(WhileCommand, _BaseCommand);

  function WhileCommand(gameController, highlightCallback, blockType, targetEntity, callback) {
    _classCallCheck(this, WhileCommand);

    _get(Object.getPrototypeOf(WhileCommand.prototype), "constructor", this).call(this, gameController, highlightCallback, targetEntity);

    this.iterationsLeft = 15;
    this.BlockType = blockType;
    this.WhileCode = callback;
    this.queue = new CommandQueue(gameController);
  }

  _createClass(WhileCommand, [{
    key: "tick",
    value: function tick() {
      if (this.state === CommandState.WORKING) {
        // tick our command queue
        this.queue.tick();
      }

      if (this.queue.isFailed()) {
        this.state = CommandState.FAILURE;
      }

      if (this.queue.isSucceeded()) {
        this.handleWhileCheck();
      }
    }
  }, {
    key: "begin",
    value: function begin() {
      _get(Object.getPrototypeOf(WhileCommand.prototype), "begin", this).call(this);
      if (this.GameController.DEBUG) {
        console.log("WHILE command: BEGIN");
      }

      // setup the while check the first time
      this.handleWhileCheck();
    }
  }, {
    key: "handleWhileCheck",
    value: function handleWhileCheck() {
      if (this.iterationsLeft <= 0) {
        this.state = CommandState.FAILURE;
      }

      if (this.GameController.isPathAhead(this.BlockType)) {
        this.queue.reset();
        this.GameController.queue.setWhileCommandInsertState(this.queue);
        this.WhileCode();
        this.GameController.queue.setWhileCommandInsertState(null);
        this.queue.begin();
      } else {
        this.state = CommandState.SUCCESS;
      }

      this.iterationsLeft--;
      if (this.GameController.DEBUG) {
        console.log("While command: Iterationsleft   " + this.iterationsLeft + " ");
      }
    }
  }]);

  return WhileCommand;
})(BaseCommand);

},{"./BaseCommand.js":2,"./CommandQueue.js":4,"./CommandState.js":5}],15:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseEntity = require("./BaseEntity.js");
var CallbackCommand = require("../CommandQueue/CallbackCommand.js");

module.exports = (function (_BaseEntity) {
  _inherits(Agent, _BaseEntity);

  function Agent(controller, type, x, y, name, isOnBlock, facing) {
    _classCallCheck(this, Agent);

    _get(Object.getPrototypeOf(Agent.prototype), "constructor", this).call(this, controller, type, 'PlayerAgent', x, y, facing);
    this.offset = [-16, -15];
    this.name = name;
    this.isOnBlock = isOnBlock;
    this.inventory = {};
    this.movementState = -1;

    this.moveDelayMin = 20;
    this.moveDelayMax = 150;
  }

  /**
   * @override
   */

  _createClass(Agent, [{
    key: "canPlaceBlockOver",
    value: function canPlaceBlockOver(toPlaceBlock, onTopOfBlock) {
      var result = { canPlace: false, plane: '' };
      if (onTopOfBlock.getIsLiquid()) {
        if (toPlaceBlock.getIsPlaceableInLiquid()) {
          result.canPlace = true;
          result.plane = "groundPlane";
        }
      } else {
        if (toPlaceBlock.isWalkable) {
          result.canPlace = true;
          result.plane = "actionPlane";
        }
      }
      return result;
    }

    /**
     * @override
     */
  }, {
    key: "canPlaceBlock",
    value: function canPlaceBlock(block) {
      return block.isEmpty;
    }

    /**
     * @override
     */
  }, {
    key: "canMoveThrough",
    value: function canMoveThrough() {
      return true;
    }

    /**
     * Give agent a higher-than-normal offset so that it will always render on top
     * of the player when on the same cell.
     * @override
     */
  }, {
    key: "getSortOrderOffset",
    value: function getSortOrderOffset() {
      return _get(Object.getPrototypeOf(Agent.prototype), "getSortOrderOffset", this).call(this) - 1;
    }

    // "Events" levels allow the player to move around with the arrow keys, and
    // perform actions with the space bar.
  }, {
    key: "updateMovement",
    value: function updateMovement() {
      var _this = this;

      if (!this.controller.attemptRunning || !this.controller.getIsDirectPlayerControl()) {
        return;
      }
      var queueIsEmpty = this.queue.isFinished() || !this.queue.isStarted();
      var isMoving = this.movementState !== -1;
      var queueHasOne = this.queue.currentCommand && this.queue.getLength() === 0;
      var timeEllapsed = +new Date() - this.lastMovement;
      var movementAlmostFinished = timeEllapsed > 300;

      if ((queueIsEmpty || queueHasOne && movementAlmostFinished) && isMoving) {
        // Arrow key
        if (this.movementState >= 0) {
          (function () {
            var direction = _this.movementState;
            var callbackCommand = new CallbackCommand(_this, function () {}, function () {
              _this.lastMovement = +new Date();
              _this.controller.moveDirection(callbackCommand, direction);
            }, _this.identifier);
            _this.addCommand(callbackCommand);
            // Spacebar
          })();
        } else {
            (function () {
              var callbackCommand = new CallbackCommand(_this, function () {}, function () {
                _this.lastMovement = +new Date();
                _this.controller.use(callbackCommand);
              }, _this.identifier);
              _this.addCommand(callbackCommand);
            })();
          }
      }
    }
  }, {
    key: "doMove",
    value: function doMove(commandQueueItem, movement) {
      var _this2 = this;

      var groundType = undefined;
      var levelModel = this.controller.levelModel;
      var levelView = this.controller.levelView;
      var wasOnBlock = this.isOnBlock;
      var prevPosition = this.position;

      // Update position.
      levelModel["move" + movement](this);

      var jumpOff = wasOnBlock && wasOnBlock !== this.isOnBlock;
      if (this.isOnBlock || jumpOff) {
        groundType = levelModel.actionPlane.getBlockAt(this.position).blockType;
      } else {
        groundType = levelModel.groundPlane.getBlockAt(this.position).blockType;
      }

      levelView["playMove" + movement + "Animation"](this, prevPosition, this.facing, jumpOff, this.isOnBlock, groundType, function () {
        levelView.playIdleAnimation(_this2.position, _this2.facing, _this2.isOnBlock, _this2);

        _this2.controller.delayPlayerMoveBy(_this2.moveDelayMin, _this2.moveDelayMax, function () {
          commandQueueItem.succeeded();
        });
      });

      this.updateHidingTree();
      this.updateHidingBlock(prevPosition);
    }
  }, {
    key: "doMoveForward",
    value: function doMoveForward(commandQueueItem) {
      this.doMove(commandQueueItem, 'Forward');
    }
  }, {
    key: "doMoveBackward",
    value: function doMoveBackward(commandQueueItem) {
      this.doMove(commandQueueItem, 'Backward');
    }
  }, {
    key: "bump",
    value: function bump(commandQueueItem) {
      var _this3 = this;

      var levelView = this.controller.levelView,
          levelModel = this.controller.levelModel;
      levelView.playBumpAnimation(this.position, this.facing, false, this);
      var frontEntity = this.controller.levelEntity.getEntityAt(levelModel.getMoveForwardPosition(this));
      if (frontEntity !== null) {
        var isFriendlyEntity = this.controller.levelEntity.isFriendlyEntity(frontEntity.type);
        // push frienly entity 1 block
        if (isFriendlyEntity) {
          var moveAwayCommand;

          (function () {
            var pushDirection = _this3.facing;
            moveAwayCommand = new CallbackCommand(_this3, function () {}, function () {
              frontEntity.pushBack(moveAwayCommand, pushDirection, 250);
            }, frontEntity.identifier);

            frontEntity.queue.startPushHighPriorityCommands();
            frontEntity.addCommand(moveAwayCommand);
            frontEntity.queue.endPushHighPriorityCommands();
          })();
        }
      }
      this.controller.delayPlayerMoveBy(200, 400, function () {
        commandQueueItem.succeeded();
      });
    }
  }, {
    key: "takeDamage",
    value: function takeDamage(callbackCommand) {
      var _this4 = this;

      var facingName = this.controller.levelView.getDirectionName(this.facing);
      this.healthPoint--;
      // still alive
      if (this.healthPoint > 0) {
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "hurt" + facingName);
        callbackCommand.succeeded();
        // report failure since player died
      } else {
          this.sprite.animations.stop(null, true);
          this.controller.levelView.playFailureAnimation(this.position, this.facing, this.isOnBlock, function () {
            callbackCommand.failed();
            _this4.controller.handleEndState(false);
          });
        }
    }
  }, {
    key: "hasPermissionToWalk",
    value: function hasPermissionToWalk(actionBlock) {
      return actionBlock.isWalkable;
    }
  }, {
    key: "canTriggerPressurePlates",
    value: function canTriggerPressurePlates() {
      return true;
    }
  }]);

  return Agent;
})(BaseEntity);

},{"../CommandQueue/CallbackCommand.js":3,"./BaseEntity.js":16}],16:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CommandQueue = require("../CommandQueue/CommandQueue.js");
var FacingDirection = require("../LevelMVC/FacingDirection.js");
var Position = require("../LevelMVC/Position.js");
var EventType = require("../Event/EventType.js");
var CallbackCommand = require("../CommandQueue/CallbackCommand.js");
var LevelBlock = require("../LevelMVC/LevelBlock.js");

module.exports = (function () {
    function BaseEntity(controller, type, identifier, x, y, facing) {
        _classCallCheck(this, BaseEntity);

        this.queue = new CommandQueue(controller);
        this.controller = controller;
        this.game = controller.game;
        this.position = [x, y];
        this.type = type;
        // temp
        this.facing = facing;
        // offset for sprite position in grid
        this.offset = [-22, -12];
        this.identifier = identifier;
        this.healthPoint = 3;
        this.underTree = { state: false, treeIndex: -1 };
    }

    _createClass(BaseEntity, [{
        key: "tick",
        value: function tick() {
            this.queue.tick();
        }
    }, {
        key: "reset",
        value: function reset() {}
    }, {
        key: "canMoveThrough",
        value: function canMoveThrough() {
            return false;
        }
    }, {
        key: "canPlaceBlock",
        value: function canPlaceBlock() {
            return false;
        }
    }, {
        key: "canTriggerPressurePlates",
        value: function canTriggerPressurePlates() {
            return false;
        }

        /**
         * Whether or not the white "selection indicator" highlight square should
         * update to follow this entity around as it moves and interacts with the
         * world
         *
         * @return {boolean}
         */
    }, {
        key: "shouldUpdateSelectionIndicator",
        value: function shouldUpdateSelectionIndicator() {
            return false;
        }
    }, {
        key: "setMovePosition",
        value: function setMovePosition(position) {
            this.position = position;
        }

        /**
         * For entities which need to be able to accomodate rendering in the same
         * cell as other entities, provide a way to define a rendering offset.
         *
         * @see LevelView.playPlayerAnimation
         * @see LevelView.playMoveForwardAnimation
         * @return Number
         */
    }, {
        key: "getSortOrderOffset",
        value: function getSortOrderOffset() {
            return 5;
        }
    }, {
        key: "addCommand",
        value: function addCommand(commandQueueItem) {
            var repeat = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            this.queue.addCommand(commandQueueItem, repeat);
            // execute the command
            this.queue.begin();
        }
    }, {
        key: "getWalkAnimation",
        value: function getWalkAnimation() {
            return "walk" + this.controller.levelView.getDirectionName(this.facing);
        }
    }, {
        key: "getIdleAnimation",
        value: function getIdleAnimation() {
            return "idle" + this.controller.levelView.getDirectionName(this.facing);
        }
    }, {
        key: "playMoveForwardAnimation",
        value: function playMoveForwardAnimation(position, facing, commandQueueItem, groundType) {
            var _this = this;

            var levelView = this.controller.levelView;
            var tween;
            // update z order
            var zOrderYIndex = position[1] + (facing === FacingDirection.North ? 1 : 0);
            this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex) + 1;
            // stepping sound
            levelView.playBlockSound(groundType);
            // play walk animation
            levelView.playScaledSpeed(this.sprite.animations, this.getWalkAnimation());
            setTimeout(function () {
                tween = _this.controller.levelView.addResettableTween(_this.sprite).to({
                    x: _this.offset[0] + 40 * position[0], y: _this.offset[1] + 40 * position[1]
                }, 300, Phaser.Easing.Linear.None);
                tween.onComplete.add(function () {
                    levelView.playScaledSpeed(_this.sprite.animations, _this.getIdleAnimation());
                    commandQueueItem.succeeded();
                });

                tween.start();
            }, 50 / this.controller.tweenTimeScale);
            // smooth movement using tween
        }

        /**
         * player walkable stuff
         */
    }, {
        key: "walkableCheck",
        value: function walkableCheck() {
            //do nothing
        }
    }, {
        key: "updateHidingTree",
        value: function updateHidingTree() {
            var levelView = this.controller.levelView;
            // this is not under tree
            if (!this.underTree.state) {
                var treeList = levelView.trees;
                for (var i = 0; i < treeList.length; i++) {
                    if (levelView.isUnderTree(i, this.position)) {
                        levelView.changeTreeAlpha(i, 0.8);
                        this.underTree = { state: true, treeIndex: i };
                        break;
                    }
                }
                // this is under tree
            } else {
                    var currentTreeIndex = this.underTree.treeIndex;
                    var entities = this.controller.levelEntity.entityMap;
                    var isOtherEntityUnderTree = function isOtherEntityUnderTree(currentEntity, entities, currentTreeIndex) {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var value = _step.value;

                                var entity = value[1];
                                var sameEntity = entity === currentEntity;
                                if (!sameEntity && entity.underTree.treeIndex === currentTreeIndex) {
                                    return true;
                                }
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator["return"]) {
                                    _iterator["return"]();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        return false;
                    };
                    if (!levelView.isUnderTree(currentTreeIndex, this.position)) {
                        if (!isOtherEntityUnderTree(this, entities, currentTreeIndex)) {
                            levelView.changeTreeAlpha(currentTreeIndex, 1);
                        }
                        this.underTree = { state: false, treeIndex: -1 };
                    }
                }
        }
    }, {
        key: "updateHidingBlock",
        value: function updateHidingBlock(prevPosition) {
            var levelView = this.controller.levelView;
            var actionPlane = this.controller.levelModel.actionPlane;

            var frontBlockCheck = function frontBlockCheck(entity, position) {
                var frontPosition = [position[0], position[1] + 1];
                var frontBlock = actionPlane.getBlockAt(frontPosition);
                if (frontBlock && !frontBlock.isTransparent) {
                    var sprite = levelView.actionPlaneBlocks[levelView.coordinatesToIndex(frontPosition)];
                    if (sprite !== null) {
                        var tween = entity.controller.levelView.addResettableTween(sprite).to({
                            alpha: 0.8
                        }, 300, Phaser.Easing.Linear.None);

                        tween.start();
                    }
                }
            };

            var prevBlockCheck = function prevBlockCheck(entity, position) {
                var frontPosition = [position[0], position[1] + 1];
                if (frontPosition[1] < 10) {
                    var sprite = levelView.actionPlaneBlocks[levelView.coordinatesToIndex(frontPosition)];
                    if (sprite !== null) {
                        var tween = entity.controller.levelView.addResettableTween(sprite).to({
                            alpha: 1
                        }, 300, Phaser.Easing.Linear.None);

                        tween.start();
                    }
                }
            };

            if (!this.isOnBlock) {
                frontBlockCheck(this, this.position);
            }
            if (prevPosition !== undefined) {
                prevBlockCheck(this, prevPosition);
            }
        }
    }, {
        key: "doMoveForward",
        value: function doMoveForward(commandQueueItem, forwardPosition) {
            var levelModel = this.controller.levelModel;
            var prevPosition = this.position;
            this.position = forwardPosition;
            // play sound effect
            var groundType = levelModel.groundPlane.getBlockAt(this.position).blockType;
            // play move forward animation and play idle after that
            this.playMoveForwardAnimation(forwardPosition, this.facing, commandQueueItem, groundType, function () {});
            this.updateHidingTree();
            this.updateHidingBlock(prevPosition);
        }
    }, {
        key: "bump",
        value: function bump(commandQueueItem) {
            var _this2 = this;

            var animName = "bump";
            var facingName = this.controller.levelView.getDirectionName(this.facing);
            this.controller.levelView.playScaledSpeed(this.sprite.animations, animName + facingName);
            var forwardPosition = this.controller.levelModel.getMoveForwardPosition(this);
            var forwardEntity = this.controller.levelEntity.getEntityAt(forwardPosition);
            if (forwardEntity !== null) {
                this.queue.startPushHighPriorityCommands();
                this.controller.events.forEach(function (e) {
                    return e({ eventType: EventType.WhenTouched, targetType: _this2.type, targetIdentifier: _this2.identifier, eventSenderIdentifier: forwardEntity.identifier });
                });
                this.queue.endPushHighPriorityCommands();
            }
            this.controller.delayPlayerMoveBy(400, 800, function () {
                commandQueueItem.succeeded();
            });
        }
    }, {
        key: "callBumpEvents",
        value: function callBumpEvents(forwardPositionInformation) {
            var _this3 = this;

            for (var i = 1; i < forwardPositionInformation.length; i++) {
                if (forwardPositionInformation[i] === 'frontEntity') {
                    this.controller.events.forEach(function (e) {
                        return e({ eventType: EventType.WhenTouched, targetType: forwardPositionInformation[i + 1].type, eventSenderIdentifier: _this3.identifier, targetIdentifier: forwardPositionInformation[i + 1].identifier });
                    });
                    i++;
                }
            }
        }
    }, {
        key: "moveDirection",
        value: function moveDirection(commandQueueItem, direction) {
            // update entity's direction
            this.controller.levelModel.turnToDirection(this, direction);
            this.moveForward(commandQueueItem, false);
        }
    }, {
        key: "moveForward",
        value: function moveForward(commandQueueItem) {
            var record = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            if (record) {
                this.controller.addCommandRecord("moveForward", this.type, commandQueueItem.repeat);
            }
            var forwardPosition = this.controller.levelModel.getMoveForwardPosition(this);
            var forwardPositionInformation = this.controller.levelModel.canMoveForward(this);
            if (forwardPositionInformation[0]) {
                var offset = FacingDirection.directionToOffset(this.facing);
                var reverseOffset = FacingDirection.directionToOffset(FacingDirection.opposite(this.facing));
                var weMovedOnTo = this.handleMoveOnPressurePlate(offset);
                this.doMoveForward(commandQueueItem, forwardPosition);
                if (!weMovedOnTo) {
                    this.handleMoveOffPressurePlate(reverseOffset);
                }
                this.handleMoveOffIronDoor(reverseOffset);
                this.handleMoveAwayFromPiston(reverseOffset);
            } else {
                this.bump(commandQueueItem);
                this.callBumpEvents(forwardPositionInformation);
            }
        }
    }, {
        key: "moveBackward",
        value: function moveBackward(commandQueueItem) {
            var record = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            if (record) {
                this.controller.addCommandRecord("moveBackward", this.type, commandQueueItem.repeat);
            }
            var backwardPosition = this.controller.levelModel.getMoveDirectionPosition(this, 2);
            var backwardPositionInformation = this.controller.levelModel.canMoveBackward(this);
            if (backwardPositionInformation[0]) {
                var offset = FacingDirection.directionToOffset(FacingDirection.opposite(this.facing));
                var reverseOffset = FacingDirection.directionToOffset(this.facing);
                var weMovedOnTo = this.handleMoveOnPressurePlate(offset);
                this.doMoveBackward(commandQueueItem, backwardPosition);
                if (!weMovedOnTo) {
                    this.handleMoveOffPressurePlate(reverseOffset);
                }
                this.handleMoveOffIronDoor(reverseOffset);
                this.handleMoveAwayFromPiston(reverseOffset);
            } else {
                this.bump(commandQueueItem);
                this.callBumpEvents(backwardPositionInformation);
            }
        }

        /**
         * @typedef {Object} CanPlace
         * @property {boolean} canPlace - whether or not placement is allowed at all
         * @property {string} plane - which plane the block should be placed on. Can
         *                    be either "groundPlane" or "actionPlane"
         */

        /**
         * check whether or not the entity can place the given block on top of the
         * given block
         *
         * @param {LevelBlock} [toPlaceBlock]
         * @param {LevelBlock} [onTopOfBlock]
         * @return {CanPlace}
         */
    }, {
        key: "canPlaceBlockOver",
        value: function canPlaceBlockOver() {
            return { canPlace: false, plane: '' };
        }

        /**
         * check all the movable points and choose the farthest one
         *
         * @param {any} commandQueueItem
         * @param {any} moveAwayFrom (entity)
         *
         * @memberOf BaseEntity
         */
    }, {
        key: "moveAway",
        value: function moveAway(commandQueueItem, moveAwayFrom) {
            this.controller.addCommandRecord("moveAway", this.type, commandQueueItem.repeat);
            var moveAwayPosition = moveAwayFrom.position;
            var bestPosition = [];
            var absoluteDistanceSquare = function absoluteDistanceSquare(position1, position2) {
                return Math.pow(position1[0] - position2[0], 2) + Math.pow(position1[1] - position2[1], 2);
            };
            var comparePositions = function comparePositions(moveAwayPosition, position1, position2) {
                return absoluteDistanceSquare(position1[1], moveAwayPosition) < absoluteDistanceSquare(position2[1], moveAwayPosition) ? position2 : position1;
            };
            var currentDistance = absoluteDistanceSquare(moveAwayPosition, this.position);
            // this entity is on the right side and can move to right
            if (moveAwayPosition[0] <= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.East)[0]) {
                bestPosition = [FacingDirection.East, [this.position[0] + 1, this.position[1]]];
            }
            // this entity is on the left side and can move to left
            if (moveAwayPosition[0] >= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.West)[0]) {
                if (bestPosition.length > 0) {
                    bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.West, [this.position[0] - 1, this.position[1]]]);
                } else {
                    bestPosition = [FacingDirection.West, [this.position[0] - 1, this.position[1]]];
                }
            }
            // this entity is on the up side and can move to up
            if (moveAwayPosition[1] >= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.North)[0]) {
                if (bestPosition.length > 0) {
                    bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.North, [this.position[0], this.position[1] - 1]]);
                } else {
                    bestPosition = [FacingDirection.North, [this.position[0], this.position[1] - 1]];
                }
            }
            // this entity is on the down side and can move to down
            if (moveAwayPosition[1] <= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.South)[0]) {
                if (bestPosition.length > 0) {
                    bestPosition = comparePositions(moveAwayPosition, bestPosition, [FacingDirection.South, [this.position[0], this.position[1] + 1]]);
                } else {
                    bestPosition = [FacingDirection.South, [this.position[0], this.position[1] + 1]];
                }
            }
            // terminate the action since it's impossible to move
            if (bestPosition.length === 0 || currentDistance >= absoluteDistanceSquare(moveAwayPosition, bestPosition[1])) {
                commandQueueItem.succeeded();
            } else {
                // execute the best result
                this.moveDirection(commandQueueItem, bestPosition[0]);
            }
        }

        /**
         * check all the movable points and choose the farthest one
         *
         * @param {any} commandQueueItem
         * @param {any} moveTowardTo (entity)
         *
         * @memberOf BaseEntity
         */
    }, {
        key: "moveToward",
        value: function moveToward(commandQueueItem, moveTowardTo) {
            this.controller.addCommandRecord("moveToward", this.type, commandQueueItem.repeat);
            var moveTowardPosition = moveTowardTo.position;
            var bestPosition = [];
            var absoluteDistanceSquare = function absoluteDistanceSquare(position1, position2) {
                return Math.pow(position1[0] - position2[0], 2) + Math.pow(position1[1] - position2[1], 2);
            };
            var comparePositions = function comparePositions(moveTowardPosition, position1, position2) {
                return absoluteDistanceSquare(position1[1], moveTowardPosition) > absoluteDistanceSquare(position2[1], moveTowardPosition) ? position2 : position1;
            };
            // this entity is on the right side and can move to right
            if (moveTowardPosition[0] >= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.East)[0]) {
                bestPosition = [FacingDirection.East, [this.position[0] + 1, this.position[1]]];
            }
            // this entity is on the left side and can move to left
            if (moveTowardPosition[0] <= this.position[0] && this.controller.levelModel.canMoveDirection(this, FacingDirection.West)[0]) {
                if (bestPosition.length > 0) {
                    bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.West, [this.position[0] - 1, this.position[1]]]);
                } else {
                    bestPosition = [FacingDirection.West, [this.position[0] - 1, this.position[1]]];
                }
            }
            // this entity is on the up side and can move to up
            if (moveTowardPosition[1] <= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.North)[0]) {
                if (bestPosition.length > 0) {
                    bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.North, [this.position[0], this.position[1] - 1]]);
                } else {
                    bestPosition = [FacingDirection.North, [this.position[0], this.position[1] - 1]];
                }
            }
            // this entity is on the down side and can move to down
            if (moveTowardPosition[1] >= this.position[1] && this.controller.levelModel.canMoveDirection(this, FacingDirection.South)[0]) {
                if (bestPosition.length > 0) {
                    bestPosition = comparePositions(moveTowardPosition, bestPosition, [FacingDirection.South, [this.position[0], this.position[1] + 1]]);
                } else {
                    bestPosition = [FacingDirection.South, [this.position[0], this.position[1] + 1]];
                }
            }
            // terminate the action since it's impossible to move
            if (absoluteDistanceSquare(this.position, moveTowardPosition) === 1) {
                if (this.position[0] < moveTowardPosition[0]) {
                    this.facing = FacingDirection.East;
                } else if (this.position[0] > moveTowardPosition[0]) {
                    this.facing = FacingDirection.West;
                } else if (this.position[1] < moveTowardPosition[1]) {
                    this.facing = FacingDirection.South;
                } else if (this.position[1] > moveTowardPosition[1]) {
                    this.facing = FacingDirection.North;
                }
                this.updateAnimationDirection();
                this.bump(commandQueueItem);
                return false;
            } else {
                if (bestPosition.length === 0) {
                    commandQueueItem.succeeded();
                    return false;
                    // execute the best result
                } else {
                        this.moveDirection(commandQueueItem, bestPosition[0]);
                        return true;
                    }
            }
        }
    }, {
        key: "moveTo",
        value: function moveTo(commandQueueItem, moveTowardTo) {
            var _this4 = this;

            var absoluteDistanceSquare = function absoluteDistanceSquare(position1, position2) {
                return Math.sqrt(Math.pow(position1[0] - position2[0], 2) + Math.pow(position1[1] - position2[1], 2));
            };
            if (absoluteDistanceSquare(moveTowardTo.position, this.position) === 1) {
                /// north
                if (moveTowardTo.position[1] - this.position[1] === -1) {
                    this.moveDirection(commandQueueItem, FacingDirection.North);
                } else if (moveTowardTo.position[1] - this.position[1] === 1) {
                    this.moveDirection(commandQueueItem, FacingDirection.South);
                } else if (moveTowardTo.position[0] - this.position[0] === 1) {
                    this.moveDirection(commandQueueItem, FacingDirection.East);
                } else {
                    this.moveDirection(commandQueueItem, FacingDirection.West);
                }
            } else if (this.moveToward(commandQueueItem, moveTowardTo)) {
                var callbackCommand = new CallbackCommand(this.controller, function () {}, function () {
                    _this4.moveTo(callbackCommand, moveTowardTo);
                }, this.identifier);
                this.addCommand(callbackCommand);
            } else {
                this.bump(commandQueueItem);
            }
        }
    }, {
        key: "turn",
        value: function turn(commandQueueItem, direction) {
            var record = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            if (record) {
                this.controller.addCommandRecord("turn", this.type, commandQueueItem.repeat);
            }
            // update entity direction
            if (direction === -1) {
                this.controller.levelModel.turnLeft(this);
            }

            if (direction === 1) {
                this.controller.levelModel.turnRight(this);
            }
            // update animation
            this.updateAnimationDirection();
            this.controller.delayPlayerMoveBy(200, 800, function () {
                commandQueueItem.succeeded();
            });
        }
    }, {
        key: "turnRandom",
        value: function turnRandom(commandQueueItem) {
            this.controller.addCommandRecord("turnRandom", this.type, commandQueueItem.repeat);
            var getRandomInt = function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };
            var direction = getRandomInt(0, 1) === 0 ? 1 : -1;
            this.turn(commandQueueItem, direction, false);
        }
    }, {
        key: "use",
        value: function use(commandQueueItem, userEntity) {
            var _this5 = this;

            // default behavior for use ?
            var animationName = "lookAtCam" + this.controller.levelView.getDirectionName(this.facing);
            this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);
            this.queue.startPushHighPriorityCommands();
            this.controller.events.forEach(function (e) {
                return e({ eventType: EventType.WhenUsed, targetType: _this5.type, eventSenderIdentifier: userEntity.identifier, targetIdentifier: _this5.identifier });
            });
            this.queue.endPushHighPriorityCommands();
            commandQueueItem.succeeded();
        }
    }, {
        key: "drop",
        value: function drop(commandQueueItem, itemType) {
            var _this6 = this;

            this.controller.addCommandRecord("drop", this.type, commandQueueItem.repeat);
            this.controller.levelView.playItemDropAnimation(this.position, itemType, function () {
                commandQueueItem.succeeded();

                if (_this6.controller.levelModel.usePlayer) {
                    var playerCommand = _this6.controller.levelModel.player.queue.currentCommand;
                    if (playerCommand && playerCommand.waitForOtherQueue) {
                        playerCommand.succeeded();
                    }
                }
            });
        }
    }, {
        key: "attack",
        value: function attack(commandQueueItem) {
            var _this7 = this;

            this.controller.addCommandRecord("attack", this.type, commandQueueItem.repeat);
            var facingName = this.controller.levelView.getDirectionName(this.facing);
            this.controller.levelView.playScaledSpeed(this.sprite.animations, "attack" + facingName);
            setTimeout(function (entity) {
                var frontEntity = entity.controller.levelEntity.getEntityAt(entity.controller.levelModel.getMoveForwardPosition(entity));
                if (frontEntity) {
                    var callbackCommand = new CallbackCommand(entity.controller, function () {}, function () {
                        frontEntity.takeDamage(callbackCommand);
                    }, frontEntity);
                    frontEntity.addCommand(callbackCommand);
                }
                setTimeout(function (controller, entity, thisEntity) {
                    if (entity !== null) {
                        frontEntity.queue.startPushHighPriorityCommands();
                        controller.events.forEach(function (e) {
                            return e({ eventType: EventType.WhenAttacked, targetType: entity.type, eventSenderIdentifier: thisEntity.identifier, targetIdentifier: entity.identifier });
                        });
                        frontEntity.queue.endPushHighPriorityCommands();
                    }
                    commandQueueItem.succeeded();
                }, 300 / _this7.controller.tweenTimeScale, entity.controller, frontEntity, entity);
            }, 200 / this.controller.tweenTimeScale, this);
        }
    }, {
        key: "pushBack",
        value: function pushBack(commandQueueItem, pushDirection, movementTime, completionHandler) {
            var _this8 = this;

            var levelModel = this.controller.levelModel;
            var pushBackPosition = Position.forward(this.position, pushDirection);
            var canMoveBack = levelModel.isPositionEmpty(pushBackPosition)[0];
            if (canMoveBack) {
                this.updateHidingBlock(this.position);
                this.position = pushBackPosition;
                this.updateHidingTree();
                var tween = this.controller.levelView.addResettableTween(this.sprite).to({
                    x: this.offset[0] + 40 * this.position[0], y: this.offset[1] + 40 * this.position[1]
                }, movementTime, Phaser.Easing.Linear.None);
                tween.onComplete.add(function () {
                    setTimeout(function () {
                        commandQueueItem.succeeded();
                        if (completionHandler !== undefined) {
                            completionHandler(_this8);
                        }
                    }, movementTime / _this8.controller.tweenTimeScale);
                });
                tween.start();
            } else {
                commandQueueItem.succeeded();
                if (completionHandler !== undefined) {
                    completionHandler(this);
                }
            }
        }
    }, {
        key: "takeDamage",
        value: function takeDamage(callbackCommand) {
            var _this9 = this;

            var levelView = this.controller.levelView;
            var facingName = levelView.getDirectionName(this.facing);
            if (this.healthPoint > 1) {
                levelView.playScaledSpeed(this.sprite.animations, "hurt" + facingName);
                setTimeout(function () {
                    _this9.healthPoint--;
                    callbackCommand.succeeded();
                }, 1500 / this.controller.tweenTimeScale);
            } else {
                this.healthPoint--;
                this.sprite.animations.stop(null, true);
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "die" + facingName);
                setTimeout(function () {
                    var tween = _this9.controller.levelView.addResettableTween(_this9.sprite).to({
                        alpha: 0
                    }, 300, Phaser.Easing.Linear.None);
                    tween.onComplete.add(function () {
                        _this9.controller.levelEntity.destroyEntity(_this9.identifier);
                    });
                    tween.start();
                }, 1500 / this.controller.tweenTimeScale);
            }
        }
    }, {
        key: "playRandomIdle",
        value: function playRandomIdle(facing) {
            var facingName,
                rand,
                animationName = "";
            facingName = this.controller.levelView.getDirectionName(facing);
            rand = Math.trunc(Math.random() * 5) + 1;

            switch (rand) {
                case 1:
                    animationName += "idle";
                    break;
                case 2:
                    animationName += "lookLeft";
                    break;
                case 3:
                    animationName += "lookRight";
                    break;
                case 4:
                    animationName += "lookAtCam";
                    break;
                case 5:
                    animationName += "lookDown";
                    break;
                default:
            }

            animationName += facingName;
            this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);
        }
    }, {
        key: "updateAnimationDirection",
        value: function updateAnimationDirection() {
            var facingName = this.controller.levelView.getDirectionName(this.facing);
            this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + facingName);
        }
    }, {
        key: "getDistance",
        value: function getDistance(entity) {
            return Math.abs(Math.pow(this.position[0] - entity.position[0], 2) + Math.pow(this.position[1] - entity.position[1], 2));
        }
    }, {
        key: "blowUp",
        value: function blowUp(commandQueueItem, explosionPosition) {
            var pushBackDirection = FacingDirection.South;
            if (explosionPosition[0] > this.position[0]) {
                pushBackDirection = FacingDirection.West;
                this.facing = FacingDirection.East;
                this.updateAnimationDirection();
            } else if (explosionPosition[0] < this.position[0]) {
                pushBackDirection = FacingDirection.East;
                this.facing = FacingDirection.West;
                this.updateAnimationDirection();
            } else if (explosionPosition[1] > this.position[1]) {
                pushBackDirection = FacingDirection.North;
                this.facing = FacingDirection.South;
                this.updateAnimationDirection();
            } else if (explosionPosition[1] < this.position[1]) {
                pushBackDirection = FacingDirection.South;
                this.facing = FacingDirection.North;
                this.updateAnimationDirection();
            }
            this.pushBack(commandQueueItem, pushBackDirection, 150, function (entity) {
                var callbackCommand = new CallbackCommand(entity.controller, function () {}, function () {
                    entity.controller.destroyEntity(callbackCommand, entity.identifier);
                }, entity.identifier);
                entity.queue.startPushHighPriorityCommands();
                entity.addCommand(callbackCommand, commandQueueItem.repeat);
                entity.queue.endPushHighPriorityCommands();
            });
        }
    }, {
        key: "hasPermissionToWalk",
        value: function hasPermissionToWalk(actionBlock, frontEntity) {
            var groundBlock = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            return (actionBlock.isWalkable || frontEntity !== undefined && frontEntity.isOnBlock &&
            // action plane is empty
            !actionBlock.isEmpty) && (
            // there is no entity
            frontEntity === undefined || frontEntity.canMoveThrough())
            // no lava or water
             && groundBlock.blockType !== "water" && groundBlock.blockType !== "lava";
        }
    }, {
        key: "handleMoveOffPressurePlate",
        value: function handleMoveOffPressurePlate(moveOffset) {
            var _this10 = this;

            var previousPosition = [this.position[0] + moveOffset[0], this.position[1] + moveOffset[1]];
            var isMovingOffOf = this.controller.levelModel.actionPlane.getBlockAt(previousPosition).blockType === "pressurePlateDown";
            var destinationBlock = this.controller.levelModel.actionPlane.getBlockAt(this.position);
            var remainOn = false;
            if (destinationBlock === undefined || !destinationBlock.isWalkable) {
                remainOn = true;
            }
            this.controller.levelEntity.entityMap.forEach(function (workingEntity) {
                if (workingEntity.identifier !== _this10.identifier && workingEntity.canTriggerPressurePlates() && _this10.controller.positionEquivalence(workingEntity.position, previousPosition)) {
                    remainOn = true;
                }
            });
            if (isMovingOffOf && !remainOn) {
                this.controller.audioPlayer.play("pressurePlateClick");
                var block = new LevelBlock('pressurePlateUp');
                this.controller.levelModel.actionPlane.setBlockAt(previousPosition, block, moveOffset[0], moveOffset[1]);
            }
        }
    }, {
        key: "handleMoveOnPressurePlate",
        value: function handleMoveOnPressurePlate(moveOffset) {
            var targetPosition = [this.position[0] + moveOffset[0], this.position[1] + moveOffset[1]];
            var isMovingOnToPlate = this.controller.levelModel.actionPlane.getBlockAt(targetPosition).blockType === "pressurePlateUp";
            if (isMovingOnToPlate) {
                this.controller.audioPlayer.play("pressurePlateClick");
                var block = new LevelBlock('pressurePlateDown');
                this.controller.levelModel.actionPlane.setBlockAt(targetPosition, block);
                return true;
            }
            return false;
        }
    }, {
        key: "handleMoveOffIronDoor",
        value: function handleMoveOffIronDoor(moveOffset) {
            var formerPosition = [this.position[0] + moveOffset[0], this.position[1] + moveOffset[1]];
            if (!this.controller.levelModel.inBounds(formerPosition)) {
                return;
            }

            var wasOnDoor = this.controller.levelModel.actionPlane.getBlockAt(formerPosition).blockType === "doorIron";
            var isOnDoor = this.controller.levelModel.actionPlane.getBlockAt(this.position).blockType === "doorIron";
            if (wasOnDoor && !isOnDoor) {
                this.controller.levelModel.actionPlane.findDoorToAnimate([-1, -1]);
            }
        }
    }, {
        key: "handleMoveAwayFromPiston",
        value: function handleMoveAwayFromPiston(moveOffset) {
            var _this11 = this;

            var formerPosition = [this.position[0] + moveOffset[0], this.position[1] + moveOffset[1]];
            Position.getOrthogonalPositions(formerPosition).forEach(function (workingPos) {
                if (_this11.controller.levelModel.actionPlane.inBounds(workingPos)) {
                    var block = _this11.controller.levelModel.actionPlane.getBlockAt(workingPos);
                    if (block.blockType.startsWith("piston") && block.isPowered) {
                        _this11.controller.levelModel.actionPlane.activatePiston(workingPos);
                    }
                }
            });
        }
    }, {
        key: "handleGetOnRails",
        value: function handleGetOnRails(direction) {
            this.getOffTrack = false;
            this.handleMoveOffPressurePlate([0, 0]);
            this.controller.levelView.playTrack(this.position, direction, true, this, null);
        }
    }]);

    return BaseEntity;
})();

},{"../CommandQueue/CallbackCommand.js":3,"../CommandQueue/CommandQueue.js":4,"../Event/EventType.js":25,"../LevelMVC/FacingDirection.js":29,"../LevelMVC/LevelBlock.js":30,"../LevelMVC/Position.js":35}],17:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseEntity = require("./BaseEntity.js");
module.exports = (function (_BaseEntity) {
    _inherits(Chicken, _BaseEntity);

    function Chicken(controller, type, identifier, x, y, facing) {
        _classCallCheck(this, Chicken);

        _get(Object.getPrototypeOf(Chicken.prototype), "constructor", this).call(this, controller, type, identifier, x, y, facing);
        var zOrderYIndex = this.position[1];
        this.offset = [-25, -32];
        this.prepareSprite();
        this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex);
    }

    _createClass(Chicken, [{
        key: "prepareSprite",
        value: function prepareSprite() {
            var _this = this;

            var getRandomSecondBetween = function getRandomSecondBetween(min, max) {
                return (Math.random() * (max - min) + min) * 1000;
            };
            var frameRate = 12,
                randomPauseMin = 0.2,
                randomPauseMax = 1;
            var actionGroup = this.controller.levelView.actionGroup;
            var frameList = [];
            var frameName = "chicken";
            this.sprite = actionGroup.create(0, 0, 'chicken', 'chicken0001.png');
            this.sprite.scale.setTo(0.75, 0.75);
            var stillFrameName = ['chicken0222.png', 'chicken0111.png', 'chicken0001.png', 'chicken0333.png'];
            var idleDelayFrame = 8;
            // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[bump],[eat]]
            var frameListPerDirection = [[[259, 275], [225, 227], [224, 226], [285, 287], [276, 281], [291, 302], [303, 313], [314, 326], [327, 332], [460, 467], [240, 249]], // down
            [[148, 164], [114, 116], [113, 115], [174, 176], [165, 170], [180, 191], [192, 202], [203, 215], [216, 221], [452, 459], [129, 138]], // right
            [[37, 53], [3, 5], [12, 14], [63, 65], [54, 59], [69, 80], [81, 91], [92, 104], [105, 110], [444, 451], [18, 27]], // up
            [[370, 386], [336, 338], [335, 337], [396, 398], [387, 392], [402, 413], [414, 424], [425, 437], [438, 443], [468, 475], [351, 360]]]; // left
            for (var i = 0; i < 4; i++) {
                var facingName = this.controller.levelView.getDirectionName(i);

                // idle sequence
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 4);
                for (var j = 0; j < idleDelayFrame; j++) {
                    frameList.push(stillFrameName[i]);
                }
                this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.playRandomIdle(_this.facing);
                });
                // look left sequence ( look left -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 4);
                this.sprite.animations.add("lookLeft" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookLeft" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 4);
                this.sprite.animations.add("lookLeft" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look right sequence ( look right -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 4);
                this.sprite.animations.add("lookRight" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookRight" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 4);
                this.sprite.animations.add("lookRight" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look up sequence ( look up -> pause for random time -> look front -> play random idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 4);
                this.sprite.animations.add("lookAtCam" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookAtCam" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 4);
                this.sprite.animations.add("lookAtCam" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look down
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 4);
                this.sprite.animations.add("lookDown" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // walk
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 4);
                this.sprite.animations.add("walk" + facingName, frameList, frameRate, true);
                // attack
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 4);
                this.sprite.animations.add("attack" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // take damage
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 4);
                this.sprite.animations.add("hurt" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // die
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 4);
                this.sprite.animations.add("die" + facingName, frameList, frameRate, false);
                // bump
                frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 4);
                this.sprite.animations.add("bump" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // eat
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 4);
                this.sprite.animations.add("eat" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "eat" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][10][1], frameListPerDirection[i][10][0], ".png", 4);
                this.sprite.animations.add("eat" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
            }
            // initialize
            this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            this.sprite.x = this.offset[0] + 40 * this.position[0];
            this.sprite.y = this.offset[1] + 40 * this.position[1];
        }
    }]);

    return Chicken;
})(BaseEntity);

},{"./BaseEntity.js":16}],18:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseEntity = require("./BaseEntity.js");
module.exports = (function (_BaseEntity) {
    _inherits(Cow, _BaseEntity);

    function Cow(controller, type, identifier, x, y, facing) {
        _classCallCheck(this, Cow);

        _get(Object.getPrototypeOf(Cow.prototype), "constructor", this).call(this, controller, type, identifier, x, y, facing);
        var zOrderYIndex = this.position[1];
        this.offset = [-43, -55];
        this.prepareSprite();
        this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex);
    }

    _createClass(Cow, [{
        key: "prepareSprite",
        value: function prepareSprite() {
            var _this = this;

            var getRandomSecondBetween = function getRandomSecondBetween(min, max) {
                return (Math.random() * (max - min) + min) * 1000;
            };
            var frameRate = 12,
                randomPauseMin = 0.2,
                randomPauseMax = 1;
            var actionGroup = this.controller.levelView.actionGroup;
            var frameList = [];
            var frameName = "Cow";
            this.sprite = actionGroup.create(0, 0, 'cow', 'Cow0001.png');
            var stillFrameName = ['Cow0222.png', 'Cow0111.png', 'Cow0001.png', 'Cow0333.png'];
            var idleDelayFrame = 20;
            // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[bump],[idle2],[eat]]
            var frameListPerDirection = [[[258, 264], [225, 227], [224, 226], [285, 287], [240, 241], [291, 302], [303, 313], [314, 326], [327, 332], [460, 467], [276, 282], [240, 249]], // down
            [[147, 153], [114, 116], [129, 130], [174, 176], [129, 130], [180, 191], [192, 202], [203, 215], [216, 221], [452, 459], [165, 171], [129, 138]], // right
            [[36, 42], [3, 5], [12, 14], [63, 65], [18, 19], [69, 80], [81, 91], [92, 104], [105, 110], [444, 451], [51, 54], [18, 27]], // up
            [[369, 375], [336, 338], [335, 337], [396, 398], [351, 352], [402, 413], [414, 424], [425, 437], [438, 443], [468, 475], [387, 393], [351, 360]]]; // left
            for (var i = 0; i < 4; i++) {
                var facingName = this.controller.levelView.getDirectionName(i);

                // idle sequence
                frameList = [];
                for (var j = 0; j < idleDelayFrame; j++) {
                    frameList.push(stillFrameName[i]);
                }
                this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle2" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look left sequence ( look left -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 4);
                this.sprite.animations.add("lookLeft" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookLeft" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 4);
                this.sprite.animations.add("lookLeft" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look right sequence ( look right -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 4);
                this.sprite.animations.add("lookRight" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    //this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookRight" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 4);
                this.sprite.animations.add("lookRight" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look up sequence ( look up -> pause for random time -> look front -> play random idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 4);
                this.sprite.animations.add("lookAtCam" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    //this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookAtCam" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 4);
                this.sprite.animations.add("lookAtCam" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look down
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 4);
                this.sprite.animations.add("lookDown" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookDown" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });

                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][1], frameListPerDirection[i][4][0], ".png", 4);
                this.sprite.animations.add("lookDown" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // walk
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 4);
                this.sprite.animations.add("walk" + facingName, frameList, frameRate, true);
                // attack
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 4);
                this.sprite.animations.add("attack" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // take damage
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 4);
                this.sprite.animations.add("hurt" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // die
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 4);
                this.sprite.animations.add("die" + facingName, frameList, frameRate, false);
                // bump
                frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 4);
                this.sprite.animations.add("bump" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // idle2 sequence
                if (i === 2) {
                    frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 4);
                    this.sprite.animations.add("idle2" + facingName, frameList, frameRate / 2, false).onComplete.add(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle2" + _this.controller.levelView.getDirectionName(_this.facing) + "_reverse");
                    });

                    frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][10][1], frameListPerDirection[i][10][0], ".png", 4);
                    this.sprite.animations.add("idle2" + facingName + "_reverse", frameList, frameRate / 2, false).onComplete.add(function () {
                        _this.playRandomIdle(_this.facing);
                    });
                } else {
                    frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][10][1], frameListPerDirection[i][10][0], ".png", 4);
                    this.sprite.animations.add("idle2" + facingName, frameList, frameRate, false).onComplete.add(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle2" + _this.controller.levelView.getDirectionName(_this.facing) + "_reverse");
                    });
                    frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 4);
                    this.sprite.animations.add("idle2" + facingName + "_reverse", frameList, frameRate, false).onComplete.add(function () {
                        _this.playRandomIdle(_this.facing);
                    });
                }
                // eat
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][11][0], frameListPerDirection[i][11][1], ".png", 4);
                this.sprite.animations.add("eat" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "eat" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][11][1], frameListPerDirection[i][11][0], ".png", 4);
                this.sprite.animations.add("eat" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
            }
            // initialize
            this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            this.sprite.x = this.offset[0] + 40 * this.position[0];
            this.sprite.y = this.offset[1] + 40 * this.position[1];
        }
    }, {
        key: "playRandomIdle",
        value: function playRandomIdle(facing) {
            var facingName,
                rand,
                animationName = "";
            facingName = this.controller.levelView.getDirectionName(facing);
            rand = Math.trunc(Math.random() * 5) + 1;

            switch (rand) {
                case 1:
                    animationName += "idle";
                    break;
                case 2:
                    animationName += "lookLeft";
                    break;
                case 3:
                    animationName += "lookRight";
                    break;
                case 4:
                    animationName += "lookAtCam";
                    break;
                case 5:
                    animationName += "lookDown";
                    break;
                default:
            }

            animationName += facingName;
            this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);
            this.controller.printErrorMsg(this.type + " calls animation : " + animationName + "\n");
        }
    }]);

    return Cow;
})(BaseEntity);

},{"./BaseEntity.js":16}],19:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseEntity = require("./BaseEntity.js");
module.exports = (function (_BaseEntity) {
    _inherits(Creeper, _BaseEntity);

    function Creeper(controller, type, identifier, x, y, facing) {
        _classCallCheck(this, Creeper);

        _get(Object.getPrototypeOf(Creeper.prototype), "constructor", this).call(this, controller, type, identifier, x, y, facing);
        var zOrderYIndex = this.position[1];
        this.offset = [-43, -55];
        this.prepareSprite();
        this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex);
    }

    _createClass(Creeper, [{
        key: "prepareSprite",
        value: function prepareSprite() {
            var _this = this;

            var getRandomSecondBetween = function getRandomSecondBetween(min, max) {
                return (Math.random() * (max - min) + min) * 1000;
            };
            var frameRate = 10,
                randomPauseMin = 0.2,
                randomPauseMax = 1;
            var actionGroup = this.controller.levelView.actionGroup;
            var frameList = [];
            var frameName = "ShadowCreeper_2016_";
            this.sprite = actionGroup.create(0, 0, 'creeper', 'ShadowCreeper_2016_000.png');
            // for normal sheep
            // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[explode],[take dmg],[die],[bump]]
            var frameListPerDirection = [[[128, 128], [128, 131], [134, 137], [140, 143], [146, 149], [152, 163], [164, 167], [164, 178], [179, 184], [185, 191], [272, 279]], // down
            [[64, 64], [64, 67], [70, 73], [76, 89], [82, 85], [88, 99], [100, 103], [100, 114], [115, 120], [121, 127], [264, 271]], // right
            [[0, 0], [0, 3], [6, 10], [12, 16], [18, 21], [24, 35], [36, 39], [36, 50], [51, 56], [57, 63], [256, 263]], // up
            [[192, 192], [192, 195], [198, 201], [204, 207], [210, 213], [216, 227], [228, 231], [228, 242], [243, 248], [249, 255], [280, 287]]]; // left
            for (var i = 0; i < 4; i++) {
                var facingName = this.controller.levelView.getDirectionName(i);

                // idle sequence
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 3);
                for (var j = 0; j < 12; j++) {
                    frameList.push(frameList[0]);
                }
                this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.playRandomIdle(_this.facing);
                });
                // look left sequence ( look left -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 3);
                this.sprite.animations.add("lookLeft" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookLeft" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 3);
                this.sprite.animations.add("lookLeft" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look right sequence ( look right -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 3);
                this.sprite.animations.add("lookRight" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookRight" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 3);
                this.sprite.animations.add("lookRight" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look up sequence ( look up -> pause for random time -> look front -> play random idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 3);
                this.sprite.animations.add("lookAtCam" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookAtCam" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 3);
                this.sprite.animations.add("lookAtCam" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look down
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 3);
                this.sprite.animations.add("lookDown" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookDown_2" + _this.controller.levelView.getDirectionName(_this.facing));
                });

                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][1], frameListPerDirection[i][4][0], ".png", 3);
                this.sprite.animations.add("lookDown_2" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // walk
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 3);
                this.sprite.animations.add("walk" + facingName, frameList, frameRate, true);
                // attack
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 3);
                this.sprite.animations.add("attack" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // explode
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 3);
                this.sprite.animations.add("explode" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // take damage
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 3);
                this.sprite.animations.add("hurt" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // die
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 3);
                this.sprite.animations.add("die" + facingName, frameList, frameRate, false);
                // bump
                frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 3);
                this.sprite.animations.add("bump" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
            }
            // initialize
            this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            this.sprite.x = this.offset[0] + 40 * this.position[0];
            this.sprite.y = this.offset[1] + 40 * this.position[1];
        }
    }]);

    return Creeper;
})(BaseEntity);

},{"./BaseEntity.js":16}],20:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseEntity = require("./BaseEntity.js");
var randomInt = require("./../LevelMVC/Utils.js").randomInt;
module.exports = (function (_BaseEntity) {
  _inherits(Ghast, _BaseEntity);

  function Ghast(controller, type, identifier, x, y, facing) {
    _classCallCheck(this, Ghast);

    _get(Object.getPrototypeOf(Ghast.prototype), "constructor", this).call(this, controller, type, identifier, x, y, facing);
    this.offset = [-50, -84];
    this.prepareSprite();
    this.sprite.sortOrder = this.controller.levelView.yToIndex(Number.MAX_SAFE_INTEGER);
    this.audioDelay = 15;
    if (x < 5) {
      this.patrolA();
    } else {
      this.patrolB();
    }
  }

  _createClass(Ghast, [{
    key: "prepareSprite",
    value: function prepareSprite() {
      var _this = this;

      var getRandomSecondBetween = function getRandomSecondBetween(min, max) {
        return (Math.random() * (max - min) + min) * 1000;
      };
      var frameRate = 12,
          randomPauseMin = 0.2,
          randomPauseMax = 1;
      var actionGroup = this.controller.levelView.actionGroup;
      var frameList = [];
      var frameName = "Ghast";
      this.sprite = actionGroup.create(0, 0, 'ghast', 'Ghast0000.png');
      this.sprite.scale.setTo(1, 1);
      var idleDelayFrame = 0;
      // [direction][[idle],[shoot]]
      var frameListPerDirection = [[[72, 83], [84, 95]], // down
      [[48, 59], [60, 71]], // right
      [[24, 35], [36, 47]], // up
      [[0, 11], [12, 23]]]; // left
      for (var i = 0; i < 4; i++) {
        var facingName = this.controller.levelView.getDirectionName(i);

        // idle sequence
        frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 4);

        var randomOffset = randomInt(2, frameList.length);
        var framesToOffset = [];
        for (var k = 0; k < randomOffset; ++k) {
          framesToOffset.push(frameList[0]);
          frameList.splice(0, 1);
        }
        for (var k = 0; k < framesToOffset.length; ++k) {
          frameList.push(framesToOffset[k]);
        }

        for (var j = 0; j < idleDelayFrame; j++) {
          frameList.push(frameList[0]);
        }
        this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(function () {
          _this.playRandomIdle(_this.facing);
        });
        // shoot
        frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 4);
        this.sprite.animations.add("shoot" + facingName, frameList, frameRate, false).onComplete.add(function () {
          _this.sprite.animations.stop();
          setTimeout(function () {
            _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "shoot" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
          }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
        });
        frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 4);
        this.sprite.animations.add("shoot" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
          _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
        });
      }
      // initialize
      this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
      this.sprite.x = this.offset[0] + 40 * this.position[0];
      this.sprite.y = this.offset[1] + 40 * this.position[1];
    }

    /**
     * @override
     */
  }, {
    key: "canMoveThrough",
    value: function canMoveThrough() {
      return true;
    }
  }, {
    key: "playRandomIdle",
    value: function playRandomIdle(facing) {
      var facingName,
          animationName = "";
      facingName = this.controller.levelView.getDirectionName(facing);

      animationName += "idle";

      animationName += facingName;
      this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);

      if (this.audioDelay > 0) {
        --this.audioDelay;
      } else {
        this.audioDelay = 5;
        var chance = Math.floor(Math.random() * 5);
        if (chance === 0) {
          var soundNum = Math.floor(Math.random() * 4);
          this.playMoan(soundNum);
        }
      }
    }
  }, {
    key: "playMoan",
    value: function playMoan(number) {
      switch (number) {
        case 0:
          this.controller.audioPlayer.play("moan2");
          break;
        case 1:
          this.controller.audioPlayer.play("moan3");
          break;
        case 2:
          this.controller.audioPlayer.play("moan6");
          break;
        default:
          this.controller.audioPlayer.play("moan7");
          break;
      }
    }
  }, {
    key: "patrolA",
    value: function patrolA() {
      var _controller$levelView$addResettableTween, _controller$levelView$addResettableTween2;

      var options = [Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true];

      (_controller$levelView$addResettableTween = this.controller.levelView.addResettableTween(this.sprite)).to.apply(_controller$levelView$addResettableTween, [{
        y: this.offset[1] + 40 * this.position[1] + 80
      }, randomInt(2500, 3500)].concat(options));

      (_controller$levelView$addResettableTween2 = this.controller.levelView.addResettableTween(this.sprite)).to.apply(_controller$levelView$addResettableTween2, [{
        x: this.offset[0] + 40 * this.position[0] + 10
      }, randomInt(1500, 2000)].concat(options));
    }
  }, {
    key: "patrolB",
    value: function patrolB() {
      var _controller$levelView$addResettableTween3, _controller$levelView$addResettableTween4;

      var options = [Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true];

      (_controller$levelView$addResettableTween3 = this.controller.levelView.addResettableTween(this.sprite)).to.apply(_controller$levelView$addResettableTween3, [{
        y: this.offset[1] + 40 * this.position[1] - 80
      }, randomInt(2500, 3500)].concat(options));

      (_controller$levelView$addResettableTween4 = this.controller.levelView.addResettableTween(this.sprite)).to.apply(_controller$levelView$addResettableTween4, [{
        x: this.offset[0] + 40 * this.position[0] - 10
      }, randomInt(1500, 2000)].concat(options));
    }
  }]);

  return Ghast;
})(BaseEntity);

},{"./../LevelMVC/Utils.js":36,"./BaseEntity.js":16}],21:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseEntity = require("./BaseEntity.js");
module.exports = (function (_BaseEntity) {
    _inherits(IronGolem, _BaseEntity);

    function IronGolem(controller, type, identifier, x, y, facing) {
        _classCallCheck(this, IronGolem);

        _get(Object.getPrototypeOf(IronGolem.prototype), "constructor", this).call(this, controller, type, identifier, x, y, facing);
        var zOrderYIndex = this.position[1];
        this.offset = [-43, -55];
        this.prepareSprite();
        this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex);
    }

    _createClass(IronGolem, [{
        key: "prepareSprite",
        value: function prepareSprite() {
            var _this = this;

            var getRandomSecondBetween = function getRandomSecondBetween(min, max) {
                return (Math.random() * (max - min) + min) * 1000;
            };
            var frameRate = 8,
                randomPauseMin = 0.2,
                randomPauseMax = 1;
            var actionGroup = this.controller.levelView.actionGroup;
            var frameList = [];
            var frameName = "Iron_Golem_Anims";
            this.sprite = actionGroup.create(0, 0, 'ironGolem', 'Iron_Golem_Anims001.png');
            // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[bump]]
            var frameListPerDirection = [[[45, 45], [46, 48], [50, 52], [58, 60], [54, 56], [62, 70], [71, 74], [77, 81], [82, 88], [185, 192]], // down
            [[133, 133], [134, 136], [138, 140], [146, 148], [142, 144], [150, 158], [159, 162], [165, 169], [170, 176], [201, 208]], // right
            [[1, 1], [2, 4], [6, 8], [14, 16], [10, 12], [18, 26], [27, 30], [33, 37], [38, 44], [177, 184]], // up
            [[89, 89], [90, 92], [94, 96], [102, 104], [98, 100], [106, 114], [115, 118], [121, 125], [126, 132], [193, 200]]]; // left
            for (var i = 0; i < 4; i++) {
                var facingName = this.controller.levelView.getDirectionName(i);

                // idle sequence
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 3);
                for (var j = 0; j < 12; j++) {
                    frameList.push(frameList[0]);
                }
                this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.playRandomIdle(_this.facing);
                });
                // look left sequence ( look left -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 3);
                this.sprite.animations.add("lookLeft" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookLeft" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 3);
                this.sprite.animations.add("lookLeft" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look right sequence ( look right -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 3);
                this.sprite.animations.add("lookRight" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookRight" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 3);
                this.sprite.animations.add("lookRight" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look up sequence ( look up -> pause for random time -> look front -> play random idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 3);
                this.sprite.animations.add("lookAtCam" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.sprite.animations.stop();
                    setTimeout(function () {
                        _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookAtCam" + _this.controller.levelView.getDirectionName(_this.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 3);
                this.sprite.animations.add("lookAtCam" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // look down
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 3);
                this.sprite.animations.add("lookDown" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "lookDown_2" + _this.controller.levelView.getDirectionName(_this.facing));
                });

                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][1], frameListPerDirection[i][4][0], ".png", 3);
                this.sprite.animations.add("lookDown_2" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // walk
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 3);
                this.sprite.animations.add("walk" + facingName, frameList, frameRate, true);
                // attack
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 3);
                this.sprite.animations.add("attack" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // take damage
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 3);
                this.sprite.animations.add("hurt" + facingName, frameList, frameRate * 2 / 3, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
                // die
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 3);
                this.sprite.animations.add("die" + facingName, frameList, frameRate * 2 / 3, false);
                // bump
                frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 3);
                this.sprite.animations.add("bump" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this.controller.levelView.playScaledSpeed(_this.sprite.animations, "idle" + _this.controller.levelView.getDirectionName(_this.facing));
                });
            }
            // initialize
            this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            this.sprite.x = this.offset[0] + 40 * this.position[0];
            this.sprite.y = this.offset[1] + 40 * this.position[1];
        }
    }]);

    return IronGolem;
})(BaseEntity);

},{"./BaseEntity.js":16}],22:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseEntity = require("./BaseEntity.js");
var CallbackCommand = require("../CommandQueue/CallbackCommand.js");

module.exports = (function (_BaseEntity) {
  _inherits(Player, _BaseEntity);

  function Player(controller, type, x, y, name, isOnBlock, facing) {
    _classCallCheck(this, Player);

    _get(Object.getPrototypeOf(Player.prototype), "constructor", this).call(this, controller, type, 'Player', x, y, facing);
    this.offset = [-18, -32];
    this.name = name;
    this.isOnBlock = isOnBlock;
    this.inventory = {};
    this.movementState = -1;
    this.onTracks = false;
    this.getOffTrack = false;

    if (controller.getIsDirectPlayerControl()) {
      this.moveDelayMin = 0;
      this.moveDelayMax = 0;
    } else {
      this.moveDelayMin = 30;
      this.moveDelayMax = 200;
    }
  }

  /**
   * @override
   */

  _createClass(Player, [{
    key: "canPlaceBlockOver",
    value: function canPlaceBlockOver(toPlaceBlock, onTopOfBlock) {
      var result = { canPlace: false, plane: '' };
      if (onTopOfBlock.getIsLiquid()) {
        result.canPlace = true;
        result.plane = "groundPlane";
      } else {
        result.canPlace = true;
        result.plane = "actionPlane";
      }
      if (toPlaceBlock.blockType === "cropWheat") {
        result.canPlace = onTopOfBlock.blockType === "farmlandWet";
      }
      return result;
    }

    /**
     * @override
     */
  }, {
    key: "canPlaceBlock",
    value: function canPlaceBlock(block) {
      return block.isEmpty;
    }

    /**
     * @override
     */
  }, {
    key: "shouldUpdateSelectionIndicator",
    value: function shouldUpdateSelectionIndicator() {
      return true;
    }

    /**
     * @override
     */
  }, {
    key: "setMovePosition",
    value: function setMovePosition(position) {
      _get(Object.getPrototypeOf(Player.prototype), "setMovePosition", this).call(this, position);
      this.collectItems(this.position);
    }

    /**
     * player walkable stuff
     */
  }, {
    key: "walkableCheck",
    value: function walkableCheck(block) {
      this.isOnBlock = !block.isWalkable;
    }

    // "Events" levels allow the player to move around with the arrow keys, and
    // perform actions with the space bar.
  }, {
    key: "updateMovement",
    value: function updateMovement() {
      var _this = this;

      if (!this.controller.attemptRunning || !this.controller.getIsDirectPlayerControl()) {
        return;
      }

      if (this.onTracks) {
        this.collectItems(this.position);
      }

      if (this.canUpdateMovement()) {
        // Arrow key
        if (this.movementState >= 0) {
          (function () {
            var direction = _this.movementState;
            var callbackCommand = new CallbackCommand(_this, function () {}, function () {
              _this.lastMovement = +new Date();
              _this.controller.moveDirection(callbackCommand, direction);
            }, _this.identifier);
            _this.addCommand(callbackCommand);
            // Spacebar
          })();
        } else {
            (function () {
              var callbackCommand = new CallbackCommand(_this, function () {}, function () {
                _this.lastMovement = +new Date();
                _this.controller.use(callbackCommand);
              }, _this.identifier);
              _this.addCommand(callbackCommand);
            })();
          }
      }
    }
  }, {
    key: "canUpdateMovement",
    value: function canUpdateMovement() {
      var queueIsEmpty = this.queue.isFinished() || !this.queue.isStarted();
      var isMoving = this.movementState !== -1;
      var queueHasOne = this.queue.currentCommand && this.queue.getLength() === 0;
      var timeEllapsed = +new Date() - this.lastMovement;
      var movementAlmostFinished = timeEllapsed > 300;
      if (isMoving && timeEllapsed > 800) {
        // Delay of 800 ms so that the first move onto a rail completes the moveDirection command.
        // Without the delay, the moveDirection conflicts with the onRails check and cancels rail riding as soon as it starts.
        this.getOffTrack = true;
      }
      return !this.onTracks && (queueIsEmpty || queueHasOne && movementAlmostFinished) && isMoving;
    }
  }, {
    key: "doMoveForward",
    value: function doMoveForward(commandQueueItem) {
      var _this2 = this;

      var player = this,
          groundType,
          jumpOff,
          levelModel = this.controller.levelModel,
          levelView = this.controller.levelView;
      var wasOnBlock = player.isOnBlock;
      var prevPosition = this.position;
      // update position
      levelModel.moveForward();
      // TODO: check for Lava, Creeper, water => play approp animation & call commandQueueItem.failed()

      jumpOff = wasOnBlock && wasOnBlock !== player.isOnBlock;
      if (player.isOnBlock || jumpOff) {
        groundType = levelModel.actionPlane.getBlockAt(player.position).blockType;
      } else {
        groundType = levelModel.groundPlane.getBlockAt(player.position).blockType;
      }

      levelView.playMoveForwardAnimation(player, prevPosition, player.facing, jumpOff, player.isOnBlock, groundType, function () {
        levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);

        if (levelModel.isPlayerStandingInWater()) {
          levelView.playDrownFailureAnimation(player.position, player.facing, player.isOnBlock, function () {
            _this2.controller.handleEndState(false);
          });
        } else if (levelModel.isPlayerStandingInLava()) {
          levelView.playBurnInLavaAnimation(player.position, player.facing, player.isOnBlock, function () {
            _this2.controller.handleEndState(false);
          });
        } else {
          _this2.controller.delayPlayerMoveBy(_this2.moveDelayMin, _this2.moveDelayMax, function () {
            commandQueueItem.succeeded();
          });
        }
      });

      this.updateHidingTree();
      this.updateHidingBlock(prevPosition);
    }
  }, {
    key: "doMoveBackward",
    value: function doMoveBackward(commandQueueItem) {
      var _this3 = this;

      var player = this,
          groundType,
          jumpOff,
          levelModel = this.controller.levelModel,
          levelView = this.controller.levelView;
      var wasOnBlock = player.isOnBlock;
      var prevPosition = this.position;
      // update position
      levelModel.moveBackward(this);
      // TODO: check for Lava, Creeper, water => play approp animation & call commandQueueItem.failed()

      jumpOff = wasOnBlock && wasOnBlock !== player.isOnBlock;
      if (player.isOnBlock || jumpOff) {
        groundType = levelModel.actionPlane.getBlockAt(player.position).blockType;
      } else {
        groundType = levelModel.actionPlane.getBlockAt(player.position).blockType;
      }

      levelView.playMoveBackwardAnimation(player, prevPosition, player.facing, jumpOff, player.isOnBlock, groundType, function () {
        levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock, player);

        if (levelModel.isPlayerStandingInWater()) {
          levelView.playDrownFailureAnimation(player.position, player.facing, player.isOnBlock, function () {
            _this3.controller.handleEndState(false);
          });
        } else if (levelModel.isPlayerStandingInLava()) {
          levelView.playBurnInLavaAnimation(player.position, player.facing, player.isOnBlock, function () {
            _this3.controller.handleEndState(false);
          });
        } else {
          _this3.controller.delayPlayerMoveBy(_this3.moveDelayMin, _this3.moveDelayMax, function () {
            commandQueueItem.succeeded();
          });
        }
      });

      this.updateHidingTree();
      this.updateHidingBlock(prevPosition);
    }
  }, {
    key: "bump",
    value: function bump(commandQueueItem) {
      var _this4 = this;

      var levelView = this.controller.levelView,
          levelModel = this.controller.levelModel;
      levelView.playBumpAnimation(this.position, this.facing, false);
      var frontEntity = this.controller.levelEntity.getEntityAt(levelModel.getMoveForwardPosition(this));
      if (frontEntity !== null) {
        var isFriendlyEntity = this.controller.levelEntity.isFriendlyEntity(frontEntity.type);
        // push frienly entity 1 block
        if (isFriendlyEntity) {
          var moveAwayCommand;

          (function () {
            var pushDirection = _this4.facing;
            moveAwayCommand = new CallbackCommand(_this4, function () {}, function () {
              frontEntity.pushBack(moveAwayCommand, pushDirection, 250);
            }, frontEntity.identifier);

            frontEntity.queue.startPushHighPriorityCommands();
            frontEntity.addCommand(moveAwayCommand);
            frontEntity.queue.endPushHighPriorityCommands();
          })();
        }
      }
      this.controller.delayPlayerMoveBy(200, 400, function () {
        commandQueueItem.succeeded();
      });
    }
  }, {
    key: "collectItems",
    value: function collectItems() {
      var targetPosition = arguments.length <= 0 || arguments[0] === undefined ? this.position : arguments[0];

      // collectible check
      var collectibles = this.controller.levelView.collectibleItems;
      var distanceBetween = function distanceBetween(position, position2) {
        return Math.sqrt(Math.pow(position[0] - position2[0], 2) + Math.pow(position[1] - position2[1], 2));
      };
      for (var i = 0; i < collectibles.length; i++) {
        var _collectibles$i = _slicedToArray(collectibles[i], 4);

        var sprite = _collectibles$i[0];
        var offset = _collectibles$i[1];
        var blockType = _collectibles$i[2];
        var collectibleDistance = _collectibles$i[3];

        // already collected item
        if (sprite === null) {
          collectibles.splice(i, 1);
        } else {
          var collectiblePosition = this.controller.levelModel.spritePositionToIndex(offset, [sprite.x, sprite.y]);
          if (distanceBetween(targetPosition, collectiblePosition) < collectibleDistance) {
            this.controller.levelView.playItemAcquireAnimation(this.position, this.facing, sprite, function () {}, blockType);
            collectibles.splice(i, 1);
          }
        }
      }
    }
  }, {
    key: "takeDamage",
    value: function takeDamage(callbackCommand) {
      var _this5 = this;

      var facingName = this.controller.levelView.getDirectionName(this.facing);
      this.healthPoint--;
      // still alive
      if (this.healthPoint > 0) {
        this.controller.levelView.playScaledSpeed(this.sprite.animations, "hurt" + facingName);
        callbackCommand.succeeded();
        // report failure since player died
      } else {
          this.sprite.animations.stop(null, true);
          this.controller.levelView.playFailureAnimation(this.position, this.facing, this.isOnBlock, function () {
            callbackCommand.failed();
            _this5.controller.handleEndState(false);
          });
        }
    }
  }, {
    key: "canTriggerPressurePlates",
    value: function canTriggerPressurePlates() {
      return true;
    }
  }]);

  return Player;
})(BaseEntity);

},{"../CommandQueue/CallbackCommand.js":3,"./BaseEntity.js":16}],23:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseEntity = require("./BaseEntity.js");
var EventType = require("../Event/EventType.js");

module.exports = (function (_BaseEntity) {
    _inherits(Sheep, _BaseEntity);

    function Sheep(controller, type, identifier, x, y, facing) {
        _classCallCheck(this, Sheep);

        _get(Object.getPrototypeOf(Sheep.prototype), "constructor", this).call(this, controller, type, identifier, x, y, facing);
        var zOrderYIndex = this.position[1];
        this.offset = [-43, -55];
        if (this.controller.levelView) {
            this.prepareSprite();
            this.sprite.sortOrder = this.controller.levelView.yToIndex(zOrderYIndex);
        }
        this.naked = false;
    }

    _createClass(Sheep, [{
        key: "use",
        value: function use(commandQueueItem, userEntity) {
            var _this = this;

            var animationName = this.getNakedSuffix() + "lookAtCam" + this.controller.levelView.getDirectionName(this.facing);
            this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);
            this.queue.startPushHighPriorityCommands();
            this.controller.events.forEach(function (e) {
                return e({ eventType: EventType.WhenUsed, targetType: _this.type, eventSenderIdentifier: userEntity.identifier, targetIdentifier: _this.identifier });
            });
            this.queue.endPushHighPriorityCommands();
            commandQueueItem.succeeded();
        }
    }, {
        key: "getWalkAnimation",
        value: function getWalkAnimation() {
            return this.getNakedSuffix() + _get(Object.getPrototypeOf(Sheep.prototype), "getWalkAnimation", this).call(this);
        }
    }, {
        key: "getIdleAnimation",
        value: function getIdleAnimation() {
            return this.getNakedSuffix() + _get(Object.getPrototypeOf(Sheep.prototype), "getIdleAnimation", this).call(this);
        }
    }, {
        key: "bump",
        value: function bump(commandQueueItem) {
            var _this2 = this;

            var animName = this.getNakedSuffix() + "bump";
            var facingName = this.controller.levelView.getDirectionName(this.facing);
            this.controller.levelView.playScaledSpeed(this.sprite.animations, animName + facingName);
            var forwardPosition = this.controller.levelModel.getMoveForwardPosition(this);
            var forwardEntity = this.controller.levelEntity.getEntityAt(forwardPosition);
            if (forwardEntity !== null) {
                this.queue.startPushHighPriorityCommands();
                this.controller.events.forEach(function (e) {
                    return e({ eventType: EventType.WhenTouched, targetType: _this2.type, targetIdentifier: _this2.identifier, eventSenderIdentifier: forwardEntity.identifier });
                });
                this.queue.endPushHighPriorityCommands();
            }
            this.controller.delayPlayerMoveBy(400, 800, function () {
                commandQueueItem.succeeded();
            });
        }
    }, {
        key: "prepareSprite",
        value: function prepareSprite() {
            var _this3 = this;

            var getRandomSecondBetween = function getRandomSecondBetween(min, max) {
                return (Math.random() * (max - min) + min) * 1000;
            };
            var frameRate = 10,
                randomPauseMin = 0.2,
                randomPauseMax = 1;
            var actionGroup = this.controller.levelView.actionGroup;
            var frameList = [];
            var frameName = "ShadowSheep_2016";
            this.sprite = actionGroup.create(0, 0, 'sheep', 'ShadowSheep_2016001.png');
            var stillFrameName = ['ShadowSheep_2016217.png', 'ShadowSheep_2016109.png', 'ShadowSheep_2016001.png', 'ShadowSheep_2016325.png'];
            var idleDelayFrame = 8;
            // for normal sheep
            // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[eat],[bump]]
            var frameListPerDirection = [[[252, 261], [220, 222], [228, 231], [276, 279], [270, 275], [282, 293], [294, 305], [306, 317], [318, 323], [234, 243], [880, 887]], // up
            [[144, 153], [112, 114], [120, 123], [168, 171], [162, 167], [174, 185], [186, 197], [198, 209], [210, 215], [126, 135], [872, 879]], // right
            [[36, 45], [3, 6], [12, 15], [60, 63], [54, 59], [66, 77], [78, 89], [90, 101], [102, 108], [18, 26], [864, 871]], // down
            [[360, 369], [328, 330], [336, 339], [384, 387], [378, 383], [390, 401], [402, 413], [414, 425], [426, 431], [342, 351], [888, 895]]]; // left
            for (var i = 0; i < 4; i++) {
                var facingName = this.controller.levelView.getDirectionName(i);
                // idle sequence
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 3);
                // idle delay
                for (var j = 0; j < idleDelayFrame; j++) {
                    frameList.push(stillFrameName[i]);
                }
                this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.playRandomIdle(_this3.facing);
                });
                // look left sequence ( look left -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 3);
                this.sprite.animations.add("lookLeft" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.sprite.animations.stop();
                    setTimeout(function () {

                        if (_this3.naked) {
                            _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_lookLeft" + _this3.controller.levelView.getDirectionName(_this3.facing) + "_2");
                        } else {
                            _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "lookLeft" + _this3.controller.levelView.getDirectionName(_this3.facing) + "_2");
                        }
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 3);
                this.sprite.animations.add("lookLeft" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // look right sequence ( look right -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 3);
                this.sprite.animations.add("lookRight" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.sprite.animations.stop();
                    setTimeout(function () {
                        if (_this3.naked) {
                            _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_lookRight" + _this3.controller.levelView.getDirectionName(_this3.facing) + "_2");
                        } else {
                            _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "lookRight" + _this3.controller.levelView.getDirectionName(_this3.facing) + "_2");
                        }
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 3);
                this.sprite.animations.add("lookRight" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // look up sequence ( look up -> pause for random time -> look front -> play random idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 3);
                this.sprite.animations.add("lookAtCam" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.sprite.animations.stop();
                    setTimeout(function () {
                        if (_this3.naked) {
                            _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_lookAtCam" + _this3.controller.levelView.getDirectionName(_this3.facing) + "_2");
                        } else {
                            _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "lookAtCam" + _this3.controller.levelView.getDirectionName(_this3.facing) + "_2");
                        }
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 3);
                this.sprite.animations.add("lookAtCam" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // look down
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 3);
                this.sprite.animations.add("lookDown" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // walk
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 3);
                this.sprite.animations.add("walk" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // attack
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 3);
                this.sprite.animations.add("attack" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // take damage
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 3);
                this.sprite.animations.add("hurt" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // die
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 3);
                this.sprite.animations.add("die" + facingName, frameList, frameRate, false);
                // eat
                frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 3);
                this.sprite.animations.add("eat" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // bump
                frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 3);
                this.sprite.animations.add("bump" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
            }
            // for naked sheep
            // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[eat],[bump]]
            frameListPerDirection = [[[684, 693], [652, 654], [660, 663], [708, 711], [702, 707], [714, 725], [726, 737], [738, 749], [750, 755], [666, 675], [912, 919]], // up
            [[576, 585], [544, 546], [552, 555], [600, 603], [594, 599], [606, 617], [618, 629], [630, 641], [642, 647], [558, 567], [904, 911]], // right
            [[468, 477], [436, 438], [444, 447], [492, 495], [486, 491], [498, 509], [510, 521], [522, 533], [534, 539], [450, 459], [896, 903]], // down
            [[792, 801], [760, 762], [768, 771], [816, 819], [810, 815], [822, 833], [834, 845], [846, 857], [858, 863], [774, 783], [920, 927]]]; // left
            stillFrameName = ['ShadowSheep_2016649.png', 'ShadowSheep_2016541.png', 'ShadowSheep_2016433.png', 'ShadowSheep_2016757.png'];
            for (var i = 0; i < 4; i++) {
                var facingName = this.controller.levelView.getDirectionName(i);

                // idle sequence
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 3);
                // idle delay
                for (var j = 0; j < idleDelayFrame; j++) {
                    frameList.push(stillFrameName[i]);
                }
                this.sprite.animations.add("naked_idle" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.playRandomIdle(_this3.facing);
                });
                // look left sequence ( look left -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 3);
                this.sprite.animations.add("naked_lookLeft" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.sprite.animations.stop();
                    setTimeout(function () {
                        _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_lookLeft" + _this3.controller.levelView.getDirectionName(_this3.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 3);
                this.sprite.animations.add("naked_lookLeft" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // look right sequence ( look right -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 3);
                this.sprite.animations.add("naked_lookRight" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.sprite.animations.stop();
                    setTimeout(function () {
                        _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_lookRight" + _this3.controller.levelView.getDirectionName(_this3.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 3);
                this.sprite.animations.add("naked_lookRight" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // look up sequence ( look up -> pause for random time -> look front -> play random idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 3);
                this.sprite.animations.add("naked_lookAtCam" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.sprite.animations.stop();
                    setTimeout(function () {
                        _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_lookAtCam" + _this3.controller.levelView.getDirectionName(_this3.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 3);
                this.sprite.animations.add("naked_lookAtCam" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // look down
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 3);
                this.sprite.animations.add("naked_lookDown" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // walk
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 3);
                this.sprite.animations.add("naked_walk" + facingName, frameList, frameRate, true);
                // attack
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 3);
                this.sprite.animations.add("naked_attack" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // take damage
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 3);
                this.sprite.animations.add("naked_hurt_" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // die
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 3);
                this.sprite.animations.add("naked_die" + facingName, frameList, frameRate, false);
                // eat
                frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 3);
                this.sprite.animations.add("naked_eat" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.naked = false;
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
                // bump
                frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][10][0], frameListPerDirection[i][10][1], ".png", 3);
                this.sprite.animations.add("naked_bump" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this3.controller.levelView.playScaledSpeed(_this3.sprite.animations, "naked_idle" + _this3.controller.levelView.getDirectionName(_this3.facing));
                });
            }

            // initialize
            this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            this.sprite.x = this.offset[0] + 40 * this.position[0];
            this.sprite.y = this.offset[1] + 40 * this.position[1];
        }
    }, {
        key: "playRandomIdle",
        value: function playRandomIdle(facing) {
            var facingName,
                rand,
                animationName = this.getNakedSuffix();
            facingName = this.controller.levelView.getDirectionName(facing);
            rand = Math.trunc(Math.random() * 6) + 1;
            switch (rand) {
                case 1:
                    animationName += "idle";
                    break;
                case 2:
                    animationName += "lookLeft";
                    break;
                case 3:
                    animationName += "lookRight";
                    break;
                case 4:
                    animationName += "lookAtCam";
                    break;
                case 5:
                    animationName += "lookDown";
                    break;
                case 6:
                    animationName += "eat";
                    break;
                default:
            }

            animationName += facingName;
            this.controller.levelView.playScaledSpeed(this.sprite.animations, animationName);
            this.controller.printErrorMsg(this.type + " calls animation : " + animationName + "\n");
        }
    }, {
        key: "attack",
        value: function attack(commandQueueItem) {
            var _this4 = this;

            var facingName = this.controller.levelView.getDirectionName(this.facing);
            this.controller.levelView.onAnimationEnd(this.controller.levelView.playScaledSpeed(this.sprite.animations, this.getNakedSuffix() + "attack" + facingName), function () {
                var frontEntity = _this4.controller.levelEntity.getEntityAt(_this4.controller.levelModel.getMoveForwardPosition(_this4));
                if (frontEntity !== null) {
                    _this4.controller.levelView.onAnimationEnd(_this4.controller.levelView.playScaledSpeed(frontEntity.sprite.animations, _this4.getNakedSuffix() + "hurt" + facingName), function () {
                        _this4.controller.events.forEach(function (e) {
                            return e({ eventType: EventType.WhenAttacked, targetType: _this4.type, eventSenderIdentifier: _this4.identifier, targetIdentifier: frontEntity.identifier });
                        });
                    });
                }
                commandQueueItem.succeeded();
            });
        }
    }, {
        key: "updateAnimationDirection",
        value: function updateAnimationDirection() {
            var facingName = this.controller.levelView.getDirectionName(this.facing);
            this.controller.levelView.playScaledSpeed(this.sprite.animations, this.getNakedSuffix() + "idle" + facingName);
        }
    }, {
        key: "drop",
        value: function drop(commandQueueItem, itemType) {
            if (this.naked) {
                return false;
            }

            if (commandQueueItem) {
                _get(Object.getPrototypeOf(Sheep.prototype), "drop", this).call(this, commandQueueItem, itemType);
            }

            if (itemType === 'wool') {
                // default behavior for drop ?
                this.naked = true;
                if (this.controller.levelView) {
                    var direction = this.controller.levelView.getDirectionName(this.facing);
                    this.controller.levelView.playScaledSpeed(this.sprite.animations, "naked_idle" + direction, function () {});
                }
            }
            return true;
        }
    }, {
        key: "takeDamage",
        value: function takeDamage(callbackCommand) {
            var _this5 = this;

            var levelView = this.controller.levelView;
            var facingName = levelView.getDirectionName(this.facing);
            if (this.healthPoint > 1) {
                levelView.playScaledSpeed(this.sprite.animations, this.getNakedSuffix() + "hurt" + facingName);
                setTimeout(function () {
                    _this5.healthPoint--;
                    callbackCommand.succeeded();
                }, 1500);
            } else {
                this.healthPoint--;
                this.sprite.animations.stop(null, true);
                this.controller.levelView.playScaledSpeed(this.sprite.animations, this.getNakedSuffix() + "die" + facingName);
                setTimeout(function () {

                    var tween = _this5.controller.levelView.addResettableTween(_this5.sprite).to({
                        alpha: 0
                    }, 500, Phaser.Easing.Linear.None);

                    tween.onComplete.add(function () {

                        _this5.controller.levelEntity.destroyEntity(_this5.identifier);
                    });
                    tween.start();
                }, 1500);
            }
        }
    }, {
        key: "getNakedSuffix",
        value: function getNakedSuffix() {
            return this.naked ? "naked_" : "";
        }
    }]);

    return Sheep;
})(BaseEntity);

},{"../Event/EventType.js":25,"./BaseEntity.js":16}],24:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseEntity = require("./BaseEntity.js");
module.exports = (function (_BaseEntity) {
    _inherits(Zombie, _BaseEntity);

    function Zombie(controller, type, identifier, x, y, facing) {
        _classCallCheck(this, Zombie);

        _get(Object.getPrototypeOf(Zombie.prototype), "constructor", this).call(this, controller, type, identifier, x, y, facing);
        this.offset = [-43, -45];
        this.burningSprite = [null, null];
        this.burningSpriteGhost = [null, null];
        this.burningSpriteOffset = [47, 40];
        this.prepareSprite();
    }

    _createClass(Zombie, [{
        key: "tick",
        value: function tick() {
            _get(Object.getPrototypeOf(Zombie.prototype), "tick", this).call(this);
        }
    }, {
        key: "reset",
        value: function reset() {
            for (var i = 0; i < 2; i++) {
                if (this.burningSprite[i]) {
                    this.burningSprite[i].destroy();
                }
            }
        }
    }, {
        key: "playMoveForwardAnimation",
        value: function playMoveForwardAnimation(position, facing, commandQueueItem, groundType) {
            var _this = this;

            _get(Object.getPrototypeOf(Zombie.prototype), "playMoveForwardAnimation", this).call(this, position, facing, commandQueueItem, groundType);

            this.burningSprite[0].sortOrder = this.sprite.sortOrder + 1;
            this.burningSprite[1].sortOrder = this.sprite.sortOrder - 1;

            setTimeout(function () {
                // tween for burning animation
                for (var i = 0; i < 2; i++) {
                    var tween = _this.controller.levelView.addResettableTween(_this.burningSprite[i]).to({
                        x: _this.offset[0] + _this.burningSpriteOffset[0] + 40 * position[0], y: _this.offset[1] + _this.burningSpriteOffset[1] + 40 * position[1]
                    }, 300, Phaser.Easing.Linear.None);
                    tween.onComplete.add(function () {});

                    tween.start();
                }
            }, 50 / this.controller.tweenTimeScale);
            // smooth movement using tween
        }
    }, {
        key: "setBurn",
        value: function setBurn(burn) {
            if (burn) {
                for (var i = 0; i < 2; i++) {
                    this.burningSprite[i].alpha = 1;
                }
            } else {
                for (var i = 0; i < 2; i++) {
                    this.burningSprite[i].alpha = 0;
                }
            }
        }
    }, {
        key: "prepareSprite",
        value: function prepareSprite() {
            var _this2 = this;

            var getRandomSecondBetween = function getRandomSecondBetween(min, max) {
                return (Math.random() * (max - min) + min) * 1000;
            };
            var frameRate = 10,
                randomPauseMin = 0.2,
                randomPauseMax = 1;
            var actionGroup = this.controller.levelView.actionGroup;
            var frameList = [];
            var frameName = "Zombie_";
            this.sprite = actionGroup.create(0, 0, 'zombie', 'Zombie_001.png');
            // update sort order and position
            this.sprite.sortOrder = this.controller.levelView.yToIndex(this.position[1]);
            this.sprite.x = this.offset[0] + 40 * this.position[0];
            this.sprite.y = this.offset[1] + 40 * this.position[1];
            // add burning sprite
            this.burningSprite = [actionGroup.create(this.sprite.x + this.burningSpriteOffset[0], this.sprite.y + this.burningSpriteOffset[1], 'burningInSun', "BurningFront_001.png"), actionGroup.create(this.sprite.x + this.burningSpriteOffset[0], this.sprite.y + this.burningSpriteOffset[1], 'burningInSun', "BurningBehind_001.png")];

            frameList = Phaser.Animation.generateFrameNames("BurningFront_", 1, 15, ".png", 3);
            this.burningSprite[0].animations.add("burn", frameList, frameRate, true);
            frameList = Phaser.Animation.generateFrameNames("BurningBehind_", 1, 15, ".png", 3);
            this.burningSprite[1].animations.add("burn", frameList, frameRate, true);
            // start burning animation
            this.controller.levelView.playScaledSpeed(this.burningSprite[0].animations, "burn");
            this.controller.levelView.playScaledSpeed(this.burningSprite[1].animations, "burn");
            // update burning sprite's sort order
            this.burningSprite[0].sortOrder = this.sprite.sortOrder + 1;
            this.burningSprite[1].sortOrder = this.sprite.sortOrder - 1;
            var stillFrameName = ['Zombie_056.png', 'Zombie_166.png', 'Zombie_001.png', 'Zombie_111.png'];
            var idleDelayFrame = 8;
            // [direction][[idle],[look left],[look right],[look up],[look down],[walk],[attack],[take dmg],[die],[bump]]
            var frameListPerDirection = [[[73, 79], [57, 59], [61, 63], [69, 71], [65, 67], [80, 88], [89, 91], [93, 101], [102, 110], [229, 236]], // down
            [[183, 189], [167, 169], [171, 173], [179, 181], [175, 177], [190, 198], [199, 201], [203, 211], [212, 220], [245, 252]], // right
            [[18, 24], [2, 4], [6, 8], [14, 16], [10, 12], [25, 33], [34, 36], [38, 46], [47, 55], [221, 228]], // up
            [[128, 134], [112, 114], [116, 118], [124, 126], [120, 122], [135, 143], [144, 146], [148, 156], [158, 165], [237, 244]]]; // left
            for (var i = 0; i < 4; i++) {
                var facingName = this.controller.levelView.getDirectionName(i);

                // idle sequence
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][0][0], frameListPerDirection[i][0][1], ".png", 3);
                for (var j = 0; j < idleDelayFrame; j++) {
                    frameList.push(stillFrameName[i]);
                }
                this.sprite.animations.add("idle" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this2.playRandomIdle(_this2.facing);
                });
                // look left sequence ( look left -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][0], frameListPerDirection[i][1][1], ".png", 3);
                this.sprite.animations.add("lookLeft" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this2.sprite.animations.stop();
                    setTimeout(function () {
                        _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "lookLeft" + _this2.controller.levelView.getDirectionName(_this2.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][1][1], frameListPerDirection[i][1][0], ".png", 3);
                this.sprite.animations.add("lookLeft" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "idle" + _this2.controller.levelView.getDirectionName(_this2.facing));
                });
                // look right sequence ( look right -> pause for random time -> look front -> idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][0], frameListPerDirection[i][2][1], ".png", 3);
                this.sprite.animations.add("lookRight" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this2.sprite.animations.stop();
                    setTimeout(function () {
                        _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "lookRight" + _this2.controller.levelView.getDirectionName(_this2.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][2][1], frameListPerDirection[i][2][0], ".png", 3);
                this.sprite.animations.add("lookRight" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "idle" + _this2.controller.levelView.getDirectionName(_this2.facing));
                });
                // look up sequence ( look up -> pause for random time -> look front -> play random idle)
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][0], frameListPerDirection[i][3][1], ".png", 3);
                this.sprite.animations.add("lookAtCam" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this2.sprite.animations.stop();
                    setTimeout(function () {
                        _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "lookAtCam" + _this2.controller.levelView.getDirectionName(_this2.facing) + "_2");
                    }, getRandomSecondBetween(randomPauseMin, randomPauseMax));
                });
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][3][1], frameListPerDirection[i][3][0], ".png", 3);
                this.sprite.animations.add("lookAtCam" + facingName + "_2", frameList, frameRate, false).onComplete.add(function () {
                    _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "idle" + _this2.controller.levelView.getDirectionName(_this2.facing));
                });
                // look down
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][4][0], frameListPerDirection[i][4][1], ".png", 3);
                this.sprite.animations.add("lookDown" + facingName, frameList, frameRate / 3, false).onComplete.add(function () {
                    _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "idle" + _this2.controller.levelView.getDirectionName(_this2.facing));
                });
                // walk
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][5][0], frameListPerDirection[i][5][1], ".png", 3);
                this.sprite.animations.add("walk" + facingName, frameList, frameRate, true);
                // attack
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][6][0], frameListPerDirection[i][6][1], ".png", 3);
                this.sprite.animations.add("attack" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "idle" + _this2.controller.levelView.getDirectionName(_this2.facing));
                });
                // take damage
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][7][0], frameListPerDirection[i][7][1], ".png", 3);
                this.sprite.animations.add("hurt" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "idle" + _this2.controller.levelView.getDirectionName(_this2.facing));
                });
                // die
                frameList = Phaser.Animation.generateFrameNames(frameName, frameListPerDirection[i][8][0], frameListPerDirection[i][8][1], ".png", 3);
                this.sprite.animations.add("die" + facingName, frameList, frameRate, false);
                // bump
                frameList = this.controller.levelView.generateReverseFrames(frameName, frameListPerDirection[i][9][0], frameListPerDirection[i][9][1], ".png", 3);
                this.sprite.animations.add("bump" + facingName, frameList, frameRate, false).onComplete.add(function () {
                    _this2.controller.levelView.playScaledSpeed(_this2.sprite.animations, "idle" + _this2.controller.levelView.getDirectionName(_this2.facing));
                });
            }
            // initialize
            this.controller.levelView.playScaledSpeed(this.sprite.animations, "idle" + this.controller.levelView.getDirectionName(this.facing));
            // set burn
            this.setBurn(this.controller.levelModel.isDaytime);
        }
    }, {
        key: "takeDamage",
        value: function takeDamage(callbackCommand) {
            var _this3 = this;

            var levelView = this.controller.levelView;
            var facingName = levelView.getDirectionName(this.facing);
            if (this.healthPoint > 1) {
                levelView.playScaledSpeed(this.sprite.animations, "hurt" + facingName);
                setTimeout(function () {
                    _this3.healthPoint--;
                    callbackCommand.succeeded();
                }, 1500 / this.controller.tweenTimeScale);
            } else {
                this.healthPoint--;
                this.controller.levelView.playScaledSpeed(this.sprite.animations, "die" + facingName);
                setTimeout(function () {

                    var tween = _this3.controller.levelView.addResettableTween(_this3.sprite).to({
                        alpha: 0
                    }, 500, Phaser.Easing.Linear.None);

                    tween.onComplete.add(function () {
                        _this3.controller.levelEntity.destroyEntity(_this3.identifier);
                    });

                    tween.start();
                    for (var i = 0; i < 2; i++) {
                        tween = _this3.controller.levelView.addResettableTween(_this3.burningSprite[i]).to({
                            alpha: 0
                        }, 500, Phaser.Easing.Linear.None);
                        tween.start();
                    }
                }, 1500 / this.controller.tweenTimeScale);
            }
        }
    }]);

    return Zombie;
})(BaseEntity);

},{"./BaseEntity.js":16}],25:[function(require,module,exports){
"use strict";

module.exports = Object.freeze({
  WhenTouched: 0,
  WhenUsed: 1,
  WhenSpawned: 2,
  WhenAttacked: 3,
  WhenNight: 4,
  WhenDay: 5,
  WhenNightGlobal: 6,
  WhenDayGlobal: 7,
  WhenRun: 8
});

},{}],26:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CommandQueue = require("./CommandQueue/CommandQueue.js");
var CallbackCommand = require("./CommandQueue/CallbackCommand.js");

var EventType = require("./Event/EventType.js");
var FacingDirection = require("./LevelMVC/FacingDirection.js");

var LevelModel = require("./LevelMVC/LevelModel.js");
var LevelView = require("./LevelMVC/LevelView.js");
var LevelEntity = require("./LevelMVC/LevelEntity.js");
var AssetLoader = require("./LevelMVC/AssetLoader.js");

var CodeOrgAPI = require("./API/CodeOrgAPI.js");

var GAME_WIDTH = 400;
var GAME_HEIGHT = 400;

/**
 * Initializes a new instance of a mini-game visualization
 */

var GameController = (function () {
  /**
   * @param {Object} gameControllerConfig
   * @param {String} gameControllerConfig.containerId DOM ID to mount this app
   * @param {Phaser} gameControllerConfig.Phaser Phaser package
   * @constructor
   */

  function GameController(gameControllerConfig) {
    var _this = this;

    _classCallCheck(this, GameController);

    this.DEBUG = gameControllerConfig.debug;

    // Phaser pre-initialization config
    window.PhaserGlobal = {
      disableAudio: true,
      disableWebAudio: true,
      hideBanner: !this.DEBUG
    };

    /**
     * @public {Object} codeOrgAPI - API with externally-callable methods for
     * starting an attempt, issuing commands, etc.
     */
    this.codeOrgAPI = CodeOrgAPI.get(this);

    var Phaser = gameControllerConfig.Phaser;

    /**
     * Main Phaser game instance.
     * @property {Phaser.Game}
     */
    this.game = new Phaser.Game({
      forceSetTimeOut: gameControllerConfig.forceSetTimeOut,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      renderer: Phaser.CANVAS,
      parent: gameControllerConfig.containerId,
      state: 'earlyLoad',
      // TODO(bjordan): remove now that using canvas?
      preserveDrawingBuffer: true // enables saving .png screengrabs
    });

    this.specialLevelType = null;
    this.queue = new CommandQueue(this);
    this.OnCompleteCallback = null;

    this.assetRoot = gameControllerConfig.assetRoot;

    this.audioPlayer = gameControllerConfig.audioPlayer;
    this.afterAssetsLoaded = gameControllerConfig.afterAssetsLoaded;
    this.assetLoader = new AssetLoader(this);
    this.earlyLoadAssetPacks = gameControllerConfig.earlyLoadAssetPacks || [];
    this.earlyLoadNiceToHaveAssetPacks = gameControllerConfig.earlyLoadNiceToHaveAssetPacks || [];

    this.resettableTimers = [];
    this.timeouts = [];
    this.timeout = 0;
    this.initializeCommandRecord();

    this.score = 0;
    this.useScore = false;
    this.scoreText = null;
    this.onScoreUpdate = gameControllerConfig.onScoreUpdate;

    this.events = [];

    // Phaser "slow motion" modifier we originally tuned animations using
    this.assumedSlowMotion = 1.5;
    this.initialSlowMotion = gameControllerConfig.customSlowMotion || this.assumedSlowMotion;
    this.tweenTimeScale = 1.5 / this.initialSlowMotion;

    this.playerDelayFactor = 1.0;
    this.dayNightCycle = false;
    this.player = null;
    this.agent = null;

    this.timerSprite = null;

    this.game.state.add('earlyLoad', {
      preload: function preload() {
        // don't let state change stomp essential asset downloads in progress
        _this.game.load.resetLocked = true;
        _this.assetLoader.loadPacks(_this.earlyLoadAssetPacks);
      },
      create: function create() {
        // optionally load some more assets if we complete early load before level load
        _this.assetLoader.loadPacks(_this.earlyLoadNiceToHaveAssetPacks);
        _this.game.load.start();
      }
    });

    this.game.state.add('levelRunner', {
      preload: this.preload.bind(this),
      create: this.create.bind(this),
      update: this.update.bind(this),
      render: this.render.bind(this)
    });
  }

  /**
   * Is this one of those level types in which the player is controlled by arrow
   * keys rather than by blocks?
   *
   * @return {boolean}
   */

  _createClass(GameController, [{
    key: "getIsDirectPlayerControl",
    value: function getIsDirectPlayerControl() {
      return this.levelData.isEventLevel || this.levelData.isAgentLevel;
    }

    /**
     * @param {Object} levelConfig
     */
  }, {
    key: "loadLevel",
    value: function loadLevel(levelConfig) {
      this.levelData = Object.freeze(levelConfig);

      this.levelEntity = new LevelEntity(this);
      this.levelModel = new LevelModel(this.levelData, this);
      this.levelView = new LevelView(this);
      this.specialLevelType = levelConfig.specialLevelType;
      this.timeout = levelConfig.levelVerificationTimeout;
      if (levelConfig.useScore !== undefined) {
        this.useScore = levelConfig.useScore;
      }
      this.timeoutResult = levelConfig.timeoutResult;
      this.onDayCallback = levelConfig.onDayCallback;
      this.onNightCallback = levelConfig.onNightCallback;

      this.game.state.start('levelRunner');
    }
  }, {
    key: "reset",
    value: function reset() {
      var _this2 = this;

      this.dayNightCycle = false;
      this.queue.reset();
      this.levelEntity.reset();
      this.levelModel.reset();
      this.levelView.reset(this.levelModel);
      this.levelEntity.loadData(this.levelData);
      this.player = this.levelModel.player;
      this.agent = this.levelModel.agent;
      this.resettableTimers.forEach(function (timer) {
        timer.stop(true);
      });
      this.timeouts.forEach(function (timeout) {
        clearTimeout(timeout);
      });
      if (this.timerSprite) {
        this.timerSprite.kill();
      }
      this.timerSprite = null;
      this.timeouts = [];
      this.resettableTimers.length = 0;
      this.events.length = 0;

      this.score = 0;
      if (this.useScore) {
        this.updateScore();
      }

      if (!this.getIsDirectPlayerControl()) {
        this.events.push(function (event) {
          if (event.eventType === EventType.WhenUsed && event.targetType === 'sheep') {
            _this2.codeOrgAPI.drop(null, 'wool', event.targetIdentifier);
          }
          if (event.eventType === EventType.WhenTouched && event.targetType === 'creeper') {
            _this2.codeOrgAPI.flashEntity(null, event.targetIdentifier);
            _this2.codeOrgAPI.explodeEntity(null, event.targetIdentifier);
          }
        });
      }

      this.initializeCommandRecord();
    }
  }, {
    key: "preload",
    value: function preload() {
      this.game.load.resetLocked = true;
      this.game.time.advancedTiming = this.DEBUG;
      this.game.stage.disableVisibilityChange = true;
      this.assetLoader.loadPacks(this.levelData.assetPacks.beforeLoad);
    }
  }, {
    key: "create",
    value: function create() {
      var _this3 = this;

      this.levelView.create(this.levelModel);
      this.game.time.slowMotion = this.initialSlowMotion;
      this.addCheatKeys();
      this.assetLoader.loadPacks(this.levelData.assetPacks.afterLoad);
      this.game.load.image('timer', this.assetRoot + "images/placeholderTimer.png");
      this.game.load.onLoadComplete.addOnce(function () {
        if (_this3.afterAssetsLoaded) {
          _this3.afterAssetsLoaded();
        }
      });
      this.levelEntity.loadData(this.levelData);
      this.game.load.start();
    }
  }, {
    key: "run",
    value: function run() {
      var _this4 = this;

      // dispatch when spawn event at run
      this.events.forEach(function (e) {
        return e({ eventType: EventType.WhenRun, targetIdentifier: undefined });
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.levelEntity.entityMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var value = _step.value;

          var entity = value[1];
          this.events.forEach(function (e) {
            return e({ eventType: EventType.WhenSpawned, targetType: entity.type, targetIdentifier: entity.identifier });
          });
          entity.queue.begin();
        }
        // set timeout for timeout
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var isNumber = !isNaN(this.timeout);
      if (isNumber && this.timeout > 0) {
        this.timerSprite = this.game.add.sprite(-50, 390, 'timer');
        var tween = this.levelView.addResettableTween(this.timerSprite).to({
          x: -450, alpha: 0.5
        }, this.timeout, Phaser.Easing.Linear.None);

        tween.onComplete.add(function () {
          _this4.endLevel(_this4.timeoutResult(_this4.levelModel));
        });

        tween.start();
      }
    }
  }, {
    key: "followingPlayer",
    value: function followingPlayer() {
      return !!this.levelData.gridDimensions && !this.checkMinecartLevelEndAnimation();
    }
  }, {
    key: "update",
    value: function update() {
      this.queue.tick();
      this.levelEntity.tick();
      if (this.levelModel.usePlayer) {
        this.player.updateMovement();
      }
      if (this.levelModel.usingAgent) {
        this.agent.updateMovement();
      }
      this.levelView.update();

      // Check for completion every frame for "event" levels. For procedural
      // levels, only check completion after the player has run all commands.
      if (this.getIsDirectPlayerControl() || this.player.queue.state > 1) {
        this.checkSolution();
      }
    }
  }, {
    key: "addCheatKeys",
    value: function addCheatKeys() {
      var _keysToMovementState,
          _this5 = this;

      if (!this.levelModel.usePlayer) {
        return;
      }

      var keysToMovementState = (_keysToMovementState = {}, _defineProperty(_keysToMovementState, Phaser.Keyboard.UP, FacingDirection.North), _defineProperty(_keysToMovementState, Phaser.Keyboard.W, FacingDirection.North), _defineProperty(_keysToMovementState, Phaser.Keyboard.RIGHT, FacingDirection.East), _defineProperty(_keysToMovementState, Phaser.Keyboard.D, FacingDirection.East), _defineProperty(_keysToMovementState, Phaser.Keyboard.DOWN, FacingDirection.South), _defineProperty(_keysToMovementState, Phaser.Keyboard.S, FacingDirection.South), _defineProperty(_keysToMovementState, Phaser.Keyboard.LEFT, FacingDirection.West), _defineProperty(_keysToMovementState, Phaser.Keyboard.A, FacingDirection.West), _defineProperty(_keysToMovementState, Phaser.Keyboard.SPACEBAR, -2), _keysToMovementState);

      Object.keys(keysToMovementState).forEach(function (key) {
        var movementState = keysToMovementState[key];
        _this5.game.input.keyboard.addKey(key).onDown.add(function () {
          _this5.player.movementState = movementState;
          _this5.player.updateMovement();
        });
        _this5.game.input.keyboard.addKey(key).onUp.add(function () {
          if (_this5.player.movementState === movementState) {
            _this5.player.movementState = -1;
          }
          _this5.player.updateMovement();
        });
      });
    }
  }, {
    key: "handleEndState",
    value: function handleEndState(result) {
      // report back to the code.org side the pass/fail result
      //     then clear the callback so we dont keep calling it
      if (this.OnCompleteCallback) {
        this.OnCompleteCallback(result, this.levelModel);
        this.OnCompleteCallback = null;
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (this.DEBUG) {
        this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
      }
      this.levelView.render();
    }
  }, {
    key: "scaleFromOriginal",
    value: function scaleFromOriginal() {
      var _ref = this.levelData.gridDimensions || [10, 10];

      var _ref2 = _slicedToArray(_ref, 2);

      var newWidth = _ref2[0];
      var newHeight = _ref2[1];
      var originalWidth = 10;
      var originalHeight = 10;

      return [newWidth / originalWidth, newHeight / originalHeight];
    }
  }, {
    key: "getScreenshot",
    value: function getScreenshot() {
      return this.game.canvas.toDataURL("image/png");
    }

    // command record

  }, {
    key: "initializeCommandRecord",
    value: function initializeCommandRecord() {
      var commandList = ["moveAway", "moveToward", "moveForward", "turn", "turnRandom", "explode", "wait", "flash", "drop", "spawn", "destroy", "playSound", "attack", "addScore"];
      this.commandRecord = new Map();
      this.repeatCommandRecord = new Map();
      this.isRepeat = false;
      for (var i = 0; i < commandList.length; i++) {
        this.commandRecord.set(commandList[i], new Map());
        this.commandRecord.get(commandList[i]).set("count", 0);
        this.repeatCommandRecord.set(commandList[i], new Map());
        this.repeatCommandRecord.get(commandList[i]).set("count", 0);
      }
    }
  }, {
    key: "startPushRepeatCommand",
    value: function startPushRepeatCommand() {
      this.isRepeat = true;
    }
  }, {
    key: "endPushRepeatCommand",
    value: function endPushRepeatCommand() {
      this.isRepeat = false;
    }
  }, {
    key: "addCommandRecord",
    value: function addCommandRecord(commandName, targetType, repeat) {
      var commandRecord = repeat ? this.repeatCommandRecord : this.commandRecord;
      // correct command name
      if (commandRecord.has(commandName)) {
        // update count for command map
        var commandMap = commandRecord.get(commandName);
        commandMap.set("count", commandMap.get("count") + 1);
        // command map has target
        if (commandMap.has(targetType)) {
          // increment count
          commandMap.set(targetType, commandMap.get(targetType) + 1);
        } else {
          commandMap.set(targetType, 1);
        }
        if (this.DEBUG) {
          var msgHeader = repeat ? "Repeat " : "" + "Command :";
          console.log(msgHeader + commandName + " executed in mob type : " + targetType + " updated count : " + commandMap.get(targetType));
        }
      }
    }
  }, {
    key: "getCommandCount",
    value: function getCommandCount(commandName, targetType, repeat) {
      var commandRecord = repeat ? this.repeatCommandRecord : this.commandRecord;
      // command record has command name and target
      if (commandRecord.has(commandName)) {
        var commandMap = commandRecord.get(commandName);
        // doesn't have target so returns global count for command
        if (targetType === undefined) {
          return commandMap.get("count");
          // type specific count
        } else if (commandMap.has(targetType)) {
            return commandMap.get(targetType);
            // doesn't have a target
          } else {
              return 0;
            }
      } else {
        return 0;
      }
    }

    // command processors

  }, {
    key: "getEntity",
    value: function getEntity(target) {
      if (target === undefined) {
        target = 'Player';
      }
      var entity = this.levelEntity.entityMap.get(target);
      if (entity === undefined) {
        console.log("Debug GetEntity: there is no entity : " + target + "\n");
      }
      return entity;
    }
  }, {
    key: "getEntities",
    value: function getEntities(type) {
      return this.levelEntity.getEntitiesOfType(type);
    }
  }, {
    key: "isType",
    value: function isType(target) {
      return typeof target === 'string' && target !== 'Player' && target !== "PlayerAgent";
    }
  }, {
    key: "printErrorMsg",
    value: function printErrorMsg(msg) {
      if (this.DEBUG) {
        this.game.debug.text(msg);
      }
    }

    /**
     * @param {any} commandQueueItem
     * @param {any} moveAwayFrom (entity identifier)
     *
     * @memberOf GameController
     */
  }, {
    key: "moveAway",
    value: function moveAway(commandQueueItem, moveAwayFrom) {
      var _this6 = this;

      var target = commandQueueItem.target;
      // apply to all entities
      if (target === undefined) {
        var entities = this.levelEntity.entityMap;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          var _loop = function () {
            value = _step2.value;

            var entity = value[1];
            var callbackCommand = new CallbackCommand(_this6, function () {}, function () {
              _this6.moveAway(callbackCommand, moveAwayFrom);
            }, entity.identifier);
            entity.addCommand(callbackCommand, commandQueueItem.repeat);
          };

          for (var _iterator2 = entities[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var value;

            _loop();
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        commandQueueItem.succeeded();
      } else {
        var targetIsType = this.isType(target);
        var moveAwayFromIsType = this.isType(moveAwayFrom);
        if (target === moveAwayFrom) {
          this.printErrorMsg("Debug MoveAway: Can't move away entity from itself\n");
          commandQueueItem.succeeded();
          return;
        }
        // move away entity from entity
        if (!targetIsType && !moveAwayFromIsType) {
          var entity = this.getEntity(target);
          var moveAwayFromEntity = this.getEntity(moveAwayFrom);
          if (entity === moveAwayFromEntity) {
            commandQueueItem.succeeded();
            return;
          }
          entity.moveAway(commandQueueItem, moveAwayFromEntity);
        } else if (targetIsType && !moveAwayFromIsType) {
          // move away type from entity
          var targetEntities = this.getEntities(target);
          var moveAwayFromEntity = this.getEntity(moveAwayFrom);
          if (moveAwayFromEntity !== undefined) {
            var _loop2 = function () {
              // not move if it's same entity
              if (targetEntities[i].identifier === moveAwayFromEntity.identifier) {
                return "continue";
              }
              var callbackCommand = new CallbackCommand(_this6, function () {}, function () {
                _this6.moveAway(callbackCommand, moveAwayFrom);
              }, targetEntities[i].identifier);
              targetEntities[i].addCommand(callbackCommand, commandQueueItem.repeat);
            };

            for (var i = 0; i < targetEntities.length; i++) {
              var _ret2 = _loop2();

              if (_ret2 === "continue") continue;
            }
          }
          commandQueueItem.succeeded();
        } else if (!targetIsType && moveAwayFromIsType) {
          // move away entity from type
          var entity = this.getEntity(target);
          var moveAwayFromEntities = this.getEntities(moveAwayFrom);
          if (moveAwayFromEntities.length > 0) {
            var closestTarget = [Number.MAX_VALUE, -1];
            for (var _i = 0; _i < moveAwayFromEntities.length; _i++) {
              if (entity.identifier === moveAwayFromEntities[_i].identifier) {
                continue;
              }
              var distance = entity.getDistance(moveAwayFromEntities[_i]);
              if (distance < closestTarget[0]) {
                closestTarget = [distance, _i];
              }
            }
            if (closestTarget[1] !== -1) {
              entity.moveAway(commandQueueItem, moveAwayFromEntities[closestTarget[1]]);
            }
          } else {
            commandQueueItem.succeeded();
          }
        } else {
          (function () {
            // move away type from type
            var entities = _this6.getEntities(target);
            var moveAwayFromEntities = _this6.getEntities(moveAwayFrom);
            if (moveAwayFromEntities.length > 0 && entities.length > 0) {
              var _loop3 = function (_i2) {
                var entity = entities[_i2];
                var closestTarget = [Number.MAX_VALUE, -1];
                for (var j = 0; j < moveAwayFromEntities.length; j++) {
                  // not move if it's same entity
                  if (moveAwayFromEntities[_i2].identifier === entity.identifier) {
                    continue;
                  }
                  var distance = entity.getDistance(moveAwayFromEntities[j]);
                  if (distance < closestTarget[0]) {
                    closestTarget = [distance, j];
                  }
                }
                if (closestTarget !== -1) {
                  (function () {
                    var callbackCommand = new CallbackCommand(_this6, function () {}, function () {
                      _this6.moveAway(callbackCommand, moveAwayFromEntities[closestTarget[1]].identifier);
                    }, entity.identifier);
                    entity.addCommand(callbackCommand, commandQueueItem.repeat);
                  })();
                } else {
                  commandQueueItem.succeeded();
                }
              };

              for (var _i2 = 0; _i2 < entities.length; _i2++) {
                _loop3(_i2);
              }
              commandQueueItem.succeeded();
            }
          })();
        }
      }
    }

    /**
     * @param {any} commandQueueItem
     * @param {any} moveTowardTo (entity identifier)
     *
     * @memberOf GameController
     */
  }, {
    key: "moveToward",
    value: function moveToward(commandQueueItem, moveTowardTo) {
      var _this7 = this;

      var target = commandQueueItem.target;
      // apply to all entities
      if (target === undefined) {
        var entities = this.levelEntity.entityMap;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          var _loop4 = function () {
            value = _step3.value;

            var entity = value[1];
            var callbackCommand = new CallbackCommand(_this7, function () {}, function () {
              _this7.moveToward(callbackCommand, moveTowardTo);
            }, entity.identifier);
            entity.addCommand(callbackCommand, commandQueueItem.repeat);
          };

          for (var _iterator3 = entities[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var value;

            _loop4();
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        commandQueueItem.succeeded();
      } else {
        var targetIsType = this.isType(target);
        var moveTowardToIsType = this.isType(moveTowardTo);
        if (target === moveTowardTo) {
          commandQueueItem.succeeded();
          return;
        }
        // move toward entity to entity
        if (!targetIsType && !moveTowardToIsType) {
          var entity = this.getEntity(target);
          var moveTowardToEntity = this.getEntity(moveTowardTo);
          entity.moveToward(commandQueueItem, moveTowardToEntity);
        } else if (targetIsType && !moveTowardToIsType) {
          // move toward type to entity
          var targetEntities = this.getEntities(target);
          var moveTowardToEntity = this.getEntity(moveTowardTo);
          if (moveTowardToEntity !== undefined) {
            var _loop5 = function (i) {
              // not move if it's same entity
              if (targetEntities[i].identifier === moveTowardToEntity.identifier) {
                return "continue";
              }
              var callbackCommand = new CallbackCommand(_this7, function () {}, function () {
                _this7.moveToward(callbackCommand, moveTowardTo);
              }, targetEntities[i].identifier);
              targetEntities[i].addCommand(callbackCommand, commandQueueItem.repeat);
            };

            for (var i = 0; i < targetEntities.length; i++) {
              var _ret7 = _loop5(i);

              if (_ret7 === "continue") continue;
            }
            commandQueueItem.succeeded();
          }
        } else if (!targetIsType && moveTowardToIsType) {
          // move toward entity to type
          var entity = this.getEntity(target);
          var moveTowardToEntities = this.getEntities(moveTowardTo);
          if (moveTowardToEntities.length > 0) {
            var closestTarget = [Number.MAX_VALUE, -1];
            for (var i = 0; i < moveTowardToEntities.length; i++) {
              // not move if it's same entity
              if (moveTowardToEntities[i].identifier === entity.identifier) {
                continue;
              }
              var distance = entity.getDistance(moveTowardToEntities[i]);
              if (distance < closestTarget[0]) {
                closestTarget = [distance, i];
              }
            }
            // there is valid target
            if (closestTarget[1] !== -1) {
              entity.moveToward(commandQueueItem, moveTowardToEntities[closestTarget[1]]);
            } else {
              commandQueueItem.succeeded();
            }
          } else {
            commandQueueItem.succeeded();
          }
        } else {
          (function () {
            // move toward type to type
            var entities = _this7.getEntities(target);
            var moveTowardToEntities = _this7.getEntities(moveTowardTo);
            if (moveTowardToEntities.length > 0 && entities.length > 0) {
              var _loop6 = function (i) {
                var entity = entities[i];
                var closestTarget = [Number.MAX_VALUE, -1];
                for (var j = 0; j < moveTowardToEntities.length; j++) {
                  // not move if it's same entity
                  if (moveTowardToEntities[i].identifier === entity.identifier) {
                    continue;
                  }
                  var distance = entity.getDistance(moveTowardToEntities[j]);
                  if (distance < closestTarget[0]) {
                    closestTarget = [distance, j];
                  }
                }
                if (closestTarget[1] !== -1) {
                  (function () {
                    var callbackCommand = new CallbackCommand(_this7, function () {}, function () {
                      _this7.moveToward(callbackCommand, moveTowardToEntities[closestTarget[1]].identifier);
                    }, entity.identifier);
                    entity.addCommand(callbackCommand, commandQueueItem.repeat);
                  })();
                }
              };

              for (var i = 0; i < entities.length; i++) {
                _loop6(i);
              }
              commandQueueItem.succeeded();
            }
          })();
        }
      }
    }
  }, {
    key: "positionEquivalence",
    value: function positionEquivalence(lhs, rhs) {
      return lhs[0] === rhs[0] && lhs[1] === rhs[1];
    }

    /**
     * Run a command. If no `commandQueueItem.target` is provided, the command
     * will be applied to all targets.
     *
     * @param commandQueueItem
     * @param command
     * @param commandArgs
     */
  }, {
    key: "execute",
    value: function execute(commandQueueItem, command) {
      for (var _len = arguments.length, commandArgs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        commandArgs[_key - 2] = arguments[_key];
      }

      var _this8 = this;

      var target = commandQueueItem.target;
      if (!this.isType(target)) {
        if (target === undefined) {
          // Apply to all entities.
          var entities = this.levelEntity.entityMap;
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            var _loop7 = function () {
              var value = _step4.value;

              var entity = value[1];
              var callbackCommand = new CallbackCommand(_this8, function () {}, function () {
                _this8.execute.apply(_this8, [callbackCommand, command].concat(commandArgs));
              }, entity.identifier);
              entity.addCommand(callbackCommand, commandQueueItem.repeat);
            };

            for (var _iterator4 = entities[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              _loop7();
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          commandQueueItem.succeeded();
        } else {
          // Apply to the given target.
          var entity = this.getEntity(target);
          entity[command].apply(entity, [commandQueueItem].concat(commandArgs));
        }
      } else {
        // Apply to all targets of the given type.
        var entities = this.getEntities(target);

        var _loop8 = function (i) {
          var callbackCommand = new CallbackCommand(_this8, function () {}, function () {
            _this8.execute.apply(_this8, [callbackCommand, command].concat(commandArgs));
          }, entities[i].identifier);
          entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
        };

        for (var i = 0; i < entities.length; i++) {
          _loop8(i);
        }
        commandQueueItem.succeeded();
      }
    }
  }, {
    key: "moveForward",
    value: function moveForward(commandQueueItem) {
      this.execute(commandQueueItem, 'moveForward');
    }
  }, {
    key: "moveBackward",
    value: function moveBackward(commandQueueItem) {
      this.execute(commandQueueItem, 'moveBackward');
    }
  }, {
    key: "moveDirection",
    value: function moveDirection(commandQueueItem, direction) {
      var player = this.levelModel.player;
      var shouldRide = this.levelModel.shouldRide(direction);
      if (shouldRide) {
        player.handleGetOnRails(direction);
        commandQueueItem.succeeded();
      } else {
        this.execute(commandQueueItem, 'moveDirection', direction);
      }
    }
  }, {
    key: "turn",
    value: function turn(commandQueueItem, direction) {
      this.execute(commandQueueItem, 'turn', direction);
    }
  }, {
    key: "turnRandom",
    value: function turnRandom(commandQueueItem) {
      this.execute(commandQueueItem, 'turnRandom');
    }
  }, {
    key: "flashEntity",
    value: function flashEntity(commandQueueItem) {
      var _this9 = this;

      var target = commandQueueItem.target;
      if (!this.isType(target)) {
        // apply to all entities
        if (target === undefined) {
          var entities = this.levelEntity.entityMap;
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            var _loop9 = function () {
              var value = _step5.value;

              var entity = value[1];
              var callbackCommand = new CallbackCommand(_this9, function () {}, function () {
                _this9.flashEntity(callbackCommand);
              }, entity.identifier);
              entity.addCommand(callbackCommand, commandQueueItem.repeat);
            };

            for (var _iterator5 = entities[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              _loop9();
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                _iterator5["return"]();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          commandQueueItem.succeeded();
        } else {
          var entity = this.getEntity(target);
          var delay = this.levelView.flashSpriteToWhite(entity.sprite);
          this.addCommandRecord("flash", entity.type, commandQueueItem.repeat);
          this.delayBy(delay, function () {
            commandQueueItem.succeeded();
          });
        }
      } else {
        var entities = this.getEntities(target);

        var _loop10 = function (i) {
          var callbackCommand = new CallbackCommand(_this9, function () {}, function () {
            _this9.flashEntity(callbackCommand);
          }, entities[i].identifier);
          entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
        };

        for (var i = 0; i < entities.length; i++) {
          _loop10(i);
        }
        commandQueueItem.succeeded();
      }
    }
  }, {
    key: "explodeEntity",
    value: function explodeEntity(commandQueueItem) {
      var _this10 = this;

      var target = commandQueueItem.target;
      if (!this.isType(target)) {
        // apply to all entities
        if (target === undefined) {
          var entities = this.levelEntity.entityMap;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            var _loop11 = function () {
              var value = _step6.value;

              var entity = value[1];
              var callbackCommand = new CallbackCommand(_this10, function () {}, function () {
                _this10.explodeEntity(callbackCommand);
              }, entity.identifier);
              entity.addCommand(callbackCommand, commandQueueItem.repeat);
            };

            for (var _iterator6 = entities[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              _loop11();
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                _iterator6["return"]();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          commandQueueItem.succeeded();
        } else {
          var _iteratorNormalCompletion7;

          var _didIteratorError7;

          var _iteratorError7;

          var _iterator7, _step7;

          (function () {
            var targetEntity = _this10.getEntity(target);
            _this10.levelView.playExplosionCloudAnimation(targetEntity.position);
            _this10.addCommandRecord("explode", targetEntity.type, commandQueueItem.repeat);
            _this10.levelView.audioPlayer.play("explode");
            var entities = _this10.levelEntity.entityMap;
            _iteratorNormalCompletion7 = true;
            _didIteratorError7 = false;
            _iteratorError7 = undefined;

            try {
              for (_iterator7 = entities[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var value = _step7.value;

                var entity = value[1];
                for (var i = -1; i <= 1; i++) {
                  for (var j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) {
                      continue;
                    }
                    var position = [targetEntity.position[0] + i, targetEntity.position[1] + j];
                    _this10.destroyBlockWithoutPlayerInteraction(position);
                    if (entity.position[0] === targetEntity.position[0] + i && entity.position[1] === targetEntity.position[1] + j) {
                      entity.blowUp(commandQueueItem, targetEntity.position);
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError7 = true;
              _iteratorError7 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                  _iterator7["return"]();
                }
              } finally {
                if (_didIteratorError7) {
                  throw _iteratorError7;
                }
              }
            }

            var callbackCommand = new CallbackCommand(_this10, function () {}, function () {
              _this10.destroyEntity(callbackCommand, targetEntity.identifier);
            }, targetEntity.identifier);
            targetEntity.queue.startPushHighPriorityCommands();
            targetEntity.addCommand(callbackCommand, commandQueueItem.repeat);
            targetEntity.queue.endPushHighPriorityCommands();
          })();
        }
        commandQueueItem.succeeded();
        this.updateFowPlane();
        this.updateShadingPlane();
      } else {
        var entities = this.getEntities(target);

        var _loop12 = function (i) {
          var callbackCommand = new CallbackCommand(_this10, function () {}, function () {
            _this10.explodeEntity(callbackCommand);
          }, entities[i].identifier);
          entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
        };

        for (var i = 0; i < entities.length; i++) {
          _loop12(i);
        }
        commandQueueItem.succeeded();
      }
    }
  }, {
    key: "wait",
    value: function wait(commandQueueItem, time) {
      var _this11 = this;

      var target = commandQueueItem.target;
      if (!this.isType(target)) {
        var entity = this.getEntity(target);
        this.addCommandRecord("wait", entity.type, commandQueueItem.repeat);
        setTimeout(function () {
          commandQueueItem.succeeded();
        }, time * 1000 / this.tweenTimeScale);
      } else {
        var entities = this.getEntities(target);

        var _loop13 = function (i) {
          var callbackCommand = new CallbackCommand(_this11, function () {}, function () {
            _this11.wait(callbackCommand, time);
          }, entities[i].identifier);
          entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
        };

        for (var i = 0; i < entities.length; i++) {
          _loop13(i);
        }
        commandQueueItem.succeeded();
      }
    }
  }, {
    key: "spawnEntity",
    value: function spawnEntity(commandQueueItem, type, spawnDirection) {
      this.addCommandRecord("spawn", type, commandQueueItem.repeat);
      var spawnedEntity = this.levelEntity.spawnEntity(type, spawnDirection);
      if (spawnedEntity !== null) {
        this.events.forEach(function (e) {
          return e({ eventType: EventType.WhenSpawned, targetType: type, targetIdentifier: spawnedEntity.identifier });
        });
      }
      commandQueueItem.succeeded();
    }
  }, {
    key: "spawnEntityAt",
    value: function spawnEntityAt(commandQueueItem, type, x, y, facing) {
      var spawnedEntity = this.levelEntity.spawnEntityAt(type, x, y, facing);
      if (spawnedEntity !== null) {
        this.events.forEach(function (e) {
          return e({ eventType: EventType.WhenSpawned, targetType: type, targetIdentifier: spawnedEntity.identifier });
        });
      }
      commandQueueItem.succeeded();
    }
  }, {
    key: "destroyEntity",
    value: function destroyEntity(commandQueueItem, target) {
      var _this12 = this;

      if (!this.isType(target)) {
        // apply to all entities
        if (target === undefined) {
          var entities = this.levelEntity.entityMap;
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            var _loop14 = function () {
              var value = _step8.value;

              var entity = value[1];
              var callbackCommand = new CallbackCommand(_this12, function () {}, function () {
                _this12.destroyEntity(callbackCommand, entity.identifier);
              }, entity.identifier);
              entity.addCommand(callbackCommand, commandQueueItem.repeat);
            };

            for (var _iterator8 = entities[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              _loop14();
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                _iterator8["return"]();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }

          commandQueueItem.succeeded();
        } else {
          this.addCommandRecord("destroy", this.type, commandQueueItem.repeat);
          var entity = this.getEntity(target);
          if (entity !== undefined) {
            entity.healthPoint = 1;
            entity.takeDamage(commandQueueItem);
          } else {
            commandQueueItem.succeeded();
          }
        }
      } else {
        var entities = this.getEntities(target);

        var _loop15 = function (i) {
          var entity = entities[i];
          var callbackCommand = new CallbackCommand(_this12, function () {}, function () {
            _this12.destroyEntity(callbackCommand, entity.identifier);
          }, entity.identifier);
          entity.addCommand(callbackCommand, commandQueueItem.repeat);
        };

        for (var i = 0; i < entities.length; i++) {
          _loop15(i);
        }
        commandQueueItem.succeeded();
      }
    }
  }, {
    key: "drop",
    value: function drop(commandQueueItem, itemType) {
      var _this13 = this;

      var target = commandQueueItem.target;
      if (!this.isType(target)) {
        // apply to all entities
        if (target === undefined) {
          var entities = this.levelEntity.entityMap;
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            var _loop16 = function () {
              var value = _step9.value;

              var entity = value[1];
              var callbackCommand = new CallbackCommand(_this13, function () {}, function () {
                _this13.drop(callbackCommand, itemType);
              }, entity.identifier);
              entity.addCommand(callbackCommand, commandQueueItem.repeat);
            };

            for (var _iterator9 = entities[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              _loop16();
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                _iterator9["return"]();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }

          commandQueueItem.succeeded();
        } else {
          var entity = this.getEntity(target);
          entity.drop(commandQueueItem, itemType);
        }
      } else {
        var entities = this.getEntities(target);

        var _loop17 = function (i) {
          var callbackCommand = new CallbackCommand(_this13, function () {}, function () {
            _this13.drop(callbackCommand, itemType);
          }, entities[i].identifier);
          entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
        };

        for (var i = 0; i < entities.length; i++) {
          _loop17(i);
        }
        commandQueueItem.succeeded();
      }
    }
  }, {
    key: "attack",
    value: function attack(commandQueueItem) {
      var _this14 = this;

      var target = commandQueueItem.target;
      if (!this.isType(target)) {
        // apply to all entities
        if (target === undefined) {
          var entities = this.levelEntity.entityMap;
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            var _loop18 = function () {
              var value = _step10.value;

              var entity = value[1];
              var callbackCommand = new CallbackCommand(_this14, function () {}, function () {
                _this14.attack(callbackCommand);
              }, entity.identifier);
              entity.addCommand(callbackCommand, commandQueueItem.repeat);
            };

            for (var _iterator10 = entities[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              _loop18();
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10["return"]) {
                _iterator10["return"]();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }

          commandQueueItem.succeeded();
        } else {
          var entity = this.getEntity(target);
          if (entity.identifier === 'Player') {
            this.codeOrgAPI.destroyBlock(function () {}, entity.identifier);
            commandQueueItem.succeeded();
          } else {
            entity.attack(commandQueueItem);
          }
        }
      } else {
        var entities = this.getEntities(target);

        var _loop19 = function (i) {
          var callbackCommand = new CallbackCommand(_this14, function () {}, function () {
            _this14.attack(callbackCommand);
          }, entities[i].identifier);
          entities[i].addCommand(callbackCommand, commandQueueItem.repeat);
        };

        for (var i = 0; i < entities.length; i++) {
          _loop19(i);
        }
        commandQueueItem.succeeded();
      }
    }
  }, {
    key: "playSound",
    value: function playSound(commandQueueItem, sound) {
      this.addCommandRecord("playSound", undefined, commandQueueItem.repeat);
      this.levelView.audioPlayer.play(sound);
      commandQueueItem.succeeded();
    }
  }, {
    key: "use",
    value: function use(commandQueueItem) {
      var _this15 = this;

      var player = this.levelModel.player;
      var frontPosition = this.levelModel.getMoveForwardPosition(player);
      var frontEntity = this.levelEntity.getEntityAt(frontPosition);
      var frontBlock = this.levelModel.actionPlane.getBlockAt(frontPosition);

      var isFrontBlockDoor = frontBlock === undefined ? false : frontBlock.blockType === "door";
      if (frontEntity !== null && frontEntity !== this.agent) {
        // push use command to execute general use behavior of the entity before executing the event
        this.levelView.setSelectionIndicatorPosition(frontPosition[0], frontPosition[1]);
        this.levelView.onAnimationEnd(this.levelView.playPlayerAnimation("punch", player.position, player.facing, false), function () {

          frontEntity.queue.startPushHighPriorityCommands();
          var useCommand = new CallbackCommand(_this15, function () {}, function () {
            frontEntity.use(useCommand, player);
          }, frontEntity.identifier);
          var isFriendlyEntity = _this15.levelEntity.isFriendlyEntity(frontEntity.type);
          // push frienly entity 1 block
          if (!isFriendlyEntity) {
            (function () {
              var pushDirection = player.facing;
              var moveAwayCommand = new CallbackCommand(_this15, function () {}, function () {
                frontEntity.pushBack(moveAwayCommand, pushDirection, 150);
              }, frontEntity.identifier);
              frontEntity.addCommand(moveAwayCommand);
            })();
          }
          frontEntity.addCommand(useCommand);
          frontEntity.queue.endPushHighPriorityCommands();
          _this15.levelView.playPlayerAnimation("idle", player.position, player.facing, false);
          if (_this15.getIsDirectPlayerControl()) {
            _this15.delayPlayerMoveBy(0, 0, function () {
              commandQueueItem.succeeded();
            });
          } else {
            commandQueueItem.waitForOtherQueue = true;
          }
          setTimeout(function () {
            _this15.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
          }, 0);
        });
      } else if (isFrontBlockDoor) {
        this.levelView.setSelectionIndicatorPosition(frontPosition[0], frontPosition[1]);
        this.levelView.onAnimationEnd(this.levelView.playPlayerAnimation("punch", player.position, player.facing, false), function () {
          _this15.audioPlayer.play("doorOpen");
          // if it's not walable, then open otherwise, close
          var canOpen = !frontBlock.isWalkable;
          _this15.levelView.playDoorAnimation(frontPosition, canOpen, function () {
            frontBlock.isWalkable = !frontBlock.isWalkable;
            _this15.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);
            _this15.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
            commandQueueItem.succeeded();
          });
        });
      } else if (frontBlock && frontBlock.isRail) {
        this.levelView.playTrack(frontPosition, player.facing, true, player, null);
        commandQueueItem.succeeded();
      } else {
        this.levelView.playPunchDestroyAirAnimation(player.position, player.facing, this.levelModel.getMoveForwardPosition(), function () {
          _this15.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
          _this15.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);
          _this15.delayPlayerMoveBy(0, 0, function () {
            commandQueueItem.succeeded();
          });
        });
      }
    }
  }, {
    key: "destroyBlock",
    value: function destroyBlock(commandQueueItem) {
      var _this16 = this;

      var player = this.getEntity(commandQueueItem.target);
      // if there is a destroyable block in front of the player
      if (this.levelModel.canDestroyBlockForward(player)) {
        var block = this.levelModel.actionPlane.getBlockAt(this.levelModel.getMoveForwardPosition(player));

        if (block !== null) {
          var destroyPosition = this.levelModel.getMoveForwardPosition(player);
          var blockType = block.blockType;

          if (block.isDestroyable) {
            switch (blockType) {
              case "logAcacia":
              case "treeAcacia":
                blockType = "planksAcacia";
                break;
              case "logBirch":
              case "treeBirch":
                blockType = "planksBirch";
                break;
              case "logJungle":
              case "treeJungle":
                blockType = "planksJungle";
                break;
              case "logOak":
              case "treeOak":
                blockType = "planksOak";
                break;
              case "logSpruce":
              case "treeSpruce":
                blockType = "planksSpruce";
                break;
            }
            this.levelView.playDestroyBlockAnimation(player.position, player.facing, destroyPosition, blockType, player, function () {
              commandQueueItem.succeeded();
            });
          } else if (block.isUsable) {
            switch (blockType) {
              case "sheep":
                // TODO: What to do with already sheered sheep?
                this.levelView.playShearSheepAnimation(player.position, player.facing, destroyPosition, blockType, function () {
                  commandQueueItem.succeeded();
                });

                break;
              default:
                commandQueueItem.succeeded();
            }
          } else {
            commandQueueItem.succeeded();
          }
        }
        // if there is a entity in front of the player
      } else {
          this.levelView.playPunchDestroyAirAnimation(player.position, player.facing, this.levelModel.getMoveForwardPosition(player), function () {
            _this16.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
            _this16.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock, player);
            _this16.delayPlayerMoveBy(0, 0, function () {
              commandQueueItem.succeeded();
            });
          }, player);
        }
    }
  }, {
    key: "destroyBlockWithoutPlayerInteraction",
    value: function destroyBlockWithoutPlayerInteraction(position) {
      if (!this.levelModel.inBounds(position)) {
        return;
      }
      var block = this.levelModel.actionPlane.getBlockAt(position);

      if (block !== null && block !== undefined) {
        var destroyPosition = position;
        var blockType = block.blockType;

        if (block.isDestroyable) {
          switch (blockType) {
            case "logAcacia":
            case "treeAcacia":
              blockType = "planksAcacia";
              break;
            case "logBirch":
            case "treeBirch":
              blockType = "planksBirch";
              break;
            case "logJungle":
            case "treeJungle":
              blockType = "planksJungle";
              break;
            case "logOak":
            case "treeOak":
              blockType = "planksOak";
              break;
            case "logSpruce":
            case "treeSpruce":
            case "logSpruceSnowy":
            case "treeSpruceSnowy":
              blockType = "planksSpruce";
              break;
          }
          this.levelView.destroyBlockWithoutPlayerInteraction(destroyPosition);
          this.levelView.playExplosionAnimation(this.levelModel.player.position, this.levelModel.player.facing, position, blockType, function () {}, false);
          this.levelView.createMiniBlock(destroyPosition[0], destroyPosition[1], blockType);
          this.updateFowPlane();
          this.updateShadingPlane();
        } else if (block.isUsable) {
          switch (blockType) {
            case "sheep":
              // TODO: What to do with already sheered sheep?
              this.levelView.playShearAnimation(this.levelModel.player.position, this.levelModel.player.facing, position, blockType, function () {});
              break;
          }
        }
      }

      // clear the block in level model (block info in 2d grid)
      this.levelModel.destroyBlock(position);
    }
  }, {
    key: "checkTntAnimation",
    value: function checkTntAnimation() {
      return this.specialLevelType === 'freeplay';
    }
  }, {
    key: "checkMinecartLevelEndAnimation",
    value: function checkMinecartLevelEndAnimation() {
      return this.specialLevelType === 'minecart';
    }
  }, {
    key: "checkHouseBuiltEndAnimation",
    value: function checkHouseBuiltEndAnimation() {
      return this.specialLevelType === 'houseBuild';
    }
  }, {
    key: "checkAgentSpawn",
    value: function checkAgentSpawn() {
      return this.specialLevelType === 'agentSpawn';
    }
  }, {
    key: "placeBlock",
    value: function placeBlock(commandQueueItem, blockType) {
      var _this17 = this;

      var player = this.getEntity(commandQueueItem.target);
      var position = player.position;
      var blockAtPosition = this.levelModel.actionPlane.getBlockAt(position);
      var blockTypeAtPosition = blockAtPosition.blockType;

      if (this.levelModel.canPlaceBlock(player, blockAtPosition)) {
        if (blockTypeAtPosition !== "") {
          this.levelModel.destroyBlock(position);
        }

        if (blockType !== "cropWheat" || this.levelModel.groundPlane.getBlockAt(player.position).blockType === "farmlandWet") {
          this.levelModel.player.updateHidingBlock(player.position);
          if (this.checkMinecartLevelEndAnimation() && blockType === "rail") {
            // Special 'minecart' level places a mix of regular and powered tracks, depending on location.
            if (player.position[1] < 7) {
              blockType = "railsUnpoweredVertical";
            } else {
              blockType = "rails";
            }
          }
          this.levelView.playPlaceBlockAnimation(player.position, player.facing, blockType, blockTypeAtPosition, player, function () {
            _this17.levelModel.placeBlock(blockType, player);
            _this17.updateFowPlane();
            _this17.updateShadingPlane();
            _this17.delayBy(200, function () {
              _this17.levelView.playIdleAnimation(player.position, player.facing, false, player);
            });
            _this17.delayPlayerMoveBy(200, 400, function () {
              commandQueueItem.succeeded();
            });
          });
        } else {
          (function () {
            var signalBinding = _this17.levelView.playPlayerAnimation("jumpUp", player.position, player.facing, false, player).onLoop.add(function () {
              _this17.levelView.playIdleAnimation(player.position, player.facing, false, player);
              signalBinding.detach();
              _this17.delayBy(800, function () {
                return commandQueueItem.succeeded();
              });
            }, _this17);
          })();
        }
      } else {
        commandQueueItem.succeeded();
      }
    }
  }, {
    key: "setPlayerActionDelayByQueueLength",
    value: function setPlayerActionDelayByQueueLength() {
      if (!this.levelModel.usePlayer) {
        return;
      }

      var START_SPEED_UP = 10;
      var END_SPEED_UP = 20;

      var queueLength = this.levelModel.player.queue.getLength();
      var speedUpRangeMax = END_SPEED_UP - START_SPEED_UP;
      var speedUpAmount = Math.min(Math.max(queueLength - START_SPEED_UP, 0), speedUpRangeMax);

      this.playerDelayFactor = 1 - speedUpAmount / speedUpRangeMax;
    }
  }, {
    key: "delayBy",
    value: function delayBy(ms, completionHandler) {
      var timer = this.game.time.create(true);
      timer.add(this.originalMsToScaled(ms), completionHandler, this);
      timer.start();
      this.resettableTimers.push(timer);
    }
  }, {
    key: "delayPlayerMoveBy",
    value: function delayPlayerMoveBy(minMs, maxMs, completionHandler) {
      this.delayBy(Math.max(minMs, maxMs * this.playerDelayFactor), completionHandler);
    }
  }, {
    key: "originalMsToScaled",
    value: function originalMsToScaled(ms) {
      var realMs = ms / this.assumedSlowMotion;
      return realMs * this.game.time.slowMotion;
    }
  }, {
    key: "originalFpsToScaled",
    value: function originalFpsToScaled(fps) {
      var realFps = fps * this.assumedSlowMotion;
      return realFps / this.game.time.slowMotion;
    }
  }, {
    key: "placeBlockForward",
    value: function placeBlockForward(commandQueueItem, blockType) {
      this.placeBlockDirection(commandQueueItem, blockType, 0);
    }
  }, {
    key: "placeBlockDirection",
    value: function placeBlockDirection(commandQueueItem, blockType, direction) {
      var _this18 = this;

      var player = this.getEntity(commandQueueItem.target);
      var position = undefined,
          placementPlane = undefined,
          soundEffect = function soundEffect() {};

      if (!this.levelModel.canPlaceBlockDirection(blockType, player, direction)) {
        this.levelView.playPunchAirAnimation(player.position, player.facing, player.position, function () {
          _this18.levelView.playIdleAnimation(player.position, player.facing, false, player);
          commandQueueItem.succeeded();
        }, player);
        return;
      }

      position = this.levelModel.getMoveDirectionPosition(player, direction);
      placementPlane = this.levelModel.getPlaneToPlaceOn(position, player, blockType);
      if (this.levelModel.isBlockOfTypeOnPlane(position, "lava", placementPlane)) {
        soundEffect = function () {
          return _this18.levelView.audioPlayer.play("fizz");
        };
      }

      this.levelView.playPlaceBlockInFrontAnimation(player, player.position, player.facing, position, function () {
        _this18.levelModel.placeBlockDirection(blockType, placementPlane, player, direction);
        _this18.levelView.refreshGroundGroup();

        _this18.updateFowPlane();
        _this18.updateShadingPlane();
        soundEffect();

        _this18.delayBy(200, function () {
          _this18.levelView.playIdleAnimation(player.position, player.facing, false, player);
        });
        _this18.delayPlayerMoveBy(200, 400, function () {
          commandQueueItem.succeeded();
        });
      });
    }
  }, {
    key: "checkSolution",
    value: function checkSolution() {
      var _this19 = this;

      if (!this.attemptRunning || this.resultReported) {
        return;
      }
      // check the final state to see if its solved
      if (this.levelModel.isSolved()) {
        var houseBottomRight;
        var inFrontOfDoor;
        var bedPosition;
        var doorPosition;
        var tnt;
        var wasOnBlock;

        (function () {
          var player = _this19.levelModel.player;
          if (_this19.checkHouseBuiltEndAnimation()) {
            _this19.resultReported = true;
            houseBottomRight = _this19.levelModel.getHouseBottomRight();
            inFrontOfDoor = [houseBottomRight[0] - 1, houseBottomRight[1] + 2];
            bedPosition = [houseBottomRight[0], houseBottomRight[1]];
            doorPosition = [houseBottomRight[0] - 1, houseBottomRight[1] + 1];

            _this19.levelModel.moveTo(inFrontOfDoor);
            _this19.levelView.playSuccessHouseBuiltAnimation(player.position, player.facing, player.isOnBlock, _this19.levelModel.houseGroundToFloorBlocks(houseBottomRight), [bedPosition, doorPosition], function () {
              _this19.endLevel(true);
            }, function () {
              _this19.levelModel.destroyBlock(bedPosition);
              _this19.levelModel.destroyBlock(doorPosition);
              _this19.updateFowPlane();
              _this19.updateShadingPlane();
            });
          } else if (_this19.checkMinecartLevelEndAnimation()) {
            _this19.resultReported = true;
            _this19.levelView.playMinecartAnimation(player.isOnBlock, function () {
              _this19.handleEndState(true);
            });
          } else if (_this19.checkAgentSpawn()) {
            _this19.resultReported = true;

            var levelEndAnimation = _this19.levelView.playLevelEndAnimation(player.position, player.facing, player.isOnBlock);

            levelEndAnimation.onComplete.add(function () {
              _this19.levelModel.spawnAgent(null, [3, 4], 2); // This will spawn the Agent at [3, 4], facing South.
              _this19.levelView.agent = _this19.agent;
              _this19.levelView.resetEntity(_this19.agent);

              _this19.updateFowPlane();
              _this19.updateShadingPlane();
              _this19.delayBy(200, function () {
                _this19.endLevel(true);
              });
            });
          } else if (_this19.checkTntAnimation()) {
            _this19.resultReported = true;
            _this19.levelView.scaleShowWholeWorld(function () {});
            tnt = _this19.levelModel.getTnt();
            wasOnBlock = player.isOnBlock;

            _this19.levelView.playDestroyTntAnimation(player.position, player.facing, player.isOnBlock, _this19.levelModel.getTnt(), _this19.levelModel.shadingPlane, function () {
              for (var i in tnt) {
                if (tnt[i].x === _this19.levelModel.player.position.x && tnt[i].y === _this19.levelModel.player.position.y) {
                  _this19.levelModel.player.isOnBlock = false;
                }
                var surroundingBlocks = _this19.levelModel.getAllBorderingPositionNotOfType(tnt[i], "tnt");
                _this19.levelModel.destroyBlock(tnt[i]);
                for (var b = 1; b < surroundingBlocks.length; ++b) {
                  if (surroundingBlocks[b][0]) {
                    _this19.destroyBlockWithoutPlayerInteraction(surroundingBlocks[b][1]);
                  }
                }
              }
              if (!player.isOnBlock && wasOnBlock) {
                _this19.levelView.playPlayerJumpDownVerticalAnimation(player.facing, player.position);
              }
              _this19.updateFowPlane();
              _this19.updateShadingPlane();
              _this19.delayBy(200, function () {
                _this19.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock, function () {
                  _this19.endLevel(true);
                });
              });
            });
          } else {
            _this19.endLevel(true);
          }
        })();
      } else if (this.levelModel.isFailed() || !this.getIsDirectPlayerControl()) {
        // For "Events" levels, check the final state to see if it's failed.
        // Procedural levels only call `checkSolution` after all code has run, so
        // fail if we didn't pass the success condition.
        this.endLevel(false);
      }
    }
  }, {
    key: "endLevel",
    value: function endLevel(result) {
      var _this20 = this;

      if (!this.levelModel.usePlayer) {
        if (result) {
          this.levelView.audioPlayer.play("success");
        } else {
          this.levelView.audioPlayer.play("failure");
        }
        this.resultReported = true;
        this.handleEndState(result);
        return;
      }
      if (result) {
        (function () {
          var player = _this20.levelModel.player;
          var callbackCommand = new CallbackCommand(_this20, function () {}, function () {
            _this20.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock, function () {
              _this20.handleEndState(true);
            });
          }, player.identifier);
          player.queue.startPushHighPriorityCommands();
          player.addCommand(callbackCommand, _this20.isRepeat);
          player.queue.endPushHighPriorityCommands();
        })();
      } else {
        (function () {
          var player = _this20.levelModel.player;
          var callbackCommand = new CallbackCommand(_this20, function () {}, function () {
            _this20.destroyEntity(callbackCommand, player.identifier);
          }, player.identifier);
          player.queue.startPushHighPriorityCommands();
          player.addCommand(callbackCommand, _this20.isRepeat);
          player.queue.endPushHighPriorityCommands();
        })();
      }
    }
  }, {
    key: "addScore",
    value: function addScore(commandQueueItem, score) {
      this.addCommandRecord("addScore", undefined, commandQueueItem.repeat);
      if (this.useScore) {
        this.score += score;
        this.updateScore();
      }
      commandQueueItem.succeeded();
    }
  }, {
    key: "updateScore",
    value: function updateScore() {
      if (this.onScoreUpdate) {
        this.onScoreUpdate(this.score);
      }
    }
  }, {
    key: "isPathAhead",
    value: function isPathAhead(blockType) {
      return this.levelModel.isForwardBlockOfType(blockType);
    }
  }, {
    key: "addCommand",
    value: function addCommand(commandQueueItem) {
      // there is a target, push command to the specific target
      if (commandQueueItem.target !== undefined) {
        var target = this.getEntity(commandQueueItem.target);
        target.addCommand(commandQueueItem, this.isRepeat);
      } else {
        this.queue.addCommand(commandQueueItem, this.isRepeat);
        this.queue.begin();
      }
    }
  }, {
    key: "addGlobalCommand",
    value: function addGlobalCommand(commandQueueItem) {
      var entity = this.levelEntity.entityMap.get(commandQueueItem.target);
      if (entity !== undefined) {
        entity.addCommand(commandQueueItem, this.isRepeat);
      } else {
        this.queue.addCommand(commandQueueItem, this.isRepeat);
        this.queue.begin();
      }
    }
  }, {
    key: "startDay",
    value: function startDay(commandQueueItem) {
      var _this21 = this;

      if (this.levelModel.isDaytime) {
        if (commandQueueItem !== undefined && commandQueueItem !== null) {
          commandQueueItem.succeeded();
        }
        if (this.DEBUG) {
          this.game.debug.text("Impossible to start day since it's already day time\n");
        }
      } else {
        if (this.onDayCallback !== undefined) {
          this.onDayCallback();
        }
        this.levelModel.isDaytime = true;
        this.levelModel.clearFow();
        this.levelView.updateFowGroup(this.levelModel.fowPlane);
        this.events.forEach(function (e) {
          return e({ eventType: EventType.WhenDayGlobal });
        });
        var entities = this.levelEntity.entityMap;
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          var _loop20 = function () {
            var value = _step11.value;

            var entity = value[1];
            _this21.events.forEach(function (e) {
              return e({ eventType: EventType.WhenDay, targetIdentifier: entity.identifier, targetType: entity.type });
            });
          };

          for (var _iterator11 = entities[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            _loop20();
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11["return"]) {
              _iterator11["return"]();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }

        var zombieList = this.levelEntity.getEntitiesOfType('zombie');
        for (var i = 0; i < zombieList.length; i++) {
          zombieList[i].setBurn(true);
        }
        if (commandQueueItem !== undefined && commandQueueItem !== null) {
          commandQueueItem.succeeded();
        }
      }
    }
  }, {
    key: "startNight",
    value: function startNight(commandQueueItem) {
      var _this22 = this;

      if (!this.levelModel.isDaytime) {
        if (commandQueueItem !== undefined && commandQueueItem !== null) {
          commandQueueItem.succeeded();
        }
        if (this.DEBUG) {
          this.game.debug.text("Impossible to start night since it's already night time\n");
        }
      } else {
        if (this.onNightCallback !== undefined) {
          this.onNightCallback();
        }
        this.levelModel.isDaytime = false;
        this.levelModel.computeFowPlane();
        this.levelView.updateFowGroup(this.levelModel.fowPlane);
        this.events.forEach(function (e) {
          return e({ eventType: EventType.WhenNightGlobal });
        });
        var entities = this.levelEntity.entityMap;
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          var _loop21 = function () {
            var value = _step12.value;

            var entity = value[1];
            _this22.events.forEach(function (e) {
              return e({ eventType: EventType.WhenNight, targetIdentifier: entity.identifier, targetType: entity.type });
            });
          };

          for (var _iterator12 = entities[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            _loop21();
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12["return"]) {
              _iterator12["return"]();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }

        var zombieList = this.levelEntity.getEntitiesOfType('zombie');
        for (var i = 0; i < zombieList.length; i++) {
          zombieList[i].setBurn(false);
        }
        if (commandQueueItem !== undefined && commandQueueItem !== null) {
          commandQueueItem.succeeded();
        }
      }
    }
  }, {
    key: "initiateDayNightCycle",
    value: function initiateDayNightCycle(firstDelay, delayInSecond, startTime) {
      var _this23 = this;

      if (startTime === "day" || startTime === "Day") {
        this.timeouts.push(setTimeout(function () {
          _this23.startDay(null);
          _this23.setDayNightCycle(delayInSecond, "night");
        }, firstDelay * 1000));
      } else if (startTime === "night" || startTime === "Night") {
        this.timeouts.push(setTimeout(function () {
          _this23.startNight(null);
          _this23.setDayNightCycle(delayInSecond, "day");
        }, firstDelay * 1000));
      }
    }
  }, {
    key: "setDayNightCycle",
    value: function setDayNightCycle(delayInSecond, startTime) {
      var _this24 = this;

      if (!this.dayNightCycle) {
        return;
      }
      if (startTime === "day" || startTime === "Day") {
        this.timeouts.push(setTimeout(function () {
          if (!_this24.dayNightCycle) {
            return;
          }
          _this24.startDay(null);
          _this24.setDayNightCycle(delayInSecond, "night");
        }, delayInSecond * 1000));
      } else if (startTime === "night" || startTime === "Night") {
        this.timeouts.push(setTimeout(function () {
          if (!_this24.dayNightCycle) {
            return;
          }
          _this24.startNight(null);
          _this24.setDayNightCycle(delayInSecond, "day");
        }, delayInSecond * 1000));
      }
    }
  }, {
    key: "arrowDown",
    value: function arrowDown(direction) {
      if (!this.levelModel.usePlayer) {
        return;
      }
      this.player.movementState = direction;
      this.player.updateMovement();
    }
  }, {
    key: "arrowUp",
    value: function arrowUp(direction) {
      if (!this.levelModel.usePlayer) {
        return;
      }
      if (this.player.movementState === direction) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    }
  }, {
    key: "clickDown",
    value: function clickDown() {
      if (!this.levelModel.usePlayer) {
        return;
      }
      this.player.movementState = -2;
      this.player.updateMovement();
    }
  }, {
    key: "clickUp",
    value: function clickUp() {
      if (!this.levelModel.usePlayer) {
        return;
      }
      if (this.player.movementState === -2) {
        this.player.movementState = -1;
      }
      this.player.updateMovement();
    }
  }, {
    key: "updateFowPlane",
    value: function updateFowPlane() {
      this.levelModel.computeFowPlane();
      this.levelView.updateFowGroup(this.levelModel.fowPlane);
    }
  }, {
    key: "updateShadingPlane",
    value: function updateShadingPlane() {
      this.levelModel.computeShadingPlane();
      this.levelView.updateShadingGroup(this.levelModel.shadingPlane);
    }
  }]);

  return GameController;
})();

window.GameController = GameController;

module.exports = GameController;

},{"./API/CodeOrgAPI.js":1,"./CommandQueue/CallbackCommand.js":3,"./CommandQueue/CommandQueue.js":4,"./Event/EventType.js":25,"./LevelMVC/AssetLoader.js":28,"./LevelMVC/FacingDirection.js":29,"./LevelMVC/LevelEntity.js":31,"./LevelMVC/LevelModel.js":32,"./LevelMVC/LevelView.js":34}],27:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Position = require("./Position");

/**
 * Group an array of positions into sets of connected positions. Default
 * definition of "connected" is "orthogonally adjacent", but that can be
 * overridden.
 */
module.exports = (function () {
  /**
   * @param {Position[]} positions
   * @param {Function} [comparisonFunction = Position.isAdjacent]
   */

  function AdjacencySet(positions, comparisonFunction) {
    var _this = this;

    _classCallCheck(this, AdjacencySet);

    this.comparisonFunction = comparisonFunction || Position.isAdjacent;
    this.sets = [];
    if (positions) {
      positions.forEach(function (position) {
        _this.add(position);
      });
    }
  }

  /**
   * Flatten the set of sets down to a single array of Positions
   *
   * @return {Position[]}
   */

  _createClass(AdjacencySet, [{
    key: "flattenSets",
    value: function flattenSets() {
      return this.sets.reduce(function (acc, cur) {
        return acc.concat(cur);
      }, []);
    }

    /**
     * Add a position to our adjacency sets if it doesn't already exist, updating
     * existing sets as necessary
     *
     * NOTE that this operation is O(N), not the O(1) that you would expect from
     * a full disjoint-set implementation.
     *
     * @param {Position} position
     * @return {boolean} whether or not the specified position was newly added
     */
  }, {
    key: "add",
    value: function add(position) {
      var _this2 = this;

      if (this.find(position)) {
        return false;
      }

      var adjacent = this.sets.filter(function (set) {
        return set.some(function (other) {
          return _this2.comparisonFunction(position, other);
        });
      });
      if (adjacent.length === 1) {
        // if this position is adjacent to exactly one set, simply add it to the
        // set
        adjacent[0].push(position);
      } else if (adjacent.length > 1) {
        (function () {
          // if this position unites several new sets into one mutual adjacency,
          // combine them all and add this position to the new set
          var newSet = [];
          adjacent.forEach(function (s) {
            _this2.sets.splice(_this2.sets.indexOf(s), 1);
            newSet.push.apply(newSet, _toConsumableArray(s));
          });
          newSet.push(position);
          _this2.sets.push(newSet);
        })();
      } else {
        // if this position is all by itself, let it be the initial entry in a new
        // set
        this.sets.push([position]);
      }

      return true;
    }

    /**
     * Find the set containing a specified position, if it exists
     *
     * @return {(Postion[]|undefined)}
     */
  }, {
    key: "find",
    value: function find(position) {
      return this.sets.find(function (set) {
        return set.some(function (other) {
          return Position.equals(position, other);
        });
      });
    }

    /**
     * Remove a position from our adjacency sets if it exists, updating existing
     * sets as necessary.
     *
     * NOTE that this operation is O(N), not the O(1) that you would expect from
     * a full disjoint-set implementation.
     *
     * @param {Position} position
     * @return {boolean} whether or not the specified position existed in the sets
     */
  }, {
    key: "remove",
    value: function remove(position) {
      var containingSet = this.find(position);

      if (!containingSet) {
        return false;
      }

      this.sets.splice(this.sets.indexOf(containingSet), 1);
      var newSet = containingSet.filter(function (other) {
        return !Position.equals(position, other);
      });
      if (newSet.length) {
        var _sets;

        var newSets = new AdjacencySet(newSet, this.comparisonFunction).sets;
        (_sets = this.sets).push.apply(_sets, _toConsumableArray(newSets));
      }
      return true;
    }
  }]);

  return AdjacencySet;
})();

},{"./Position":35}],28:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function AssetLoader(controller) {
    _classCallCheck(this, AssetLoader);

    this.controller = controller;
    this.audioPlayer = controller.audioPlayer;
    this.game = controller.game;
    this.assetRoot = controller.assetRoot;

    this.assets = {
      entityShadow: {
        type: 'image',
        path: this.assetRoot + 'images/Character_Shadow.png'
      },
      selectionIndicator: {
        type: 'image',
        path: this.assetRoot + 'images/Selection_Indicator.png'
      },
      tallGrass: {
        type: 'image',
        path: this.assetRoot + 'images/TallGrass.png'
      },
      finishOverlay: {
        type: 'image',
        path: this.assetRoot + 'images/WhiteRect.png'
      },
      bed: {
        type: 'image',
        path: this.assetRoot + 'images/Bed.png'
      },
      playerSteve: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Steve1013.png',
        jsonPath: this.assetRoot + 'images/Steve1013.json'
      },
      playerAlex: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Alex1013.png',
        jsonPath: this.assetRoot + 'images/Alex1013.json'
      },
      playerSteveEvents: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Steve_2016.png',
        jsonPath: this.assetRoot + 'images/Steve_2016.json'
      },
      playerAlexEvents: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/DevAlex.png',
        jsonPath: this.assetRoot + 'images/DevAlex.json'
      },
      playerAgent: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Agent.png',
        jsonPath: this.assetRoot + 'images/Agent.json'
      },
      AO: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/AO.png',
        jsonPath: this.assetRoot + 'images/AO.json'
      },
      LavaGlow: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/LavaGlow.png',
        jsonPath: this.assetRoot + 'images/LavaGlow.json'
      },
      WaterAO: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/WaterAO.png',
        jsonPath: this.assetRoot + 'images/WaterAO.json'
      },
      blockShadows: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Block_Shadows.png',
        jsonPath: this.assetRoot + 'images/Block_Shadows.json'
      },
      undergroundFow: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/UndergroundFoW.png',
        jsonPath: this.assetRoot + 'images/UndergroundFoW.json'
      },
      blocks: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Blocks.png',
        jsonPath: this.assetRoot + 'images/Blocks.json'
      },
      leavesAcacia: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Acacia_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Acacia_Decay.json'
      },
      leavesBirch: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Birch_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Birch_Decay.json'
      },
      leavesJungle: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Jungle_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Jungle_Decay.json'
      },
      leavesOak: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Oak_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Oak_Decay.json'
      },
      leavesSpruce: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Spruce_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Spruce_Decay.json'
      },
      leavesSpruceSnowy: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Spruce_Snowy_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Spruce_Snowy_Decay.json'
      },
      sheep: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Sheep_2016.png',
        jsonPath: this.assetRoot + 'images/Sheep_2016.json'
      },
      crops: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Crops.png',
        jsonPath: this.assetRoot + 'images/Crops.json'
      },
      torch: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Torch.png',
        jsonPath: this.assetRoot + 'images/Torch.json'
      },
      destroyOverlay: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Destroy_Overlay.png',
        jsonPath: this.assetRoot + 'images/Destroy_Overlay.json'
      },
      blockExplode: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/BlockExplode.png',
        jsonPath: this.assetRoot + 'images/BlockExplode.json'
      },
      miningParticles: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/MiningParticles.png',
        jsonPath: this.assetRoot + 'images/MiningParticles.json'
      },
      miniBlocks: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Miniblocks.png',
        jsonPath: this.assetRoot + 'images/Miniblocks.json'
      },
      lavaPop: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/LavaPop.png',
        jsonPath: this.assetRoot + 'images/LavaPop.json'
      },
      redstoneSparkle: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Redstone_Sparkle.png',
        jsonPath: this.assetRoot + 'images/Redstone_Sparkle.json'
      },
      fire: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Fire.png',
        jsonPath: this.assetRoot + 'images/Fire.json'
      },
      bubbles: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Bubbles.png',
        jsonPath: this.assetRoot + 'images/Bubbles.json'
      },
      explosion: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Explosion.png',
        jsonPath: this.assetRoot + 'images/Explosion.json'
      },
      door: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Door.png',
        jsonPath: this.assetRoot + 'images/Door.json'
      },
      doorIron: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Door_Iron.png',
        jsonPath: this.assetRoot + 'images/Door_Iron.json'
      },
      rails: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Rails.png',
        jsonPath: this.assetRoot + 'images/Rails.json'
      },
      tnt: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/TNT.png',
        jsonPath: this.assetRoot + 'images/TNT.json'
      },
      burningInSun: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/BurningInSun.png',
        jsonPath: this.assetRoot + 'images/BurningInSun.json'
      },
      zombie: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Zombie.png',
        jsonPath: this.assetRoot + 'images/Zombie.json'
      },
      ironGolem: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Iron_Golem.png',
        jsonPath: this.assetRoot + 'images/Iron_Golem.json'
      },
      creeper: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Creeper_2016.png',
        jsonPath: this.assetRoot + 'images/Creeper_2016.json'
      },
      cow: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Cow.png',
        jsonPath: this.assetRoot + 'images/Cow.json'
      },
      chicken: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Chicken.png',
        jsonPath: this.assetRoot + 'images/Chicken.json'
      },
      ghast: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Ghast.png',
        jsonPath: this.assetRoot + 'images/Ghast.json'
      },
      dig_wood1: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/dig_wood1.mp3',
        wav: this.assetRoot + 'audio/dig_wood1.wav',
        ogg: this.assetRoot + 'audio/dig_wood1.ogg'
      },
      stepGrass: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/step_grass1.mp3',
        wav: this.assetRoot + 'audio/step_grass1.wav',
        ogg: this.assetRoot + 'audio/step_grass1.ogg'
      },
      stepWood: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/wood2.mp3',
        ogg: this.assetRoot + 'audio/wood2.ogg'
      },
      stepStone: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/stone2.mp3',
        ogg: this.assetRoot + 'audio/stone2.ogg'
      },
      stepGravel: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/gravel1.mp3',
        ogg: this.assetRoot + 'audio/gravel1.ogg'
      },
      stepFarmland: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cloth4.mp3',
        ogg: this.assetRoot + 'audio/cloth4.ogg'
      },
      failure: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/break.mp3',
        ogg: this.assetRoot + 'audio/break.ogg'
      },
      success: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/levelup.mp3',
        ogg: this.assetRoot + 'audio/levelup.ogg'
      },
      fall: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/fallsmall.mp3',
        ogg: this.assetRoot + 'audio/fallsmall.ogg'
      },
      fuse: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/fuse.mp3',
        ogg: this.assetRoot + 'audio/fuse.ogg'
      },
      explode: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/explode3.mp3',
        ogg: this.assetRoot + 'audio/explode3.ogg'
      },
      placeBlock: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cloth1.mp3',
        ogg: this.assetRoot + 'audio/cloth1.ogg'
      },
      collectedBlock: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/pop.mp3',
        ogg: this.assetRoot + 'audio/pop.ogg'
      },
      bump: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/hit3.mp3',
        ogg: this.assetRoot + 'audio/hit3.ogg'
      },
      punch: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cloth1.mp3',
        ogg: this.assetRoot + 'audio/cloth1.ogg'
      },
      fizz: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/fizz.mp3',
        ogg: this.assetRoot + 'audio/fizz.ogg'
      },
      doorOpen: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/door_open.mp3',
        ogg: this.assetRoot + 'audio/door_open.ogg'
      },
      houseSuccess: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/launch1.mp3',
        ogg: this.assetRoot + 'audio/launch1.ogg'
      },
      minecart: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/minecartBase.mp3',
        ogg: this.assetRoot + 'audio/minecartBase.ogg'
      },
      sheepBaa: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/say3.mp3',
        ogg: this.assetRoot + 'audio/say3.ogg'
      },
      chickenHurt: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/chickenhurt2.mp3',
        ogg: this.assetRoot + 'audio/chickenhurt2.ogg'
      },
      chickenBawk: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/chickensay3.mp3',
        ogg: this.assetRoot + 'audio/chickensay3.ogg'
      },
      cowHuff: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cowhuff.mp3',
        ogg: this.assetRoot + 'audio/cowhuff.ogg'
      },
      cowHurt: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cowhurt.mp3',
        ogg: this.assetRoot + 'audio/cowhurt.ogg'
      },
      cowMoo: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cowmoo1.mp3',
        ogg: this.assetRoot + 'audio/cowmoo1.ogg'
      },
      cowMooLong: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cowmoolong.mp3',
        ogg: this.assetRoot + 'audio/cowmoolong.ogg'
      },
      creeperHiss: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/creeper.mp3',
        ogg: this.assetRoot + 'audio/creeper.ogg'
      },
      ironGolemHit: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/irongolemhit.mp3',
        ogg: this.assetRoot + 'audio/irongolemhit.ogg'
      },
      metalWhack: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/metalwhack.mp3',
        ogg: this.assetRoot + 'audio/metalwhack.ogg'
      },
      zombieBrains: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/zombiebrains.mp3',
        ogg: this.assetRoot + 'audio/zombiebrains.ogg'
      },
      zombieGroan: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/zombiegroan.mp3',
        ogg: this.assetRoot + 'audio/zombiegroan.ogg'
      },
      zombieHurt: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/zombiehurt1.mp3',
        ogg: this.assetRoot + 'audio/zombiehurt1.ogg'
      },
      pistonIn: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/piston_in.mp3',
        ogg: this.assetRoot + 'audio/piston_in.ogg'
      },
      zombieHurt2: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/zombiehurt2.mp3',
        ogg: this.assetRoot + 'audio/zombiehurt2.ogg'
      },
      pistonOut: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/piston_out.mp3',
        ogg: this.assetRoot + 'audio/piston_out.ogg'
      },
      portalAmbient: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/portal.mp3',
        ogg: this.assetRoot + 'audio/portal.ogg'
      },
      portalTravel: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/travel_portal.mp3',
        ogg: this.assetRoot + 'audio/travel_portal.ogg'
      },
      pressurePlateClick: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/pressurePlateClick.mp3',
        ogg: this.assetRoot + 'audio/pressurePlateClick.ogg'
      },
      moan2: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/moan2.mp3',
        ogg: this.assetRoot + 'audio/moan2.ogg'
      },
      moan3: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/moan3.mp3',
        ogg: this.assetRoot + 'audio/moan3.ogg'
      },
      moan6: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/moan6.mp3',
        ogg: this.assetRoot + 'audio/moan6.ogg'
      },
      moan7: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/moan7.mp3',
        ogg: this.assetRoot + 'audio/moan7.ogg'
      }

    };

    var ALL_SOUND_ASSETS = ['dig_wood1', 'stepGrass', 'stepWood', 'stepStone', 'stepGravel', 'stepFarmland', 'failure', 'success', 'fall', 'fuse', 'explode', 'placeBlock', 'collectedBlock', 'bump', 'punch', 'fizz', 'doorOpen', 'minecart', 'sheepBaa', 'chickenHurt', 'chickenBawk', 'cowHuff', 'cowHurt', 'cowMoo', 'cowMooLong', 'creeperHiss', 'ironGolemHit', 'metalWhack', 'zombieBrains', 'zombieGroan', 'zombieHurt', 'pistonIn', 'pistonOut', 'portalAmbient', 'portalTravel', 'pressurePlateClick', 'moan2', 'moan3', 'moan6', 'moan7'];

    var CHICKEN_LEVEL_ASSETS = ['chicken', 'entityShadow', 'selectionIndicator', 'AO', 'blockShadows', 'tallGrass', 'blocks', 'miniBlocks', 'stepGrass', 'failure', 'success'].concat(ALL_SOUND_ASSETS);

    this.assetPacks = {
      adventurerLevelOneAssets: ['entityShadow', 'selectionIndicator', 'AO', 'blockShadows', 'leavesOak', 'leavesBirch', 'tallGrass', 'blocks', 'sheep', 'bump', 'stepGrass', 'failure', 'success'],
      adventurerLevelTwoAssets: ['entityShadow', 'selectionIndicator', 'AO', 'blockShadows', 'leavesSpruce', 'tallGrass', 'blocks', 'sheep', 'bump', 'stepGrass', 'failure', 'playerSteve', 'success', 'miniBlocks', 'blockExplode', 'miningParticles', 'destroyOverlay', 'dig_wood1', 'collectedBlock', 'punch'],
      adventurerLevelThreeAssets: ['entityShadow', 'selectionIndicator', 'AO', 'blockShadows', 'leavesOak', 'tallGrass', 'blocks', 'sheep', 'bump', 'stepGrass', 'failure', 'playerSteve', 'success', 'miniBlocks', 'blockExplode', 'miningParticles', 'destroyOverlay', 'dig_wood1', 'collectedBlock', 'sheepBaa', 'punch'],
      adventurerAllAssetsMinusPlayer: ['entityShadow', 'selectionIndicator', 'tallGrass', 'finishOverlay', 'bed', 'AO', 'LavaGlow', 'WaterAO', 'blockShadows', 'undergroundFow', 'blocks', 'leavesAcacia', 'leavesBirch', 'leavesJungle', 'leavesOak', 'leavesSpruce', 'sheep', 'creeper', 'crops', 'torch', 'destroyOverlay', 'blockExplode', 'miningParticles', 'miniBlocks', 'lavaPop', 'fire', 'bubbles', 'explosion', 'door', 'rails', 'tnt', 'dig_wood1', 'stepGrass', 'stepWood', 'stepStone', 'stepGravel', 'stepFarmland', 'failure', 'success', 'fall', 'fuse', 'explode', 'placeBlock', 'collectedBlock', 'bump', 'punch', 'fizz', 'doorOpen', 'houseSuccess', 'minecart', 'sheepBaa'],
      levelOneAssets: CHICKEN_LEVEL_ASSETS,
      levelTwoAssets: CHICKEN_LEVEL_ASSETS,
      levelThreeAssets: CHICKEN_LEVEL_ASSETS,
      allAssetsMinusPlayer: ['entityShadow', 'selectionIndicator', 'tallGrass', 'finishOverlay', 'bed', 'AO', 'LavaGlow', 'WaterAO', 'blockShadows', 'undergroundFow', 'blocks', 'leavesAcacia', 'leavesBirch', 'leavesJungle', 'leavesOak', 'leavesSpruce', 'leavesSpruceSnowy', 'sheep', 'creeper', 'crops', 'torch', 'destroyOverlay', 'blockExplode', 'miningParticles', 'miniBlocks', 'lavaPop', 'redstoneSparkle', 'fire', 'bubbles', 'explosion', 'door', 'doorIron', 'rails', 'tnt', 'dig_wood1', 'stepGrass', 'stepWood', 'stepStone', 'stepGravel', 'stepFarmland', 'failure', 'success', 'fall', 'fuse', 'explode', 'placeBlock', 'collectedBlock', 'bump', 'punch', 'fizz', 'doorOpen', 'houseSuccess', 'minecart', 'sheepBaa', 'zombie', 'cow', 'chicken', 'ghast', 'ironGolem', 'burningInSun', 'chickenHurt', 'chickenBawk', 'cowHuff', 'cowHurt', 'cowMoo', 'cowMooLong', 'creeperHiss', 'ironGolemHit', 'metalWhack', 'zombieBrains', 'zombieGroan', 'zombieHurt', 'zombieHurt2', 'pistonIn', 'pistonOut', 'portalAmbient', 'portalTravel', 'pressurePlateClick', 'moan2', 'moan3', 'moan6', 'moan7'],
      playerSteve: ['playerSteve'],
      playerAlex: ['playerAlex'],
      playerSteveEvents: ['playerSteveEvents'],
      playerAlexEvents: ['playerAlexEvents'],
      playerAgent: ['playerAgent'],
      grass: ['tallGrass']
    };
  }

  _createClass(AssetLoader, [{
    key: 'loadPacks',
    value: function loadPacks(packList) {
      var _this = this;

      packList.forEach(function (packName) {
        _this.loadPack(packName);
      });
    }
  }, {
    key: 'loadPack',
    value: function loadPack(packName) {
      var packAssets = this.assetPacks[packName];
      this.loadAssets(packAssets);
    }
  }, {
    key: 'loadAssets',
    value: function loadAssets(assetNames) {
      var _this2 = this;

      assetNames.forEach(function (assetKey) {
        var assetConfig = _this2.assets[assetKey];
        _this2.loadAsset(assetKey, assetConfig);
      });
    }
  }, {
    key: 'loadAsset',
    value: function loadAsset(key, config) {
      switch (config.type) {
        case 'image':
          this.game.load.image(key, config.path);
          break;
        case 'sound':
          this.audioPlayer.register({
            id: key,
            mp3: config.mp3,
            ogg: config.ogg
          });
          break;
        case 'atlasJSON':
          this.game.load.atlasJSONHash(key, config.pngPath, config.jsonPath);
          break;
        default:
          throw 'Asset ' + key + ' needs config.type set in configuration.';
      }
    }
  }]);

  return AssetLoader;
})();

},{}],29:[function(require,module,exports){
'use strict';

var FacingDirection = Object.freeze({
  North: 0,
  East: 1,
  South: 2,
  West: 3,

  opposite: function opposite(facing) {
    switch (facing) {
      case FacingDirection.North:
        return FacingDirection.South;
      case FacingDirection.South:
        return FacingDirection.North;
      case FacingDirection.East:
        return FacingDirection.West;
      case FacingDirection.West:
        return FacingDirection.East;
    }
  },

  left: function left(facing) {
    return this.turn(facing, 'left');
  },

  right: function right(facing) {
    return this.turn(facing, 'right');
  },

  turnDirection: function turnDirection(from, to) {
    switch (from) {
      case FacingDirection.North:
        return to === FacingDirection.East ? 'right' : 'left';
      case FacingDirection.South:
        return to === FacingDirection.West ? 'right' : 'left';
      case FacingDirection.East:
        return to === FacingDirection.South ? 'right' : 'left';
      case FacingDirection.West:
        return to === FacingDirection.North ? 'right' : 'left';
    }
  },

  turn: function turn(facing, rotation) {
    return (facing + 4 + (rotation === 'right' ? 1 : -1)) % 4;
  },

  directionToOffset: function directionToOffset(direction) {
    switch (direction) {
      case FacingDirection.North:
        return [0, -1];
      case FacingDirection.South:
        return [0, 1];
      case FacingDirection.East:
        return [1, 0];
      case FacingDirection.West:
        return [-1, 0];
    }
  },

  directionToRelative: function directionToRelative(direction) {
    switch (direction) {
      case FacingDirection.North:
        return "Up";
      case FacingDirection.South:
        return "Down";
      case FacingDirection.East:
        return "Right";
      case FacingDirection.West:
        return "Left";
    }
  }

});

module.exports = FacingDirection;

},{}],30:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("./FacingDirection.js");

var North = _require.North;
var South = _require.South;
var East = _require.East;
var West = _require.West;

module.exports = (function () {
  function LevelBlock(blockType) {
    _classCallCheck(this, LevelBlock);

    this.blockType = blockType;

    // Default values apply to simple, action-plane destroyable blocks
    this.isEntity = false;
    this.isWalkable = false;
    this.isPlacable = false; // whether another block can be placed in this block's spot
    this.isDestroyable = true;
    this.isUsable = true;
    this.isEmpty = false;
    this.isEmissive = false;
    this.isTransparent = false;
    this.isRedstone = false;
    this.isPowered = false;
    this.isConnectedToRedstone = false; // can this block connect to nearby redstone wire
    this.isRedstoneBattery = false;
    this.isOpen = false;
    this.isRail = false;
    this.isSolid = true;
    this.isWeaklyPowerable = true;
    this.isStickable = true;

    if (blockType === "") {
      this.isWalkable = true;
      this.isDestroyable = false;
      this.isEmpty = true;
      this.isPlacable = true;
      this.isUsable = false;
      this.isWeaklyPowerable = false;
    }

    if (this.getIsMiniblock()) {
      this.isEntity = true;
      this.isWalkable = true;
      this.isDestroyable = false;
      this.isPlacable = true;
      this.isUsable = false;
      this.isTransparent = true;
    }

    if (blockType.match('torch')) {
      this.isWalkable = true;
      this.isPlacable = true;
      this.isStickable = false;
    }

    if (blockType.substring(0, 5) === "rails") {
      this.isWeaklyPowerable = blockType === 'railsRedstoneTorch' ? true : false;
      this.isStickable = blockType === 'railsRedstoneTorch' ? false : true;
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = true;
      this.isTransparent = true;
      this.isRail = blockType !== "railsRedstoneTorch";
      this.isConnectedToRedstone = /^rails(RedstoneTorch|Unpowered|Powered)/.test(blockType);
      this.isRedstoneBattery = blockType === "railsRedstoneTorch";
      this.connectionA = undefined;
      this.connectionB = undefined;
    }

    if (blockType === "sheep") {
      this.isEntity = true;
      this.isDestroyable = false;
      this.isUsable = true;
    }

    if (blockType === "invisible") {
      this.isDestroyable = false;
      this.isUsable = false;
      this.isWeaklyPowerable = false;
      this.isEmissive = true;
    }

    if (blockType.startsWith("glass")) {
      this.isSolid = false;
    }

    if (blockType.startsWith("ice")) {
      this.isSolid = false;
    }

    if (blockType === "creeper") {
      this.isEntity = true;
    }

    if (blockType === "bedrock") {
      this.isDestroyable = false;
    }

    if (blockType === "lava") {
      this.isEmissive = true;
      this.isWalkable = true;
      this.isPlacable = true;
    }

    if (blockType === "water") {
      this.isPlacable = true;
    }

    if (blockType === "torch") {
      this.isEmissive = true;
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
    }

    if (blockType === "cropWheat") {
      this.isEmissive = false;
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
    }

    if (blockType === "tnt") {
      this.isUsable = true;
      this.isDestroyable = true;
    }

    if (blockType === "door") {
      this.isWeaklyPowerable = false;
      this.isSolid = false;
      this.isEntity = true;
      this.isWalkable = false;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
      this.isStickable = false;
    }

    if (blockType === "doorIron") {
      this.isWeaklyPowerable = false;
      this.isSolid = false;
      this.isEntity = true;
      this.isWalkable = false;
      this.isDestroyable = false;
      this.isTransparent = true;
      this.isConnectedToRedstone = true;
      this.isStickable = false;
    }

    if (blockType.startsWith("redstoneWire")) {
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = true;
      this.isTransparent = true;
      this.isRedstone = true;
      this.isStickable = false;
    }

    if (blockType.startsWith("pressurePlate")) {
      this.isWeaklyPowerable = blockType === 'pressurePlateUp' ? false : true;
      this.isEntity = true;
      this.isWalkable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
      this.isConnectedToRedstone = true;
      this.isRedstoneBattery = blockType === 'pressurePlateUp' ? false : true;
      this.isStickable = false;
    }

    if (blockType === "glowstone") {
      this.isEntity = true;
    }

    if (blockType === "bedFoot" || blockType === "bedHead") {
      this.isEntity = true;
    }

    if (blockType.startsWith("piston")) {
      this.isWeaklyPowerable = false;
      this.isSolid = false;
      this.isDestroyable = false;
      this.isConnectedToRedstone = !blockType.startsWith("pistonArm");
      if (blockType.substring(blockType.length - 2, blockType.length) === "On" || blockType.startsWith("pistonArm") || blockType.substring(blockType.length - 8, blockType.length) === "OnSticky") {
        this.isEntity = true;
      }
    }

    if (blockType.startsWith("flower")) {
      this.isWalkable = true;
    }
  }

  /**
   * Does the given block type represent a "flat" block?
   * "flat" blocks are those subset of walkable blocks which are walkable
   * because they are lying right on the ground, as opposed to those blocks like
   * torches which are walkable because they do not occupy very much space.
   *
   * @return {boolean}
   */

  _createClass(LevelBlock, [{
    key: "isFlat",
    value: function isFlat() {
      return this.isRail || this.isRedstone || this.blockType.startsWith("pressurePlate");
    }
  }, {
    key: "notValidOnGroundPlane",
    value: function notValidOnGroundPlane() {
      return this.blockType.startsWith("rails") || this.blockType.startsWith("redstone");
    }
  }, {
    key: "skipsDestructionOverlay",
    value: function skipsDestructionOverlay() {
      return this.isRedstone || this.blockType === "torch" || this.blockType === "railsRedstoneTorch";
    }
  }, {
    key: "shouldRenderOnGroundPlane",
    value: function shouldRenderOnGroundPlane() {
      return this.isFlat();
    }
  }, {
    key: "getIsPowerableRail",
    value: function getIsPowerableRail() {
      return this.isRail && this.isConnectedToRedstone;
    }

    /**
     * Helper method specifically for powered rails, which can only be veritical
     * or horizontal.
     *
     * @return {boolean}
     */
  }, {
    key: "getIsHorizontal",
    value: function getIsHorizontal() {
      return this.blockType.match('East|West');
    }

    /**
     * Helper method specifically for powered rails, which can only be veritical
     * or horizontal.
     *
     * @return {boolean}
     */
  }, {
    key: "getIsVertical",
    value: function getIsVertical() {
      return this.blockType.match('North|South');
    }
  }, {
    key: "getIsStickyPiston",
    value: function getIsStickyPiston() {
      return this.blockType.substring(this.blockType.length - 6, this.blockType.length) === "Sticky";
    }
  }, {
    key: "canHoldCharge",
    value: function canHoldCharge() {
      return this.isSolid;
    }

    /**
     * @see {LevelBlock.isMiniblock}
     * @return {boolean}
     */
  }, {
    key: "getIsMiniblock",
    value: function getIsMiniblock() {
      return LevelBlock.isMiniblock(this.blockType);
    }
  }, {
    key: "getIsTree",
    value: function getIsTree() {
      return !!this.blockType.match(/^tree/);
    }
  }, {
    key: "getIsDoor",
    value: function getIsDoor() {
      return this.blockType.startsWith("door");
    }
  }, {
    key: "getIsLiquid",
    value: function getIsLiquid() {
      return this.blockType === "water" || this.blockType === "lava";
    }
  }, {
    key: "getCanFall",
    value: function getCanFall() {
      return this.blockType === "sand" || this.blockType === "gravel";
    }

    /**
     * Can this block be placed in liquid to replace a liquid block? Should
     * generally be true for all "standard" blocks like cobblestone and dirt, and
     * false for all "special" blocks like redstone and torches.
     *
     * @return {boolean}
     */
  }, {
    key: "getIsPlaceableInLiquid",
    value: function getIsPlaceableInLiquid() {
      var notPlaceable = this.isRedstone || this.getIsPiston() || this.isRail || this.blockType === 'torch' || this.blockType === 'railsRedstoneTorch' || this.blockType === 'pressurePlateUp';

      return !notPlaceable;
    }

    /**
     * Note that this will be true for blocks representing the unpowered piston,
     * the "base" of the powered piston, AND the extended arm of the powered
     * piston
     *
     * @return {boolean}
     */
  }, {
    key: "getIsPiston",
    value: function getIsPiston() {
      return this.blockType.startsWith("piston");
    }

    /**
     * @return {boolean}
     */
  }, {
    key: "getIsPistonArm",
    value: function getIsPistonArm() {
      return this.blockType.startsWith("pistonArm");
    }
  }, {
    key: "getIsPushable",
    value: function getIsPushable() {
      return this.blockType !== "" && !this.isDestroyableUponPush();
    }
  }, {
    key: "isDestroyableUponPush",
    value: function isDestroyableUponPush() {
      return this.blockType.startsWith("redstone") || this.blockType.startsWith("door") || this.blockType.startsWith("railsRedstone") || this.blockType.startsWith("pressure");
    }
  }, {
    key: "needToRefreshRedstone",
    value: function needToRefreshRedstone() {
      if (this.isRedstone || this.blockType === '' || this.isConnectedToRedstone && !this.blockType.startsWith("piston")) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: "getPistonDirection",
    value: function getPistonDirection() {
      if (this.blockType.startsWith("piston")) {
        var direction = this.blockType.substring(6, 7);
        switch (direction) {
          case "D":
            return South;
          case "U":
            return North;
          case "L":
            return West;
          case "R":
            return East;
        }
      }
    }
  }, {
    key: "getIsEmptyOrEntity",
    value: function getIsEmptyOrEntity() {
      return this.isEmpty || this.isEntity;
    }

    /**
     * Static to determine if a block would fall from Action Plane into Ground Plane.
     * @param {String} blockType
     * @return {boolean}
     */
  }], [{
    key: "getCanFall",
    value: function getCanFall(blockType) {
      return new LevelBlock(blockType).getCanFall();
    }

    /**
     * Static to determine if a block is placeable over water at all.
     * @param {String} blockType
     * @return {boolean}
     */
  }, {
    key: "getIsPlaceableInLiquid",
    value: function getIsPlaceableInLiquid(blockType) {
      return new LevelBlock(blockType).getIsPlaceableInLiquid();
    }

    /**
     * Static passthrough to the isWalkable property for the given blockType.
     * TODO @hamms: remove this method once all calling methods have been updated
     *      to operate on actual LevelBlocks rather than blockType strings
     *
     * @param {String} blockType
     * @return {boolean}
     */
  }, {
    key: "isWalkable",
    value: function isWalkable(blockType) {
      return new LevelBlock(blockType).isWalkable;
    }

    /**
     * Does the given block type represent a miniblock?
     * TODO @hamms: remove this method once all calling methods have been updated
     *      to operate on actual LevelBlocks rather than blockType strings
     *
     * @param {String} blockType
     * @return {boolean}
     */
  }, {
    key: "isMiniblock",
    value: function isMiniblock(blockType) {
      return blockType.endsWith("Miniblock");
    }

    /**
     * Static passthrough to the isWalkable property for the given blockType.
     * TODO @hamms: remove this method once all calling methods have been updated
     *      to operate on actual LevelBlocks rather than blockType strings
     *
     * @param {String} blockType
     * @return {boolean}
     */
  }, {
    key: "isFlat",
    value: function isFlat(blockType) {
      return new LevelBlock(blockType).isFlat();
    }
  }, {
    key: "skipsDestructionOverlay",
    value: function skipsDestructionOverlay(blockType) {
      return new LevelBlock(blockType).skipsDestructionOverlay();
    }
  }, {
    key: "notValidOnGroundPlane",
    value: function notValidOnGroundPlane(blockType) {
      return new LevelBlock(blockType).notValidOnGroundPlane();
    }

    /**
     * For any given block type, get the appropriate mini block frame (as defined
     * in LevelView.miniblocks) if it exists.
     *
     * For miniblock block types, this should be the miniblock itself, so this
     * means simply removing the "Miniblock" identifier, so a "diamondMiniblock"
     * block will produce a "diamond" frame.
     *
     * For regular block types, this should be the miniblock produced when
     * destroying the block type, so a "oreDiamond" block will produce a "diamond"
     * frame
     *
     * @param {String} blockType
     * @return {String} frame identifier
     */
  }, {
    key: "getMiniblockFrame",
    value: function getMiniblockFrame(blockType) {
      if (blockType === "railsRedstoneTorch") {
        return "redstoneTorch";
      }

      if (blockType.startsWith("rails")) {
        return "railNormal";
      }

      if (blockType.startsWith("glass") || blockType.startsWith("ice")) {
        return undefined;
      }

      // We use the same miniblock for -all- restoneWire
      if (blockType.substring(0, 12) === "redstoneWire") {
        return "redstoneDust";
      }

      // Miniblock block types are suffixed with the string "Miniblock"
      if (LevelBlock.isMiniblock(blockType)) {
        return blockType.replace("Miniblock", "");
      }

      // For everything else, simply map the block type to the desired miniblock
      var frame = blockType;

      switch (frame) {
        case "treeAcacia":
        case "treeBirch":
        case "treeJungle":
        case "treeOak":
        case "treeSpruce":
        case "treeSpruceSnowy":
          frame = "log" + frame.substring(4);
          break;
        case "stone":
          frame = "cobblestone";
          break;
        case "oreCoal":
          frame = "coal";
          break;
        case "oreDiamond":
          frame = "diamond";
          break;
        case "oreIron":
          frame = "ingotIron";
          break;
        case "oreLapis":
          frame = "lapisLazuli";
          break;
        case "oreGold":
          frame = "ingotGold";
          break;
        case "oreEmerald":
          frame = "emerald";
          break;
        case "oreRedstone":
          frame = "redstoneDust";
          break;
        case "grass":
          frame = "dirt";
          break;
        case "wool_orange":
          frame = "wool";
          break;
        case "tnt":
          frame = "gunPowder";
          break;
      }

      return frame;
    }
  }]);

  return LevelBlock;
})();

},{"./FacingDirection.js":29}],31:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseEntity = require("../Entities/BaseEntity.js");
var Sheep = require("../Entities/Sheep.js");
var Zombie = require("../Entities/Zombie.js");
var IronGolem = require("../Entities/IronGolem.js");
var Creeper = require("../Entities/Creeper.js");
var Cow = require("../Entities/Cow.js");
var Chicken = require("../Entities/Chicken.js");
var Ghast = require("../Entities/Ghast.js");

/**
 * Handling non-player entities inside of the level
 */
module.exports = (function () {
  function LevelEntity(controller) {
    _classCallCheck(this, LevelEntity);

    this.controller = controller;
    this.game = controller.game;
    this.entityMap = new Map();
    this.entityDeathCount = new Map();
    this.sprite = null;
    this.id = 0;
  }

  _createClass(LevelEntity, [{
    key: "loadData",
    value: function loadData(levelData) {
      if (levelData.entities !== undefined) {
        for (var i = 0; i < levelData.entities.length; i++) {
          var data = levelData.entities[i];
          var entity = this.createEntity(data[0], this.id++, data[1], data[2], data[3], data[4]);
          entity.updateHidingTree();
          entity.updateHidingBlock();
        }
      }
    }
  }, {
    key: "tick",
    value: function tick() {
      var updateEntity = function updateEntity(value) {
        value.tick();
      };
      this.entityMap.forEach(updateEntity);
    }
  }, {
    key: "pushEntity",
    value: function pushEntity(entity) {
      if (!this.entityMap.has(entity.identifier)) {
        this.entityMap.set(entity.identifier, entity);
      } else if (this.controller.DEBUG) {
        this.game.debug.text("Duplicate entity name : " + entity.identifier + "\n");
      }
    }
  }, {
    key: "isFriendlyEntity",
    value: function isFriendlyEntity(type) {
      var friendlyEntityList = ['sheep', 'ironGolem', 'cow', 'chicken'];
      for (var i = 0; i < friendlyEntityList.length; i++) {
        if (type === friendlyEntityList[i]) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: "createEntity",
    value: function createEntity(type, identifier, x, y, facing, pattern) {
      var entity = null;
      if (!this.entityMap.has(identifier)) {
        switch (type) {
          case 'sheep':
            entity = new Sheep(this.controller, type, identifier, x, y, facing);
            break;
          case 'zombie':
            entity = new Zombie(this.controller, type, identifier, x, y, facing);
            break;
          case 'ironGolem':
            entity = new IronGolem(this.controller, type, identifier, x, y, facing);
            break;
          case 'creeper':
            entity = new Creeper(this.controller, type, identifier, x, y, facing);
            break;
          case 'cow':
            entity = new Cow(this.controller, type, identifier, x, y, facing);
            break;
          case 'chicken':
            entity = new Chicken(this.controller, type, identifier, x, y, facing);
            break;
          case 'ghast':
            entity = new Ghast(this.controller, type, identifier, x, y, facing, pattern);
            break;
          default:
            entity = new BaseEntity(this.controller, type, identifier, x, y, facing);

        }
        if (this.controller.DEBUG) {
          console.log('Create Entity type : ' + type + ' ' + x + ',' + y);
        }
        this.entityMap.set(identifier, entity);
      } else if (this.controller.DEBUG) {
        this.game.debug.text("Duplicate entity name : " + identifier + "\n");
      }
      return entity;
    }
  }, {
    key: "isSpawnableInBetween",
    value: function isSpawnableInBetween(minX, minY, maxX, maxY) {
      for (var i = minX; i <= maxX; i++) {
        for (var j = minY; j <= maxY; j++) {
          if (this.controller.levelModel.isPositionEmpty([i, j])[0]) {
            return true;
          }
        }
      }
      return false;
    }
  }, {
    key: "spawnEntity",
    value: function spawnEntity(type, spawnDirection) {
      var getRandomInt = function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };
      var levelModel = this.controller.levelModel;
      var width = levelModel.planeWidth;
      var height = levelModel.planeHeight;
      if (spawnDirection === "middle") {
        if (this.isSpawnableInBetween(Math.floor(0.25 * width), Math.floor(0.25 * height), Math.floor(0.75 * width), Math.floor(0.75 * height))) {
          var position = [getRandomInt(Math.floor(0.25 * width), Math.floor(0.75 * width)), getRandomInt(Math.floor(0.25 * height), Math.floor(0.75 * height))];
          while (!levelModel.isPositionEmpty(position)[0]) {
            position = [getRandomInt(Math.floor(0.25 * width), Math.floor(0.75 * width)), getRandomInt(Math.floor(0.25 * height), Math.floor(0.75 * height))];
          }
          return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
        } else {
          if (!this.isSpawnableInBetween(1, 1, width - 2, height - 2)) {
            return null;
          }
          var position = [getRandomInt(1, width - 2), getRandomInt(1, height - 2)];
          while (!levelModel.isPositionEmpty(position)[0]) {
            position = [getRandomInt(1, width - 2), getRandomInt(1, height - 2)];
          }
          return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
        }
      } else if (spawnDirection === "left") {
        var xIndex = 0;
        var columnFull = true;
        while (xIndex < width && columnFull) {
          columnFull = true;
          for (var i = 0; i < height; i++) {
            if (levelModel.isPositionEmpty([xIndex, i])[0]) {
              columnFull = false;
              break;
            }
          }
          if (columnFull) {
            xIndex++;
          }
        }
        if (xIndex < width) {
          var position = [xIndex, getRandomInt(0, height - 1)];
          while (!levelModel.isPositionEmpty(position)[0]) {
            position = [xIndex, getRandomInt(0, height - 1)];
          }
          return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
        }
      } else if (spawnDirection === "right") {
        var xIndex = width - 1;
        var columnFull = true;
        while (xIndex > -1 && columnFull) {
          columnFull = true;
          for (var i = 0; i < height; i++) {
            if (levelModel.isPositionEmpty([xIndex, i])[0]) {
              columnFull = false;
              break;
            }
          }
          if (columnFull) {
            xIndex--;
          }
        }
        if (xIndex > -1) {
          var position = [xIndex, getRandomInt(0, height - 1)];
          while (!levelModel.isPositionEmpty(position)[0]) {
            position = [xIndex, getRandomInt(0, height - 1)];
          }
          return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
        }
      } else if (spawnDirection === "up") {
        var yIndex = 0;
        var rowFull = true;
        while (yIndex < height && rowFull) {
          rowFull = true;
          for (var i = 0; i < width; i++) {
            if (levelModel.isPositionEmpty([i, yIndex])[0]) {
              rowFull = false;
              break;
            }
          }
          if (rowFull) {
            yIndex++;
          }
        }
        if (yIndex < height) {
          var position = [getRandomInt(0, height - 1), yIndex];
          while (!levelModel.isPositionEmpty(position)[0]) {
            position = [getRandomInt(0, height - 1), yIndex];
          }
          return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
        }
      } else if (spawnDirection === "down") {
        var yIndex = height - 1;
        var rowFull = true;
        while (yIndex > -1 && rowFull) {
          rowFull = true;
          for (var i = 0; i < width; i++) {
            if (levelModel.isPositionEmpty([i, yIndex])[0]) {
              rowFull = false;
              break;
            }
          }
          if (rowFull) {
            yIndex--;
          }
        }
        if (yIndex > -1) {
          var position = [getRandomInt(0, height - 1), yIndex];
          while (!levelModel.isPositionEmpty(position)[0]) {
            position = [getRandomInt(0, height - 1), yIndex];
          }
          return this.createEntity(type, this.id++, position[0], position[1], getRandomInt(0, 3));
        }
      }
      return null;
    }
  }, {
    key: "spawnEntityAt",
    value: function spawnEntityAt(type, x, y, facing) {
      return this.createEntity(type, this.id++, x, y, facing);
    }
  }, {
    key: "destroyEntity",
    value: function destroyEntity(identifier) {
      if (this.entityMap.has(identifier)) {
        var entity = this.entityMap.get(identifier);
        if (this.entityDeathCount.has(entity.type)) {
          this.entityDeathCount.set(entity.type, this.entityDeathCount.get(entity.type) + 1);
        } else {
          this.entityDeathCount.set(entity.type, 1);
        }
        entity.reset();
        entity.sprite.animations.stop(null, true);
        entity.sprite.destroy();
        this.entityMap["delete"](identifier);
      } else if (this.controller.DEBUG) {
        this.game.debug.text("It's impossible to delete since entity name : " + identifier + " is not existing\n");
      }
    }
  }, {
    key: "getEntityAt",
    value: function getEntityAt(position) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.entityMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var value = _step.value;

          var entity = value[1];
          if (entity.position[0] === position[0] && entity.position[1] === position[1]) {
            return entity;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return null;
    }
  }, {
    key: "getEntitiesOfType",
    value: function getEntitiesOfType(type) {
      if (type === "all") {
        var entities = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.entityMap[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var value = _step2.value;

            var entity = value[1];
            if (entity.type !== 'Player') {
              entities.push(entity);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return entities;
      } else {
        var entities = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.entityMap[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var value = _step3.value;

            var entity = value[1];
            if (entity.type === type) {
              entities.push(entity);
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return entities;
      }
    }
  }, {
    key: "reset",
    value: function reset() {
      this.entityMap.clear();
      this.entityDeathCount = new Map();
    }
  }]);

  return LevelEntity;
})();

},{"../Entities/BaseEntity.js":16,"../Entities/Chicken.js":17,"../Entities/Cow.js":18,"../Entities/Creeper.js":19,"../Entities/Ghast.js":20,"../Entities/IronGolem.js":21,"../Entities/Sheep.js":23,"../Entities/Zombie.js":24}],32:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LevelPlane = require("./LevelPlane.js");
var LevelBlock = require("./LevelBlock.js");
var FacingDirection = require("./FacingDirection.js");
var Position = require("./Position.js");
var Player = require("../Entities/Player.js");
var Agent = require("../Entities/Agent.js");

// for blocks on the action plane, we need an actual "block" object, so we can model

module.exports = (function () {
  function LevelModel(levelData, controller) {
    _classCallCheck(this, LevelModel);

    this.planeWidth = levelData.gridDimensions ? levelData.gridDimensions[0] : 10;
    this.planeHeight = levelData.gridDimensions ? levelData.gridDimensions[1] : 10;
    this.controller = controller;
    this.player = {};
    this.agent = {};
    this.usingAgent = false;

    this.initialLevelData = Object.create(levelData);

    this.reset();

    this.initialPlayerState = Object.create(this.player);
    this.initialAgentState = Object.create(this.agent);
  }

  _createClass(LevelModel, [{
    key: "planeArea",
    value: function planeArea() {
      return this.planeWidth * this.planeHeight;
    }
  }, {
    key: "inBounds",
    value: function inBounds(position) {
      var _position = _slicedToArray(position, 2);

      var x = _position[0];
      var y = _position[1];

      return x >= 0 && x < this.planeWidth && y >= 0 && y < this.planeHeight;
    }
  }, {
    key: "reset",
    value: function reset() {
      var _this = this;

      this.groundPlane = new LevelPlane(this.initialLevelData.groundPlane, this.planeWidth, this.planeHeight, this, "groundPlane");
      this.groundDecorationPlane = new LevelPlane(this.initialLevelData.groundDecorationPlane, this.planeWidth, this.planeHeight, this, "decorationPlane");
      this.shadingPlane = [];
      this.actionPlane = new LevelPlane(this.initialLevelData.actionPlane, this.planeWidth, this.planeHeight, this, "actionPlane");

      this.actionPlane.powerRedstone();

      this.actionPlane.getAllPositions().forEach(function (position) {
        if (_this.actionPlane.getBlockAt(position).isRedstone) {
          _this.actionPlane.determineRedstoneSprite(position);
        }
        if (_this.actionPlane.getBlockAt(position).isRail) {
          _this.actionPlane.determineRailType(position);
        }
      });

      this.fluffPlane = new LevelPlane(this.initialLevelData.fluffPlane, this.planeWidth, this.planeHeight);
      this.fowPlane = [];
      this.isDaytime = this.initialLevelData.isDaytime === undefined || this.initialLevelData.isDaytime;

      var levelData = Object.create(this.initialLevelData);

      var _levelData$playerStartPosition = _slicedToArray(levelData.playerStartPosition, 2);

      var x = _levelData$playerStartPosition[0];
      var y = _levelData$playerStartPosition[1];

      if (this.initialLevelData.usePlayer !== undefined) {
        this.usePlayer = this.initialLevelData.usePlayer;
      } else {
        this.usePlayer = true;
      }
      if (this.usePlayer) {
        this.player = new Player(this.controller, "Player", x, y, this.initialLevelData.playerName || "Steve", !this.actionPlane.getBlockAt([x, y]).getIsEmptyOrEntity(), levelData.playerStartDirection);
        this.controller.levelEntity.pushEntity(this.player);
        this.controller.player = this.player;

        if (levelData.useAgent) {
          this.spawnAgent(levelData);
        }
      }

      // If we have an agent but the level initialization data doesn't define one,
      // then we must have spawned one during the level run and so want to reset
      // back to not having one
      if (!levelData.useAgent && this.usingAgent) {
        this.destroyAgent();
      }

      this.computeShadingPlane();
      this.computeFowPlane();
    }

    /**
     * Creates the Agent entity
     *
     * @param {Object} levelData the initial level data object, specifying the
     *        Agent's default position and direction
     * @param {[Number, Number]} [positionOverride] optional position override
     * @param {Number} [directionOverride] optional direction override
     */
  }, {
    key: "spawnAgent",
    value: function spawnAgent(levelData, positionOverride, directionOverride) {
      this.usingAgent = true;

      var _ref = positionOverride !== undefined ? positionOverride : levelData.agentStartPosition;

      var _ref2 = _slicedToArray(_ref, 2);

      var x = _ref2[0];
      var y = _ref2[1];

      var direction = directionOverride !== undefined ? directionOverride : levelData.agentStartDirection;

      var name = "PlayerAgent";
      var key = "Agent";

      var startingBlock = this.actionPlane.getBlockAt([x, y]);
      this.agent = new Agent(this.controller, name, x, y, key, !startingBlock.getIsEmptyOrEntity(), direction);
      this.controller.levelEntity.pushEntity(this.agent);
      this.controller.agent = this.agent;
    }

    /**
     * Destroys the agent entity; is the inverse of spawnAgent.
     */
  }, {
    key: "destroyAgent",
    value: function destroyAgent() {
      this.controller.agent = undefined;
      this.controller.levelEntity.destroyEntity(this.agent.identifier);
      this.agent = undefined;
      this.usingAgent = false;
    }
  }, {
    key: "yToIndex",
    value: function yToIndex(y) {
      return y * this.planeWidth;
    }
  }, {
    key: "isSolved",
    value: function isSolved() {
      return this.initialLevelData.verificationFunction(this);
    }
  }, {
    key: "isFailed",
    value: function isFailed() {
      if (this.initialLevelData.failureCheckFunction !== undefined) {
        return this.initialLevelData.failureCheckFunction(this);
      } else {
        return false;
      }
    }
  }, {
    key: "getHouseBottomRight",
    value: function getHouseBottomRight() {
      return this.initialLevelData.houseBottomRight;
    }

    // Verifications
  }, {
    key: "isPlayerNextTo",
    value: function isPlayerNextTo(blockType) {
      var _this2 = this;

      if (!this.usePlayer) {
        return false;
      }

      return Position.getOrthogonalPositions(this.player.position).some(function (position) {
        return _this2.inBounds(position) && (_this2.isBlockOfType(position, blockType) || _this2.isEntityOfType(position, blockType) || _this2.groundPlane.getBlockAt(position).blockType === blockType);
      });
    }
  }, {
    key: "isEntityNextTo",
    value: function isEntityNextTo(entityType, blockType) {
      var _this3 = this;

      var entityList = this.controller.levelEntity.getEntitiesOfType(entityType);

      return entityList.some(function (entity) {
        return Position.getOrthogonalPositions(entity.position).some(function (position) {
          return _this3.inBounds(position) && (_this3.isBlockOfType(position, blockType) || _this3.isEntityOfType(position, blockType) || _this3.groundPlane.getBlockAt(position).blockType === blockType);
        });
      });
    }
  }, {
    key: "isEntityOnBlocktype",
    value: function isEntityOnBlocktype(entityType, blockType) {
      var count = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

      var entityList = this.controller.levelEntity.getEntitiesOfType(entityType);
      var resultCount = 0;
      for (var i = 0; i < entityList.length; i++) {
        var entity = entityList[i];
        if (this.isBlockOfType(entity.position, blockType) || this.groundPlane.getBlockAt(entity.position).blockType === blockType) {
          resultCount++;
        }
      }
      return resultCount >= count;
    }
  }, {
    key: "isEntityAt",
    value: function isEntityAt(entityType, position) {
      var entityList = this.controller.levelEntity.getEntitiesOfType(entityType);
      for (var i = 0; i < entityList.length; i++) {
        var entity = entityList[i];
        if (Position.equals(entity.position, position)) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: "isEntityTypeRunning",
    value: function isEntityTypeRunning(entityType) {
      var entityList = this.controller.levelEntity.getEntitiesOfType(entityType);
      for (var i = 0; i < entityList.length; i++) {
        var entity = entityList[i];
        var notStarted = !entity.queue.isStarted();
        var notFinished = !entity.queue.isFinished();
        if (notStarted && entity.queue.commandList_.length > 0 || notFinished) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: "isEntityDied",
    value: function isEntityDied(entityType) {
      var count = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      var deathCount = this.controller.levelEntity.entityDeathCount;
      if (deathCount.has(entityType)) {
        if (deathCount.get(entityType) >= count) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: "getScore",
    value: function getScore() {
      return this.controller.score;
    }
  }, {
    key: "shouldRide",
    value: function shouldRide(direction) {
      var player = this.player;
      var frontPosition = this.getNextRailPosition(player, direction);
      var frontBlock = this.actionPlane.getBlockAt(frontPosition);
      return this.isNextRailValid(frontBlock, direction);
    }
  }, {
    key: "isNextRailValid",
    value: function isNextRailValid(block, direction) {
      if (!block) {
        return;
      }
      return FacingDirection.opposite(block.connectionA) === direction || FacingDirection.opposite(block.connectionB) === direction || block.connectionA === direction || block.connectionB === direction;
    }
  }, {
    key: "getNextRailPosition",
    value: function getNextRailPosition(entity, direction) {
      if (entity === undefined) entity = this.player;

      var offset = FacingDirection.directionToOffset(direction) || [0, 0];
      return Position.add(entity.position, offset);
    }
  }, {
    key: "getEntityCount",
    value: function getEntityCount(entityType) {
      var entityList = this.controller.levelEntity.getEntitiesOfType(entityType);
      return entityList.length;
    }
  }, {
    key: "getCommandExecutedCount",
    value: function getCommandExecutedCount(commandName, targetType) {
      return this.controller.getCommandCount(commandName, targetType, false);
    }
  }, {
    key: "getRepeatCommandExecutedCount",
    value: function getRepeatCommandExecutedCount(commandName, targetType) {
      return this.controller.getCommandCount(commandName, targetType, true);
    }
  }, {
    key: "getTurnRandomCount",
    value: function getTurnRandomCount() {
      return this.controller.turnRandomCount;
    }
  }, {
    key: "getInventoryAmount",
    value: function getInventoryAmount(inventoryType) {
      if (!this.usePlayer) {
        return 0;
      }
      if (inventoryType === "all" || inventoryType === "All") {
        var inventory = this.player.inventory;
        var count = 0;
        for (var key in inventory) {
          count += inventory[key];
        }
        return count;
      }
      return this.player.inventory[inventoryType];
    }
  }, {
    key: "getInventoryTypes",
    value: function getInventoryTypes() {
      if (!this.usePlayer) {
        return [];
      }
      return Object.keys(this.player.inventory);
    }
  }, {
    key: "countOfTypeOnMap",
    value: function countOfTypeOnMap(blockType) {
      var _this4 = this;

      var blocksOfType = this.actionPlane.getAllPositions().filter(function (position) {
        return _this4.actionPlane.getBlockAt(position).blockType === blockType;
      });

      return blocksOfType.length;
    }
  }, {
    key: "isPlayerAt",
    value: function isPlayerAt(position) {
      if (!this.usePlayer) {
        return false;
      }
      return this.player.position[0] === position[0] && this.player.position[1] === position[1];
    }
  }, {
    key: "spritePositionToIndex",
    value: function spritePositionToIndex(offset, spritePosition) {
      var position = [spritePosition[0] - offset[0], spritePosition[1] - offset[1]];
      return [position[0] / 40, position[1] / 40];
    }
  }, {
    key: "solutionMapMatchesResultMap",
    value: function solutionMapMatchesResultMap(solutionMap) {
      for (var i = 0; i < this.planeArea(); i++) {
        var solutionItemType = solutionMap[i];
        var position = this.actionPlane.indexToCoordinates(i);

        // "" on the solution map means we dont care what's at that spot
        if (solutionItemType !== "") {
          if (solutionItemType === "empty") {
            if (!this.actionPlane.getBlockAt(position).isEmpty) {
              return false;
            }
          } else if (solutionItemType === "any") {
            if (this.actionPlane.getBlockAt(position).isEmpty) {
              return false;
            }
          } else if (this.actionPlane.getBlockAt(position).blockType !== solutionItemType) {
            return false;
          }
        }
      }
      return true;
    }
  }, {
    key: "getTnt",
    value: function getTnt() {
      var tnt = [];
      for (var x = 0; x < this.planeWidth; ++x) {
        for (var y = 0; y < this.planeHeight; ++y) {
          var block = this.actionPlane.getBlockAt([x, y]);
          if (block.blockType === "tnt") {
            tnt.push([x, y]);
          }
        }
      }
      return tnt;
    }
  }, {
    key: "getMoveForwardPosition",
    value: function getMoveForwardPosition() {
      var entity = arguments.length <= 0 || arguments[0] === undefined ? this.player : arguments[0];

      return Position.forward(entity.position, entity.facing);
    }
  }, {
    key: "getMoveDirectionPosition",
    value: function getMoveDirectionPosition(entity, direction) {
      var absoluteDirection = entity.facing;
      for (var i = 0; i < direction; ++i) {
        absoluteDirection = FacingDirection.turn(absoluteDirection, 'right');
      }
      return Position.forward(entity.position, absoluteDirection);
    }
  }, {
    key: "isForwardBlockOfType",
    value: function isForwardBlockOfType(blockType) {
      var blockForwardPosition = this.getMoveForwardPosition();

      var actionIsEmpty = this.isBlockOfTypeOnPlane(blockForwardPosition, "empty", this.actionPlane);

      if (blockType === '' && actionIsEmpty) {
        return true;
      }

      return actionIsEmpty ? this.isBlockOfTypeOnPlane(blockForwardPosition, blockType, this.groundPlane) : this.isBlockOfTypeOnPlane(blockForwardPosition, blockType, this.actionPlane);
    }
  }, {
    key: "getForwardBlockType",
    value: function getForwardBlockType() {
      return this.getForwardBlock().blockType;
    }
  }, {
    key: "getForwardBlock",
    value: function getForwardBlock() {
      var blockForwardPosition = this.getMoveForwardPosition();
      return this.actionPlane.getBlockAt(blockForwardPosition);
    }
  }, {
    key: "isBlockOfType",
    value: function isBlockOfType(position, blockType) {
      return this.isBlockOfTypeOnPlane(position, blockType, this.actionPlane);
    }
  }, {
    key: "isEntityOfType",
    value: function isEntityOfType(position, type) {
      var entities = this.controller.levelEntity.getEntitiesOfType(type);
      return entities.some(function (entity) {
        return Position.equals(position, entity.position);
      });
    }
  }, {
    key: "isBlockOfTypeOnPlane",
    value: function isBlockOfTypeOnPlane(position, blockType, plane) {
      var result = false;

      if (this.inBounds(position)) {

        if (blockType === "empty") {
          result = plane.getBlockAt(position).isEmpty;
        } else if (blockType === "tree") {
          result = plane.getBlockAt(position).getIsTree();
        } else {
          result = blockType === plane.getBlockAt(position).blockType;
        }
      }

      return result;
    }
  }, {
    key: "isPlayerStandingInWater",
    value: function isPlayerStandingInWater() {
      return this.groundPlane.getBlockAt(this.player.position).blockType === "water";
    }
  }, {
    key: "isPlayerStandingInLava",
    value: function isPlayerStandingInLava() {
      return this.groundPlane.getBlockAt(this.player.position).blockType === "lava";
    }
  }, {
    key: "coordinatesToIndex",
    value: function coordinatesToIndex(coordinates) {
      return this.yToIndex(coordinates[1]) + coordinates[0];
    }
  }, {
    key: "checkPositionForTypeAndPush",
    value: function checkPositionForTypeAndPush(blockType, position, objectArray) {
      if (!blockType && this.actionPlane.getBlockAt(position).blockType !== "" || this.isBlockOfType(position, blockType)) {
        objectArray.push([true, position]);
        return true;
      } else {
        objectArray.push([false, null]);
        return false;
      }
    }
  }, {
    key: "houseGroundToFloorHelper",
    value: function houseGroundToFloorHelper(position, woolType, arrayCheck) {
      var checkActionBlock,
          posAbove,
          posBelow,
          posRight,
          posLeft,
          checkIndex = 0,
          array = arrayCheck;
      var index = this.yToIndex(position[2]) + position[1];

      if (index === 44) {
        index = 44;
      }

      posAbove = [0, position[1], position[2] + 1];
      posAbove[0] = this.yToIndex(posAbove[2]) + posAbove[1];

      posBelow = [0, position[1], position[2] - 1];
      posBelow[0] = this.yToIndex(posBelow[2]) + posBelow[1];

      posRight = [0, position[1] + 1, position[2]];
      posRight[0] = this.yToIndex(posRight[2]) + posRight[1];

      posLeft = [0, position[1] - 1, position[2]];
      posRight[0] = this.yToIndex(posRight[2]) + posRight[1];

      checkActionBlock = this.actionPlane.getBlockAt(this.actionPlane.indexToCoordinates(index));
      for (var i = 0; i < array.length; ++i) {
        if (array[i][0] === index) {
          checkIndex = -1;
          break;
        }
      }

      if (checkActionBlock.blockType !== "") {
        return {};
      } else if (array.length > 0 && checkIndex === -1) {
        return {};
      }
      array.push(position);
      array.concat(this.houseGroundToFloorHelper(posAbove, woolType, array));
      array.concat(this.houseGroundToFloorHelper(posBelow, woolType, array));
      array.concat(this.houseGroundToFloorHelper(posRight, woolType, array));
      array.concat(this.houseGroundToFloorHelper(posLeft, woolType, array));

      return array;
    }
  }, {
    key: "houseGroundToFloorBlocks",
    value: function houseGroundToFloorBlocks(startingPosition) {
      //checkCardinalDirections for actionblocks.
      //If no action block and square isn't the type we want.
      //Change it.
      var woolType = "wool_orange";

      //Place this block here
      //this.createBlock(this.groundPlane, startingPosition[0], startingPosition[1], woolType);
      var helperStartData = [0, startingPosition[0], startingPosition[1]];
      return this.houseGroundToFloorHelper(helperStartData, woolType, []);
    }
  }, {
    key: "getEntityAt",
    value: function getEntityAt(position) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.controller.levelEntity.entityMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var entity = _step.value;

          if (Position.equals(entity[1].position, position)) {
            return entity[1];
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return undefined;
    }
  }, {
    key: "getAllBorderingPositionNotOfType",
    value: function getAllBorderingPositionNotOfType(position, blockType) {
      var surroundingBlocks = this.getAllBorderingPosition(position, null);
      for (var b = 1; b < surroundingBlocks.length; ++b) {
        if (surroundingBlocks[b][0] && this.actionPlane.getBlockAt(surroundingBlocks[b][1]).blockType === blockType) {
          surroundingBlocks[b][0] = false;
        }
      }
      return surroundingBlocks;
    }
  }, {
    key: "getAllBorderingPosition",
    value: function getAllBorderingPosition(position, blockType) {
      var _this5 = this;

      var allFoundObjects = [false];

      Position.getSurroundingPositions(position).forEach(function (surroundingPosition) {
        if (_this5.checkPositionForTypeAndPush(blockType, surroundingPosition, allFoundObjects)) {
          allFoundObjects[0] = true;
        }
      });

      return allFoundObjects;
    }
  }, {
    key: "canMoveForward",
    value: function canMoveForward() {
      var entity = arguments.length <= 0 || arguments[0] === undefined ? this.player : arguments[0];

      var _getMoveForwardPosition = this.getMoveForwardPosition(entity);

      var _getMoveForwardPosition2 = _slicedToArray(_getMoveForwardPosition, 2);

      var x = _getMoveForwardPosition2[0];
      var y = _getMoveForwardPosition2[1];

      if (!this.controller.followingPlayer() && (x > 9 || y > 9)) {
        return false;
      }
      return this.isPositionEmpty([x, y], entity);
    }
  }, {
    key: "canMoveBackward",
    value: function canMoveBackward() {
      var entity = arguments.length <= 0 || arguments[0] === undefined ? this.player : arguments[0];

      var _getMoveDirectionPosition = this.getMoveDirectionPosition(entity, 2);

      var _getMoveDirectionPosition2 = _slicedToArray(_getMoveDirectionPosition, 2);

      var x = _getMoveDirectionPosition2[0];
      var y = _getMoveDirectionPosition2[1];

      return this.isPositionEmpty([x, y], entity);
    }
  }, {
    key: "isPositionEmpty",
    value: function isPositionEmpty(position) {
      var entity = arguments.length <= 1 || arguments[1] === undefined ? this.player : arguments[1];

      var result = [false];

      if (this.inBounds(position)) {
        if (!this.actionPlane.getBlockAt(position).isWalkable) {
          result.push("notWalkable");
        }
        if (!this.actionPlane.getBlockAt(position).isEmpty) {
          if (this.player.isOnBlock) {
            return [true];
          }
          result.push("notEmpty");
        }
        // Prevent walking into water/lava in levels where the player is
        // controlled by arrow keys. In levels where the player is controlled by
        // blocks, let them drown.
        if (this.groundPlane.getBlockAt(position).blockType === "water") {
          if (this.controller.getIsDirectPlayerControl()) {
            result.push("water");
          } else {
            return [true];
          }
        } else if (this.groundPlane.getBlockAt(position).blockType === "lava") {
          if (this.controller.getIsDirectPlayerControl()) {
            result.push("lava");
          } else {
            return [true];
          }
        }

        var frontEntity = this.getEntityAt(position);
        if (frontEntity !== undefined) {
          result.push("frontEntity");
          result.push(frontEntity);
        }
        var groundBlock = this.groundPlane.getBlockAt(position);
        var actionBlock = this.actionPlane.getBlockAt(position);
        result[0] = entity.hasPermissionToWalk(actionBlock, frontEntity, groundBlock);
      } else {
        result.push("outBound");
      }

      return result;
    }
  }, {
    key: "canMoveDirection",
    value: function canMoveDirection(entity, direction) {
      if (entity === undefined) entity = this.player;

      // save current direction of the entity
      var currentDirection = entity.facing;
      this.turnToDirection(entity, direction);
      var result = this.canMoveForward(entity);
      // rerotate the entity to the saved direction
      this.turnToDirection(entity, currentDirection);
      return result;
    }
  }, {
    key: "canPlaceBlock",
    value: function canPlaceBlock(entity, blockAtPosition) {
      return entity.canPlaceBlock(blockAtPosition);
    }
  }, {
    key: "canPlaceBlockDirection",
    value: function canPlaceBlockDirection(blockType, entity, direction) {
      if (blockType === undefined) blockType = "";

      if (entity.isOnBlock) {
        return false;
      }
      var plane = this.getPlaneToPlaceOn(this.getMoveDirectionPosition(entity, direction), entity, blockType);
      if (plane === this.groundPlane) {
        if (LevelBlock.notValidOnGroundPlane(blockType) && this.groundPlane.getBlockAt(this.getMoveDirectionPosition(entity, direction))) {
          return false;
        }
      }

      if (this.checkEntityConflict(this.getMoveDirectionPosition(entity, direction))) {
        return false;
      }
      return this.getPlaneToPlaceOn(this.getMoveDirectionPosition(entity, direction), entity, blockType) !== null;
    }
  }, {
    key: "checkEntityConflict",
    value: function checkEntityConflict(position) {
      var conflict = false;
      this.controller.levelEntity.entityMap.forEach(function (entity) {
        if (Position.equals(entity.position, position)) {
          conflict = true;
        }
      });
      return conflict;
    }
  }, {
    key: "canPlaceBlockForward",
    value: function canPlaceBlockForward() {
      var blockType = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
      var entity = arguments.length <= 1 || arguments[1] === undefined ? this.player : arguments[1];

      return this.canPlaceBlockDirection(blockType, entity, 0);
    }
  }, {
    key: "getPlaneToPlaceOn",
    value: function getPlaneToPlaceOn(position, entity, blockType) {
      if (this.inBounds(position)) {
        var actionBlock = this.actionPlane.getBlockAt(position);
        if (entity === this.agent && actionBlock.isEmpty) {
          var groundBlock = this.groundPlane.getBlockAt(position);
          if (groundBlock.getIsLiquid()) {
            if (LevelBlock.getCanFall(blockType)) {
              return this.groundPlane;
            } else if (!LevelBlock.getIsPlaceableInLiquid(blockType)) {
              return null;
            }
          }
          return this.actionPlane;
        }
        if (actionBlock.isPlacable) {
          var groundBlock = this.groundPlane.getBlockAt(position);
          if (groundBlock.isPlacable) {
            return this.groundPlane;
          }
          return this.actionPlane;
        }
      }

      return null;
    }
  }, {
    key: "canDestroyBlockForward",
    value: function canDestroyBlockForward() {
      var entity = arguments.length <= 0 || arguments[0] === undefined ? this.player : arguments[0];

      var result = false;

      if (!entity.isOnBlock) {
        var blockForwardPosition = this.getMoveForwardPosition(entity);

        if (this.inBounds(blockForwardPosition)) {
          var block = this.actionPlane.getBlockAt(blockForwardPosition);
          result = !block.isEmpty && (block.isDestroyable || block.isUsable);
        }
      }

      return result;
    }
  }, {
    key: "moveForward",
    value: function moveForward() {
      var entity = arguments.length <= 0 || arguments[0] === undefined ? this.player : arguments[0];

      var blockForwardPosition = this.getMoveForwardPosition(entity);
      this.moveTo(blockForwardPosition, entity);
    }
  }, {
    key: "moveBackward",
    value: function moveBackward() {
      var entity = arguments.length <= 0 || arguments[0] === undefined ? this.player : arguments[0];

      var blockBackwardPosition = this.getMoveDirectionPosition(entity, 2);
      this.moveTo(blockBackwardPosition, entity);
    }
  }, {
    key: "moveTo",
    value: function moveTo(position) {
      var entity = arguments.length <= 1 || arguments[1] === undefined ? this.player : arguments[1];

      entity.setMovePosition(position);

      if (this.actionPlane.getBlockAt(position).isEmpty) {
        entity.isOnBlock = false;
      }
    }
  }, {
    key: "turnLeft",
    value: function turnLeft() {
      var entity = arguments.length <= 0 || arguments[0] === undefined ? this.player : arguments[0];

      entity.facing = FacingDirection.turn(entity.facing, 'left');
    }
  }, {
    key: "turnRight",
    value: function turnRight() {
      var entity = arguments.length <= 0 || arguments[0] === undefined ? this.player : arguments[0];

      entity.facing = FacingDirection.turn(entity.facing, 'right');
    }
  }, {
    key: "turnToDirection",
    value: function turnToDirection(entity, direction) {
      if (entity === undefined) entity = this.player;

      entity.facing = direction;
    }
  }, {
    key: "moveDirection",
    value: function moveDirection(entity, direction) {
      if (entity === undefined) entity = this.player;

      this.turnToDirection(entity, direction);
      this.moveForward();
    }
  }, {
    key: "placeBlock",
    value: function placeBlock(blockType) {
      var entity = arguments.length <= 1 || arguments[1] === undefined ? this.player : arguments[1];

      var position = entity.position;
      var placedBlock = null;

      var ground = this.groundPlane.getBlockAt(position);
      var currentBlock = this.actionPlane.getBlockAt(position);
      var block = new LevelBlock(blockType);
      var result = entity.canPlaceBlockOver(block, ground);
      if (result.canPlace && !currentBlock.getIsMiniblock()) {
        switch (result.plane) {
          case "actionPlane":
            placedBlock = this.actionPlane.setBlockAt(position, block);
            entity.walkableCheck(block);
            break;
          case "groundPlane":
            this.groundPlane.setBlockAt(position, block);
            break;
        }
      }

      return placedBlock;
    }
  }, {
    key: "placeBlockForward",
    value: function placeBlockForward(blockType, targetPlane) {
      var entity = arguments.length <= 2 || arguments[2] === undefined ? this.player : arguments[2];

      return this.placeBlockDirection(blockType, targetPlane, entity, 0);
    }
  }, {
    key: "placeBlockDirection",
    value: function placeBlockDirection(blockType, targetPlane, entity, direction) {
      var blockPosition = this.getMoveDirectionPosition(entity, direction);

      //for placing wetland for crops in free play
      if (blockType === "watering") {
        blockType = "farmlandWet";
        targetPlane = this.groundPlane;
      }
      return targetPlane.setBlockAt(blockPosition, new LevelBlock(blockType));
    }
  }, {
    key: "destroyBlock",
    value: function destroyBlock(position) {
      var block = null;
      var x = position[0];
      var y = position[1];

      if (this.inBounds(position)) {
        block = this.actionPlane.getBlockAt(position);
        if (block !== null) {
          block.position = [x, y];

          if (block.isDestroyable) {
            this.actionPlane.setBlockAt(position, new LevelBlock(""));
          }
        }
      }
      return block;
    }
  }, {
    key: "destroyBlockForward",
    value: function destroyBlockForward(entity) {
      var block = null;

      var blockForwardPosition = this.getMoveForwardPosition(entity);

      if (this.inBounds(blockForwardPosition)) {
        block = this.actionPlane.getBlockAt(blockForwardPosition);
        if (block !== null) {

          if (block.isDestroyable) {
            this.actionPlane.setBlockAt(blockForwardPosition, new LevelBlock(""));
          }
        }
      }
      return block;
    }
  }, {
    key: "solveFOWTypeForMap",
    value: function solveFOWTypeForMap() {
      var emissives, blocksToSolve;

      emissives = this.getAllEmissives();
      blocksToSolve = this.findBlocksAffectedByEmissives(emissives);

      for (var block in blocksToSolve) {
        if (blocksToSolve.hasOwnProperty(block)) {
          this.solveFOWTypeFor(blocksToSolve[block], emissives);
        }
      }
    }
  }, {
    key: "solveFOWTypeFor",
    value: function solveFOWTypeFor(position, emissives) {
      var emissivesTouching,
          topLeftQuad = false,
          botLeftQuad = false,
          leftQuad = false,
          topRightQuad = false,
          botRightQuad = false,
          rightQuad = false,
          topQuad = false,
          botQuad = false,
          angle = 0,
          index = this.coordinatesToIndex(position),
          x,
          y;

      emissivesTouching = this.findEmissivesThatTouch(position, emissives);

      for (var torch in emissivesTouching) {
        var currentTorch = emissivesTouching[torch];
        y = position[1];
        x = position[0];

        angle = Math.atan2(currentTorch[1] - position[1], currentTorch[0] - position[0]);
        //invert
        angle = -angle;
        //Normalize to be between 0 and 2*pi
        if (angle < 0) {
          angle += 2 * Math.PI;
        }
        //convert to degrees for simplicity
        angle *= 360 / (2 * Math.PI);

        //top right
        if (!rightQuad && angle > 32.5 && angle <= 57.5) {
          topRightQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_TopRight", precedence: 0 });
        } //top left
        if (!leftQuad && angle > 122.5 && angle <= 147.5) {
          topLeftQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_TopLeft", precedence: 0 });
        } //bot left
        if (!leftQuad && angle > 212.5 && angle <= 237.5) {
          botLeftQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_BottomLeft", precedence: 0 });
        } //botright
        if (!rightQuad && angle > 302.5 && angle <= 317.5) {
          botRightQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_BottomRight", precedence: 0 });
        }
        //right
        if (angle >= 327.5 || angle <= 32.5) {
          rightQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Right", precedence: 1 });
        } //bot
        if (angle > 237.5 && angle <= 302.5) {
          botQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom", precedence: 1 });
        }
        //left
        if (angle > 147.5 && angle <= 212.5) {
          leftQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Left", precedence: 1 });
        }
        //top
        if (angle > 57.5 && angle <= 122.5) {
          topQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top", precedence: 1 });
        }
      }

      if (topLeftQuad && botLeftQuad) {
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Left", precedence: 1 });
      }
      if (topRightQuad && botRightQuad) {
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Right", precedence: 1 });
      }
      if (topLeftQuad && topRightQuad) {
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top", precedence: 1 });
      }
      if (botRightQuad && botLeftQuad) {
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom", precedence: 1 });
      }

      if (botRightQuad && topLeftQuad || botLeftQuad && topRightQuad || leftQuad && rightQuad || topQuad && botQuad || rightQuad && botQuad && topLeftQuad || botQuad && topRightQuad && topLeftQuad || topQuad && botRightQuad && botLeftQuad || leftQuad && topRightQuad && botRightQuad || leftQuad && botQuad && topRightQuad) {
        //fully lit
        this.fowPlane[index] = "";
      } else if (botQuad && leftQuad || botQuad && topLeftQuad || leftQuad && botRightQuad) {
        // darkend botleft corner
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom_Left", precedence: 2 });
      } else if (botQuad && rightQuad || botQuad && topRightQuad || rightQuad && botLeftQuad) {
        // darkend botRight corner
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom_Right", precedence: 2 });
      } else if (topQuad && rightQuad || topQuad && botRightQuad || rightQuad && topLeftQuad) {
        // darkend topRight corner
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top_Right", precedence: 2 });
      } else if (topQuad && leftQuad || topQuad && botLeftQuad || leftQuad && topRightQuad) {
        // darkend topLeft corner
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top_Left", precedence: 2 });
      }
    }
  }, {
    key: "pushIfHigherPrecedence",
    value: function pushIfHigherPrecedence(index, fowObject) {
      if (fowObject === "") {
        this.fowPlane[index] = "";
        return;
      }
      var existingItem = this.fowPlane[index];
      if (existingItem && existingItem.precedence > fowObject.precedence) {
        return;
      }
      this.fowPlane[index] = fowObject;
    }
  }, {
    key: "getAllEmissives",
    value: function getAllEmissives() {
      var emissives = [];
      for (var y = 0; y < this.planeHeight; ++y) {
        for (var x = 0; x < this.planeWidth; ++x) {
          var position = [x, y];
          if (!this.actionPlane.getBlockAt(position).isEmpty && this.actionPlane.getBlockAt(position).isEmissive || this.groundPlane.getBlockAt(position).isEmissive && this.actionPlane.getBlockAt(position).isEmpty) {
            emissives.push([x, y]);
          }
        }
      }
      return emissives;
    }
  }, {
    key: "findBlocksAffectedByEmissives",
    value: function findBlocksAffectedByEmissives(emissives) {
      var blocksTouchedByEmissives = {};
      //find emissives that are close enough to light us.
      for (var torch in emissives) {
        var currentTorch = emissives[torch];
        var y = currentTorch[1];
        var x = currentTorch[0];
        for (var yIndex = currentTorch[1] - 2; yIndex <= currentTorch[1] + 2; ++yIndex) {
          for (var xIndex = currentTorch[0] - 2; xIndex <= currentTorch[0] + 2; ++xIndex) {

            //Ensure we're looking inside the map
            if (!this.inBounds([xIndex, yIndex])) {
              continue;
            }

            //Ignore the indexes directly around us.
            //Theyre taken care of on the FOW first pass
            if (yIndex >= y - 1 && yIndex <= y + 1 && xIndex >= x - 1 && xIndex <= x + 1) {
              continue;
            }

            //we want unique copies so we use a map.
            blocksTouchedByEmissives[yIndex.toString() + xIndex.toString()] = [xIndex, yIndex];
          }
        }
      }

      return blocksTouchedByEmissives;
    }
  }, {
    key: "findEmissivesThatTouch",
    value: function findEmissivesThatTouch(position, emissives) {
      var emissivesThatTouch = [];
      var y = position[1];
      var x = position[0];
      //find emissives that are close enough to light us.
      for (var yIndex = y - 2; yIndex <= y + 2; ++yIndex) {
        for (var xIndex = x - 2; xIndex <= x + 2; ++xIndex) {

          //Ensure we're looking inside the map
          if (!this.inBounds([xIndex, yIndex])) {
            continue;
          }

          //Ignore the indexes directly around us.
          if (yIndex >= y - 1 && yIndex <= y + 1 && xIndex >= x - 1 && xIndex <= x + 1) {
            continue;
          }

          for (var torch in emissives) {
            if (emissives[torch][0] === xIndex && emissives[torch][1] === yIndex) {
              emissivesThatTouch.push(emissives[torch]);
            }
          }
        }
      }

      return emissivesThatTouch;
    }
  }, {
    key: "computeFowPlane",
    value: function computeFowPlane() {
      var x, y;

      this.fowPlane = [];
      if (!this.isDaytime) {
        // compute the fog of war for light emitting blocks
        for (y = 0; y < this.planeHeight; ++y) {
          for (x = 0; x < this.planeWidth; ++x) {
            this.fowPlane.push({ x: x, y: y, type: "FogOfWar_Center" });
          }
        }

        //second pass for partial lit squares
        this.solveFOWTypeForMap();

        for (y = 0; y < this.planeHeight; ++y) {
          for (x = 0; x < this.planeWidth; ++x) {
            var groundBlock = this.groundPlane.getBlockAt([x, y]);
            var actionBlock = this.actionPlane.getBlockAt([x, y]);

            if (groundBlock.isEmissive && actionBlock.isEmpty || !actionBlock.isEmpty && actionBlock.isEmissive) {
              this.clearFowAround(x, y);
            }
          }
        }
      }
    }
  }, {
    key: "clearFowAround",
    value: function clearFowAround(x, y) {
      var ox, oy;

      for (oy = -1; oy <= 1; ++oy) {
        for (ox = -1; ox <= 1; ++ox) {
          this.clearFowAt(x + ox, y + oy);
        }
      }
    }
  }, {
    key: "clearFowAt",
    value: function clearFowAt(x, y) {
      if (x >= 0 && x < this.planeWidth && y >= 0 && y < this.planeHeight) {
        var blockIndex = this.yToIndex(y) + x;
        this.fowPlane[blockIndex] = "";
      }
    }
  }, {
    key: "clearFow",
    value: function clearFow() {
      for (var x = 0; x < this.planeWidth; x++) {
        for (var y = 0; y < this.planeHeight; y++) {
          var blockIndex = this.yToIndex(y) + x;
          this.fowPlane[blockIndex] = "";
        }
      }
    }
  }, {
    key: "computeShadingPlane",
    value: function computeShadingPlane() {
      this.shadingPlane = [];
      this.computeShading(this.actionPlane);
      this.computeShading(this.groundPlane);
    }
  }, {
    key: "occludedBy",
    value: function occludedBy(block) {
      return block && !block.getIsEmptyOrEntity() && !block.getIsLiquid();
    }
  }, {
    key: "computeShading",
    value: function computeShading(plane) {
      var x, y, index, hasRight;

      for (index = 0; index < this.planeArea(); ++index) {
        x = index % this.planeWidth;
        y = Math.floor(index / this.planeWidth);

        hasRight = false;

        var block = plane.getBlockAt([x, y]);
        var groundBlock = this.groundPlane.getBlockAt([x, y]);
        if (block.isEmpty || block.isTransparent || block.getIsLiquid()) {
          var atlas = 'AO';
          if (block.blockType === 'lava') {
            atlas = 'LavaGlow';
          } else if (block.blockType === 'water') {
            atlas = 'WaterAO';
          }

          if (block === groundBlock || !groundBlock.getIsLiquid()) {
            // Edge of world AO.
            if (y === 0) {
              this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_Bottom' });
            }

            if (y === this.planeHeight - 1) {
              this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_Top' });
            }

            if (x === 0) {
              this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_Right' });
            }

            if (x === this.planeWidth - 1) {
              this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_Left' });
            }
          }

          // Neighbor AO.
          var surrounding = plane.getSurroundingBlocks([x, y]);
          if (x < this.planeWidth - 1 && this.occludedBy(surrounding.east)) {
            // needs a left side AO shadow
            this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_Left' });
          }

          if (x > 0 && this.occludedBy(surrounding.west)) {
            // needs a right side AO shadow
            this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_Right' });

            // Lighting shadows.
            if (!block.getIsLiquid()) {
              this.shadingPlane.push({
                x: x,
                y: y,
                atlas: 'blockShadows',
                type: 'Shadow_Parts_Fade_base.png'
              });

              if (y > 0 && x > 0 && plane.getBlockAt([x - 1, y - 1]).getIsEmptyOrEntity()) {
                this.shadingPlane.push({
                  x: x,
                  y: y,
                  atlas: 'blockShadows',
                  type: 'Shadow_Parts_Fade_top.png'
                });
              }
            }

            hasRight = true;
          }

          if (y > 0 && this.occludedBy(surrounding.north)) {
            // needs a bottom side AO shadow
            this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_Bottom' });
          } else if (y > 0) {
            if (x < this.planeWidth - 1 && this.occludedBy(surrounding.northEast) && !this.occludedBy(surrounding.east)) {
              // needs a bottom left side AO shadow
              this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_BottomLeft' });
            }

            if (!hasRight && x > 0 && this.occludedBy(surrounding.northWest)) {
              // needs a bottom right side AO shadow
              this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_BottomRight' });
            }
          }

          if (y < this.planeHeight - 1 && this.occludedBy(surrounding.south)) {
            // needs a top side AO shadow
            this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_Top' });
          } else if (y < this.planeHeight - 1) {
            if (x < this.planeWidth - 1 && this.occludedBy(surrounding.southEast) && !this.occludedBy(surrounding.east)) {
              // needs a bottom left side AO shadow
              this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_TopLeft' });
            }

            if (!hasRight && x > 0 && this.occludedBy(surrounding.southWest)) {
              // needs a bottom right side AO shadow
              this.shadingPlane.push({ x: x, y: y, atlas: atlas, type: 'AOeffect_TopRight' });
            }
          }
        }
      }
    }
  }]);

  return LevelModel;
})();

},{"../Entities/Agent.js":15,"../Entities/Player.js":22,"./FacingDirection.js":29,"./LevelBlock.js":30,"./LevelPlane.js":33,"./Position.js":35}],33:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LevelBlock = require("./LevelBlock.js");

var _require = require("./FacingDirection.js");

var North = _require.North;
var South = _require.South;
var East = _require.East;
var West = _require.West;
var opposite = _require.opposite;
var turnDirection = _require.turnDirection;
var turn = _require.turn;
var directionToOffset = _require.directionToOffset;
var directionToRelative = _require.directionToRelative;

var Position = require("./Position");
var AdjacencySet = require("./AdjacencySet");

var connectionName = function connectionName(connection) {
  switch (connection) {
    case North:
      return 'North';
    case South:
      return 'South';
    case East:
      return 'East';
    case West:
      return 'West';
    default:
      return '';
  }
};

var RedstoneCircuitConnections = ["", "Vertical", "Vertical", "Vertical", "Horizontal", "UpRight", "DownRight", "TRight", "Horizontal", "UpLeft", "DownLeft", "TLeft", "Horizontal", "TUp", "TDown", "Cross"];

var RailConnectionPriority = [[], [North], [South], [North, South], [East], [North, East], [South, East], [South, East], [West], [North, West], [South, West], [South, West], [East, West], [North, East], [South, East], [North, East]];

var PoweredRailConnectionPriority = [[], [North], [South], [North, South], [East], [East, West], [East, West], [East, West], [West], [East, West], [East, West], [East, West], [East, West], [East, West], [East, West], [East, West]];

module.exports = (function () {
  function LevelPlane(planeData, width, height, levelModel, planeType) {
    _classCallCheck(this, LevelPlane);

    this._data = [];
    this.width = width;
    this.height = height;
    this.levelModel = levelModel;
    this.planeType = planeType;
    this.playPistonOn = false;
    this.playPistonOff = false;

    for (var index = 0; index < planeData.length; ++index) {
      var block = new LevelBlock(planeData[index]);
      this._data.push(block);
    }

    if (this.isActionPlane()) {
      this.redstoneAdjacencySet = this.createRedstoneAdjacencySet();
    }
  }

  /**
  * Determines whether the position in question is within the bounds of the plane.
  */

  _createClass(LevelPlane, [{
    key: "inBounds",
    value: function inBounds(position) {
      var _position = _slicedToArray(position, 2);

      var x = _position[0];
      var y = _position[1];

      return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
    * Converts coordinates to a index
    */
  }, {
    key: "coordinatesToIndex",
    value: function coordinatesToIndex(position) {
      return position[1] * this.width + position[0];
    }

    /**
    * Determines the positional coordinates given a specific index.
    */
  }, {
    key: "indexToCoordinates",
    value: function indexToCoordinates(index) {
      var y = Math.floor(index / this.width);
      var x = index - y * this.width;
      return [x, y];
    }

    /**
     * Retrieve all the [x, y] coordinates within this plane
     *
     * @return {[Number, Number][]}
     */
  }, {
    key: "getAllPositions",
    value: function getAllPositions() {
      var _this = this;

      return this._data.map(function (_, i) {
        return _this.indexToCoordinates(i);
      });
    }

    /**
     * Gets the block at the desired position within the plane, optionally with an
     * offset
     *
     * @param {Position} position - [x, y] coordinates of block
     *
     * @return {LevelBlock}
     */
  }, {
    key: "getBlockAt",
    value: function getBlockAt(position) {
      if (this.inBounds(position)) {
        return this._data[this.coordinatesToIndex(position)];
      }
    }
  }, {
    key: "isActionPlane",
    value: function isActionPlane() {
      return this.planeType === "actionPlane";
    }
  }, {
    key: "isDecorationPlane",
    value: function isDecorationPlane() {
      return this.planeType === "decorationPlane";
    }
  }, {
    key: "isGroundPlane",
    value: function isGroundPlane() {
      return this.planeType === "groundPlane";
    }

    /**
     * Changes the block at a desired position to the desired block.
     * Important note: This is the cornerstone of block placing/destroying.
     */
  }, {
    key: "setBlockAt",
    value: function setBlockAt(position, block) {
      var _this2 = this;

      if (!this.inBounds(position)) {
        return;
      }
      this._data[this.coordinatesToIndex(position)] = block;

      if (this.isActionPlane()) {

        if (block.isRedstone || block.isRedstoneBattery) {
          this.redstoneAdjacencySet.add(position);
        } else {
          this.redstoneAdjacencySet.remove(position);
        }

        var redstoneToRefresh = [];
        if (block.needToRefreshRedstone()) {
          redstoneToRefresh = this.refreshRedstone();
        }

        this.updateWeakCharge(position, block);

        // if we've just removed a block, clean up any rail connections that were
        // formerly connected to this block
        if (block.isEmpty) {
          [North, South, East, West].forEach(function (direction) {
            // if the block in the given cardinal direction is a rail block with a
            // connection to this one, sever that connection
            var offset = directionToOffset(direction);
            var adjacentBlock = _this2.getBlockAt(Position.add(position, offset));
            if (adjacentBlock && adjacentBlock.isRail) {
              if (adjacentBlock.connectionA === opposite(direction)) {
                adjacentBlock.connectionA = undefined;
              }
              if (adjacentBlock.connectionB === opposite(direction)) {
                adjacentBlock.connectionB = undefined;
              }
            }
          });
        }
        this.determineRailType(position, true);

        if (this.levelModel && this.levelModel.controller.levelView) {
          var northEast = Position.north(Position.east(position));
          var southWest = Position.south(Position.west(position));
          var positionAndTouching = Position.getOrthogonalPositions(position).concat([position, northEast, southWest]);
          this.levelModel.controller.levelView.refreshActionGroup(positionAndTouching);
          this.levelModel.controller.levelView.refreshActionGroup(redstoneToRefresh);
        }
      } else if (this.isGroundPlane()) {
        this.levelModel.controller.levelView.refreshGroundGroup();
      }

      return block;
    }

    /**
    * Gets the blocks within orthogonal positions around a given position.
    * Important note: This DOES to bounds checking. Will be undefined if OOB.
    */
  }, {
    key: "getOrthogonalBlocks",
    value: function getOrthogonalBlocks(position) {
      return {
        north: { block: this.getBlockAt(Position.north(position)), relative: South },
        south: { block: this.getBlockAt(Position.south(position)), relative: North },
        east: { block: this.getBlockAt(Position.east(position)), relative: West },
        west: { block: this.getBlockAt(Position.west(position)), relative: East }
      };
    }

    /**
     * Gets the blocks surrounding a given position.
     * Important note: This DOES to bounds checking. Will be undefined if OOB.
     */
  }, {
    key: "getSurroundingBlocks",
    value: function getSurroundingBlocks(position) {
      return {
        north: this.getBlockAt(Position.add(position, [0, -1])),
        northEast: this.getBlockAt(Position.add(position, [1, -1])),
        east: this.getBlockAt(Position.add(position, [1, 0])),
        southEast: this.getBlockAt(Position.add(position, [1, 1])),
        south: this.getBlockAt(Position.add(position, [0, 1])),
        southWest: this.getBlockAt(Position.add(position, [-1, 1])),
        west: this.getBlockAt(Position.add(position, [-1, 0])),
        northWest: this.getBlockAt(Position.add(position, [-1, -1]))
      };
    }

    /**
    * Gets the mask of the orthogonal indices around the given position.
    */
  }, {
    key: "getOrthogonalMask",
    value: function getOrthogonalMask(position, comparator) {
      var orthogonal = this.getOrthogonalBlocks(position);
      return (comparator(orthogonal.north) << 0) + (comparator(orthogonal.south) << 1) + (comparator(orthogonal.east) << 2) + (comparator(orthogonal.west) << 3);
    }
  }, {
    key: "getMinecartTrack",
    value: function getMinecartTrack(position, facing) {
      var block = this.getBlockAt(position);

      if (!block.isRail) {
        return;
      }

      var speed = 300;

      if (block.connectionA === facing || block.connectionB === facing) {
        return ["", Position.forward(position, facing), facing, speed];
      }

      var incomming = opposite(facing);
      if (block.connectionA === incomming && block.connectionB !== undefined) {
        var rotation = turnDirection(facing, block.connectionB);
        var newFacing = turn(facing, rotation);
        return ["turn_" + rotation, position, newFacing, speed];
      }
      if (block.connectionB === incomming && block.connectionA !== undefined) {
        var rotation = turnDirection(facing, block.connectionA);
        var newFacing = turn(facing, rotation);
        return ["turn_" + rotation, position, newFacing, speed];
      }
    }

    /**
     * Determine whether or not the blocks at the given positions are powered
     * rails that are connected to each other.
     *
     * @param {Posititon} left
     * @param {Posititon} right
     * @return {boolean}
     */
  }, {
    key: "getPoweredRailsConnected",
    value: function getPoweredRailsConnected(left, right) {
      // return early if the positions are not even adjacent
      if (!Position.isAdjacent(left, right)) {
        return false;
      }

      var leftBlock = this.getBlockAt(left);
      var rightBlock = this.getBlockAt(right);

      // to be connected, both blocks must be powerable rails
      if (!(leftBlock.getIsPowerableRail() && rightBlock.getIsPowerableRail())) {
        return false;
      }

      // to be connected, both blocks must be oriented either North/South or
      // East/West
      if (leftBlock.getIsHorizontal() && rightBlock.getIsHorizontal()) {
        return Position.equals(Position.forward(left, East), right) || Position.equals(Position.forward(left, West), right);
      } else if (leftBlock.getIsVertical() && rightBlock.getIsVertical()) {
        return Position.equals(Position.forward(left, North), right) || Position.equals(Position.forward(left, South), right);
      } else {
        return false;
      }
    }

    /**
     * Propagate power to (and orient) all redstone wire in the level
     */
  }, {
    key: "powerRedstone",
    value: function powerRedstone() {
      var _this3 = this;

      // redstone charge propagation
      this.redstoneAdjacencySet.sets.forEach(function (set) {
        var somePower = set.some(function (position) {
          return _this3.getBlockAt(position).isRedstoneBattery;
        });

        set.forEach(function (position) {
          _this3.getBlockAt(position).isPowered = somePower;
          _this3.determineRedstoneSprite(position);
        });
      });

      return this.redstoneAdjacencySet.flattenSets();
    }
  }, {
    key: "createRedstoneAdjacencySet",
    value: function createRedstoneAdjacencySet() {
      var _this4 = this;

      var redstonePositions = this.getAllPositions().filter(function (position) {
        var block = _this4.getBlockAt(position);
        return block.isRedstone || block.isRedstoneBattery;
      });

      return new AdjacencySet(redstonePositions);
    }

    /**
     * Propagate power to (and orient) all powerable rails in the level.
     */
  }, {
    key: "powerRails",
    value: function powerRails() {
      var _this5 = this;

      // find all rails that can be powered
      var powerableRails = this.getAllPositions().filter(function (position) {
        return _this5.getBlockAt(position).getIsPowerableRail();
      });

      // update powerable rails once to set their orientations
      powerableRails.forEach(function (position) {
        _this5.determineRailType(position);
      });

      // propagate power
      new AdjacencySet(powerableRails, this.getPoweredRailsConnected.bind(this)).sets.forEach(function (set) {
        // each set of connected rails should be entirely powered if any of them
        // is powered
        var somePower = set.some(function (position) {
          return _this5.getBlockAt(position).isPowered;
        });

        if (somePower) {
          set.forEach(function (position) {
            _this5.getBlockAt(position).isPowered = true;
          });
        }
      });

      // update all rails again to set their power state
      powerableRails.forEach(function (position) {
        _this5.determineRailType(position);
      });

      return powerableRails;
    }

    /**
     * Determines which rail object should be placed given the context of surrounding
     * indices.
     */
  }, {
    key: "determineRailType",
    value: function determineRailType(position) {
      var _this6 = this;

      var updateTouching = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var block = this.getBlockAt(position);

      if (!block || !block.isRail) {
        return;
      }

      var powerState = '';
      var priority = RailConnectionPriority;
      if (block.getIsPowerableRail()) {
        powerState = block.isPowered ? 'Powered' : 'Unpowered';
        priority = PoweredRailConnectionPriority;
      }

      if (block.connectionA === undefined || block.connectionB === undefined) {
        var mask = this.getOrthogonalMask(position, function (_ref) {
          var block = _ref.block;
          var relative = _ref.relative;

          if (!block || !block.isRail) {
            return false;
          }
          var a = block.connectionA === undefined || block.connectionA === relative;
          var b = block.connectionB === undefined || block.connectionB === relative;

          return a || b;
        });

        // Look up what type of connection to create, based on the surrounding tracks.

        var _priority$mask = _slicedToArray(priority[mask], 2);

        block.connectionA = _priority$mask[0];
        block.connectionB = _priority$mask[1];
      }

      var variant = connectionName(block.connectionA) + connectionName(block.connectionB);
      block.blockType = "rails" + powerState + variant;

      if (updateTouching) {
        Position.getOrthogonalPositions(position).forEach(function (orthogonalPosition) {
          _this6.determineRailType(orthogonalPosition);
        });
      }
    }

    /**
    * Determines which redstoneWire variant should be placed given the context of
    * surrounding indices and Powered state.
    */
  }, {
    key: "determineRedstoneSprite",
    value: function determineRedstoneSprite(position) {
      var block = this.getBlockAt(position);

      if (!block || !block.isRedstone) {
        return;
      }

      var mask = this.getOrthogonalMask(position, function (_ref2) {
        var block = _ref2.block;

        return block && (block.isRedstone || block.isConnectedToRedstone);
      });

      var variant = RedstoneCircuitConnections[mask];
      var powerState = block.isPowered ? 'On' : '';
      block.blockType = "redstoneWire" + variant + powerState;

      return "redstoneWire" + variant;
    }

    /**
     * Updates the state and sprites of all redstoneWire on the plane.
     * Important note: This is what kicks off redstone charge propagation and is called
     * on place/destroy/run/load.... wherever updating charge is important.
     */
  }, {
    key: "refreshRedstone",
    value: function refreshRedstone() {
      var _this7 = this;

      // power redstone
      var redstonePositions = this.powerRedstone();

      // power all blocks powered by redstone
      this.powerAllBlocks();

      // power rails powered by redstone
      var powerableRails = this.powerRails();
      var posToRefresh = redstonePositions.concat(powerableRails);

      // Once we're done updating redstoneWire states, check to see if doors and pistons should open/close.
      this.getAllPositions().forEach(function (position) {
        _this7.getIronDoors(position);
        _this7.getPistonState(position);
      });
      this.playPistonSound();
      return posToRefresh;
    }
  }, {
    key: "playPistonSound",
    value: function playPistonSound() {
      if (!this.levelModel) {
        return;
      }
      if (this.playPistonOn) {
        this.levelModel.controller.audioPlayer.play("pistonOut");
      } else if (this.playPistonOff) {
        this.levelModel.controller.audioPlayer.play("pistonIn");
      }
      this.playPistonOn = false;
      this.playPistonOff = false;
    }
  }, {
    key: "checkEntityConflict",
    value: function checkEntityConflict(position) {
      var _this8 = this;

      if (!this.levelModel) {
        return;
      }
      var captureReturn = false;
      this.levelModel.controller.levelEntity.entityMap.forEach(function (workingEntity) {
        if (_this8.levelModel.controller.positionEquivalence(position, workingEntity.position)) {
          captureReturn = true;
        }
      });
      return captureReturn;
    }

    /**
    * Evaluates what state Iron Doors on the map should be in.
    */
  }, {
    key: "getIronDoors",
    value: function getIronDoors(position) {
      var block = this.getBlockAt(position);
      var index = this.coordinatesToIndex(position);

      if (block.blockType === "doorIron") {
        block.isPowered = this.powerCheck(position, true);
        if (block.isPowered && !block.isOpen) {
          block.isOpen = true;
          if (this.levelModel) {
            this.levelModel.controller.levelView.animateDoor(index, true);
          }
        } else if (!block.isPowered && block.isOpen) {
          if (this.levelModel) {
            if (!this.checkEntityConflict(position)) {
              block.isOpen = false;
              this.levelModel.controller.levelView.animateDoor(index, false);
            }
          }
        }
      }
    }

    /**
    * Evaluates what state Pistons on the map should be in.
    */
  }, {
    key: "getPistonState",
    value: function getPistonState(position) {
      var block = this.getBlockAt(position);

      if (block.getIsPiston() && !block.getIsPistonArm()) {
        block.isPowered = this.powerCheck(position, true);
        if (block.isPowered) {
          this.activatePiston(position);
        } else if (!block.isPowered) {
          this.deactivatePiston(position);
        }
        if (this.levelModel) {
          this.levelModel.controller.updateFowPlane();
          this.levelModel.controller.updateShadingPlane();
        }
      }
    }

    /**
    * Find all iron doors in a level and evaluate if they need to be animated based on state
    */
  }, {
    key: "findDoorToAnimate",
    value: function findDoorToAnimate(positionInQuestion) {
      var _this9 = this;

      this.getAllPositions().forEach(function (position) {
        var block = _this9.getBlockAt(position);
        var index = _this9.coordinatesToIndex(position);

        if (block.blockType === "doorIron" && position !== positionInQuestion) {
          block.isPowered = _this9.powerCheck(position, true);
          if (block.isPowered && !block.isOpen) {
            block.isOpen = true;
            if (_this9.levelModel) {
              _this9.levelModel.controller.levelView.animateDoor(index, true);
            }
          } else if (!block.isPowered && block.isOpen && !_this9.checkEntityConflict(position)) {
            block.isOpen = false;
            if (_this9.levelModel) {
              _this9.levelModel.controller.levelView.animateDoor(index, false);
            }
          }
        }
      });
    }

    /**
     * Activates a piston at a given position to push blocks away from it
     * depending on type.
     */
  }, {
    key: "activatePiston",
    value: function activatePiston(position) {
      var block = this.getBlockAt(position);

      var pistonType = block.blockType;
      if (block.getIsStickyPiston()) {
        pistonType = pistonType.substring(0, pistonType.length - 6);
      }
      var checkOn = pistonType.substring(pistonType.length - 2, pistonType.length);
      if (checkOn === "On") {
        pistonType = pistonType.substring(0, pistonType.length - 2);
      }

      var direction = block.getPistonDirection();
      var armType = "pistonArm" + directionToRelative(direction);

      var offset = directionToOffset(direction);
      var pos = Position.forward(position, direction);
      var workingNeighbor = this.getBlockAt(pos);

      if (this.pistonArmBlocked(position, offset)) {
        return;
      }
      // Break an object right in front of the piston.
      if (workingNeighbor.isDestroyableUponPush()) {
        this.setBlockAt(pos, new LevelBlock(""));
        this.playPistonOn = true;
        if (this.levelModel) {
          this.levelModel.controller.levelView.playExplosionAnimation(pos, 2, pos, workingNeighbor.blockType, null, null, this.player);
        }
      } else if (workingNeighbor.blockType !== "" && !workingNeighbor.getIsPistonArm()) {
        // We've actually got something to push.
        var blocksPositions = this.getBlocksToPush(pos, offset);
        var concat = "On";
        if (block.getIsStickyPiston()) {
          concat += "Sticky";
        }
        var onPiston = new LevelBlock(pistonType += concat);
        this.setBlockAt(position, onPiston);
        this.pushBlocks(blocksPositions, offset);
        this.playPistonOn = true;
      } else if (workingNeighbor.blockType === "") {
        // Nothing to push, so just make the arm.
        var concat = "On";
        if (block.getIsStickyPiston()) {
          concat += "Sticky";
          armType += "Sticky";
        }
        var armBlock = new LevelBlock(armType);
        var pistonBlock = new LevelBlock(pistonType += concat);
        this.setBlockAt(pos, armBlock);
        this.setBlockAt(position, pistonBlock);
        this.playPistonOn = true;
      }
    }
  }, {
    key: "pistonArmBlocked",
    value: function pistonArmBlocked(position, offset) {
      var workingPosition = Position.add(position, offset);
      return this.checkEntityConflict(workingPosition);
    }

    /**
     * Deactivates a piston at a given position by determining what the arm
     * orientation is.
     */
  }, {
    key: "deactivatePiston",
    value: function deactivatePiston(position) {
      var block = this.getBlockAt(position);
      if (!block.getIsPiston() || !block.blockType.match("On")) {
        return;
      }

      var direction = block.getPistonDirection();
      if (direction !== undefined) {
        this.retractArm(Position.forward(position, direction), position);
      }
    }

    /**
    * Does the actual retraction of the arm of a piston.
    */
  }, {
    key: "retractArm",
    value: function retractArm(armPosition, pistonPosition) {
      var emptyBlock = new LevelBlock("");
      var pistonType = this.getBlockAt(pistonPosition);
      var concat = "";
      var blockType = "";
      if (this.getBlockAt(pistonPosition).getIsStickyPiston()) {
        concat = "Sticky";
        blockType = pistonType.blockType.substring(0, pistonType.blockType.length - 8);
      } else {
        blockType = pistonType.blockType.substring(0, pistonType.blockType.length - 2);
      }
      var newPistonType = blockType + concat;
      var offPiston = new LevelBlock(newPistonType);
      if (this.getBlockAt(armPosition).getIsPistonArm()) {
        if (this.getBlockAt(pistonPosition).getIsStickyPiston()) {
          var offset = directionToOffset(pistonType.getPistonDirection());
          var stuckBlockPosition = Position.add(armPosition, offset);
          if (this.inBounds(stuckBlockPosition) && this.getBlockAt(stuckBlockPosition).isStickable) {
            this.setBlockAt(armPosition, this.getBlockAt(stuckBlockPosition));
            this.setBlockAt(stuckBlockPosition, emptyBlock);
          } else {
            this.setBlockAt(armPosition, emptyBlock);
            this.playPistonOff = true;
          }
        } else {
          this.setBlockAt(armPosition, emptyBlock);
          this.playPistonOff = true;
        }
      }
      this.setBlockAt(pistonPosition, offPiston);
    }

    /**
     * Goes through a list of blocks and shuffles them over 1 index in a given direction.
     *
     * @param {Position[]} blocksPositions
     * @param {Position} [offset=[0, 0]]
     */
  }, {
    key: "pushBlocks",
    value: function pushBlocks(blocksPositions) {
      var offset = arguments.length <= 1 || arguments[1] === undefined ? [0, 0] : arguments[1];

      var pistonType = "";
      var redo = false;
      if (offset[0] === 1) {
        pistonType = "pistonArmRight";
      } else if (offset[0] === -1) {
        pistonType = "pistonArmLeft";
      } else {
        if (offset[1] === 1) {
          pistonType = "pistonArmDown";
        } else if (offset[1] === -1) {
          pistonType = "pistonArmUp";
        } else {
          // There is no offset, so we're not putting down anything.
        }
      }
      var armBlock = new LevelBlock(pistonType);
      for (var i = blocksPositions.length - 1; i >= 0; --i) {
        var destination = Position.add(blocksPositions[i], offset);
        var block = this.getBlockAt(blocksPositions[i]);
        if (this.inBounds(destination) && this.getBlockAt(destination).isDestroyableUponPush()) {
          if (this.levelModel) {
            this.levelModel.controller.levelView.playExplosionAnimation(destination, 2, destination, block.blockType, null, null, this.player);
          }
          redo = true;
        }
        this.setBlockAt(destination, this.getBlockAt(blocksPositions[i]));
        if (i === 0) {
          this.setBlockAt(blocksPositions[i], armBlock);
        }
      }
      if (redo) {
        this.refreshRedstone();
      }
    }

    /**
     * Returns a list of blocks in a given direction to be shuffled over later.
     * @param {Position} position
     * @param {Position} [offset=[0, 0]]
     */
  }, {
    key: "getBlocksToPush",
    value: function getBlocksToPush(position) {
      var offset = arguments.length <= 1 || arguments[1] === undefined ? [0, 0] : arguments[1];

      var pushingBlocks = [];
      var workingPosition = position;
      while (this.inBounds(workingPosition) && this.getBlockAt(workingPosition).getIsPushable()) {
        pushingBlocks.push(workingPosition);
        workingPosition = Position.add(workingPosition, offset);
      }
      return pushingBlocks;
    }

    /**
    * Checking power state for objects that are powered by redstone.
    */
  }, {
    key: "powerCheck",
    value: function powerCheck(position) {
      var _this10 = this;

      var canReadCharge = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return Position.getOrthogonalPositions(position).some(function (orthogonalPosition) {
        var block = _this10.getBlockAt(orthogonalPosition);
        if (block) {
          if (!block.isWeaklyPowerable) {
            return false;
          }
          if (_this10.getBlockAt(position).getIsPiston()) {
            var piston = _this10.getBlockAt(position);
            var ignoreThisSide = directionToOffset(piston.getPistonDirection()) || [0, 0];
            var posCheck = Position.add(position, ignoreThisSide);
            if (Position.equals(orthogonalPosition, posCheck)) {
              return false;
            }
          }
          if (canReadCharge) {
            return block.isPowered || block.isRedstoneBattery;
          }
          return block.isRedstone && block.isPowered || block.isRedstoneBattery;
        }
      });
    }
  }, {
    key: "powerAllBlocks",
    value: function powerAllBlocks() {
      var _this11 = this;

      this.getAllPositions().forEach(function (position) {
        var block = _this11.getBlockAt(position);
        if (block.blockType !== "" && block.canHoldCharge()) {
          block.isPowered = _this11.powerCheck(position);
        }
      });
    }
  }, {
    key: "updateWeakCharge",
    value: function updateWeakCharge(position, block) {
      var _this12 = this;

      if (block.isWeaklyPowerable) {
        block.isPowered = this.powerCheck(position);
      }
      if (block.isPowered) {
        Position.getOrthogonalPositions(position).forEach(function (workingPos) {
          if (_this12.inBounds(workingPos)) {
            _this12.getIronDoors(workingPos);
            _this12.getPistonState(workingPos);
          }
        });
      }
    }
  }]);

  return LevelPlane;
})();

},{"./AdjacencySet":27,"./FacingDirection.js":29,"./LevelBlock.js":30,"./Position":35}],34:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LevelBlock = require("./LevelBlock.js");
var FacingDirection = require("./FacingDirection.js");
var Position = require("./Position.js");
var createEvent = require("../../utils").createEvent;
var randomInt = require("./Utils").randomInt;

module.exports = (function () {
  function LevelView(controller) {
    _classCallCheck(this, LevelView);

    this.controller = controller;
    this.audioPlayer = controller.audioPlayer;
    this.game = controller.game;

    this.baseShading = null;

    this.player = null;
    this.agent = null;
    this.selectionIndicator = null;

    this.groundGroup = null;
    this.shadingGroup = null;
    this.actionGroup = null;
    this.fluffGroup = null;
    this.fowGroup = null;
    this.collectibleItems = [];
    //{sprite : sprite, type : blockType, position : [x,y]}
    this.trees = [];

    this.miniBlocks = {
      "dirt": ["Miniblocks", 0, 5],
      "dirtCoarse": ["Miniblocks", 6, 11],
      "sand": ["Miniblocks", 12, 17],
      "gravel": ["Miniblocks", 18, 23],
      "bricks": ["Miniblocks", 24, 29],
      "logAcacia": ["Miniblocks", 30, 35],
      "logBirch": ["Miniblocks", 36, 41],
      "logJungle": ["Miniblocks", 42, 47],
      "logOak": ["Miniblocks", 48, 53],
      "logSpruce": ["Miniblocks", 54, 59],
      "logSpruceSnowy": ["Miniblocks", 54, 59],
      "planksAcacia": ["Miniblocks", 60, 65],
      "planksBirch": ["Miniblocks", 66, 71],
      "planksJungle": ["Miniblocks", 72, 77],
      "planksOak": ["Miniblocks", 78, 83],
      "planksSpruce": ["Miniblocks", 84, 89],
      "cobblestone": ["Miniblocks", 90, 95],
      "sandstone": ["Miniblocks", 96, 101],
      "wool": ["Miniblocks", 102, 107],
      "redstoneDust": ["Miniblocks", 108, 113],
      "lapisLazuli": ["Miniblocks", 114, 119],
      "ingotIron": ["Miniblocks", 120, 125],
      "ingotGold": ["Miniblocks", 126, 131],
      "emerald": ["Miniblocks", 132, 137],
      "diamond": ["Miniblocks", 138, 143],
      "coal": ["Miniblocks", 144, 149],
      "bucketWater": ["Miniblocks", 150, 155],
      "bucketLava": ["Miniblocks", 156, 161],
      "gunPowder": ["Miniblocks", 162, 167],
      "wheat": ["Miniblocks", 168, 173],
      "potato": ["Miniblocks", 174, 179],
      "carrots": ["Miniblocks", 180, 185],
      "milk": ["Miniblocks", 186, 191],
      "egg": ["Miniblocks", 192, 197],
      "poppy": ["Miniblocks", 198, 203],
      "daisy": ["Miniblocks", 204, 209],
      "dandelion": ["Miniblocks", 210, 215],
      "bed": ["Miniblocks", 216, 221],
      "cactus": ["Miniblocks", 222, 227],
      "clay": ["Miniblocks", 228, 233],
      "deadbush": ["Miniblocks", 234, 239],
      "doorIron": ["Miniblocks", 240, 245],
      "doorOak": ["Miniblocks", 246, 251],
      "glowstoneDust": ["Miniblocks", 252, 257],
      "hardenedClay": ["Miniblocks", 258, 263],
      "hardenedClayBlack": ["Miniblocks", 264, 269],
      "hardenedClayBlue": ["Miniblocks", 270, 275],
      "hardenedClayBrown": ["Miniblocks", 276, 281],
      "hardenedClayCyan": ["Miniblocks", 282, 287],
      "hardenedClayGray": ["Miniblocks", 288, 293],
      "hardenedClayGreen": ["Miniblocks", 294, 299],
      "hardenedClayLightBlue": ["Miniblocks", 300, 305],
      "hardenedClayLime": ["Miniblocks", 306, 311],
      "hardenedClayMagenta": ["Miniblocks", 312, 317],
      "hardenedClayOrange": ["Miniblocks", 318, 323],
      "hardenedClayPink": ["Miniblocks", 324, 329],
      "hardenedClayPurple": ["Miniblocks", 330, 335],
      "hardenedClayRed": ["Miniblocks", 336, 341],
      "hardenedClaySilver": ["Miniblocks", 342, 347],
      "hardenedClayWhite": ["Miniblocks", 348, 353],
      "hardenedClayYellow": ["Miniblocks", 354, 359],
      "netherbrick": ["Miniblocks", 360, 365],
      "netherrack": ["Miniblocks", 366, 371],
      "obsidian": ["Miniblocks", 372, 377],
      "piston": ["Miniblocks", 378, 383],
      "pressurePlateOak": ["Miniblocks", 384, 389],
      "netherQuartz": ["Miniblocks", 390, 395],
      "railGolden": ["Miniblocks", 396, 401],
      "railNormal": ["Miniblocks", 402, 407],
      "redstoneTorch": ["Miniblocks", 408, 413],
      "reeds": ["Miniblocks", 414, 419],
      "seedsWheat": ["Miniblocks", 420, 425],
      "snow": ["Miniblocks", 426, 431],
      "snowBall": ["Miniblocks", 432, 437],
      "woolBlack": ["Miniblocks", 438, 443],
      "woolBlue": ["Miniblocks", 444, 449],
      "woolBrown": ["Miniblocks", 450, 455],
      "woolCyan": ["Miniblocks", 456, 461],
      "woolGray": ["Miniblocks", 462, 467],
      "woolGreen": ["Miniblocks", 468, 473],
      "woolLightBlue": ["Miniblocks", 474, 479],
      "woolLime": ["Miniblocks", 480, 485],
      "woolMagenta": ["Miniblocks", 486, 491],
      "woolOrange": ["Miniblocks", 492, 497],
      "woolPink": ["Miniblocks", 498, 503],
      "woolLPurple": ["Miniblocks", 504, 509],
      "woolRed": ["Miniblocks", 510, 515],
      "woolSilver": ["Miniblocks", 516, 521],
      "woolYellow": ["Miniblocks", 522, 527],
      "bookEnchanted": ["Miniblocks", 528, 533],
      "bucketEmpty": ["Miniblocks", 534, 539],
      "chest": ["Miniblocks", 540, 545],
      "compass": ["Miniblocks", 546, 551],
      "axeDiamond": ["Miniblocks", 552, 557],
      "pickaxeDiamond": ["Miniblocks", 558, 563],
      "shovelDiamond": ["Miniblocks", 564, 569],
      "flintAndSteel": ["Miniblocks", 570, 575],
      "flint": ["Miniblocks", 576, 581],
      "mapEmpty": ["Miniblocks", 582, 587],
      "minecart": ["Miniblocks", 588, 593],
      "potionBottleDrinkable": ["Miniblocks", 594, 599]
    };

    this.blocks = {
      "bedrock": ["blocks", "Bedrock", -13, 0],
      "bricks": ["blocks", "Bricks", -13, 0],
      "oreCoal": ["blocks", "Coal_Ore", -13, 0],
      "dirtCoarse": ["blocks", "Coarse_Dirt", -13, 0],
      "cobblestone": ["blocks", "Cobblestone", -13, 0],
      "oreDiamond": ["blocks", "Diamond_Ore", -13, 0],
      "dirt": ["blocks", "Dirt", -13, 0],
      "oreEmerald": ["blocks", "Emerald_Ore", -13, 0],
      "farmlandWet": ["blocks", "Farmland_Wet", -13, 0],
      "flowerDandelion": ["blocks", "Flower_Dandelion", -13, 0],
      "flowerOxeeye": ["blocks", "Flower_Oxeeye", -13, 0],
      "flowerRose": ["blocks", "Flower_Rose", -13, 0],
      "glass": ["blocks", "Glass", -13, 0],
      "oreGold": ["blocks", "Gold_Ore", -13, 0],
      "grass": ["blocks", "Grass", -13, 0],
      "gravel": ["blocks", "Gravel", -13, 0],
      "oreIron": ["blocks", "Iron_Ore", -13, 0],
      "oreLapis": ["blocks", "Lapis_Ore", -13, 0],
      "lava": ["blocks", "Lava_0", -13, 0],
      "logAcacia": ["blocks", "Log_Acacia", -13, 0],
      "logBirch": ["blocks", "Log_Birch", -13, 0],
      "logJungle": ["blocks", "Log_Jungle", -13, 0],
      "logOak": ["blocks", "Log_Oak", -13, 0],
      "logSpruce": ["blocks", "Log_Spruce", -13, 0],
      "logSpruceSnowy": ["blocks", "Log_Spruce", -13, 0],
      "obsidian": ["blocks", "Obsidian", -13, 0],
      "planksAcacia": ["blocks", "Planks_Acacia", -13, 0],
      "planksBirch": ["blocks", "Planks_Birch", -13, 0],
      "planksJungle": ["blocks", "Planks_Jungle", -13, 0],
      "planksOak": ["blocks", "Planks_Oak", -13, 0],
      "planksSpruce": ["blocks", "Planks_Spruce", -13, 0],
      "oreRedstone": ["blocks", "Redstone_Ore", -13, 0],
      "sand": ["blocks", "Sand", -13, 0],
      "sandstone": ["blocks", "Sandstone", -13, 0],
      "stone": ["blocks", "Stone", -13, 0],
      "tnt": ["tnt", "TNTexplosion0", -80, -58],
      "water": ["blocks", "Water_0", -13, 0],
      "wool": ["blocks", "Wool_White", -13, 0],
      "wool_orange": ["blocks", "Wool_Orange", -13, 0],
      "wool_black": ["blocks", "Wool_Black", -13, 0],
      "wool_blue": ["blocks", "Wool_Blue", -13, 0],
      "wool_brown": ["blocks", "Wool_Brown", -13, 0],
      "wool_cyan": ["blocks", "Wool_Cyan", -13, 0],
      "wool_gray": ["blocks", "Wool_Gray", -13, 0],
      "wool_green": ["blocks", "Wool_Green", -13, 0],
      "wool_light_blue": ["blocks", "Wool_LightBlue", -13, 0],
      "wool_lime": ["blocks", "Wool_Lime", -13, 0],
      "wool_magenta": ["blocks", "Wool_Magenta", -13, 0],
      "wool_pink": ["blocks", "Wool_Pink", -13, 0],
      "wool_purple": ["blocks", "Wool_Purple", -13, 0],
      "wool_red": ["blocks", "Wool_Red", -13, 0],
      "wool_silver": ["blocks", "Wool_Silver", -13, 0],
      "wool_yellow": ["blocks", "Wool_Yellow", -13, 0],

      "leavesAcacia": ["leavesAcacia", "Leaves_Acacia0.png", -100, 0],
      "leavesBirch": ["leavesBirch", "Leaves_Birch0.png", -100, 0],
      "leavesJungle": ["leavesJungle", "Leaves_Jungle0.png", -100, 0],
      "leavesOak": ["leavesOak", "Leaves_Oak0.png", -100, 0],
      "leavesSpruce": ["leavesSpruce", "Leaves_Spruce0.png", -100, 0],
      "leavesSpruceSnowy": ["leavesSpruceSnowy", "Leaves_SpruceSnowy0.png", -100, 36],

      "watering": ["blocks", "Water_0", -13, 0],
      "cropWheat": ["blocks", "Wheat0", -13, 0],
      "torch": ["torch", "Torch0", -13, 0],

      "tallGrass": ["tallGrass", "", -13, 0],

      "lavaPop": ["lavaPop", "LavaPop01", -13, 0],
      "redstoneSparkle": ["redstoneSparkle", "redstone_sparkle1.png", 7, 23],
      "fire": ["fire", "", -11, 135],
      "bubbles": ["bubbles", "", -11, 135],
      "explosion": ["explosion", "", -70, 60],

      "door": ["door", "", -12, -15],
      "doorIron": ["doorIron", "", -12, -15],

      "rails": ["blocks", "Rails_Vertical", -13, -0],
      "railsNorthEast": ["blocks", "Rails_BottomLeft", -13, 0],
      "railsNorthWest": ["blocks", "Rails_BottomRight", -13, 0],
      "railsEast": ["blocks", "Rails_Horizontal", -13, 0],
      "railsWest": ["blocks", "Rails_Horizontal", -13, 0],
      "railsEastWest": ["blocks", "Rails_Horizontal", -13, 0],
      "railsSouthEast": ["blocks", "Rails_TopLeft", -13, 0],
      "railsSouthWest": ["blocks", "Rails_TopRight", -13, 0],
      "railsNorth": ["blocks", "Rails_Vertical", -13, -0],
      "railsSouth": ["blocks", "Rails_Vertical", -13, -0],
      "railsNorthSouth": ["blocks", "Rails_Vertical", -13, -0],

      "railsUnpowered": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsUnpoweredNorth": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsUnpoweredSouth": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsUnpoweredNorthSouth": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsUnpoweredEast": ["blocks", "Rails_UnpoweredHorizontal", -13, 0],
      "railsUnpoweredWest": ["blocks", "Rails_UnpoweredHorizontal", -13, 0],
      "railsUnpoweredEastWest": ["blocks", "Rails_UnpoweredHorizontal", -13, 0],

      "railsPowered": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsPoweredNorth": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsPoweredSouth": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsPoweredNorthSouth": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsPoweredEast": ["blocks", "Rails_PoweredHorizontal", -13, 0],
      "railsPoweredWest": ["blocks", "Rails_PoweredHorizontal", -13, 0],
      "railsPoweredEastWest": ["blocks", "Rails_PoweredHorizontal", -13, 0],

      "railsRedstoneTorch": ["blocks", "Rails_RedstoneTorch", -12, 9],

      "redstoneWire": ["blocks", "redstone_dust_dot_off", -13, 0],
      "redstoneWireHorizontal": ["blocks", "redstone_dust_line_h_off", -13, 0],
      "redstoneWireVertical": ["blocks", "redstone_dust_line_v_off", -13, 0],
      "redstoneWireUpRight": ["blocks", "redstone_dust_corner_BottomLeft_off", -13, 0],
      "redstoneWireUpLeft": ["blocks", "redstone_dust_corner_BottomRight_off", -13, 0],
      "redstoneWireDownRight": ["blocks", "redstone_dust_corner_TopLeft_off", -13, 0],
      "redstoneWireDownLeft": ["blocks", "redstone_dust_corner_TopRight_off", -13, 0],
      "redstoneWireTUp": ["blocks", "redstone_dust_cross_up_off", -13, 0],
      "redstoneWireTDown": ["blocks", "redstone_dust_cross_down_off", -13, 0],
      "redstoneWireTLeft": ["blocks", "redstone_dust_cross_left_off", -13, 0],
      "redstoneWireTRight": ["blocks", "redstone_dust_cross_right_off", -13, 0],
      "redstoneWireCross": ["blocks", "redstone_dust_cross_off", -13, 0],

      "redstoneWireOn": ["blocks", "redstone_dust_dot", -13, 0],
      "redstoneWireHorizontalOn": ["blocks", "redstone_dust_line_h", -13, 0],
      "redstoneWireVerticalOn": ["blocks", "redstone_dust_line_v", -13, 0],
      "redstoneWireUpRightOn": ["blocks", "redstone_dust_corner_BottomLeft", -13, 0],
      "redstoneWireUpLeftOn": ["blocks", "redstone_dust_corner_BottomRight", -13, 0],
      "redstoneWireDownRightOn": ["blocks", "redstone_dust_corner_TopLeft", -13, 0],
      "redstoneWireDownLeftOn": ["blocks", "redstone_dust_corner_TopRight", -13, 0],
      "redstoneWireTUpOn": ["blocks", "redstone_dust_cross_up", -13, 0],
      "redstoneWireTDownOn": ["blocks", "redstone_dust_cross_down", -13, 0],
      "redstoneWireTLeftOn": ["blocks", "redstone_dust_cross_left", -13, 0],
      "redstoneWireTRightOn": ["blocks", "redstone_dust_cross_right", -13, 0],
      "redstoneWireCrossOn": ["blocks", "redstone_dust_cross", -13, 0],

      "pressurePlateUp": ["blocks", "PressurePlate_Up", -13, 0],
      "pressurePlateDown": ["blocks", "PressurePlate_Down", -13, 0],

      "pistonUp": ["blocks", "piston_up", -13, 0],
      "pistonDown": ["blocks", "piston_down", -13, 0],
      "pistonLeft": ["blocks", "piston_left", -13, 0],
      "pistonRight": ["blocks", "piston_right", -13, 0],
      "pistonUpOn": ["blocks", "piston_base_up", -26, -13],
      "pistonDownOn": ["blocks", "piston_base_down", -26, -13],
      "pistonLeftOn": ["blocks", "piston_base_left", -26, -13],
      "pistonRightOn": ["blocks", "piston_base_right", -26, -13],

      "pistonArmLeft": ["blocks", "piston_arm_left", -26, -13],
      "pistonArmRight": ["blocks", "piston_arm_right", -26, -13],
      "pistonArmUp": ["blocks", "piston_arm_up", -26, -13],
      "pistonArmDown": ["blocks", "piston_arm_down", -26, -13],

      "pistonUpSticky": ["blocks", "piston_up", -13, 0],
      "pistonDownSticky": ["blocks", "piston_down_sticky", -13, 0],
      "pistonLeftSticky": ["blocks", "piston_left", -13, 0],
      "pistonRightSticky": ["blocks", "piston_right", -13, 0],
      "pistonUpOnSticky": ["blocks", "piston_base_up", -26, -13],
      "pistonDownOnSticky": ["blocks", "piston_base_down_sticky", -26, -13],
      "pistonLeftOnSticky": ["blocks", "piston_base_left", -26, -13],
      "pistonRightOnSticky": ["blocks", "piston_base_right", -26, -13],

      "pistonArmLeftSticky": ["blocks", "piston_arm_left", -26, -13],
      "pistonArmRightSticky": ["blocks", "piston_arm_right", -26, -13],
      "pistonArmUpSticky": ["blocks", "piston_arm_up", -26, -13],
      "pistonArmDownSticky": ["blocks", "piston_arm_down_sticky", -26, -13],

      "cactus": ["blocks", "cactus", -13, 0],
      "deadBush": ["blocks", "dead_bush", -13, 0],
      "glowstone": ["blocks", "glowstone", -13, 0],
      "grassPath": ["blocks", "grass_path", -13, 0],
      "ice": ["blocks", "ice", -13, 0],
      "netherrack": ["blocks", "netherrack", -13, 0],
      "netherBrick": ["blocks", "nether_brick", -13, 0],
      "quartzOre": ["blocks", "quartz_ore", -13, 0],
      "snow": ["blocks", "snow", -13, 0],
      "snowyGrass": ["blocks", "snowy_grass", -13, 0],
      "topSnow": ["blocks", "top_snow", -13, 0],

      "Nether_Portal": ["blocks", "Nether_Portal0", 0, -58],

      //hooking up all old blocks that we had assets for but never used in previous years
      "bedFoot": ["blocks", "Bed_Foot", -13, 0],
      "bedHead": ["blocks", "Bed_Head", -13, 10],
      "clay": ["blocks", "Clay", -13, 0],
      "glassBlack": ["blocks", "Glass_Black", -13, 0],
      "glassBlue": ["blocks", "Glass_Blue", -13, 0],
      "glassBrown": ["blocks", "Glass_Brown", -13, 0],
      "glassCyan": ["blocks", "Glass_Cyan", -13, 0],
      "glassGray": ["blocks", "Glass_Gray", -13, 0],
      "glassGreen": ["blocks", "Glass_Green", -13, 0],
      "glassLightBlue": ["blocks", "Glass_LightBlue", -13, 0],
      "glassLime": ["blocks", "Glass_Lime", -13, 0],
      "glassMagenta": ["blocks", "Glass_Magenta", -13, 0],
      "glassOrange": ["blocks", "Glass_Orange", -13, 0],
      "glassPink": ["blocks", "Glass_Pink", -13, 0],
      "glassPurple": ["blocks", "Glass_Purple", -13, 0],
      "glassRed": ["blocks", "Glass_Red", -13, 0],
      "glassSilver": ["blocks", "Glass_Silver", -13, 0],
      "glassWhite": ["blocks", "Glass_White", -13, 0],
      "glassYellow": ["blocks", "Glass_Yellow", -13, 0],
      "terracotta": ["blocks", "Terracotta", -13, 0],
      "terracottaBlack": ["blocks", "Terracotta_Black", -13, 0],
      "terracottaBlue": ["blocks", "Terracotta_Blue", -13, 0],
      "terracottaBrown": ["blocks", "Terracotta_Brown", -13, 0],
      "terracottaCyan": ["blocks", "Terracotta_Cyan", -13, 0],
      "terracottaGray": ["blocks", "Terracotta_Gray", -13, 0],
      "terracottaGreen": ["blocks", "Terracotta_Green", -13, 0],
      "terracottaLightBlue": ["blocks", "Terracotta_LightBlue", -13, 0],
      "terracottaLime": ["blocks", "Terracotta_Lime", -13, 0],
      "terracottaMagenta": ["blocks", "Terracotta_Magenta", -13, 0],
      "terracottaOrange": ["blocks", "Terracotta_Orange", -13, 0],
      "terracottaPink": ["blocks", "Terracotta_Pink", -13, 0],
      "terracottaPurple": ["blocks", "Terracotta_Purple", -13, 0],
      "terracottaRed": ["blocks", "Terracotta_Red", -13, 0],
      "terracottaSilver": ["blocks", "Terracotta_Silver", -13, 0],
      "terracottaWhite": ["blocks", "Terracotta_White", -13, 0],
      "terracottaYellow": ["blocks", "Terracotta_Yellow", -13, 0],

      "invisible": ["blocks", "Invisible", 0, 0]
    };
    this.actionPlaneBlocks = [];
    this.toDestroy = [];
    this.resettableTweens = [];
    this.treeFluffTypes = {

      "treeAcacia": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2]],
      "treeBirch": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2], [0, -3]],
      "treeJungle": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2], [0, -3], [1, -3]],
      "treeOak": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [0, -3]],
      "treeSpruce": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2], [0, -3]],
      "treeSpruceSnowy": [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1], [-1, -2], [0, -2], [1, -2], [0, -3]]
    };
  }

  _createClass(LevelView, [{
    key: "yToIndex",
    value: function yToIndex(y) {
      return this.controller.levelModel.yToIndex(y);
    }
  }, {
    key: "create",
    value: function create(levelModel) {
      this.createGroups();
      this.reset(levelModel);
    }
  }, {
    key: "resetEntity",
    value: function resetEntity(entity) {
      this.preparePlayerSprite(entity.name, entity);
      entity.sprite.animations.stop();
      this.setPlayerPosition(entity.position[0], entity.position[1], entity.isOnBlock, entity);
      if (entity.shouldUpdateSelectionIndicator()) {
        this.setSelectionIndicatorPosition(entity.position[0], entity.position[1]);
        this.selectionIndicator.visible = true;
      }
      this.playIdleAnimation(entity.position, entity.facing, entity.isOnBlock, entity);
    }
  }, {
    key: "reset",
    value: function reset(levelModel) {
      this.player = levelModel.player;
      this.agent = levelModel.agent;

      this.resettableTweens.forEach(function (tween) {
        tween.stop(false);
      });
      this.resettableTweens.length = 0;
      this.collectibleItems = [];
      this.trees = [];

      this.resetGroups(levelModel);

      if (levelModel.usePlayer) {
        this.resetEntity(this.player);

        if (levelModel.usingAgent) {
          this.resetEntity(this.agent);
        }
      }

      this.updateShadingGroup(levelModel.shadingPlane);
      this.updateFowGroup(levelModel.fowPlane);

      if (this.controller.followingPlayer()) {
        this.game.world.setBounds(0, 0, levelModel.planeWidth * 40, levelModel.planeHeight * 40);
        this.game.camera.follow(this.player.sprite);
        this.game.world.scale.x = 1;
        this.game.world.scale.y = 1;
      } else {
        this.game.world.setBounds(0, 0, 400, 400);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var i;

      for (i = 0; i < this.toDestroy.length; ++i) {
        this.toDestroy[i].destroy();
      }
      this.toDestroy = [];
    }
  }, {
    key: "render",
    value: function render() {
      this.actionGroup.sort('sortOrder');
      this.fluffGroup.sort('z');
    }
  }, {
    key: "scaleShowWholeWorld",
    value: function scaleShowWholeWorld(completionHandler) {
      var _controller$scaleFromOriginal = this.controller.scaleFromOriginal();

      var _controller$scaleFromOriginal2 = _slicedToArray(_controller$scaleFromOriginal, 2);

      var scaleX = _controller$scaleFromOriginal2[0];
      var scaleY = _controller$scaleFromOriginal2[1];

      var scaleTween = this.addResettableTween(this.game.world.scale).to({
        x: 1 / scaleX,
        y: 1 / scaleY
      }, 1000, Phaser.Easing.Exponential.Out);

      this.game.camera.unfollow();

      var positionTween = this.addResettableTween(this.game.camera).to({
        x: 0,
        y: 0
      }, 1000, Phaser.Easing.Exponential.Out);

      scaleTween.onComplete.addOnce(function () {
        completionHandler();
      });

      positionTween.start();
      scaleTween.start();
    }
  }, {
    key: "getDirectionName",
    value: function getDirectionName(facing) {
      return "_" + FacingDirection.directionToRelative(facing).toLowerCase();
    }
  }, {
    key: "updatePlayerDirection",
    value: function updatePlayerDirection(position, facing) {
      var direction = this.getDirectionName(facing);

      this.setSelectionIndicatorPosition(position[0], position[1]);
      this.playScaledSpeed(this.player.sprite.animations, "idle" + direction);
    }

    // animations

  }, {
    key: "playDoorAnimation",
    value: function playDoorAnimation(position, open, completionHandler) {
      var blockIndex = this.yToIndex(position[1]) + position[0];
      var block = this.actionPlaneBlocks[blockIndex];
      var animationName = open ? "open" : "close";
      var animation = this.playScaledSpeed(block.animations, animationName);
      this.onAnimationEnd(animation, function () {
        animation.updateCurrentFrame();
        completionHandler();
      });
    }
  }, {
    key: "playPlayerAnimation",
    value: function playPlayerAnimation(animationName, position, facing) {
      var isOnBlock = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      var entity = arguments.length <= 4 || arguments[4] === undefined ? this.player : arguments[4];

      var direction = this.getDirectionName(facing);
      entity.sprite.sortOrder = this.yToIndex(position[1]) + entity.getSortOrderOffset();

      var animName = animationName + direction;
      return this.playScaledSpeed(entity.sprite.animations, animName);
    }
  }, {
    key: "playIdleAnimation",
    value: function playIdleAnimation(position, facing, isOnBlock) {
      var entity = arguments.length <= 3 || arguments[3] === undefined ? this.player : arguments[3];

      this.playPlayerAnimation("idle", position, facing, isOnBlock, entity);
    }
  }, {
    key: "playSuccessAnimation",
    value: function playSuccessAnimation(position, facing, isOnBlock, completionHandler) {
      var _this = this;

      var entity = arguments.length <= 4 || arguments[4] === undefined ? this.player : arguments[4];

      this.controller.delayBy(250, function () {
        _this.audioPlayer.play("success");
        _this.onAnimationEnd(_this.playPlayerAnimation("celebrate", position, facing, isOnBlock, entity), function () {
          completionHandler();
        });
      });
    }
  }, {
    key: "playFailureAnimation",
    value: function playFailureAnimation(position, facing, isOnBlock, completionHandler) {
      var _this2 = this;

      var entity = arguments.length <= 4 || arguments[4] === undefined ? this.player : arguments[4];

      this.controller.delayBy(500, function () {
        _this2.audioPlayer.play("failure");
        _this2.onAnimationEnd(_this2.playPlayerAnimation("fail", position, facing, isOnBlock, entity), function () {
          _this2.controller.delayBy(800, completionHandler);
        });
      });
    }
  }, {
    key: "playBumpAnimation",
    value: function playBumpAnimation(position, facing, isOnBlock) {
      var _this3 = this;

      var entity = arguments.length <= 3 || arguments[3] === undefined ? this.player : arguments[3];

      var animation = this.playPlayerAnimation("bump", position, facing, isOnBlock, entity);
      animation.onComplete.add(function () {
        _this3.playIdleAnimation(position, facing, isOnBlock, entity);
      });
      return animation;
    }
  }, {
    key: "playDrownFailureAnimation",
    value: function playDrownFailureAnimation(position, facing, isOnBlock, completionHandler) {
      var sprite, tween;

      this.playPlayerAnimation("fail", position, facing, isOnBlock);
      this.createBlock(this.fluffGroup, position[0], position[1], "bubbles");

      sprite = this.fluffGroup.create(0, 0, "finishOverlay");

      var _controller$scaleFromOriginal3 = this.controller.scaleFromOriginal();

      var _controller$scaleFromOriginal32 = _slicedToArray(_controller$scaleFromOriginal3, 2);

      var scaleX = _controller$scaleFromOriginal32[0];
      var scaleY = _controller$scaleFromOriginal32[1];

      sprite.scale.x = scaleX;
      sprite.scale.y = scaleY;
      sprite.alpha = 0;
      sprite.tint = 0x324bff;

      tween = this.addResettableTween(sprite).to({
        alpha: 0.5
      }, 200, Phaser.Easing.Linear.None);

      tween.onComplete.add(function () {
        completionHandler();
      });

      tween.start();
    }
  }, {
    key: "playBurnInLavaAnimation",
    value: function playBurnInLavaAnimation(position, facing, isOnBlock, completionHandler) {
      var sprite, tween;

      this.playPlayerAnimation("jumpUp", position, facing, isOnBlock);
      this.createBlock(this.fluffGroup, position[0], position[1], "fire");

      sprite = this.fluffGroup.create(0, 0, "finishOverlay");

      var _controller$scaleFromOriginal4 = this.controller.scaleFromOriginal();

      var _controller$scaleFromOriginal42 = _slicedToArray(_controller$scaleFromOriginal4, 2);

      var scaleX = _controller$scaleFromOriginal42[0];
      var scaleY = _controller$scaleFromOriginal42[1];

      sprite.scale.x = scaleX;
      sprite.scale.y = scaleY;
      sprite.alpha = 0;
      sprite.tint = 0xd1580d;

      tween = this.addResettableTween(sprite).to({
        alpha: 0.5
      }, 200, Phaser.Easing.Linear.None);

      tween.onComplete.add(function () {
        completionHandler();
      });

      tween.start();
    }
  }, {
    key: "playDestroyTntAnimation",
    value: function playDestroyTntAnimation(position, facing, isOnBlock, tntArray, newShadingPlaneData, completionHandler) {
      var _this4 = this;

      var block, lastAnimation;
      if (tntArray.length === 0) {
        completionHandler();
        return;
      }

      this.audioPlayer.play("fuse");
      for (var tnt in tntArray) {
        block = this.actionPlaneBlocks[this.coordinatesToIndex(tntArray[tnt])];
        lastAnimation = this.playScaledSpeed(block.animations, "explode");
      }

      this.onAnimationEnd(lastAnimation, function () {
        _this4.audioPlayer.play("explode");
        completionHandler();
      });
    }
  }, {
    key: "playCreeperExplodeAnimation",
    value: function playCreeperExplodeAnimation(position, facing, destroyPosition, isOnBlock, completionHandler) {
      var _this5 = this;

      this.controller.delayBy(180, function () {
        //this.onAnimationLoopOnce(
        _this5.playPlayerAnimation("bump", position, facing, false).onComplete.add(function () {
          //add creeper windup sound
          _this5.audioPlayer.play("fuse");
          _this5.playExplodingCreeperAnimation(position, facing, destroyPosition, isOnBlock, completionHandler, _this5);

          _this5.controller.delayBy(200, function () {
            _this5.onAnimationLoopOnce(_this5.playPlayerAnimation("jumpUp", position, facing, false), function () {
              _this5.playIdleAnimation(position, facing, isOnBlock);
            });
          });
        });
      });
    }

    // flash
  }, {
    key: "flashEntity",
    value: function flashEntity(entity) {
      return this.flashSpriteToWhite(entity.sprite);
    }
  }, {
    key: "flashBlock",
    value: function flashBlock(position) {
      var blockIndex = this.yToIndex(position[1]) + position[0];
      var block = this.actionPlaneBlocks[blockIndex];
      return this.flashSpriteToWhite(block);
    }
  }, {
    key: "flashSpriteToWhite",
    value: function flashSpriteToWhite(sprite) {
      var fillBmd = this.game.add.bitmapData(sprite.width, sprite.height);
      fillBmd.fill(0xFF, 0xFF, 0xFF, 0xFF);
      var maskedBmd = this.game.add.bitmapData(sprite.width, sprite.height);

      var srcRect = { x: 0, y: 0, width: sprite.width, height: sprite.height };
      var dstRect = { x: 0, y: 0, width: sprite.texture.crop.width, height: sprite.texture.crop.height };
      maskedBmd.alphaMask(fillBmd, sprite, srcRect, dstRect);

      var flashSprite = sprite.addChild(this.game.make.sprite(0, 0, maskedBmd.texture));
      flashSprite.alpha = 0;
      var fadeMs = 60;
      var pauseMs = fadeMs * 4;
      var totalIterations = 3;
      var totalDuration = 0;
      var aIn = { alpha: 1.0 };
      var aOut = { alpha: 0.0 };
      var fadeIn = this.game.add.tween(flashSprite).to(aIn, fadeMs, Phaser.Easing.Linear.None);
      var fadeOut = this.game.add.tween(flashSprite).to(aOut, fadeMs, Phaser.Easing.Linear.None);
      totalDuration = fadeMs * 2;
      fadeIn.chain(fadeOut);
      var lastStep = fadeOut;

      for (var i = 0; i < totalIterations - 1; i++) {
        var innerPause = this.game.add.tween(flashSprite).to(aOut, pauseMs, Phaser.Easing.Linear.None);
        var innerFadeIn = this.game.add.tween(flashSprite).to(aIn, fadeMs, Phaser.Easing.Linear.None);
        var innerFadeOut = this.game.add.tween(flashSprite).to(aOut, fadeMs, Phaser.Easing.Linear.None);
        totalDuration += pauseMs + fadeMs * 2;
        lastStep.chain(innerPause);
        innerPause.chain(innerFadeIn);
        innerFadeIn.chain(innerFadeOut);
        lastStep = innerFadeOut;
      }

      lastStep.onComplete.add(function () {
        flashSprite.destroy();
      });

      fadeIn.start();

      return totalDuration * 2;
    }
  }, {
    key: "playExplodingCreeperAnimation",
    value: function playExplodingCreeperAnimation(position, facing, destroyPosition, isOnBlock, completionHandler) {
      var _this6 = this;

      var blockIndex = this.yToIndex(destroyPosition[1]) + destroyPosition[0];
      var blockToExplode = this.actionPlaneBlocks[blockIndex];

      var creeperExplodeAnimation = blockToExplode.animations.getAnimation("explode");
      creeperExplodeAnimation.onComplete.add(function () {
        blockToExplode.kill();
        _this6.playExplosionAnimation(position, facing, destroyPosition, isOnBlock, function () {
          _this6.controller.delayBy(100, function () {
            _this6.playFailureAnimation(position, facing, false, completionHandler);
          });
        }, false);
        _this6.audioPlayer.play("explode");
        _this6.playExplosionCloudAnimation(destroyPosition);
      });

      creeperExplodeAnimation.play();
    }
  }, {
    key: "playExplosionCloudAnimation",
    value: function playExplosionCloudAnimation(position) {
      this.createBlock(this.fluffGroup, position[0], position[1], "explosion");
    }
  }, {
    key: "coordinatesToIndex",
    value: function coordinatesToIndex(coordinates) {
      return this.yToIndex(coordinates[1]) + coordinates[0];
    }
  }, {
    key: "playMinecartTurnAnimation",
    value: function playMinecartTurnAnimation(position, isUp, isOnBlock, completionHandler, turnDirection) {
      var facing = isUp ? FacingDirection.North : FacingDirection.South;
      var animation = this.playPlayerAnimation("mineCart_turn" + turnDirection, position, facing, false);
      return animation;
    }
  }, {
    key: "playMinecartMoveForwardAnimation",
    value: function playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed) {
      var tween;

      //if we loop the sfx that might be better?
      this.audioPlayer.play("minecart");
      this.playPlayerAnimation("mineCart", position, facing, false);
      tween = this.addResettableTween(this.player.sprite).to(this.positionToScreen(nextPosition), speed, Phaser.Easing.Linear.None);
      tween.start();
      this.player.sprite.sortOrder = this.yToIndex(nextPosition[1]) + 10;

      return tween;
    }
  }, {
    key: "playMinecartAnimation",
    value: function playMinecartAnimation(isOnBlock, completionHandler) {
      var _this7 = this;

      //start at 3,2
      this.setPlayerPosition(3, 2, isOnBlock);
      var position = [3, 2];
      this.player.facing = 2;

      var animation = this.playLevelEndAnimation(position, this.player.facing, isOnBlock, completionHandler, false);
      this.game.world.setBounds(0, 0, 440, 400);
      this.game.camera.follow(this.player.sprite);

      animation.onComplete.add(function () {
        _this7.playTrack(position, _this7.player.facing, isOnBlock, _this7.player, completionHandler);
      });
    }
  }, {
    key: "playTrack",
    value: function playTrack(position, facing, isOnBlock, entity, completionHandler) {
      var _this8 = this;

      if (entity === undefined) entity = this.player;

      entity.onTracks = true;

      // Need to get track on current position to avoid mishandling immediate turns
      var track = this.controller.levelModel.actionPlane.getMinecartTrack(position, facing);

      var nextPos = Position.forward(entity.position, facing);

      if (entity.getOffTrack || !track && !this.isFirstTimeOnRails(position, nextPos)) {
        entity.getOffTrack = false;
        entity.onTracks = false;
        if (completionHandler) {
          completionHandler();
        }
        return;
      }

      // If track is undefined, it means the player was not on a rail
      // but if we reached this, that means we're trying to get on a rail for the first time
      // and we need to grab that track -in front of us-
      if (track === undefined) {
        track = this.controller.levelModel.actionPlane.getMinecartTrack(nextPos, facing);
        // Having a weird bug on publish where rail destruction while riding causes a destructure of
        // non-iterable instance error. If getTrack fails with currPos and nextPos, just call the whole thing off.
        // so that we don't reach the const assignment below.
        if (track === undefined) {
          entity.getOffTrack = false;
          entity.onTracks = false;
          if (completionHandler) {
            completionHandler();
          }
          return;
        }
      }

      var direction = undefined;
      var _track = track;

      var _track2 = _slicedToArray(_track, 4);

      var arraydirection = _track2[0];
      var nextPosition = _track2[1];
      var nextFacing = _track2[2];
      var speed = _track2[3];

      this.player.position = nextPosition;

      //turn
      if (arraydirection.substring(0, 4) === "turn") {
        direction = arraydirection.substring(5);
        var isUp = facing === FacingDirection.North || nextFacing === FacingDirection.North;
        this.onAnimationEnd(this.playMinecartTurnAnimation(position, isUp, isOnBlock, completionHandler, direction), function () {
          _this8.playTrack(nextPosition, nextFacing, isOnBlock, entity, completionHandler);
        });
      } else {
        this.onAnimationEnd(this.playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed), function () {
          _this8.playTrack(nextPosition, nextFacing, isOnBlock, entity, completionHandler);
        });
      }
    }

    /**
    * Handling the first case of walking onto a track while not currently on one
    */
  }, {
    key: "isFirstTimeOnRails",
    value: function isFirstTimeOnRails(currPos, nextPos) {
      var nextBlock = this.controller.levelModel.actionPlane.getBlockAt(nextPos);
      var currBlock = this.controller.levelModel.actionPlane.getBlockAt(currPos);
      if (!currBlock.isRail && nextBlock.isRail) {
        return true;
      }
      return false;
    }
  }, {
    key: "addHouseBed",
    value: function addHouseBed(bottomCoordinates) {
      //Temporary, will be replaced by bed blocks
      var bedTopCoordinate = bottomCoordinates[1] - 1;
      var sprite = this.actionGroup.create(38 * bottomCoordinates[0], 35 * bedTopCoordinate, "bed");
      sprite.sortOrder = this.yToIndex(bottomCoordinates[1]);
    }
  }, {
    key: "addDoor",
    value: function addDoor(coordinates) {
      var sprite;
      var toDestroy = this.actionPlaneBlocks[this.coordinatesToIndex(coordinates)];
      this.createActionPlaneBlock(coordinates, "door");
      //Need to grab the correct blocktype from the action layer
      //And use that type block to create the ground block under the door
      sprite = this.createBlock(this.groundGroup, coordinates[0], coordinates[1], "wool_orange");
      toDestroy.kill();
      sprite.sortOrder = this.yToIndex(6);
    }
  }, {
    key: "playSuccessHouseBuiltAnimation",
    value: function playSuccessHouseBuiltAnimation(position, facing, isOnBlock, createFloor, houseObjectPositions, completionHandler, updateScreen) {
      var _this9 = this;

      //fade screen to white
      //Add house blocks
      //fade out of white
      //Play success animation on player.
      var tweenToW = this.playLevelEndAnimation(position, facing, isOnBlock, function () {
        _this9.controller.delayBy(4000, completionHandler);
      }, true);
      tweenToW.onComplete.add(function () {
        _this9.audioPlayer.play("houseSuccess");
        //Change house ground to floor
        var xCoord;
        var yCoord;
        var sprite;

        for (var i = 0; i < createFloor.length; ++i) {
          xCoord = createFloor[i][1];
          yCoord = createFloor[i][2];
          /*this.groundGroup._data[this.coordinatesToIndex([xCoord,yCoord])].kill();*/
          sprite = _this9.createBlock(_this9.groundGroup, xCoord, yCoord, "wool_orange");
          sprite.sortOrder = _this9.yToIndex(yCoord);
        }

        _this9.addHouseBed(houseObjectPositions[0]);
        _this9.addDoor(houseObjectPositions[1]);
        _this9.groundGroup.sort('sortOrder');
        updateScreen();
      });
    }

    //Tweens in and then out of white. returns the tween to white for adding callbacks
  }, {
    key: "playLevelEndAnimation",
    value: function playLevelEndAnimation(position, facing, isOnBlock, completionHandler, playSuccessAnimation) {
      var _this10 = this;

      var sprite, tweenToW, tweenWToC;

      sprite = this.fluffGroup.create(0, 0, "finishOverlay");

      var _controller$scaleFromOriginal5 = this.controller.scaleFromOriginal();

      var _controller$scaleFromOriginal52 = _slicedToArray(_controller$scaleFromOriginal5, 2);

      var scaleX = _controller$scaleFromOriginal52[0];
      var scaleY = _controller$scaleFromOriginal52[1];

      sprite.scale.x = scaleX;
      sprite.scale.y = scaleY;
      sprite.alpha = 0;

      tweenToW = this.tweenToWhite(sprite);
      tweenWToC = this.tweenFromWhiteToClear(sprite);

      tweenToW.onComplete.add(function () {
        _this10.selectionIndicator.visible = false;
        _this10.setPlayerPosition(position[0], position[1], isOnBlock);
        tweenWToC.start();
      });
      if (playSuccessAnimation) {
        tweenWToC.onComplete.add(function () {
          _this10.playSuccessAnimation(position, facing, isOnBlock, completionHandler);
        });
      }
      tweenToW.start();

      return tweenToW;
    }
  }, {
    key: "tweenFromWhiteToClear",
    value: function tweenFromWhiteToClear(sprite) {
      var tweenWhiteToClear;

      tweenWhiteToClear = this.addResettableTween(sprite).to({
        alpha: 0.0
      }, 700, Phaser.Easing.Linear.None);
      return tweenWhiteToClear;
    }
  }, {
    key: "tweenToWhite",
    value: function tweenToWhite(sprite) {
      var tweenToWhite;

      tweenToWhite = this.addResettableTween(sprite).to({
        alpha: 1.0
      }, 300, Phaser.Easing.Linear.None);
      return tweenToWhite;
    }
  }, {
    key: "playBlockSound",
    value: function playBlockSound(groundType) {
      var oreString = groundType.substring(0, 3);
      if (groundType === "water" || groundType === "lava") {
        return;
      }
      if (groundType === "stone" || groundType === "cobblestone" || groundType === "bedrock" || oreString === "ore" || groundType === "bricks") {
        this.audioPlayer.play("stepStone");
      } else if (groundType === "grass" || groundType === "dirt" || groundType === "dirtCoarse" || groundType === "wool_orange" || groundType === "wool") {
        this.audioPlayer.play("stepGrass");
      } else if (groundType === "gravel") {
        this.audioPlayer.play("stepGravel");
      } else if (groundType === "farmlandWet") {
        this.audioPlayer.play("stepFarmland");
      } else {
        this.audioPlayer.play("stepWood");
      }
    }

    /**
     * Play the MoveForward animation for the given entity. Note that both
     * MoveForward and MoveBackward are implemented using the same walk
     * animations, and the only difference between the two is the logic they use
     * for moving north after placing a block
     *
     * @see LevelView.playWalkAnimation
     */
  }, {
    key: "playMoveForwardAnimation",
    value: function playMoveForwardAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, completionHandler) {
      // make sure to render high for when moving north after placing a block
      var targetYIndex = entity.position[1] + (facing === FacingDirection.North ? 1 : 0);
      this.playWalkAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, targetYIndex, completionHandler);
    }

    /**
     * @see LevelView.playMoveForwardAnimation
     */
  }, {
    key: "playMoveBackwardAnimation",
    value: function playMoveBackwardAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, completionHandler) {
      // make sure to render high for when moving north after placing a block
      var targetYIndex = entity.position[1] + (facing === FacingDirection.South ? 1 : 0);
      this.playWalkAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, targetYIndex, completionHandler);
    }
  }, {
    key: "playWalkAnimation",
    value: function playWalkAnimation(entity, oldPosition, facing, shouldJumpDown, isOnBlock, groundType, targetYIndex, completionHandler) {
      var _this11 = this;

      var tween = undefined;
      var position = entity.position;

      //stepping on stone sfx
      this.playBlockSound(groundType);

      if (entity.shouldUpdateSelectionIndicator()) {
        this.setSelectionIndicatorPosition(position[0], position[1]);
      }

      if (!shouldJumpDown) {
        var animName = 'walk' + this.getDirectionName(facing);
        this.playScaledSpeed(entity.sprite.animations, animName);
        tween = this.addResettableTween(entity.sprite).to(this.positionToScreen(position, isOnBlock, entity), 180, Phaser.Easing.Linear.None);
      } else {
        tween = this.playPlayerJumpDownVerticalAnimation(facing, position, oldPosition);
      }

      // Update the sort order 3/4 of the way through the animation
      tween.onUpdateCallback(function (tween, percent) {
        if (percent >= 0.75) {
          entity.sprite.sortOrder = _this11.yToIndex(targetYIndex) + entity.getSortOrderOffset();
          tween.onUpdateCallback(null);
        }
      });

      tween.onComplete.add(function () {
        completionHandler();
      });

      tween.start();
    }

    /**
     * Animate the player jumping down from on top of a block to ground level.
     * @param {FacingDirection} facing
     * @param {Array<int>}position
     * @param {?Array<int>} oldPosition
     * @return {Phaser.Tween}
     */
  }, {
    key: "playPlayerJumpDownVerticalAnimation",
    value: function playPlayerJumpDownVerticalAnimation(facing, position) {
      var oldPosition = arguments.length <= 2 || arguments[2] === undefined ? position : arguments[2];
      return (function () {
        var _this12 = this;

        var animName = "jumpDown" + this.getDirectionName(facing);
        this.playScaledSpeed(this.player.sprite.animations, animName);

        var start = this.positionToScreen(oldPosition);
        var end = this.positionToScreen(position);
        var tween = this.addResettableTween(this.player.sprite).to({
          x: [start.x, end.x, end.x],
          y: [start.y, end.y - 50, end.y]
        }, 300, Phaser.Easing.Linear.None).interpolation(function (v, k) {
          return Phaser.Math.bezierInterpolation(v, k);
        });
        tween.onComplete.addOnce(function () {
          _this12.audioPlayer.play("fall");
        });
        tween.start();

        return tween;
      }).apply(this, arguments);
    }
  }, {
    key: "playPlaceBlockAnimation",
    value: function playPlaceBlockAnimation(position, facing, blockType, blockTypeAtPosition, entity, completionHandler) {
      var _this13 = this;

      var jumpAnimName;
      var blockIndex = this.yToIndex(position[1]) + position[0];

      if (entity.shouldUpdateSelectionIndicator()) {
        this.setSelectionIndicatorPosition(position[0], position[1]);
      }

      if (entity === this.agent || LevelBlock.isWalkable(blockType)) {
        var signalDetacher = this.playPlayerAnimation("punch", position, facing, false, entity).onComplete.add(function () {
          signalDetacher.detach();
          completionHandler();
        });
      } else {
        this.audioPlayer.play("placeBlock");

        var direction = this.getDirectionName(facing);

        jumpAnimName = "jumpUp" + direction;

        if (blockTypeAtPosition !== "") {
          this.playExplosionAnimation(position, facing, position, blockTypeAtPosition, function () {}, false);
        }

        this.playScaledSpeed(this.player.sprite.animations, jumpAnimName);
        var placementTween = this.addResettableTween(this.player.sprite).to({
          y: -55 + 40 * position[1]
        }, 125, Phaser.Easing.Cubic.EaseOut);

        placementTween.onComplete.addOnce(function () {
          placementTween = null;

          if (blockTypeAtPosition !== "") {
            _this13.actionPlaneBlocks[blockIndex].kill();
          }
          completionHandler();
        });
        placementTween.start();
      }
    }
  }, {
    key: "playPlaceBlockInFrontAnimation",
    value: function playPlaceBlockInFrontAnimation(entity, playerPosition, facing, blockPosition, completionHandler) {
      if (entity === undefined) entity = this.player;

      this.setSelectionIndicatorPosition(blockPosition[0], blockPosition[1]);

      this.playPlayerAnimation("punch", playerPosition, facing, false, entity).onComplete.addOnce(function () {
        completionHandler();
      });
    }
  }, {
    key: "correctForShadowOverlay",
    value: function correctForShadowOverlay(blockType, sprite) {
      if (blockType.startsWith("piston")) {
        sprite.sortOrder -= 0.1;
      }
    }
  }, {
    key: "createActionPlaneBlock",
    value: function createActionPlaneBlock(position, blockType) {
      var block = new LevelBlock(blockType);
      var blockIndex = this.yToIndex(position[1]) + position[0];

      // Remove the old sprite at this position, if there is one.
      this.actionGroup.remove(this.actionPlaneBlocks[blockIndex]);
      this.groundGroup.remove(this.actionPlaneBlocks[blockIndex]);

      if (block.isEmpty) {
        this.actionPlaneBlocks[blockIndex] = null;
        return;
      }

      // Create a new sprite.
      var sprite = undefined;
      if (block.getIsMiniblock()) {
        // miniblocks defined on the action plane like this should have a
        // closer collectible range and a narrower drop offset than normal
        sprite = this.createMiniBlock(position[0], position[1], blockType, {
          collectibleDistance: 1,
          xOffsetRange: 10,
          yOffsetRange: 10
        });
      } else {
        var group = block.shouldRenderOnGroundPlane() ? this.groundGroup : this.actionGroup;
        var offset = block.shouldRenderOnGroundPlane() ? -0.5 : 0;
        sprite = this.createBlock(group, position[0], position[1] + offset, blockType);
      }

      if (sprite) {
        sprite.sortOrder = this.yToIndex(position[1]);
        this.correctForShadowOverlay(blockType, sprite);
      }

      this.actionPlaneBlocks[blockIndex] = sprite;
    }
  }, {
    key: "playShearAnimation",
    value: function playShearAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
      var _this14 = this;

      var blockIndex = this.yToIndex(destroyPosition[1]) + destroyPosition[0];
      var blockToShear = this.actionPlaneBlocks[blockIndex];

      blockToShear.animations.stop(null, true);
      this.onAnimationLoopOnce(this.playScaledSpeed(blockToShear.animations, "used"), function () {
        _this14.playScaledSpeed(blockToShear.animations, "face");
      });

      this.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
    }
  }, {
    key: "playShearSheepAnimation",
    value: function playShearSheepAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
      var _this15 = this;

      this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);

      this.onAnimationEnd(this.playPlayerAnimation("punch", playerPosition, facing, false), function () {
        var blockIndex = _this15.yToIndex(destroyPosition[1]) + destroyPosition[0];
        var blockToShear = _this15.actionPlaneBlocks[blockIndex];

        blockToShear.animations.stop(null, true);
        _this15.onAnimationLoopOnce(_this15.playScaledSpeed(blockToShear.animations, "used"), function () {
          _this15.playScaledSpeed(blockToShear.animations, "face");
        });

        _this15.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
      });
    }
  }, {
    key: "destroyBlockWithoutPlayerInteraction",
    value: function destroyBlockWithoutPlayerInteraction(destroyPosition) {
      var _this16 = this;

      var blockIndex = this.yToIndex(destroyPosition[1]) + destroyPosition[0];
      var blockToDestroy = this.actionPlaneBlocks[blockIndex];

      var destroyOverlay = this.actionGroup.create(-12 + 40 * destroyPosition[0], -22 + 40 * destroyPosition[1], "destroyOverlay", "destroy1");
      destroyOverlay.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
      this.onAnimationEnd(destroyOverlay.animations.add("destroy", Phaser.Animation.generateFrameNames("destroy", 1, 12, "", 0), 30, false), function () {
        _this16.actionPlaneBlocks[blockIndex] = null;

        if (blockToDestroy.hasOwnProperty("onBlockDestroy")) {
          blockToDestroy.onBlockDestroy(blockToDestroy);
        }

        blockToDestroy.kill();
        destroyOverlay.kill();
        _this16.toDestroy.push(blockToDestroy);
        _this16.toDestroy.push(destroyOverlay);
        _this16.audioPlayer.play('dig_wood1');
      });

      this.playScaledSpeed(destroyOverlay.animations, "destroy");
    }
  }, {
    key: "playDestroyBlockAnimation",
    value: function playDestroyBlockAnimation(playerPosition, facing, destroyPosition, blockType, entity, completionHandler) {
      if (entity.shouldUpdateSelectionIndicator()) {
        this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);
      }

      var playerAnimation = undefined;
      if (entity === this.agent) {
        playerAnimation = "punchDestroy";
      } else {
        playerAnimation = blockType.match(/(ore|stone|clay|bricks|bedrock)/) ? "mine" : "punchDestroy";
      }
      this.playPlayerAnimation(playerAnimation, playerPosition, facing, false, entity);
      this.playMiningParticlesAnimation(facing, destroyPosition);
      this.playBlockDestroyOverlayAnimation(playerPosition, facing, destroyPosition, blockType, entity, completionHandler);
    }
  }, {
    key: "playPunchDestroyAirAnimation",
    value: function playPunchDestroyAirAnimation(playerPosition, facing, destroyPosition, completionHandler) {
      var entity = arguments.length <= 4 || arguments[4] === undefined ? this.player : arguments[4];

      this.playPunchAnimation(playerPosition, facing, destroyPosition, "punchDestroy", completionHandler, entity);
    }
  }, {
    key: "playPunchAirAnimation",
    value: function playPunchAirAnimation(playerPosition, facing, destroyPosition, completionHandler) {
      var entity = arguments.length <= 4 || arguments[4] === undefined ? this.player : arguments[4];

      this.playPunchAnimation(playerPosition, facing, destroyPosition, "punch", completionHandler, entity);
    }
  }, {
    key: "playPunchAnimation",
    value: function playPunchAnimation(playerPosition, facing, destroyPosition, animationType, completionHandler) {
      var entity = arguments.length <= 5 || arguments[5] === undefined ? this.player : arguments[5];

      if (entity.shouldUpdateSelectionIndicator()) {
        this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);
      }
      this.onAnimationEnd(this.playPlayerAnimation(animationType, playerPosition, facing, false, entity), function () {
        completionHandler();
      });
    }

    /**
     * Play the block Destroy Overlay animation. As a side effect, also actually
     * destroy the block in the level model, update the visualization, and play
     * the block Explision animation.
     *
     * Note that if the block is of a type that does not require an overlay
     * animation, this method (confusingly) simply calls the side effects
     * immediately.
     */
  }, {
    key: "playBlockDestroyOverlayAnimation",
    value: function playBlockDestroyOverlayAnimation(playerPosition, facing, destroyPosition, blockType, entity, completionHandler) {
      var _this17 = this;

      var blockIndex = this.yToIndex(destroyPosition[1]) + destroyPosition[0];
      var blockToDestroy = this.actionPlaneBlocks[blockIndex];

      var afterDestroy = function afterDestroy() {
        if (blockToDestroy.hasOwnProperty("onBlockDestroy")) {
          blockToDestroy.onBlockDestroy(blockToDestroy);
        }

        _this17.controller.levelModel.destroyBlockForward(entity);
        _this17.controller.updateShadingPlane();
        _this17.controller.updateFowPlane();

        if (entity.shouldUpdateSelectionIndicator()) {
          _this17.setSelectionIndicatorPosition(playerPosition[0], playerPosition[1]);
        }

        _this17.audioPlayer.play('dig_wood1');
        _this17.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true, entity);
      };

      if (LevelBlock.skipsDestructionOverlay(blockType)) {
        // "flat" blocks are by definition not cube shaped and so shouldn't accept
        // the cube-shaped destroy overlay animation. In this case, destroy the
        // block immediately without waiting for the animation.
        afterDestroy();
      } else {
        (function () {
          var destroyOverlay = _this17.actionGroup.create(-12 + 40 * destroyPosition[0], -22 + 40 * destroyPosition[1], "destroyOverlay", "destroy1");
          if (LevelBlock.isFlat(blockType)) {
            var cropRect = new Phaser.Rectangle(0, 0, 60, 40);
            destroyOverlay.position.y += 20;
            destroyOverlay.crop(cropRect);
          }
          destroyOverlay.sortOrder = _this17.yToIndex(destroyPosition[1]) + 2;
          _this17.onAnimationEnd(destroyOverlay.animations.add("destroy", Phaser.Animation.generateFrameNames("destroy", 1, 12, "", 0), 30, false), function () {
            destroyOverlay.kill();
            _this17.toDestroy.push(destroyOverlay);

            afterDestroy();
          });
          _this17.playScaledSpeed(destroyOverlay.animations, "destroy");
        })();
      }
    }
  }, {
    key: "playMiningParticlesAnimation",
    value: function playMiningParticlesAnimation(facing, destroyPosition) {
      var _this18 = this;

      var miningParticlesData = [[24, -100, -80], // left
      [12, -120, -80], // bottom
      [0, -60, -80], // right
      [36, -80, -60]];

      // top
      var direction = this.getDirectionName(facing);
      var miningParticlesIndex = direction === "_left" ? 0 : direction === "_bottom" ? 1 : direction === "_right" ? 2 : 3;
      var miningParticlesFirstFrame = miningParticlesData[miningParticlesIndex][0];
      var miningParticlesOffsetX = miningParticlesData[miningParticlesIndex][1];
      var miningParticlesOffsetY = miningParticlesData[miningParticlesIndex][2];
      var miningParticles = this.actionGroup.create(miningParticlesOffsetX + 40 * destroyPosition[0], miningParticlesOffsetY + 40 * destroyPosition[1], "miningParticles", "MiningParticles" + miningParticlesFirstFrame);
      miningParticles.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
      this.onAnimationEnd(miningParticles.animations.add("miningParticles", Phaser.Animation.generateFrameNames("MiningParticles", miningParticlesFirstFrame, miningParticlesFirstFrame + 11, "", 0), 30, false), function () {
        miningParticles.kill();
        _this18.toDestroy.push(miningParticles);
      });
      this.playScaledSpeed(miningParticles.animations, "miningParticles");
    }
  }, {
    key: "playExplosionAnimation",
    value: function playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, placeBlock) {
      var _this19 = this;

      var entity = arguments.length <= 6 || arguments[6] === undefined ? this.player : arguments[6];

      var explodeAnim = this.actionGroup.create(-36 + 40 * destroyPosition[0], -30 + 40 * destroyPosition[1], "blockExplode", "BlockBreakParticle0");

      switch (blockType) {
        case "treeAcacia":
        case "logAcacia":
          explodeAnim.tint = 0x6c655a;
          break;
        case "treeBirch":
        case "logBirch":
          explodeAnim.tint = 0xdad6cc;
          break;
        case "treeJungle":
        case "logJungle":
          explodeAnim.tint = 0x6a4f31;
          break;
        case "treeOak":
        case "logOak":
          explodeAnim.tint = 0x675231;
          break;
        case "treeSpruce":
        case "logSpruce":
          explodeAnim.tint = 0x4b3923;
          break;
        case "planksAcacia":
          explodeAnim.tint = 0xba6337;
          break;
        case "planksBirch":
          explodeAnim.tint = 0xd7cb8d;
          break;
        case "planksJungle":
          explodeAnim.tint = 0xb88764;
          break;
        case "planksOak":
          explodeAnim.tint = 0xb4905a;
          break;
        case "planksSpruce":
          explodeAnim.tint = 0x805e36;
          break;
        case "stone":
        case "oreCoal":
        case "oreDiamond":
        case "oreIron":
        case "oreGold":
        case "oreEmerald":
        case "oreRedstone":
          explodeAnim.tint = 0xC6C6C6;
          break;
        case "grass":
        case "cropWheat":
          explodeAnim.tint = 0x5d8f23;
          break;
        case "dirt":
          explodeAnim.tint = 0x8a5e33;
          break;

        case "redstoneWireOn":
        case "redstoneWireHorizontalOn":
        case "redstoneWireVerticalOn":
        case "redstoneWireUpRightOn":
        case "redstoneWireUpLeftOn":
        case "redstoneWireDownRightOn":
        case "redstoneWireDownLeftOn":
        case "redstoneWireTUpOn":
        case "redstoneWireTDownOn":
        case "redstoneWireTLeftOn":
        case "redstoneWireTRightOn":
        case "redstoneWireCrossOn":
          explodeAnim.tint = 0x990707;
          break;

        case "redstoneWire":
        case "redstoneWireHorizontal":
        case "redstoneWireVertical":
        case "redstoneWireUpRight":
        case "redstoneWireUpLeft":
        case "redstoneWireDownRight":
        case "redstoneWireDownLeft":
        case "redstoneWireTUp":
        case "redstoneWireTDown":
        case "redstoneWireTLeft":
        case "redstoneWireTRight":
        case "redstoneWireCross":
          explodeAnim.tint = 0x290202;
          break;

        default:
          break;
      }

      explodeAnim.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
      this.onAnimationEnd(explodeAnim.animations.add("explode", Phaser.Animation.generateFrameNames("BlockBreakParticle", 0, 7, "", 0), 30, false), function () {
        explodeAnim.kill();
        _this19.toDestroy.push(explodeAnim);

        if (placeBlock) {
          if (!_this19.controller.getIsDirectPlayerControl()) {
            _this19.playPlayerAnimation("idle", playerPosition, facing, false, entity);
          }
          if (completionHandler !== null) {
            _this19.playItemDropAnimation(destroyPosition, blockType, completionHandler);
          }
        }
      });
      this.playScaledSpeed(explodeAnim.animations, "explode");
      if (this.controller.getIsDirectPlayerControl() ^ !placeBlock) {
        if (completionHandler) {
          completionHandler();
        }
      }
    }
  }, {
    key: "playItemDropAnimation",
    value: function playItemDropAnimation(destroyPosition, blockType, completionHandler) {
      var _this20 = this;

      var sprite = this.createMiniBlock(destroyPosition[0], destroyPosition[1], blockType);

      if (sprite) {
        sprite.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
      }

      if (this.controller.getIsDirectPlayerControl()) {
        if (completionHandler) {
          completionHandler();
        }
      } else {
        this.onAnimationEnd(this.playScaledSpeed(sprite.animations, "animate"), function () {
          var player = _this20.controller.levelModel.player;
          _this20.playItemAcquireAnimation(player.position, player.facing, sprite, completionHandler, blockType);
        });
      }
    }
  }, {
    key: "playScaledSpeed",
    value: function playScaledSpeed(animationManager, name) {
      var animation = animationManager.getAnimation(name);
      if (animation === null) {
        console.log("can't find animation name : " + name);
      } else {
        if (!animation.originalFps) {
          animation.originalFps = 1000 / animation.delay;
        }
        var fps = this.controller.originalFpsToScaled(animation.originalFps);
        return animationManager.play(name, fps);
      }
    }
  }, {
    key: "playItemAcquireAnimation",
    value: function playItemAcquireAnimation(playerPosition, facing, sprite, completionHandler, blockType) {
      var _this21 = this;

      var tween;

      tween = this.addResettableTween(sprite).to(this.positionToScreen(playerPosition), 200, Phaser.Easing.Linear.None);

      tween.onComplete.add(function () {
        var caughtUpToPlayer = Position.equals(_this21.player.position, playerPosition);
        if (sprite.alive && caughtUpToPlayer) {
          _this21.audioPlayer.play("collectedBlock");
          _this21.player.inventory[blockType] = (_this21.player.inventory[blockType] || 0) + 1;
          sprite.kill();
          _this21.toDestroy.push(sprite);
          var _event = createEvent('craftCollectibleCollected');
          _event.blockType = blockType;
          window.dispatchEvent(_event);
          if (completionHandler) {
            completionHandler();
          }
        } else {
          _this21.playItemAcquireAnimation(_this21.player.position, _this21.player.facing, sprite, completionHandler, blockType);
        }
      });

      tween.start();
    }

    /**
     * Convert a grid coordinate position to a screen X/Y location.
     * @param {Array<int>} position
     * @param {?boolean} isOnBlock
     * @return {{x: number, y: number}}
     */
  }, {
    key: "positionToScreen",
    value: function positionToScreen(position) {
      var isOnBlock = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var entity = arguments.length <= 2 || arguments[2] === undefined ? this.player : arguments[2];

      var _position = _slicedToArray(position, 2);

      var x = _position[0];
      var y = _position[1];

      var _entity$offset = _slicedToArray(entity.offset, 2);

      var xOffset = _entity$offset[0];
      var yOffset = _entity$offset[1];

      return {
        x: xOffset + 40 * x,
        y: yOffset + (isOnBlock ? -23 : 0) + 40 * y
      };
    }
  }, {
    key: "setPlayerPosition",
    value: function setPlayerPosition(x, y, isOnBlock) {
      var entity = arguments.length <= 3 || arguments[3] === undefined ? this.player : arguments[3];

      var screen = this.positionToScreen([x, y], isOnBlock, entity);
      entity.sprite.x = screen.x;
      entity.sprite.y = screen.y;
      entity.sprite.sortOrder = this.yToIndex(screen.y) + entity.getSortOrderOffset();
    }
  }, {
    key: "setSelectionIndicatorPosition",
    value: function setSelectionIndicatorPosition(x, y) {
      this.selectionIndicator.x = -35 + 23 + 40 * x;
      this.selectionIndicator.y = -55 + 43 + 40 * y;
    }

    /**
     * @param {Array<Array<int>>} gridSpaces An array of x and y grid coordinates.
     */
  }, {
    key: "drawHintPath",
    value: function drawHintPath(gridSpaces) {
      this.hintGroup.removeAll(true);

      var bounds = this.game.world.bounds;
      var hintPath = this.game.add.bitmapData(bounds.width, bounds.height);

      var context = hintPath.context;
      context.setLineDash([10, 10]);
      context.lineDashOffset = 5;
      context.lineWidth = 2;
      context.strokeStyle = '#fff';
      context.shadowColor = '#000';
      context.shadowOffsetY = 7;
      context.shadowBlur = 4;

      context.beginPath();
      gridSpaces.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var x = _ref2[0];
        var y = _ref2[1];

        context.lineTo(40 * x + 19, 40 * y + 19);
      });
      context.stroke();

      var sprite = this.hintGroup.create(0, 0, hintPath);
      sprite.alpha = 0;

      this.addResettableTween(sprite).to({ alpha: 1 }, 830, Phaser.Easing.Quadratic.Out).to({ alpha: 0.4 }, 500, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
    }
  }, {
    key: "createGroups",
    value: function createGroups() {
      this.groundGroup = this.game.add.group();
      this.groundGroup.yOffset = -2;
      this.shadingGroup = this.game.add.group();
      this.shadingGroup.yOffset = -2;
      this.hintGroup = this.game.add.group();
      this.actionGroup = this.game.add.group();
      this.actionGroup.yOffset = -22;
      this.fluffGroup = this.game.add.group();
      this.fluffGroup.yOffset = -160;
      this.fowGroup = this.game.add.group();
      this.fowGroup.yOffset = 0;
    }
  }, {
    key: "resetGroups",
    value: function resetGroups(levelData) {
      var sprite, x, y;

      this.groundGroup.removeAll(true);
      this.actionGroup.removeAll(true);
      this.hintGroup.removeAll(true);
      this.fluffGroup.removeAll(true);
      this.shadingGroup.removeAll(true);
      this.fowGroup.removeAll(true);

      this.baseShading = this.game.add.group();

      this.actionPlaneBlocks = [];
      this.refreshGroundGroup();

      for (y = 0; y < this.controller.levelModel.planeHeight; ++y) {
        for (x = 0; x < this.controller.levelModel.planeWidth; ++x) {
          var position = [x, y];
          sprite = null;

          var groundBlock = levelData.groundDecorationPlane.getBlockAt(position);
          if (!groundBlock.isEmpty) {
            sprite = this.createBlock(this.actionGroup, x, y, groundBlock.blockType);
            if (sprite) {
              sprite.sortOrder = this.yToIndex(y);
            }
          }

          var actionBlock = levelData.actionPlane.getBlockAt(position);
          if (!actionBlock.shouldRenderOnGroundPlane()) {
            this.createActionPlaneBlock(position, actionBlock.blockType);
          }
        }
      }

      for (y = 0; y < this.controller.levelModel.planeHeight; ++y) {
        for (x = 0; x < this.controller.levelModel.planeWidth; ++x) {
          var position = [x, y];
          if (!levelData.fluffPlane.getBlockAt(position).isEmpty) {
            sprite = this.createBlock(this.fluffGroup, x, y, levelData.fluffPlane.getBlockAt(position).blockType);
          }
        }
      }
    }
  }, {
    key: "refreshGroundGroup",
    value: function refreshGroundGroup() {
      this.groundGroup.removeAll(true);
      for (var y = 0; y < this.controller.levelModel.planeHeight; ++y) {
        for (var x = 0; x < this.controller.levelModel.planeWidth; ++x) {
          var position = [x, y];
          var groundBlock = this.controller.levelModel.groundPlane.getBlockAt(position);
          var sprite = this.createBlock(this.groundGroup, x, y, groundBlock.blockType);

          if (sprite) {
            sprite.sortOrder = this.yToIndex(y);
          }

          var actionBlock = this.controller.levelModel.actionPlane.getBlockAt(position);
          if (actionBlock && actionBlock.shouldRenderOnGroundPlane()) {
            this.createActionPlaneBlock([x, y], actionBlock.blockType);
          }
        }
      }
    }
  }, {
    key: "refreshActionGroup",
    value: function refreshActionGroup(positions) {
      var _this22 = this;

      // We need to add indices to refresh if there are other blocks in the action plane that might
      // conflict with the drawing of refreshed blocks.
      for (var i = 0; i < positions.length; ++i) {
        var positionBelow = Position.south(positions[i]);
        var indexIsValid = this.controller.levelModel.actionPlane.inBounds(positionBelow);
        if (indexIsValid) {
          var blockToCheck = this.controller.levelModel.actionPlane.getBlockAt(positionBelow);
          var indexIsEmpty = blockToCheck.blockType === "";
          if (!indexIsEmpty) {
            positions.push(positionBelow);
          }
        }
      }

      // Once all blocks that need to be refreshed are accounted for, go in and actually refresh.
      positions.forEach(function (position) {
        if (position) {
          var newBlock = _this22.controller.levelModel.actionPlane.getBlockAt(position);

          // we don't want to refresh doors. They're not destroyable, and
          // refreshing will lead to bad animation states
          if (newBlock && newBlock.getIsDoor()) {
            return;
          }

          if (newBlock && newBlock.getIsMiniblock() || newBlock && newBlock.getIsTree()) {
            return;
          }

          if (newBlock && newBlock.blockType) {
            _this22.createActionPlaneBlock(position, newBlock.blockType);
          } else if (newBlock) {
            // Remove the old sprite at this position, if there is one.
            var index = _this22.coordinatesToIndex(position);
            _this22.actionGroup.remove(_this22.actionPlaneBlocks[index]);
            _this22.groundGroup.remove(_this22.actionPlaneBlocks[index]);
          }
        }
      });
    }
  }, {
    key: "updateShadingGroup",
    value: function updateShadingGroup(shadingData) {
      var index, shadowItem, sx, sy, atlas;

      this.shadingGroup.removeAll();

      this.shadingGroup.add(this.baseShading);
      if (this.selectionIndicator) {
        this.shadingGroup.add(this.selectionIndicator);
      }

      for (index = 0; index < shadingData.length; ++index) {
        shadowItem = shadingData[index];

        atlas = shadowItem.atlas;
        sx = 40 * shadowItem.x;
        sy = 40 * shadowItem.y;

        var sprite = this.shadingGroup.create(sx, sy, atlas, shadowItem.type);
        if (atlas === 'WaterAO') {
          sprite.tint = 0x555555;
        }
      }
    }
  }, {
    key: "updateFowGroup",
    value: function updateFowGroup(fowData) {
      var index, fx, fy, atlas;

      this.fowGroup.removeAll();

      for (index = 0; index < fowData.length; ++index) {
        var fowItem = fowData[index];

        if (fowItem !== "") {
          atlas = "undergroundFow";
          fx = -40 + 40 * fowItem.x;
          fy = -40 + 40 * fowItem.y;

          switch (fowItem.type) {
            case "FogOfWar_Center":
              break;

            default:
              break;
          }

          var sprite = this.fowGroup.create(fx, fy, atlas, fowItem.type);
          sprite.alpha = 0.8;
        }
      }
    }
  }, {
    key: "playRandomPlayerIdle",
    value: function playRandomPlayerIdle(facing) {
      var entity = arguments.length <= 1 || arguments[1] === undefined ? this.player : arguments[1];

      var facingName, rand, animationName;

      facingName = this.getDirectionName(facing);
      rand = Math.trunc(Math.random() * 4) + 1;

      switch (rand) {
        case 1:
          animationName = "idle";
          break;
        case 2:
          animationName = "lookLeft";
          break;
        case 3:
          animationName = "lookRight";
          break;
        case 4:
          animationName = "lookAtCam";
          break;
        default:
      }

      animationName += facingName;
      this.playScaledSpeed(entity.sprite.animations, animationName);
    }
  }, {
    key: "generatePlayerCelebrateFrames",
    value: function generatePlayerCelebrateFrames() {
      var frameList = [];

      //Face Down
      for (var i = 0; i < 6; ++i) {
        frameList.push("Player_001");
      }
      //Crouch Left
      frameList = frameList.concat("Player_259");
      frameList = frameList.concat("Player_260");
      //Jump
      frameList.push("Player_261");
      frameList.push("Player_297");
      frameList.push("Player_298");
      frameList.push("Player_297");
      frameList.push("Player_261");
      //Jump
      frameList.push("Player_261");
      frameList.push("Player_297");
      frameList.push("Player_298");
      frameList.push("Player_297");
      frameList.push("Player_261");
      //Pause
      frameList.push("Player_001");
      frameList.push("Player_001");
      frameList.push("Player_001");
      frameList.push("Player_001");
      frameList.push("Player_001");
      //Jump
      frameList.push("Player_261");
      frameList.push("Player_297");
      frameList.push("Player_298");
      frameList.push("Player_297");
      frameList.push("Player_261");
      //Jump
      frameList.push("Player_261");
      frameList.push("Player_297");
      frameList.push("Player_298");
      frameList.push("Player_297");
      frameList.push("Player_261");

      return frameList;
    }
  }, {
    key: "generateFramesWithEndDelay",
    value: function generateFramesWithEndDelay(frameName, startFrame, endFrame, endFrameFullName, buffer, frameDelay) {
      var frameList = Phaser.Animation.generateFrameNames(frameName, startFrame, endFrame, "", buffer);
      for (var i = 0; i < frameDelay; ++i) {
        frameList.push(endFrameFullName);
      }
      return frameList;
    }
  }, {
    key: "generateReverseFrames",
    value: function generateReverseFrames(frameName, startFrame, endFrame, suffix, buffer) {
      var frameList = Phaser.Animation.generateFrameNames(frameName, startFrame, endFrame, suffix, buffer);
      return frameList.concat(Phaser.Animation.generateFrameNames(frameName, endFrame - 1, startFrame, suffix, buffer));
    }
  }, {
    key: "preparePlayerSprite",
    value: function preparePlayerSprite(playerName) {
      var _this23 = this;

      var entity = arguments.length <= 1 || arguments[1] === undefined ? this.player : arguments[1];

      entity.sprite = this.actionGroup.create(0, 0, "player" + playerName, 'Player_121');
      if (this.controller.followingPlayer() && entity === this.player) {
        this.game.camera.follow(entity.sprite);
      }

      if (entity.shouldUpdateSelectionIndicator()) {
        this.selectionIndicator = this.shadingGroup.create(24, 44, 'selectionIndicator');
      }

      this.generateAnimations(FacingDirection.South, 0, entity);
      this.generateAnimations(FacingDirection.East, 60, entity);
      this.generateAnimations(FacingDirection.North, 120, entity);
      this.generateAnimations(FacingDirection.West, 180, entity);

      var frameRate = 20;
      var idleFrameRate = 10;
      var frameList = undefined;

      frameList = this.generateFramesWithEndDelay("Player_", 263, 262, "Player_262", 3, 5);
      frameList.push("Player_263");
      entity.sprite.animations.add('lookAtCam_down', frameList, idleFrameRate, false).onComplete.add(function () {
        _this23.playScaledSpeed(entity.sprite.animations, "idlePause_down");
      });

      frameList = this.generateFramesWithEndDelay("Player_", 270, 269, "Player_269", 3, 5);
      frameList.push("Player_270");
      entity.sprite.animations.add('lookAtCam_right', frameList, idleFrameRate, false).onComplete.add(function () {
        _this23.playScaledSpeed(entity.sprite.animations, "idlePause_right");
      });

      frameList = this.generateFramesWithEndDelay("Player_", 277, 276, "Player_276", 3, 5);
      frameList.push("Player_277");
      entity.sprite.animations.add('lookAtCam_up', frameList, idleFrameRate, false).onComplete.add(function () {
        _this23.playScaledSpeed(entity.sprite.animations, "idlePause_up");
      });

      frameList = this.generateFramesWithEndDelay("Player_", 284, 283, "Player_283", 3, 5);
      frameList.push("Player_284");
      entity.sprite.animations.add('lookAtCam_left', frameList, idleFrameRate, false).onComplete.add(function () {
        _this23.playScaledSpeed(entity.sprite.animations, "idlePause_left");
      });

      entity.sprite.animations.add('mine_down', Phaser.Animation.generateFrameNames("Player_", 241, 244, "", 3), frameRate, true);
      entity.sprite.animations.add('mine_right', Phaser.Animation.generateFrameNames("Player_", 245, 248, "", 3), frameRate, true);
      entity.sprite.animations.add('mine_up', Phaser.Animation.generateFrameNames("Player_", 249, 252, "", 3), frameRate, true);
      entity.sprite.animations.add('mine_left', Phaser.Animation.generateFrameNames("Player_", 253, 256, "", 3), frameRate, true);

      entity.sprite.animations.add('mineCart_down', Phaser.Animation.generateFrameNames("Minecart_", 5, 5, "", 2), frameRate, false);
      entity.sprite.animations.add('mineCart_turnleft_down', Phaser.Animation.generateFrameNames("Minecart_", 6, 6, "", 2), frameRate, false);
      entity.sprite.animations.add('mineCart_turnright_down', Phaser.Animation.generateFrameNames("Minecart_", 12, 12, "", 2), frameRate, false);

      entity.sprite.animations.add('mineCart_right', Phaser.Animation.generateFrameNames("Minecart_", 7, 7, "", 2), frameRate, false);
      entity.sprite.animations.add('mineCart_left', Phaser.Animation.generateFrameNames("Minecart_", 11, 11, "", 2), frameRate, false);

      entity.sprite.animations.add('mineCart_up', Phaser.Animation.generateFrameNames("Minecart_", 9, 9, "", 2), frameRate, false);
      entity.sprite.animations.add('mineCart_turnleft_up', Phaser.Animation.generateFrameNames("Minecart_", 10, 10, "", 2), frameRate, false);
      entity.sprite.animations.add('mineCart_turnright_up', Phaser.Animation.generateFrameNames("Minecart_", 8, 8, "", 2), frameRate, false);
    }
  }, {
    key: "playerFrameName",
    value: function playerFrameName(n) {
      return Phaser.Animation.generateFrameNames("Player_", n, n, "", 3);
    }

    /**
     * Create action animations for Alex, Steve and the Agent from the sprite
     * sheet and JSON map.
     * @param {FacingDirection} facing
     * @param {int} offset
     */
  }, {
    key: "generateAnimations",
    value: function generateAnimations(facing, offset) {
      var _this24 = this;

      var entity = arguments.length <= 2 || arguments[2] === undefined ? this.player : arguments[2];

      var direction = this.getDirectionName(facing);
      var idleFrameRate = 10;
      var frameRate = 20;

      var frameList = [];

      frameList.push(this.playerFrameName(offset + 1));
      frameList.push(this.playerFrameName(offset + 3));
      frameList.push(this.playerFrameName(offset + 1));
      frameList.push(this.playerFrameName(offset + 7));
      frameList.push(this.playerFrameName(offset + 9));
      frameList.push(this.playerFrameName(offset + 7));
      for (var i = 0; i < 5; ++i) {
        frameList.push(this.playerFrameName(offset + 1));
      }

      entity.sprite.animations.add('idle' + direction, frameList, frameRate / 3, false).onComplete.add(function () {
        _this24.playRandomPlayerIdle(facing, entity);
      });
      frameList = this.generateFramesWithEndDelay("Player_", offset + 6, offset + 5, this.playerFrameName(offset + 5), 3, 5);
      frameList.push(this.playerFrameName(offset + 6));
      entity.sprite.animations.add('lookLeft' + direction, frameList, idleFrameRate, false).onComplete.add(function () {
        _this24.playScaledSpeed(entity.sprite.animations, "idlePause" + direction);
      });
      frameList = this.generateFramesWithEndDelay("Player_", offset + 12, offset + 11, this.playerFrameName(offset + 11), 3, 5);
      frameList.push(this.playerFrameName(offset + 12));
      entity.sprite.animations.add('lookRight' + direction, frameList, idleFrameRate, false).onComplete.add(function () {
        _this24.playScaledSpeed(entity.sprite.animations, "idlePause" + direction);
      });
      frameList = [];
      for (var i = 0; i < 13; ++i) {
        frameList.push(this.playerFrameName(offset + 1));
      }
      entity.sprite.animations.add('idlePause' + direction, frameList, frameRate / 3, false).onComplete.add(function () {
        _this24.playRandomPlayerIdle(facing, entity);
      });

      entity.sprite.animations.add('walk' + direction, Phaser.Animation.generateFrameNames("Player_", offset + 13, offset + 20, "", 3), frameRate, true);
      var singlePunch = Phaser.Animation.generateFrameNames("Player_", offset + 21, offset + 24, "", 3);
      entity.sprite.animations.add('punch' + direction, singlePunch, frameRate, false).onComplete.add(function () {
        _this24.audioPlayer.play("punch");
      });
      entity.sprite.animations.add('punchDestroy' + direction, singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
      entity.sprite.animations.add('hurt' + direction, Phaser.Animation.generateFrameNames("Player_", offset + 25, offset + 28, "", 3), frameRate, false).onComplete.add(function () {
        _this24.playScaledSpeed(entity.sprite.animations, "idlePause" + direction);
      });
      entity.sprite.animations.add('crouch' + direction, Phaser.Animation.generateFrameNames("Player_", offset + 29, offset + 32, "", 3), frameRate, true);
      entity.sprite.animations.add('jumpUp' + direction, Phaser.Animation.generateFrameNames("Player_", offset + 33, offset + 36, "", 3), frameRate / 2, true);
      entity.sprite.animations.add('fail' + direction, Phaser.Animation.generateFrameNames("Player_", offset + 45, offset + 48, "", 3), frameRate, false);
      entity.sprite.animations.add('celebrate' + direction, this.generatePlayerCelebrateFrames(), frameRate / 2, false);
      entity.sprite.animations.add('bump' + direction, Phaser.Animation.generateFrameNames("Player_", offset + 49, offset + 54, "", 3), frameRate, false).onStart.add(function () {
        _this24.audioPlayer.play("bump");
      });
      entity.sprite.animations.add('jumpDown' + direction, Phaser.Animation.generateFrameNames("Player_", offset + 55, offset + 60, "", 3), frameRate, true);
    }

    /**
     * Create a "miniblock" asset (representing a floating collectable) based on
     * the given block at the given coordinates
     *
     * @param {Number} x
     * @param {Number} y
     * @param {String} blockType
     * @param {Object} [overrides] optional overrides for various defaults
     * @param {Number} [overrides.collectibleDistance=2] distance at which the
     *        miniblock can be collected
     * @param {Number} [overrides.xOffsetRange=40]
     * @param {Number} [overrides.yOffsetRange=40]
     */
  }, {
    key: "createMiniBlock",
    value: function createMiniBlock(x, y, blockType) {
      var _this25 = this;

      var overrides = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var sprite = null,
          frameList = undefined;

      var collectibleDistance = overrides.collectibleDistance || 2;
      var xOffsetRange = overrides.xOffsetRange || 40;
      var yOffsetRange = overrides.yOffsetRange || 40;

      var frame = LevelBlock.getMiniblockFrame(blockType);
      if (!(frame && this.miniBlocks[frame])) {
        return sprite;
      }

      var atlas = "miniBlocks";
      var framePrefix = this.miniBlocks[frame][0];
      var frameStart = this.miniBlocks[frame][1];
      var frameEnd = this.miniBlocks[frame][2];
      var xOffset = -10 - xOffsetRange / 2 + Math.random() * xOffsetRange;
      var yOffset = 0 - yOffsetRange / 2 + Math.random() * yOffsetRange + this.actionGroup.yOffset;

      frameList = Phaser.Animation.generateFrameNames(framePrefix, frameStart, frameEnd, ".png", 3);
      sprite = this.actionGroup.create(xOffset + 40 * x, yOffset + 40 * y, atlas, "");
      var anim = sprite.animations.add("animate", frameList, 10, false);

      // If direct player control, we have stuff to do to manage miniblock pick up
      if (this.controller.getIsDirectPlayerControl()) {
        (function () {
          var distanceBetween = function distanceBetween(position, position2) {
            return Math.sqrt(Math.pow(position[0] - position2[0], 2) + Math.pow(position[1] - position2[1], 2));
          };

          var collectiblePosition = _this25.controller.levelModel.spritePositionToIndex([xOffset, yOffset], [sprite.x, sprite.y]);
          _this25.collectibleItems.push([sprite, [xOffset, yOffset], blockType, collectibleDistance]);
          anim.onComplete.add(function () {
            if (_this25.controller.levelModel.usePlayer) {
              if (distanceBetween(_this25.player.position, collectiblePosition) < collectibleDistance) {
                _this25.player.collectItems([x, y]);
              }
            }
          });
        })();
      }

      this.playScaledSpeed(sprite.animations, "animate");
      return sprite;
    }
  }, {
    key: "playAnimationWithOffset",
    value: function playAnimationWithOffset(sprite, animationName, animationFrameTotal, startFrame) {
      var rand = Math.trunc(Math.random() * animationFrameTotal) + startFrame;
      this.playScaledSpeed(sprite.animations, animationName).setFrame(rand, true);
    }
  }, {
    key: "psuedoRandomTint",
    value: function psuedoRandomTint(group, sprite, x, y) {
      var psuedoRandom = Math.pow(x * 10 + y, 5) % 251;
      var darkness = psuedoRandom / 12;
      if (group === this.groundGroup) {
        darkness += 24;
      } else {
        darkness *= 0.75;
      }
      var brightness = Math.floor(0xff - darkness).toString(16);
      sprite.tint = '0x' + brightness + brightness + brightness;
    }
  }, {
    key: "createBlock",
    value: function createBlock(group, x, y, blockType) {
      var _this26 = this;

      var i,
          sprite = null,
          frameList,
          atlas,
          frame,
          xOffset,
          yOffset;

      var buildTree = function buildTree(levelView, frame) {
        var type = blockType.substring(4);
        sprite = levelView.createBlock(group, x, y, "log" + type);
        sprite.fluff = levelView.createBlock(levelView.fluffGroup, x, y, "leaves" + type);
        sprite.onBlockDestroy = function (logSprite) {
          logSprite.fluff.animations.add("despawn", Phaser.Animation.generateFrameNames("Leaves_" + type, frame[0], frame[1], ".png", 0), 10, false).onComplete.add(function () {
            levelView.toDestroy.push(logSprite.fluff);
            logSprite.fluff.kill();
          });

          levelView.playScaledSpeed(logSprite.fluff.animations, "despawn");
        };
        levelView.trees.push({ sprite: sprite, type: blockType, position: [x, y] });
      };

      var buildDoor = function buildDoor(levelView, type) {
        atlas = _this26.blocks[blockType][0];
        frame = _this26.blocks[blockType][1];
        xOffset = _this26.blocks[blockType][2];
        yOffset = _this26.blocks[blockType][3];
        sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);

        frameList = [];
        var animationFramesIron = Phaser.Animation.generateFrameNames(type, 0, 3, "", 1);
        for (var j = 0; j < 5; ++j) {
          frameList.push(type + "0");
        }
        frameList = frameList.concat(animationFramesIron);

        sprite.animations.add("open", frameList);

        frameList = [];
        animationFramesIron = Phaser.Animation.generateFrameNames(type, 3, 0, "", 1);
        for (var j = 0; j < 5; ++j) {
          frameList.push(type + "3");
        }
        frameList = frameList.concat(animationFramesIron);
        sprite.animations.add("close", frameList);

        return sprite;
      };

      switch (blockType) {
        case "treeAcacia":
          //0,7
          buildTree(this, [0, 7]);
          break;
        case "treeBirch":
          //0,8
          buildTree(this, [0, 8]);
          break;
        case "treeJungle":
          //0,9
          buildTree(this, [0, 9]);
          break;
        case "treeOak":
          buildTree(this, [0, 6]);
          break;
        case "treeSpruce":
          //0,8
          buildTree(this, [0, 8]);
          break;
        case "treeSpruceSnowy":
          //1,9
          buildTree(this, [0, 8]);
          break;
        case "cropWheat":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Wheat", 0, 2, "", 0);
          sprite.animations.add("idle", frameList, 0.4, false);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "torch":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Torch", 0, 23, "", 0);
          sprite.animations.add("idle", frameList, 15, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "water":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Water_", 0, 5, "", 0);
          sprite.animations.add("idle", frameList, 5, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        //for placing wetland for crops in free play
        case "watering":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          sprite.kill();
          this.toDestroy.push(sprite);
          this.createBlock(this.groundGroup, x, y, "farmlandWet");
          this.refreshGroundGroup();
          break;

        case "lava":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Lava_", 0, 5, "", 0);
          sprite.animations.add("idle", frameList, 5, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "Nether_Portal":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Nether_Portal", 0, 5, "", 0);
          sprite.animations.add("idle", frameList, 5, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "lavaPop":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("LavaPop", 1, 7, "", 2);
          for (i = 0; i < 4; ++i) {
            frameList.push("LavaPop07");
          }
          frameList = frameList.concat(Phaser.Animation.generateFrameNames("LavaPop", 8, 13, "", 2));
          for (i = 0; i < 3; ++i) {
            frameList.push("LavaPop13");
          }
          frameList = frameList.concat(Phaser.Animation.generateFrameNames("LavaPop", 14, 30, "", 2));
          for (i = 0; i < 8; ++i) {
            frameList.push("LavaPop01");
          }
          sprite.animations.add("idle", frameList, 5, true);
          this.playAnimationWithOffset(sprite, "idle", 29, 1);
          break;

        case "fire":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Fire", 0, 14, "", 2);
          sprite.animations.add("idle", frameList, 5, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "bubbles":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Bubbles", 0, 14, "", 2);
          sprite.animations.add("idle", frameList, 5, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "explosion":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Explosion", 0, 16, "", 1);
          sprite.animations.add("idle", frameList, 15, false).onComplete.add(function () {
            _this26.toDestroy.push(sprite);
            sprite.kill();
          });
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "door":
          sprite = buildDoor(this, "Door");
          break;

        case "doorIron":
          sprite = buildDoor(this, "DoorIron");
          if (this.blockReceivesCornerShadow(x, y)) {
            sprite.addChild(this.game.make.sprite(-40, 55, "blockShadows", "Shadow_Parts_Fade_overlap.png"));
          }
          break;

        case "tnt":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("TNTexplosion", 0, 8, "", 0);
          sprite.animations.add("explode", frameList, 7, false).onComplete.add(function () {
            _this26.playExplosionCloudAnimation([x, y]);
            sprite.kill();
            _this26.toDestroy.push(sprite);
            _this26.actionPlaneBlocks[_this26.coordinatesToIndex([x, y])] = null;
          });
          break;

        default:
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = group.create(xOffset + 40 * x, yOffset + group.yOffset + 40 * y, atlas, frame);
          if (group === this.actionGroup || group === this.groundGroup) {
            if (!LevelBlock.isWalkable(blockType)) {
              this.psuedoRandomTint(group, sprite, x, y);
            }
          }
          if (group === this.actionGroup && !LevelBlock.isWalkable(blockType) && this.blockReceivesCornerShadow(x, y)) {
            var xShadow = -39;
            var yShadow = 40;
            if (blockType.startsWith("pistonArm")) {
              xShadow = -26;
              yShadow = 53;
            }
            sprite.addChild(this.game.make.sprite(xShadow, yShadow, "blockShadows", "Shadow_Parts_Fade_overlap.png"));
          }
          if (blockType.startsWith('redstoneWire') && blockType.endsWith('On')) {
            sprite.addChild(this.addRedstoneSparkle());
          }
          break;
      }

      return sprite;
    }
  }, {
    key: "addRedstoneSparkle",
    value: function addRedstoneSparkle() {
      var _this27 = this;

      var blank = "redstone_sparkle99.png";
      var sprite = this.game.make.sprite(20, 25, "redstoneSparkle", blank);

      // Establish the three different animations.
      for (var i = 0; i < 3; i++) {
        var n = i * 8;
        var _frames = [blank].concat(Phaser.Animation.generateFrameNames("redstone_sparkle", n, n + 7, ".png"), blank);
        sprite.animations.add("fizz_" + i, _frames, 7);
      }

      var playRandomSparkle = function playRandomSparkle() {
        setTimeout(function () {
          if (!sprite.alive) {
            return;
          }

          // Pick one of the animations to play.
          var whichAnim = Math.floor(Math.random() * 3);
          _this27.onAnimationEnd(_this27.playScaledSpeed(sprite.animations, "fizz_" + whichAnim), playRandomSparkle);

          // Randomize which corner of the index the animation manifests in.
          sprite.position.x = Math.random() > 0.5 ? 20 : 40;
          sprite.position.y = Math.random() > 0.5 ? 25 : 45;
        }, randomInt(500, 7000) / _this27.controller.tweenTimeScale);
      };

      playRandomSparkle();

      return sprite;
    }
  }, {
    key: "blockReceivesCornerShadow",
    value: function blockReceivesCornerShadow(x, y) {
      var southBlock = this.controller.levelModel.actionPlane.getBlockAt([x, y + 1]);
      if (!southBlock || southBlock.blockType && !southBlock.isWalkable) {
        return false;
      }

      var southWestBlock = this.controller.levelModel.actionPlane.getBlockAt([x - 1, y + 1]);
      return southWestBlock && southWestBlock.blockType && !southWestBlock.isWalkable;
    }
  }, {
    key: "isUnderTree",
    value: function isUnderTree(treeIndex, position) {
      // invalid index
      if (treeIndex >= this.trees.length || treeIndex < 0) {
        return false;
      }
      var fluffPositions = this.treeFluffTypes[this.trees[treeIndex].type];
      for (var i = 0; i < fluffPositions.length; i++) {
        if (this.trees[treeIndex].position[0] + fluffPositions[i][0] === position[0] && this.trees[treeIndex].position[1] + fluffPositions[i][1] === position[1]) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: "changeTreeAlpha",
    value: function changeTreeAlpha(treeIndex, alpha) {
      var tween = this.controller.levelView.addResettableTween(this.trees[treeIndex].sprite.fluff).to({
        alpha: alpha
      }, 300, Phaser.Easing.Linear.None);

      tween.start();
    }
  }, {
    key: "onAnimationEnd",
    value: function onAnimationEnd(animation, completionHandler) {
      var signalBinding = animation.onComplete.add(function () {
        signalBinding.detach();
        completionHandler();
      });
    }
  }, {
    key: "onAnimationStart",
    value: function onAnimationStart(animation, completionHandler) {
      var signalBinding = animation.onStart.add(function () {
        signalBinding.detach();
        completionHandler();
      });
    }
  }, {
    key: "onAnimationLoopOnce",
    value: function onAnimationLoopOnce(animation, completionHandler) {
      var signalBinding = animation.onLoop.add(function () {
        signalBinding.detach();
        completionHandler();
      });
    }
  }, {
    key: "addResettableTween",
    value: function addResettableTween(sprite) {
      var tween = this.game.add.tween(sprite);
      tween.timeScale = this.controller.tweenTimeScale;
      this.resettableTweens.push(tween);
      return tween;
    }

    /**
    * Animate Door and set the status
    */
  }, {
    key: "animateDoor",
    value: function animateDoor(index, open) {
      var _this28 = this;

      var player = this.controller.levelModel.player;
      this.setSelectionIndicatorPosition(this.controller.levelModel.actionPlane.indexToCoordinates(index)[0], this.controller.levelModel.actionPlane.indexToCoordinates(index)[1]);
      this.controller.audioPlayer.play("doorOpen");
      // If it's not walable, then open otherwise, close.
      var position = this.controller.levelModel.actionPlane.indexToCoordinates(index);
      this.playDoorAnimation(position, open, function () {
        var block = _this28.controller.levelModel.actionPlane.getBlockAt(position);
        block.isWalkable = block.isOpen;
        if (block.blockType !== "doorIron") {
          // Iron doors don't need to set the player animation to Idle, because they're not opened with 'use'.
          _this28.playIdleAnimation(player.position, player.facing, player.isOnBlock, player);
        }
        _this28.setSelectionIndicatorPosition(player.position[0], player.position[1]);
      });
    }
  }]);

  return LevelView;
})();

},{"../../utils":37,"./FacingDirection.js":29,"./LevelBlock.js":30,"./Position.js":35,"./Utils":36}],35:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FacingDirection = require("./FacingDirection");

var directions = [FacingDirection.North, FacingDirection.East, FacingDirection.South, FacingDirection.West];

module.exports = (function () {
  function Position() {
    _classCallCheck(this, Position);
  }

  _createClass(Position, null, [{
    key: "add",
    value: function add(left, right) {
      return [left[0] + right[0], left[1] + right[1]];
    }
  }, {
    key: "equals",
    value: function equals(left, right) {
      return left[0] === right[0] && left[1] === right[1];
    }
  }, {
    key: "isAdjacent",
    value: function isAdjacent(left, right) {
      return directions.map(FacingDirection.directionToOffset).some(function (offset) {
        return Position.equals(Position.add(left, offset), right);
      });
    }
  }, {
    key: "forward",
    value: function forward(position, direction) {
      return Position.add(position, FacingDirection.directionToOffset(direction));
    }
  }, {
    key: "north",
    value: function north(position) {
      return Position.forward(position, FacingDirection.North);
    }
  }, {
    key: "east",
    value: function east(position) {
      return Position.forward(position, FacingDirection.East);
    }
  }, {
    key: "south",
    value: function south(position) {
      return Position.forward(position, FacingDirection.South);
    }
  }, {
    key: "west",
    value: function west(position) {
      return Position.forward(position, FacingDirection.West);
    }
  }, {
    key: "getOrthogonalPositions",
    value: function getOrthogonalPositions(position) {
      return directions.map(function (direction) {
        return Position.forward(position, direction);
      });
    }

    /**
     * Gets all eight surrounding positions - orthogonal and diagonal
     */
  }, {
    key: "getSurroundingPositions",
    value: function getSurroundingPositions(position) {
      return Position.getOrthogonalPositions(position).concat([Position.north(Position.east(position)), Position.north(Position.west(position)), Position.south(Position.east(position)), Position.south(Position.west(position))]);
    }
  }]);

  return Position;
})();

},{"./FacingDirection":29}],36:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var FacingDirection = require("./FacingDirection.js");

/**
 * Converts entities found within the levelConfig.actionPlane to a
 * levelConfig.entities suitable for loading by the game initializer.
 *
 * ['sheepRight', 'creeperUp] -> [['sheep', 0, 0, 1], ['creeper', 1, 0, 0]]
 *
 * @param levelConfig
 */
module.exports.convertActionPlaneEntitiesToConfig = function (levelConfig) {
  var _ref = levelConfig.gridWidth && levelConfig.gridHeight ? [levelConfig.gridWidth, levelConfig.gridHeight] : [10, 10];

  var _ref2 = _slicedToArray(_ref, 2);

  var width = _ref2[0];
  var height = _ref2[1];

  var planesToCustomize = [levelConfig.actionPlane];
  planesToCustomize.forEach(function (plane) {
    for (var i = 0; i < plane.length; i++) {
      var item = plane[i];

      if (item.match(/sheep|zombie|ironGolem|creeper|cow|chicken|ghast/)) {
        var suffixToDirection = {
          Up: FacingDirection.North,
          Down: FacingDirection.South,
          Left: FacingDirection.West,
          Right: FacingDirection.East
        };

        levelConfig.entities = levelConfig.entities || [];
        var x = i % width;
        var y = Math.floor(i / height);

        var directionMatch = item.match(/(.*)(Right|Left|Up|Down)/);
        var directionToUse = directionMatch ? suffixToDirection[directionMatch[2]] : FacingDirection.East;
        var entityToUse = directionMatch ? directionMatch[1] : item;
        levelConfig.entities.push([entityToUse, x, y, directionToUse]);
        plane[i] = '';
      }
    }
  });
};

module.exports.randomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

},{"./FacingDirection.js":29}],37:[function(require,module,exports){
module.exports = {};

/**
 * Creates a new event in a cross-browswer-compatible way.
 *
 * createEvent functionality is officially deprecated in favor of
 * the Event constructor, but some older browsers do not yet support
 * event constructors. Attempt to use the new functionality, fall
 * back to the old if it fails.
 *
 * @param {String} type
 * @param {boolean} [bubbles=false]
 * @param {boolean} [cancelable=false]
 */
module.exports.createEvent = function createEvent(type, bubbles = false, cancelable = false) {
  var customEvent;
  try {
    customEvent = new Event(type, { bubbles, cancelable });
  } catch (e) {
    customEvent = document.createEvent('Event');
    customEvent.initEvent(type, bubbles, cancelable);
  }
  return customEvent;
};

module.exports.bisect = function bisect(array, conditional) {
  const positive = array.filter(x => conditional(x));
  const negative = array.filter(x => !conditional(x));
  return [positive, negative];
};

},{}],38:[function(require,module,exports){
const AdventurerLevels = require("../../test/helpers/AdventurerLevels");
const AgentLevels = require("../../test/helpers/AgentLevels");
const DesignerLevels = require("../../test/helpers/DesignerLevels");

module.exports = Object.assign({
  default: {
    instructions: "Nighttime is boring with no zombies (sheep at this time). Get the Zombies spawning at night, and get them to chase you.",
    useAgent: true,
    
    playerStartPosition: [3, 4],
    agentStartPosition: [3, 6],

    // up: 0, right: 1, down: 2, left: 3
    playerStartDirection: 1,
    agentStartDirection: 1,

    playerName: "SteveEvents",
    isAgentLevel: true,
    earlyLoadAssetPacks: ['allAssetsMinusPlayer'],
    earlyLoadNiceToHaveAssetPacks: ['playerSteveEvents', 'playerAgent'],

    assetPacks: {
      beforeLoad: ['allAssetsMinusPlayer', 'playerSteveEvents', 'playerAgent'],
      afterLoad: [],
    },

    levelVerificationTimeout : -1,
    timeoutResult : function(verificationAPI) {
      return false;
    },

    groundPlane: [
      "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
      "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
      "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
      "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
      "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
      "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
      "grass", "grass", "grass", "grass", "grass", "water", "water", "grass", "grass", "grass",
      "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
      "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
      "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
    ],

    groundDecorationPlane: [
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
    ],

    actionPlane: [
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
    ],

    fluffPlane: [
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "",
    ],

    failureCheckFunction: function (verificationAPI) {
      return false;
    },

    verificationFunction: function (verificationAPI) {
      return false;
    },
  },
}, AdventurerLevels, AgentLevels, DesignerLevels);

},{"../../test/helpers/AdventurerLevels":40,"../../test/helpers/AgentLevels":41,"../../test/helpers/DesignerLevels":42}],39:[function(require,module,exports){
window.GameController = require("../js/game/GameController");
window.demoLevels = require("./levels");

},{"../js/game/GameController":26,"./levels":38}],40:[function(require,module,exports){
module.exports = {
  adventurer01: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","flowerRose","","","tallGrass","","","","","","","","tallGrass","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerRose","","","","","","","",""],
    actionPlane: ["grass","grass","","","","","","","grass","grass","grass","grass","","","","","","","","grass","grass","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","",""],
    entities: [['sheep', 6, 4, 1]],
    playerStartPosition: [3, 4],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.isPlayerNextTo("sheep"),
  },
  adventurer02: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","",""],
    actionPlane: ["","","","","","","grass","grass","grass","grass","grass","grass","","","","","","","","","grass","grass","","","","","","","","","grass","grass","","","","","","","","","grass","grass","","","treeSpruce","","","","","","grass","","","","","","","","","","grass","","","","","","","","","","","","","","","","","","","grass","","","","","","","","","grass","grass","grass","grass","","","","","","","grass","grass"],
    playerStartPosition: [4, 7],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.countOfTypeOnMap("treeSpruce") === 0,
  },
  adventurer03: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","dirt","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt"],
    groundDecorationPlane: ["","","","","","","","","","","","flowerRose","","","tallGrass","","","","","","","","","tallGrass","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","flowerDandelion","","","","","","","","","tallGrass","","","","tallGrass","","tallGrass","flowerRose","","","","","tallGrass",""],
    actionPlane: ["grass","grass","grass","grass","","","","","","","","","grass","grass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","grass","","","","","","","","","","grass","","treeOak","","","","","","","","grass","","","","","","","","",""],
    entities: [["sheep", 5, 3, 3], ["sheep", 4, 5, 3]],
    playerStartPosition: [2, 3],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("wool") >= 2,
  },
  adventurer04: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","flowerOxeeye","","","","","","","","","flowerDandelion","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","flowerRose","","tallGrass","tallGrass","","","","","","tallGrass","","flowerOxeeye"],
    actionPlane: ["","grass","grass","grass","grass","grass","grass","grass","grass","grass","","","","","grass","grass","grass","grass","grass","grass","","","","","","","","","","","","","","","","","treeSpruce","","","","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","","","","","","","","","","","","","","","","","","","","",""],
    playerStartPosition: [3, 7],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("planksBirch") === 1 &&
      verificationAPI.getInventoryAmount("planksSpruce") === 1 &&
      verificationAPI.getInventoryAmount("planksOak") === 1,
  },
  adventurer05: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirtCoarse","dirtCoarse","dirtCoarse","dirtCoarse","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","flowerOxeeye","tallGrass","","","","","","","","","tallGrass","tallGrass","flowerDandelion","","","","","","","","","flowerDandelion","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerDandelion","","tallGrass","","","","","","","","","tallGrass","","","","","","tallGrass","","",""],
    actionPlane: ["grass","grass","","","","","","","grass","grass","","","","","","","","","","grass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    playerStartPosition: [6, 6],
    playerStartDirection: 3,
    verificationFunction: verificationAPI =>
      verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "any", "any", "any", "any", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
      ]),
  },
  adventurer06: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass","grass","grass","grass","grass","grass","dirtCoarse", "grass","grass","dirtCoarse", "grass","grass","grass","grass","grass","grass","dirtCoarse", "grass","grass","dirtCoarse", "grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","",""],
    actionPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","planksBirch","planksBirch","planksBirch","planksBirch","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    playerStartPosition: [3, 6],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "any", "any", "any", "any", "", "", "",
        "", "", "", "any", "", "", "any", "", "", "",
        "", "", "", "any", "", "", "any", "", "", "",
        "", "", "", "any", "any", "any", "any", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
      ]),
  },
  adventurer07: {
    groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","dirt","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","dirt","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","dirt","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["flowerOxeeye","tallGrass","","","","tallGrass","","","flowerDandelion","tallGrass","tallGrass","tallGrass","flowerDandelion","","","","","","","flowerDandelion","","flowerDandelion","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerDandelion","","","","","","tallGrass","","","","","","","","","tallGrass","flowerDandelion","tallGrass","","","","","","","","tallGrass","tallGrass"],
    actionPlane: ["","","grass","grass","","","","","","","","","","grass","","","","","","","","","","","","","","","","","planksBirch","","","","","","","","","","planksBirch","","","","","","","","","","planksBirch","","","","","","","","","","planksBirch","","","","","","","","","","","","","","","","","","","","","","grass","","","","","","","","","","grass","grass","","","","","",""],
    entities: [["sheep", 8, 2, 3], ["sheep", 2, 6, 3]],
    playerStartPosition: [4, 7],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
      ]),
  },
  adventurer08: {
    isDaytime: false,
    groundPlane: ["grass","grass","grass","planksBirch","grass","grass","planksBirch","grass","grass","grass","grass","grass","grass","planksBirch","planksBirch","planksBirch","planksBirch","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerDandelion","","tallGrass","","","","","","","","","tallGrass","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","",""],
    actionPlane: ["","","","planksBirch","","","planksBirch","","","","","","torch","planksBirch","","planksBirch","planksBirch","","","","","","","","","","","","","","","","","","","torch","","","","","","","","","","","","","","","grass","","","","","","","","","","grass","","","","","","","","","","grass","","","","","","","","","","grass","","","","","","","","","grass","","","","","","","","grass","grass","grass"],
    entities: [["creeper", 2, 2, 2], ["creeper", 4, 3, 2], ["creeper", 3, 4, 2], ["creeper", 5, 5, 2], ["creeper", 7, 3, 2], ["creeper", 7, 5, 2], ["creeper", 6, 7, 2], ["creeper", 9, 4, 2]],
    playerStartPosition: [2, 6],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.isPlayerAt([4, 1]) ||
      verificationAPI.isPlayerAt([4, 2]) ||
      verificationAPI.isPlayerAt([4, 0]) ||
      verificationAPI.isPlayerAt([5, 0]),
  },
  adventurer09: {
    isDaytime: false,
    groundPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    actionPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","","","oreCoal","oreCoal","oreCoal","stone","oreCoal","stone","stone","stone","","","","","","","stone","stone","stone","stone","","","","","","","oreCoal","stone","stone","stone","","stone","","","","","oreCoal","stone","stone","stone","stone","stone","oreCoal","oreCoal","","","stone","","","stone","stone","stone","stone","stone","","","stone","stone","stone","stone","stone","stone","stone","stone","","stone","stone","stone","stone","stone","stone","stone","stone","stone","","stone","stone","stone","stone"],
    playerStartPosition: [5, 6],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("oreCoal") >= 2 &&
      verificationAPI.countOfTypeOnMap("torch") >= 2,
  },
  adventurer10: {
    isDaytime: false,
    groundPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","stone","lava","stone","stone","lava","lava","lava","lava","lava","lava","lava","lava","lava","lava","stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","torch","","","","","","","","","","lavaPop","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    actionPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","oreIron","oreIron","oreIron","stone","stone","stone","stone","stone","stone","stone","oreIron","oreIron","oreIron","stone","stone","stone","stone","stone","","","","","","","","","stone","","","","","","","","","","","stone","stone","stone","","","","","","stone","stone","","","","","","stone","stone","","stone","stone","stone","","","","","","","","stone","stone","stone","stone","","","","","","","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    playerStartPosition: [3, 6],
    playerStartDirection: 0,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("oreIron") >= 2,
  },
  adventurer11: {
    isDaytime: false,
    groundPlane: ["stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","lava","lava","stone","stone","lava","stone","stone","lava","stone","lava","stone","stone","lava","lava","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    actionPlane: ["stone","stone","stone","stone","stone","stone","stone","","stone","stone","stone","stone","","","","","","","stone","stone","stone","","","","","","","","stone","stone","stone","","","","","","","","stone","stone","stone","","stone","stone","oreCoal","oreCoal","stone","oreIron","oreIron","stone","stone","","","","","","","","","","stone","","","","","","stone","","stone","stone","stone","stone","","","stone","","","","stone","stone","stone","stone","","","stone","stone","","","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    playerStartPosition: [1, 4],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.countOfTypeOnMap("oreIron") === 0 &&
      verificationAPI.countOfTypeOnMap("oreCoal") === 0,
  },
  adventurer12: {
    isDaytime: false,
    groundPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","lava","lava","lava","lava","stone","stone","stone","stone","stone","stone","lava","lava","lava","lava","stone","lava","stone","stone","stone","stone","lava","stone","stone","stone","lava","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","lava","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","",""],
    actionPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","","stone","oreRedstone","oreDiamond","stone","oreRedstone","stone","stone","stone","","","oreRedstone","","","oreRedstone","oreRedstone","stone","stone","stone","","","","","","","oreDiamond","stone","stone","","","","","","","","stone","stone","stone","","","","","","","oreRedstone","stone","stone","stone","","","","stone","stone","stone","oreRedstone","stone","stone","stone","","","","","","","","","stone","stone","","","","","","","","","stone","stone","","","stone","stone","stone","stone","stone","stone","stone","stone"],
    playerStartPosition: [3, 5],
    playerStartDirection: 1,
    verificationFunction: verificationAPI =>
      verificationAPI.getInventoryAmount("oreRedstone") >= 3,
  },
  adventurer13: {
    specialLevelType: "minecart",
    gridDimensions: [12, 10],
    groundPlane: ["grass","grass","planksBirch","grass","grass","planksBirch","grass","grass","grass","grass","grass","grass","grass","grass","planksBirch","planksBirch","planksBirch","planksBirch","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","dirt","water","water","grass","grass","grass","grass","grass","grass","grass","grass","water","dirt","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","dirt","dirt","dirt","dirt","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
    groundDecorationPlane: ["tallGrass","tallGrass","","","","","","tallGrass","","","","","","flowerOxeeye","","","","","tallGrass","","","","tallGrass","","","","","","","","","","tallGrass","flowerDandelion","","","","tallGrass","","","","","","","","","","","tallGrass","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","tallGrass","","","tallGrass","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","tallGrass","","","tallGrass","","","","","","","","","","","tallGrass","flowerRose","",""],
    actionPlane: ["","","planksBirch","","","planksBirch","","","","","","","","","planksBirch","","planksBirch","planksBirch","","","","","","","","","railsRedstoneTorch","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","railsEast","railsWest","treeBirch","","","","","","","","","","","","","","","","","","","","","","",""],
    fluffPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    playerStartPosition: [9, 7],
    playerStartDirection: 2,
    verificationFunction: verificationAPI =>
      verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredNorthSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredNorthSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredNorthSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsPoweredNorthSouth", "", "", "", "", "", "", "", "",
        "", "", "", "railsNorthEast", "railsEastWest", "railsEastWest", "railsEastWest", "railsEastWest", "railsEastWest", "railsEastWest", "railsEastWest", "railsWest",
        "", "", "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "", "", "",
      ]),
  },
  adventurer14: {
    specialLevelType: "freeplay",
    gridDimensions: [20, 20],
    groundPlane: ["grass","grass","grass","grass","dirt","dirt","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","water","water","water","water","grass","grass","water","water","water","water","water","grass","grass","grass","grass","grass","grass","water","water","grass","grass","grass","grass","water","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","dirt","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","dirt","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","dirt","dirt","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","water","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","grass","dirt","grass","water","grass","grass","grass","water","water","water","water","water","water","water","stone","lava","lava","lava","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass","grass","grass","dirt","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass","dirt","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass"],
    groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    actionPlane: ["oreLapis","oreLapis","stone","stone","stone","stone","stone","oreIron","oreIron","","oreRedstone","oreRedstone","oreRedstone","stone","","stone","stone","oreIron","oreGold","oreGold","oreLapis","oreCoal","","stone","oreIron","oreIron","","stone","","","stone","oreRedstone","stone","stone","","","","stone","stone","oreGold","oreCoal","stone","","","","","","","","","","stone","","stone","","","","","","","stone","","","","","","treeOak","","","","","","","","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","","","","","","","","","treeBirch","","","","","","","","","","","","","","","","treeSpruce","","","","","","","","","","treeSpruce","","","","","","","","","oreIron","","","","","","","","","","","","","","treeOak","","","","","","stone","oreIron","","","","","","","","","","","","","","","treeSpruce","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeOak","","","","","","treeBirch","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","","","","","","","oreDiamond","","","","","","","","treeSpruce","","","","","","","","","","","oreDiamond","oreDiamond","","","","","","","","","","","","","","","","","","","oreEmerald","oreLapis"],
    fluffPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    entities: [["sheep", 0, 18, 1], ["sheep", 1, 14, 1], ["sheep", 2, 17, 1], ["sheep", 3, 15, 1], ["sheep", 4, 18, 1]],
    playerStartPosition: [10, 10],
    playerStartDirection: 0,
    verificationFunction: () => true,
  },
};

},{}],41:[function(require,module,exports){
module.exports = {
  agent01: {
    isAgentLevel: true,
    useAgent: true,
    groundPlane: ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "dirt", "planksSpruce", "dirt", "dirt", "grass", "grass", "dirt", "grass", "grass", "dirt", "wool_blue", "wool_blue", "wool_blue", "dirt", "grass", "grass", "grass", "grass", "grass", "planksSpruce", "wool_blue", "wool_blue", "wool_blue", "planksSpruce", "grass", "grass", "grass", "grass", "grass", "dirt", "wool_blue", "wool_blue", "wool_blue", "dirt", "grass", "grass", "grass", "grass", "bricks", "dirt", "dirt", "planksSpruce", "dirt", "dirt", "bricks", "bricks", "grass", "bricks", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "logAcacia", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "tallGrass", "tallGrass", "", "", "", "", "", "", "", "", "", "tallGrass", "tallGrass", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "tallGrass", "flowerRose", "flowerDandelion", "", "flowerDandelion", "flowerDandelion", "tallGrass", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "tallGrass", "tallGrass", "", "", "", "", "", "tallGrass", "", "tallGrass"],
    actionPlane: ["", "", "", "diamondMiniblock", "", "", "", "", "", "", "", "planksSpruce", "planksSpruce", "glass", "planksSpruce", "planksSpruce", "", "", "treeSpruce", "", "", "planksSpruce", "bedHead", "", "", "planksSpruce", "", "", "", "", "", "glass", "bedFoot", "", "", "glass", "", "", "", "", "", "planksSpruce", "", "", "", "planksSpruce", "", "", "", "", "bricks", "planksSpruce", "planksSpruce", "doorIron", "planksSpruce", "planksSpruce", "bricks", "bricks", "", "bricks", "", "", "", "redstoneWire", "", "", "", "", "", "", "", "", "", "redstoneWire", "", "", "", "", "", "", "", "", "", "pressurePlateUp", "", "", "", "", "chestMiniblock", "", "", "", "", "", "", "", "", "", "", ""],
    playerStartPosition: [3, 3],
    playerStartDirection: 2,
    agentStartPosition: [3, 9],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([8, 8]),
  },
  agent02: {
    isAgentLevel: true,
    useAgent: true,
    groundPlane: ["grass", "grass", "dirt", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "logAcacia", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "water", "water", "dirt", "water", "water", "water", "dirt", "water", "water", "water", "water", "water", "dirt", "water", "water", "water", "dirt", "water", "water", "water", "water", "water", "dirt", "water", "water", "water", "dirt", "water", "water", "water", "water", "water", "dirt", "water", "water", "water", "dirt", "water", "water", "water", "water", "water", "dirt", "water", "water", "water", "dirt", "water", "water", "water", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "flowerOxeeye", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "flowerOxeeye", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["grass", "grass", "diamondMiniblock", "grass", "grass", "grass", "", "grass", "grass", "grass", "grass", "grass", "doorIron", "grass", "grass", "grass", "mapEmptyMiniblock", "grass", "grass", "", "", "redstoneWire", "", "redstoneWire", "redstoneWire", "grass", "doorIron", "grass", "grass", "", "", "redstoneWire", "redstoneWire", "redstoneWire", "", "", "redstoneWire", "", "", "", "", "", "redstoneWire", "", "", "", "redstoneWire", "", "", "", "", "", "pressurePlateUp", "", "", "", "redstoneWire", "", "", "", "", "", "", "", "", "", "redstoneWire", "", "", "", "", "", "", "", "", "", "pressurePlateUp", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    playerStartPosition: [2, 9],
    playerStartDirection: 0,
    agentStartPosition: [6, 9],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([6, 1]),
  },
  agent03: {
    isAgentLevel: true,
    useAgent: true,
    groundPlane: ["grass", "grass", "grass", "grass", "stone", "grass", "grass", "gravel", "grass", "grass", "grass", "grass", "grass", "grass", "gravel", "gravel", "gravel", "gravel", "gravel", "grass", "stone", "grass", "grass", "grass", "gravel", "gravel", "gravel", "gravel", "gravel", "logAcacia", "gravel", "grass", "grass", "grass", "grass", "grass", "gravel", "dirt", "gravel", "gravel", "gravel", "gravel", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "gravel", "grass", "grass", "grass", "dirt", "dirt", "dirt", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass"],
    groundDecorationPlane: ["tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "flowerDandelion", "", "", "", "", "", "", "flowerOxeeye"],
    actionPlane: ["redstoneWire", "redstoneWire", "redstoneWire", "stone", "diamondMiniblock", "stone", "stone", "stone", "stone", "stone", "redstoneWire", "treeSpruce", "redstoneWire", "stone", "doorIron", "stone", "stone", "", "", "stone", "redstoneWire", "", "redstoneWire", "stone", "redstoneWire", "stone", "stone", "", "", "compassMiniblock", "redstoneWire", "stone", "redstoneWire", "redstoneWire", "redstoneWire", "redstoneWire", "stone", "doorIron", "stone", "", "redstoneWire", "", "", "", "", "", "", "redstoneWire", "stone", "stone", "pressurePlateUp", "", "", "", "pressurePlateUp", "redstoneWire", "redstoneWire", "redstoneWire", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "treeSpruce", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "", "treeSpruce", "", "grass", "grass", "", "", "", "", "", "", "", ""],
    playerStartPosition: [5, 9],
    playerStartDirection: 0,
    agentStartPosition: [4, 9],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([9, 2]),
  },
  agent04: {
    isAgentLevel: true,
    useAgent: true,
    groundPlane: ["grass", "grass", "grass", "grass", "dirt", "gravel", "water", "planksJungle", "planksJungle", "planksJungle", "grass", "grass", "grass", "grass", "water", "gravel", "water", "planksJungle", "planksJungle", "logAcacia", "grass", "grass", "grass", "grass", "grass", "gravel", "water", "planksJungle", "planksJungle", "planksJungle", "grass", "grass", "grass", "grass", "grass", "gravel", "grass", "planksJungle", "planksJungle", "planksJungle", "grass", "grass", "grass", "water", "water", "gravel", "water", "water", "gravel", "water", "dirtCoarse", "dirtCoarse", "grass", "water", "water", "water", "water", "water", "gravel", "water", "dirtCoarse", "dirtCoarse", "grass", "water", "water", "water", "water", "water", "gravel", "water", "dirtCoarse", "dirtCoarse", "grass", "water", "water", "stone", "water", "water", "gravel", "water", "dirtCoarse", "dirtCoarse", "gravel", "water", "water", "water", "water", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["", "redstoneWire", "redstoneWire", "redstoneWire", "grass", "pressurePlateUp", "", "planksSpruce", "planksSpruce", "planksSpruce", "", "redstoneWire", "", "pressurePlateUp", "", "redstoneWire", "", "planksSpruce", "", "bucketEmptyMiniblock", "treeSpruce", "redstoneWire", "", "redstoneWire", "", "redstoneWire", "", "planksSpruce", "", "", "", "redstoneWire", "", "redstoneWire", "redstoneWire", "redstoneWire", "redstoneWire", "planksSpruce", "doorIron", "planksSpruce", "cobblestone", "pistonDown", "cobblestone", "", "", "", "", "", "", "", "treeSpruce", "railsRedstoneTorch", "cobblestone", "", "", "", "", "", "", "", "diamondMiniblock", "pistonDownOnSticky", "cobblestone", "", "", "", "", "", "", "", "", "pistonArmDown", "cobblestone", "", "", "", "", "", "", "", "", "dirt", "", "", "", "", "", "", "", "grass", "cobblestone", "cobblestone", "", "", "", "", "", "", "grass", "grass"],
    playerStartPosition: [5, 9],
    playerStartDirection: 0,
    agentStartPosition: [5, 7],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([9, 1]),
  },
  agent05: {
    isAgentLevel: true,
    useAgent: true,
    groundPlane: ["sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "logAcacia", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "planksJungle", "planksJungle", "planksJungle", "planksJungle", "sand", "sand", "sand", "sand", "sand", "sand", "planksJungle", "planksJungle", "planksJungle", "planksJungle", "sand", "sand", "sand", "sand", "sand", "sand", "planksJungle", "planksJungle", "planksJungle", "planksJungle", "sand", "sand", "sandstone", "sandstone", "sandstone", "sandstone", "planksJungle", "planksJungle", "planksJungle", "planksJungle", "sand", "sand", "sandstone", "sandstone", "sandstone", "sandstone", "planksJungle", "planksJungle", "planksJungle", "planksJungle", "sand", "sand", "sandstone", "sandstone", "sandstone", "sandstone"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "deadBush", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "deadBush", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["sandstone", "sandstone", "", "", "", "", "", "", "sandstone", "sandstone", "sandstone", "", "", "cactus", "redstoneWire", "redstoneWire", "redstoneWire", "cactus", "", "axeDiamondMiniblock", "", "", "", "", "redstoneWire", "", "redstoneWire", "", "", "", "", "cactus", "redstoneWire", "redstoneWire", "redstoneWire", "cactus", "redstoneWire", "redstoneWire", "pressurePlateUp", "sandstone", "", "", "redstoneWire", "", "", "", "", "", "redstoneWire", "", "planksSpruce", "planksSpruce", "doorIron", "planksSpruce", "redstoneWire", "redstoneWire", "pressurePlateUp", "", "redstoneWire", "", "planksSpruce", "", "", "planksSpruce", "", "", "", "", "redstoneWire", "", "planksSpruce", "", "", "glass", "", "sandstone", "sandstone", "doorIron", "sandstone", "sandstone", "planksSpruce", "", "", "planksSpruce", "", "sandstone", "", "", "", "sandstone", "", "", "planksSpruce", "planksSpruce", "", "sandstone", "torch", "diamondMiniblock", "torch", "sandstone"],
    playerStartPosition: [0, 9],
    playerStartDirection: 1,
    agentStartPosition: [4, 7],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([9, 1]),
  },
  agent06: {
    isAgentLevel: true,
    useAgent: true,
    groundPlane: ["dirt", "dirtCoarse", "dirt", "sand", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "logAcacia", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "water", "dirt", "sand", "sand", "sand", "dirt", "dirtCoarse", "dirt", "dirtCoarse", "dirt", "water", "water", "water", "water", "water", "water", "dirt", "dirt", "dirt", "dirt", "dirt", "water", "water", "water", "water", "water", "water", "water", "water", "water", "sand", "sand", "water", "water", "water", "water", "water", "dirt", "water", "water", "sandstone", "sandstone", "sand", "sand", "sand", "sand", "water", "water", "water", "water", "sandstone", "sandstone", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sandstone", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sand", "sandstone", "sandstone", "sandstone", "sand", "sand", "sand", "sand", "sand", "sand", "sandstone", "sandstone"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "deadBush", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "deadBush", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "deadBush", "", "", "", "", "", "", ""],
    actionPlane: ["dirtCoarse", "dirtCoarse", "dirtCoarse", "", "dirtCoarse", "dirtCoarse", "dirtCoarse", "", "", "", "", "", "dirtCoarse", "shovelDiamondMiniblock", "dirtCoarse", "dirtCoarse", "", "", "treeOak", "", "", "dirtCoarse", "", "", "", "dirtCoarse", "dirtCoarse", "", "diamondMiniblock", "", "", "", "", "", "", "", "", "", "", "", "dirtCoarse", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "dirtCoarse", "", "", "sandstone", "sandstone", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "sandstone", "sandstone", "", "", "", "", "", "", "", "sandstone", "sandstone", "", "sandstone", "sandstone", "", "", "", "", "", "sandstone", "", ""],
    playerStartPosition: [1, 7],
    playerStartDirection: 1,
    agentStartPosition: [3, 6],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([3, 1]),
  },
  agent07: {
    isAgentLevel: true,
    useAgent: true,
    groundPlane: ["stone", "stone", "stone", "gravel", "gravel", "dirtCoarse", "grass", "stone", "gravel", "stone", "stone", "gravel", "stone", "stone", "gravel", "logAcacia", "stone", "stone", "stone", "stone", "gravel", "stone", "water", "water", "water", "water", "water", "water", "stone", "stone", "water", "water", "water", "water", "water", "water", "water", "gravel", "stone", "stone", "grass", "grass", "water", "water", "water", "water", "water", "stone", "stone", "gravel", "grass", "grass", "grass", "water", "water", "water", "water", "stone", "gravel", "gravel", "water", "dirtCoarse", "water", "water", "water", "water", "water", "water", "stone", "stone", "water", "water", "water", "dirtCoarse", "dirtCoarse", "dirtCoarse", "water", "water", "water", "water", "dirtCoarse", "water", "dirtCoarse", "dirtCoarse", "sand", "dirt", "dirtCoarse", "dirtCoarse", "water", "water", "dirtCoarse", "dirtCoarse", "dirtCoarse", "sand", "sand", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "water"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["stone", "stone", "", "", "stone", "", "stone", "", "", "stone", "stone", "", "", "", "", "pickaxeDiamondMiniblock", "", "", "", "", "", "", "", "", "", "", "", "", "dirtCoarse", "dirtCoarse", "", "", "", "", "", "", "", "dirtCoarse", "", "", "", "", "", "", "", "", "", "", "diamondMiniblock", "", "", "treeSpruce", "", "", "", "", "", "dirtCoarse", "", "", "", "", "", "", "", "", "", "", "dirtCoarse", "dirtCoarse", "", "", "", "", "", "", "", "", "", "", "dirtCoarse", "", "", "", "", "", "", "dirtCoarse", "", "", "dirtCoarse", "dirtCoarse", "", "", "", "", "", "", "dirtCoarse", ""],
    playerStartPosition: [4, 9],
    playerStartDirection: 0,
    agentStartPosition: [5, 7],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([5, 1]),
  },
  agent08: {
    isAgentLevel: true,
    useAgent: true,
    isDaytime: false,
    groundPlane: ["gravel", "dirtCoarse", "dirtCoarse", "gravel", "water", "water", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "water", "water", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "water", "water", "gravel", "gravel", "snow", "logAcacia", "gravel", "dirtCoarse", "gravel", "dirtCoarse", "water", "water", "dirtCoarse", "gravel", "gravel", "snow", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "water", "water", "dirtCoarse", "water", "water", "gravel", "water", "water", "water", "water", "water", "water", "gravel", "water", "water", "gravel", "water", "water", "water", "water", "water", "water", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "gravel"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["stone", "oreRedstone", "", "stone", "water", "water", "stone", "", "", "stone", "stone", "", "", "stone", "", "", "stone", "planksJungle", "planksJungle", "snowyGrass", "stone", "planksJungle", "planksJungle", "stone", "", "", "", "", "", "redstoneTorchMiniblock", "oreCoal", "", "", "torch", "", "", "torch", "", "", "", "", "", "", "", "", "", "oreCoal", "", "", "stone", "", "", "", "", "", "", "stone", "", "", "stone", "", "", "", "", "", "stone", "stone", "diamondMiniblock", "", "", "stone", "", "", "", "", "stone", "stone", "", "", "", "stone", "", "", "", "stone", "stone", "stone", "planksJungle", "planksJungle", "oreCoal", "oreCoal", "stone", "stone", "", "stone", "oreRedstone", "stone", "", "", "stone"],
    playerStartPosition: [3, 8],
    playerStartDirection: 0,
    agentStartPosition: [3, 7],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([9, 2]),
  },
  agent09: {
    isAgentLevel: true,
    useAgent: true,
    groundPlane: ["snow", "snow", "snow", "bedrock", "bedrock", "bedrock", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "bedrock", "logAcacia", "bedrock", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "water", "water", "snow", "snow", "water", "snow", "ice", "ice", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "ice", "water", "ice", "snow", "water", "snow", "snow", "snow", "snow", "snow", "ice", "ice", "ice", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "ice", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "water", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow", "snow"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["", "", "stone", "", "", "", "stone", "", "", "", "", "", "stone", "", "minecartMiniblock", "", "stone", "", "", "treeBirch", "", "", "stone", "stone", "", "stone", "stone", "", "", "", "treeBirch", "", "", "snowyGrass", "ice", "ice", "", "", "ice", "snow", "", "", "", "snowyGrass", "", "snowyGrass", "snowyGrass", "snowyGrass", "diamondMiniblock", "snowyGrass", "", "", "", "snowyGrass", "ice", "snowyGrass", "", "snowyGrass", "snowyGrass", "snowyGrass", "", "", "", "snowyGrass", "", "snowyGrass", "", "", "", "", "", "", "", "snowyGrass", "", "snowyGrass", "", "", "", "snow", "snowyGrass", "snowyGrass", "snowyGrass", "snowyGrass", "ice", "snowyGrass", "", "", "snow", "snow", "", "", "", "", "", "snowyGrass", "", "snow", "snow", "snow"],
    playerStartPosition: [3, 9],
    playerStartDirection: 0,
    agentStartPosition: [4, 9],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([4, 1]),
  },
  agent10: {
    isAgentLevel: true,
    useAgent: true,
    isDaytime: false,
    groundPlane: ["water", "water", "lava", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "water", "obsidian", "water", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "water", "bedrock", "bedrock", "obsidian", "obsidian", "obsidian", "obsidian", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "logAcacia", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "lava", "lava", "lava", "lava", "lava", "bedrock", "bedrock", "bedrock", "bedrock", "gravel", "gravel", "lava", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "lava", "lava", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "lava", "lava", "lava", "lava", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Nether_Portal", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["", "", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "pistonDownOnSticky", "railsRedstoneTorch", "", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "pistonArmDown", "pistonUp", "bedrock", "bedrock", "torch", "obsidian", "", "", "obsidian", "torch", "stone", "pressurePlateUp", "bedrock", "", "", "", "flintAndSteelMiniblock", "", "", "", "bedrock", "diamondMiniblock", "gravel", "rails", "rails", "rails", "rails", "", "", "gravel", "", "", "gravel", "", "", "", "bedrock", "", "bedrock", "gravel", "bedrock", "bedrock", "gravel", "bedrock", "", "bedrock", "bedrock", "bedrock", "bedrock", "rails", "rails", "gravel", "rails", "bedrock", "bedrock", "bedrock", "", "", "bedrock", "bedrock", "bedrock", "gravel", "rails", "bedrock", "bedrock", "", "", "", "", "bedrock", "bedrock", "gravel", "gravel", "gravel", "rails", "rails", "", "", "rails", "rails", "gravel", "gravel"],
    playerStartPosition: [5, 9],
    playerStartDirection: 0,
    agentStartPosition: [4, 9],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([4, 3]),
  },
  agent11: {
    isAgentLevel: true,
    useAgent: true,
    isDaytime: false,
    entities: [["ghast", 1, 5, 2, "A"], ["ghast", 7, 7, 2, "B"]],
    groundPlane: ["netherrack", "netherrack", "netherrack", "netherrack", "netherrack", "netherrack", "netherrack", "netherrack", "netherrack", "lava", "netherrack", "lava", "netherrack", "obsidian", "obsidian", "obsidian", "obsidian", "netherrack", "lava", "lava", "lava", "lava", "lava", "netherBrick", "logAcacia", "netherBrick", "netherBrick", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "netherBrick", "lava", "lava", "netherBrick", "netherBrick", "lava", "lava", "lava", "netherBrick", "lava", "lava", "lava", "lava", "lava", "netherBrick", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "netherBrick", "netherBrick", "netherBrick", "lava", "lava", "netherBrick", "netherBrick", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "lava", "netherrack", "netherrack", "lava", "lava", "lava", "lava", "lava", "lava", "netherrack", "netherrack", "netherrack", "lava", "lava", "netherBrick", "netherBrick", "netherBrick", "netherBrick", "lava", "lava", "netherrack"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "lavaPop", "", "Nether_Portal", "", "", "", "", "lavaPop", "", "", "", "", "", "", "", "", "", "", "", "", "", "lavaPop", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "lavaPop", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "lavaPop"],
    actionPlane: ["glowstone", "netherrack", "", "obsidian", "obsidian", "obsidian", "obsidian", "", "diamondMiniblock", "", "netherrack", "", "", "obsidian", "", "", "obsidian", "", "", "", "", "", "", "", "bookEnchantedMiniblock", "", "", "", "", "", "", "", "", "", "", "", "", "", "netherBrick", "", "", "", "netherBrick", "", "", "", "netherBrick", "", "", "", "", "", "netherBrick", "", "", "", "", "", "", "", "", "", "netherBrick", "netherBrick", "netherBrick", "", "", "netherBrick", "netherBrick", "", "", "", "", "", "", "", "", "", "", "", "netherrack", "netherrack", "", "", "", "", "", "", "netherrack", "glowstone", "netherrack", "", "", "netherBrick", "", "", "netherBrick", "", "", "netherrack"],
    playerStartPosition: [5, 9],
    playerStartDirection: 0,
    agentStartPosition: [4, 9],
    agentStartDirection: 0,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([4, 2]),
  },
  agent12: {
    isAgentLevel: true,
    useAgent: true,
    groundPlane: ["gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "oreDiamond", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "wool_orange", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel", "gravel"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "", "", "rails", "rails", "snow", "snow", "snow", "rails", "rails", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "rails", "bedrock", "bedrock", "bedrock", "snow", "snow", "snow", "snow", "bedrock", "bedrock", "snow", "bedrock", "bedrock", "bedrock", "snow", "bedrock", "bedrock", "snow", "bedrock", "bedrock", "snow", "bedrock", "bedrock", "bedrock", "snow", "bedrock", "diamondMiniblock", "snow", "bedrock", "bedrock", "snow", "bedrock", "bedrock", "bedrock", "", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "rails", "bedrock", "bedrock", "railsRedstoneTorch", "rails", "rails", "snow", "snow", "snow", "rails", "rails", "bedrock", "bedrock", "redstoneWire", "bedrock", "bedrock", "bedrock", "bedrock", "bedrock", "pistonRightOnSticky", "pistonArmRight", "torch", "bedrock", "redstoneWire", "redstoneWire", "redstoneWire", "redstoneWire", "redstoneWire", "redstoneWire", "redstoneWire", "bedrock", "bedrock"],
    playerStartPosition: [1, 1],
    playerStartDirection: 1,
    agentStartPosition: [2, 1],
    agentStartDirection: 1,
    verificationFunction: verificationAPI => verificationAPI.isPlayerAt([4, 2]),
  },
};

},{}],42:[function(require,module,exports){
const baseGroundPlane = ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "dirtCoarse", "dirt", "dirtCoarse", "dirt", "grass", "grass", "grass", "grass", "grass", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "grass", "grass", "grass", "dirtCoarse", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirt", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt"];
const baseDecorationPlane = ["", "", "tallGrass", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "flowerDandelion", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "tallGrass", ""];
const baseActionPlane = ["grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "grass"];

const houseGroundPlane = ["grass", "grass", "grass", "planksOak", "planksOak", "planksOak", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "planksOak", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass"];
const houseDecorationPlane = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "flowerOxeeye", "flowerOxeeye", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "flowerDandelion", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "flowerOxeeye", "flowerOxeeye"];
const houseActionPlane = ["grass", "grass", "bricks", "", "", "", "bricks", "grass", "grass", "grass", "grass", "", "bricks", "bricks", "door", "bricks", "bricks", "", "grass", "grass", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "treeSpruce", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "treeSpruce", "", "", "grass", "grass", "grass", "", "", "", "", "", "", ""];

const fourChickens = [["chicken", 3, 3, 1], ["chicken", 6, 3, 1], ["chicken", 3, 6, 1], ["chicken", 6, 6, 1]];

module.exports = {
  designer01: {
    isEventLevel: true,
    groundPlane: baseGroundPlane,
    groundDecorationPlane: baseDecorationPlane,
    actionPlane: baseActionPlane,
    entities: [["chicken", 4, 4, 1]],
    usePlayer: false,
    levelVerificationTimeout: 5000,
    timeoutResult: verificationAPI => (
      verificationAPI.getCommandExecutedCount("moveForward") >= 1 &&
      verificationAPI.getCommandExecutedCount("turn") >= 1
    ),
    verificationFunction: verificationAPI => (
      !verificationAPI.isEntityTypeRunning("chicken") &&
      verificationAPI.getCommandExecutedCount("moveForward") >= 1 &&
      verificationAPI.getCommandExecutedCount("turn") >= 1
    ),
  },
  designer02: {
    isEventLevel: true,
    groundPlane: baseGroundPlane,
    groundDecorationPlane: baseDecorationPlane,
    actionPlane: baseActionPlane,
    entities: fourChickens,
    usePlayer: false,
    levelVerificationTimeout: 5000,
    timeoutResult: verificationAPI => (
      verificationAPI.getRepeatCommandExecutedCount("moveForward") > 0
    ),
    verificationFunction: () => false,
  },
  designer03: {
    isEventLevel: true,
    groundPlane: baseGroundPlane,
    groundDecorationPlane: baseDecorationPlane,
    actionPlane: baseActionPlane,
    entities: fourChickens,
    usePlayer: false,
    levelVerificationTimeout: 7000,
    timeoutResult: verificationAPI => (
      verificationAPI.getCommandExecutedCount("turnRandom") >= 1 ||
      verificationAPI.getRepeatCommandExecutedCount("turnRandom") >= 1
    ),
    verificationFunction: () => false,
  },
  designer04: {
    isEventLevel: true,
    groundPlane: houseGroundPlane,
    groundDecorationPlane: houseDecorationPlane,
    actionPlane: houseActionPlane,
    usePlayer: true,
    playerStartPosition: [4, 7],
    playerStartDirection: 0,
    levelVerificationTimeout: 20000,
    timeoutResult: () => false,
    verificationFunction: verificationAPI => (
      verificationAPI.isEntityOnBlocktype("Player", "planksOak")
    ),
  },
  designer05: {
    isEventLevel: true,
    groundPlane: houseGroundPlane,
    groundDecorationPlane: houseDecorationPlane,
    actionPlane: houseActionPlane,
    entities: [["sheep", 6, 3, 1]],
    usePlayer: true,
    playerStartPosition: [4, 7],
    playerStartDirection: 0,
    levelVerificationTimeout: 20000,
    timeoutResult: () => false,
    verificationFunction: verificationAPI => (
      verificationAPI.getInventoryAmount("all") >= 1
    ),
  },
  designer06: {
    isEventLevel: true,
    groundPlane: ["dirt", "dirt", "dirtCoarse", "dirt", "gravel", "dirtCoarse", "water", "water", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "water", "water", "dirt", "dirt", "dirt", "dirtCoarse", "grass", "grass", "grass", "dirtCoarse", "water", "water", "dirt", "dirt", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["stone", "stone", "", "stone", "stone", "", "", "", "stone", "stone", "stone", "", "", "", "", "", "", "", "", "stone", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "stone", "stone", "", "", "", "", "", "stone", "", "", "", "stone", "", "", "", "", "", "stone", "stone", "", "", "", "", "stone", "", "", "", "", "", "", "", "", "stone", "stone", "", "", "", "", "", "", "", "", "", "", "stone", "", "", "", "stone", "", "", "", "", "grass", "stone", "", "", "stone", "stone", "", "", "", "grass", "grass"],
    entities: [["cow", 6, 1, 1], ["cow", 1, 2, 1]],
    usePlayer: true,
    playerStartPosition: [5, 6],
    playerStartDirection: 2,
    levelVerificationTimeout: 60000,
    timeoutResult: () => false,
    verificationFunction: verificationAPI => {
      const grassPositions = [[6, 6], [7, 6], [8, 6], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [6, 8], [7, 8], [8, 8], [9, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9]];
      let cowOnGrassCount = 0;
      for (let i = 0; i < grassPositions.length; i++) {
        if (verificationAPI.isEntityAt("cow", grassPositions[i])) {
          cowOnGrassCount++;
        }
      }
      return cowOnGrassCount >= 2;
    },
  },
  designer07: {
    isEventLevel: true,
    isDaytime: false,
    groundPlane: ["stone", "stone", "stone", "stone", "lava", "lava", "stone", "grass", "grass", "grass", "stone", "stone", "stone", "stone", "lava", "lava", "stone", "grass", "grass", "grass", "stone", "stone", "stone", "stone", "stone", "lava", "stone", "grass", "grass", "grass", "gravel", "stone", "stone", "stone", "stone", "stone", "stone", "grass", "grass", "grass", "stone", "stone", "gravel", "gravel", "gravel", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "dirtCoarse", "stone", "gravel", "gravel", "stone", "gravel", "gravel", "gravel", "dirtCoarse", "dirtCoarse", "dirtCoarse", "gravel", "gravel", "gravel", "stone", "stone", "stone", "stone", "grass", "grass", "grass", "stone", "gravel", "stone", "stone", "stone", "stone", "stone", "grass", "grass", "grass", "lava", "stone", "stone", "stone", "stone", "stone", "stone", "grass", "grass", "grass", "lava", "lava", "stone", "gravel", "stone", "stone", "stone", "grass", "grass", "grass"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "lavaPop", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "lavaPop", "", "", "", "", "", "", "", ""],
    actionPlane: ["stone", "stone", "", "", "stone", "stone", "stone", "oreCoal", "stone", "stone", "oreCoal", "stone", "", "", "", "", "stone", "stone", "stone", "", "stone", "", "", "", "", "", "stone", "stone", "", "treeBirch", "", "", "", "", "", "", "stone", "stone", "", "", "", "", "", "", "", "", "stone", "", "", "", "", "", "", "", "", "", "stone", "", "", "", "", "", "", "", "", "", "stone", "stone", "", "", "", "", "", "", "", "stone", "stone", "stone", "", "", "", "", "", "", "stone", "stone", "stone", "stone", "stone", "", "", "", "", "", "stone", "stone", "stone", "oreDiamond", "stone", "stone"],
    entities: [["sheep", 8, 4, 1], ["creeper", 2, 8, 1]],
    usePlayer: true,
    playerStartPosition: [3, 1],
    playerStartDirection: 2,
    levelVerificationTimeout: -1,
    timeoutResult: () => false,
    verificationFunction: verificationAPI  => {
      const successPositions = [[7, 4] , [7, 5]];
      for (let i = 0; i < successPositions.length; i++) {
        if (verificationAPI.isEntityAt("Player" , successPositions[i])) {
          return true;
        }
      }
    },
  },
  designer08: {
    isEventLevel: true,
    isDaytime: false,
    groundPlane: ["grass", "dirt", "dirt", "dirt", "grass", "grass", "grass", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "grass", "grass", "grass", "grass", "grass", "dirt", "dirt", "grass", "dirt", "dirt", "bricks", "bricks", "bricks", "bricks", "bricks", "grass", "grass", "grass", "grass", "dirt", "bricks", "planksSpruce", "planksSpruce", "planksSpruce", "bricks", "grass", "grass", "grass", "grass", "grass", "bricks", "planksSpruce", "planksSpruce", "planksSpruce", "bricks", "grass", "grass", "grass", "grass", "grass", "bricks", "planksSpruce", "planksSpruce", "planksSpruce", "bricks", "grass", "grass", "grass", "grass", "grass", "bricks", "planksSpruce", "planksSpruce", "planksSpruce", "bricks", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "planksSpruce", "grass", "grass", "grass", "dirt", "grass", "grass", "grass", "grass", "grass", "gravel", "grass", "grass", "dirt", "dirt", "grass", "grass", "grass", "grass", "grass", "gravel", "grass", "dirt", "dirt", "dirt"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "tallGrass", "", "tallGrass", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "bricks", "bricks", "glass", "bricks", "bricks", "", "", "", "", "", "bricks", "", "", "", "bricks", "", "", "", "", "", "glass", "", "torch", "", "glass", "", "", "", "", "", "bricks", "", "", "", "bricks", "", "", "", "", "", "bricks", "bricks", "door", "bricks", "bricks", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    entities: [["zombie", 5, 7, 1], ["ironGolem", 5, 9, 1]],
    usePlayer: true,
    playerStartPosition: [5, 3],
    playerStartDirection: 2,
    levelVerificationTimeout: -1,
    timeoutResult: () => false,
    verificationFunction: verificationAPI  => verificationAPI.isEntityDied("zombie", 1),
  },
  designer09: {
    isEventLevel: true,
    groundPlane: ["dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "stone", "dirt", "dirt", "stone", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "stone", "dirt", "dirt", "stone", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse"],
    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    actionPlane: ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "", "", "", "", "grass", "grass", "grass", "grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "", "", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "grass", "grass", "", "", "", "", "grass", "grass", "grass"],
    usePlayer: true,
    playerStartPosition: [4, 8],
    playerStartDirection: 0,
    levelVerificationTimeout: 60000,
    timeoutResult: () => false,
    verificationFunction: verificationAPI  => (
      (verificationAPI.getEntityCount("all") >= 1 && !verificationAPI.isEntityTypeRunning("all")) ||
      verificationAPI.isEntityDied("zombie") ||
      verificationAPI.isEntityDied("creeper")
    ),
  },
};

},{}]},{},[39])