///<reference path="../host/memory.ts" />
/* ------------
     memoryManager.ts

     Requires Memory.ts.

     Class for storing memory
------------ */
var TSOS;
(function (TSOS) {
    var memoryManager = /** @class */ (function () {
        function memoryManager(memory) {
            this.memory = memory;
        }
        return memoryManager;
    }());
    TSOS.memoryManager = memoryManager;
})(TSOS || (TSOS = {}));
