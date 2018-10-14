///<reference path="../host/memory.ts" />
/* ------------
     memoryManager.ts

     Requires Memory.ts.

     Class for managing memory
------------ */
var TSOS;
(function (TSOS) {
    var memoryManager = /** @class */ (function () {
        function memoryManager(memory) {
            this.memory = memory;
            this.memory = _Memory.mem;
        }
        memoryManager.prototype.loadProgram = function () {
            this.clearMem();
            var userInput = document.getElementById("taProgramInput").value.split(" ");
            for (var i = 0; i < userInput.length; i++) {
                this.memory[i] = userInput[i];
            }
            for (var i = 0; i < this.memory.length; i++) {
                document.getElementById(i.toString()).innerHTML = this.memory[i];
            }
            _Memory.mem = this.memory;
        };
        memoryManager.prototype.clearMem = function () {
            for (var i = 0; i <= 255; i++) {
                this.memory[i] = "00";
                document.getElementById(i.toString()).innerHTML = "00";
            }
            _Memory.mem = this.memory;
        };
        memoryManager.prototype.getLimit = function () {
            var limit = 255;
            return limit;
        };
        return memoryManager;
    }());
    TSOS.memoryManager = memoryManager;
})(TSOS || (TSOS = {}));
