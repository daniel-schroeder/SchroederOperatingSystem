///<reference path="../host/memory.ts" />
/* ------------
     memoryManager.ts

     Requires Memory.ts.

     Class for managing memory
------------ */
var TSOS;
(function (TSOS) {
    var memoryManager = /** @class */ (function () {
        function memoryManager(memory, spaceFree) {
            this.memory = memory;
            this.spaceFree = spaceFree;
            this.memory = _Memory.mem;
            this.spaceFree = true;
        }
        //load the program into memory
        memoryManager.prototype.loadProgram = function () {
            //clears mem cuz only one program at a time for now
            this.clearMem();
            //splits the userInput on " "
            var userInput = document.getElementById("taProgramInput").value.split(" ");
            //sets each loacation in memory to the user input starting at 0000
            for (var i = 0; i < userInput.length; i++) {
                this.memory[i] = userInput[i];
            }
            //update memory table
            for (var i = 0; i < userInput.length; i++) {
                document.getElementById(i.toString()).innerHTML = this.memory[i];
            }
            _Memory.mem = this.memory;
            this.spaceFree = false;
        };
        //clears memory by setting everything to "00"
        memoryManager.prototype.clearMem = function () {
            for (var i = 0; i <= 255; i++) {
                this.memory[i] = "00";
                document.getElementById(i.toString()).innerHTML = "00";
            }
            _Memory.mem = this.memory;
        };
        memoryManager.prototype.clearMemPartition = function (part) {
            var base = 0;
            switch (part) {
                case 1:
                    base = 0;
                    break;
                case 2:
                    base = 256;
                    break;
                case 3:
                    base = 512;
                    break;
            }
            for (base; base < base + 255; base++) {
                this.memory[base] = "00";
                document.getElementById(base.toString()).innerHTML = "00";
            }
        };
        memoryManager.prototype.getLimit = function () {
            var limit = 255;
            return limit;
        };
        return memoryManager;
    }());
    TSOS.memoryManager = memoryManager;
})(TSOS || (TSOS = {}));
