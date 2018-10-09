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
            if (memory === void 0) { memory = []; }
            this.memory = memory;
        }
        return memoryManager;
    }());
    TSOS.memoryManager = memoryManager;
})(TSOS || (TSOS = {}));
