/* global GMPixi, PIXI, Function */

var GMPixi =
  GMPixi ||
  Object.defineProperty(window, "GMPixi", {
    value: {},
  }).GMPixi;

GMPixi.object =
  GMPixi.other ||
  Object.defineProperty(GMPixi, "object", {
    value: {},
  }).other;

// var clickTimer = null;

// function touch2() {
//     if (clickTimer == null) {
//         clickTimer = setTimeout(function () {
//             clickTimer = null;
//             alert("single");

//         }, 500)
//     } else {
//         clearTimeout(clickTimer);
//         clickTimer = null;
//         alert("double");

//     }
// }
var timeout;
var lastTap = 0;
Object.defineProperty(GMPixi.other, "Level", {
  enumerable: true,
  value: function Level(d) {
    GMPixi.object.Room.call(this, {
      room: d.room,
      rooms: d.rooms,
      methods: {
        init: function () {
          //adds all key events here
          window.addEventListener("touchstart", this.theclick);
          window.addEventListener("touchend", this.thetouchend);
        },
        
        theclick: function(event) {
          if (event.type == "touchstart") this.button.up = true;
            var currentTime = new Date().getTime();
            var tapLength = currentTime - lastTap;
            clearTimeout(timeout);
            if (tapLength < 500 && tapLength > 0) {
                this.button.space = true;
                event.preventDefault();
            }
             else {
                this.button.right = true;
                timeout = setTimeout(function() {
                    this.button.right = true;
                    clearTimeout(timeout);
                }, 500);
            }
            lastTap = currentTime;
        },
        thetouchend: function (e) {
          if (e.keyCode === 37) this.button.left = false;
          if (e.type == "touchend") this.button.up = false;
          if ((e.type = "touchend")) this.button.right = false;
          if ((e.type = "touchend")) this.button.space = false;
        },
        thePrompt: function (e) {
          if ((e.type = "touchend")) {
            window.removeEventListener("touchend", this.thePrompt);
            this.roomMask.animate.exit = true;
          }
        },
        promptTrigger: function () {
          window.addEventListener("touchend", this.thePrompt);
        },
        exitRoom: function (notDead) {
          window.removeEventListener("touchend", this.thetouchend);
          window.removeEventListener("click", this.theclick);

          if (notDead) {
            if (this.nextLevel === "win") {
              this.goto = "title";
              this.winScreen.animate.entrance = true;
            } else {
              this.goto = this.nextLevel;
              this.roomMask.animate.exit = true;
            }
          } else {
            this.goto = "title";
            this.loseScreen.animate.entrance = true;
          }
        },
      },
      setup: function () {
        //create the background
        this.add(
          new GMPixi.other.Background({
            room: this.room,
          })
        );

        this.nextLevel = d.to;
        this.lastLevel = d.from;

        //for key listeners
        this.button = {
          left: false,
          right: false,
          up: false,
          space: false,
        };

        this.blocks = [];
        for (var m = 0; m < 20; ++m) {
          this.blocks.push([]);
          for (var n = 0; n < 20; ++n) {
            (function (k, l) {
              var obj = this.add(
                new GMPixi.other.Block({
                  room: this.room,
                  m: k,
                  n: l,
                  level: this,
                })
              );
              obj.position.set(k * 40, l * 40);
              obj.c = {
                x: k * 40 + 20,
                y: l * 40 + 20,
              };
              this.blocks[m].push(obj);
            }.call(this, m, n));
          }
        }

        var blk = d.data;

        //parse all the blocks
        for (var n = 0; n < 20; ++n) {
          for (var m = 0; m < 20; ++m) {
            this.blocks[m][n].type = blk[n][m];
            if (blk[n][m] === -1) this.entrance = this.blocks[m][n];
            if (blk[n][m] === 1) this.exit = this.blocks[m][n];
          }
        }

        //create the player
        this.player = this.add(
          new GMPixi.other.Player({
            room: this.room,
            level: this,
          }),
          this.entrance.c.x + 1,
          this.entrance.c.y,
          0.5
        );

        this.animate = {};

        this.winScreen = this.add(
          new GMPixi.other.Win({
            room: this.room,
            next: this.promptTrigger,
          })
        );

        this.loseScreen = this.add(
          new GMPixi.other.Lose({
            room: this.room,
            next: this.promptTrigger,
          })
        );

        //adds the mask
        this.roomMask = this.add(
          new GMPixi.other.Mask({
            room: this.room,
            next: {
              entrance: function () {
                this.init();
              }.bind(this),
              exit: function () {
                this.room.change(this.goto);
              }.bind(this),
            },
          })
        );
      },
      reset: function () {
        this.player.x = this.entrance.c.x + 1;
        this.player.y = this.entrance.c.y;
        this.roomMask.animate.entrance = true;

        this.goto = this.nextLevel;

        //reset inputs
        for (var k in this.button) {
          this.button[k] = false;
        }
      },
    });
  },
});

Object.defineProperty(GMPixi.other.Level, "prototype", {
  value: Object.create(GMPixi.object.Room.prototype),
});
