import BaseCommand from "./BaseCommand";
import CommandState from "./CommandState.js";

export default class CommandQueue {
  constructor(gameController) {
    this.gameController = gameController;
    this.game = gameController.game;
    this.reset();
    this.repeatCommands = [];
  }

  addCommand(command) {
    // if we're handling a while command, add to the while command's queue instead of this queue
    if (this.whileCommandQueue) {
      this.whileCommandQueue.addCommand(command);
    } else {
      this.commandList_.push(command);
    }
  }

  setWhileCommandInsertState(queue) {
    this.whileCommandQueue = queue;
  }

  begin() {
    this.state = CommandState.WORKING;
    if (this.gameController.DEBUG) {
      console.log("Debug Queue: BEGIN");
    }
  }

  reset() {
    this.state = CommandState.NOT_STARTED;
    this.currentCommand = null;
    this.commandList_ = [];
    if (this.whileCommandQueue) {
      this.whileCommandQueue.reset();
    }
    this.whileCommandQueue = null;
  }

  tick() {
    if (this.state === CommandState.WORKING) {
      // if there is no command
      if (!this.currentCommand) {
        // if command list is empty
        if (this.commandList_.length === 0) {
          // mark this queue as a success
          this.state = CommandState.SUCCESS;
          // if there are repeat command for this queue, add them
          for (var i = 0; i < this.repeatCommands.length; i++) {
            if (this.repeatCommands[i][1] > 0) {
              this.repeatCommands[i][0]();
              this.repeatCommands[i][1]--;
            }
            else if (this.repeatCommands[i][1] === -1)
              this.repeatCommands[i][0]();
            else
              this.repeatCommands.splice(i);
          }
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


  getLength() {
    return this.commandList_ ? this.commandList_.length : 0;
  }

  /**
   * Whether the command has started working.
   * @returns {boolean}
   */
  isStarted() {
    return this.state !== CommandState.NOT_STARTED;
  }

  /**
   * Whether the command has succeeded or failed, and is
   * finished with its work.
   * @returns {boolean}
   */
  isFinished() {
    return this.isSucceeded() || this.isFailed();
  }

  /**
   * Whether the command has finished with its work and reported success.
   * @returns {boolean}
   */
  isSucceeded() {
    return this.state === CommandState.SUCCESS;
  }

  /**
   * Whether the command has finished with its work and reported failure.
   * @returns {boolean}
   */
  isFailed() {
    return this.state === CommandState.FAILURE;
  }

  addRepeatCommands(codeBlock, iteration) {
    this.repeatCommands.push([codeBlock, iteration]);
    this.begin();
  }
}

