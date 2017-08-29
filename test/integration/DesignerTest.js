const test = require("tape");
const attempt = require("../helpers/RunLevel.js");

test('Designer 1: Chicken Move (fail)', t => {
  attempt('designer01', api => new Promise(resolve => {
    api.startAttempt(success => {
      t.assert(!success);
      t.end();

      resolve();
    });
  }));
});

test('Designer 1: Chicken Move (pass)', t => {
  attempt('designer01', api => new Promise(resolve => {
    api.onEventTriggered(null, 'chicken', 2, event => {
      api.moveForward(null, event.targetIdentifier);
      api.turnLeft(null, event.targetIdentifier);
    });

    api.startAttempt(success => {
      t.assert(success);
      t.end();

      resolve();
    });
  }));
});

test('Designer 2: Four Chicken Move', t => {
  attempt('designer02', api => new Promise(resolve => {
    api.onEventTriggered(null, 'chicken', 2, event => {
      api.repeat(null, () => {
        api.moveForward(null, event.targetIdentifier);
        api.turnLeft(null, event.targetIdentifier);
      }, -1, event.targetIdentifier);
    });

    api.startAttempt(success => {
      t.assert(success);
      t.end();

      resolve();
    });
  }));
});

test('Designer 3: Four Chicken Random Move', t => {
  attempt('designer03', api => new Promise(resolve => {
    api.onEventTriggered(null, 'chicken', 2, event => {
      api.repeat(null, () => {
        // Movement isn't actually random because we've stubbed `Math.random()`
        // for integration tests.
        api.wait(null, 'random', event.targetIdentifier);
        api.moveForward(null, event.targetIdentifier);
        api.turnRandom(null, event.targetIdentifier);
      }, -1, event.targetIdentifier);
    });

    api.startAttempt(success => {
      t.assert(success);
      t.end();

      resolve();
    });
  }));
});

test('Designer 4: Move Player Inside House', t => {
  attempt('designer04', api => new Promise(resolve => {
    for (let i = 0; i < 5; i++) {
      api.moveForward(null, 'Player');
    }
    api.use(null, 'Player');
    api.moveForward(null, 'Player');

    api.startAttempt(success => {
      t.assert(success);
      t.end();

      resolve();
    });
  }));
});

test('Designer 5: Add Shear Sheep Behavior (fail)', t => {
  attempt('designer05', api => new Promise(resolve => {
    // Move to the sheep without defining the sheep `use` behavior.
    for (let i = 0; i < 4; i++) {
      api.moveForward(null, 'Player');
    }
    api.turnRight(null, 'Player');
    api.moveForward(null, 'Player');
    api.use(null, 'Player');

    api.startAttempt(success => {
      t.assert(!success);
      t.end();

      resolve();
    });
  }));
});

test('Designer 5: Add Shear Sheep Behavior (pass)', t => {
  attempt('designer05', api => new Promise(resolve => {
    // Set up the sheep `use` behavior to drop wool.
    api.onEventTriggered(null, 'sheep', 2, event => {
      api.drop(null, 'wool', event.targetIdentifier);
    });

    // Move to the sheep then `use`.
    for (let i = 0; i < 4; i++) {
      api.moveForward(null, 'Player');
    }
    api.turnRight(null, 'Player');
    api.moveForward(null, 'Player');
    api.use(null, 'Player');

    api.startAttempt(success => {
      t.assert(success);
      t.end();

      resolve();
    });
  }));
});

test('Designer 6: Lead Cows to Grass', t => {
  attempt('designer06', api => new Promise(resolve => {
    // Define cow follow behavior as user code.
    api.onEventTriggered(null, 'cow', 2, event => {
      api.repeat(null, () => {
        api.moveToward(null, event.targetIdentifier, 'Player');
      }, -1, event.targetIdentifier);
    });

    // Move player into grassy area.
    api.moveForward(null, 'Player');
    api.turnLeft(null, 'Player');
    api.moveForward(null, 'Player');
    api.moveForward(null, 'Player');

    api.startAttempt(success => {
      t.assert(success);
      t.end();

      resolve();
    });
  }));
});
