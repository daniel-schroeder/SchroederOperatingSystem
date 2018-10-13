///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     Class for storing memory
------------ */
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, pc, xreg, yreg, zflag, accumulator, base, limit) {
            if (pid === void 0) { pid = 0; }
            if (pc === void 0) { pc = 0; }
            if (xreg === void 0) { xreg = 0; }
            if (yreg === void 0) { yreg = 0; }
            if (zflag === void 0) { zflag = 0; }
            if (accumulator === void 0) { accumulator = 0; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            this.pid = pid;
            this.pc = pc;
            this.xreg = xreg;
            this.yreg = yreg;
            this.zflag = zflag;
            this.accumulator = accumulator;
            this.base = base;
            this.limit = limit;
        }
        ProcessControlBlock.prototype.init = function () {
            this.pid = this.nextPID();
            this.pc = 0;
            this.xreg = 0;
            this.yreg = 0;
            this.zflag = 0;
            this.accumulator = 0;
            this.base = 0;
            this.limit = this.getLimit();
        };
        ProcessControlBlock.prototype.nextPID = function () {
            return 0;
        };
        ProcessControlBlock.prototype.getLimit = function () {
            var limit = document.getElementById("taProgramInput").value.split(" ").length;
            return limit;
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
