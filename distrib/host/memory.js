///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     Class for storing memory
------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(mem) {
            if (mem === void 0) { mem = new Array(); }
            this.mem = mem;
        }
        //initialize memory to "00"
        Memory.prototype.init = function () {
            for (var i = 0; i <= 255; i++) {
                this.mem[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
