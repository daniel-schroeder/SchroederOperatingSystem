///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     Class for storing memory
------------ */
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, pc, xreg, yreg, zflag, accumulator, base, limit, state) {
            if (pid === void 0) { pid = 0; }
            if (pc === void 0) { pc = 0; }
            if (xreg === void 0) { xreg = 0; }
            if (yreg === void 0) { yreg = 0; }
            if (zflag === void 0) { zflag = 0; }
            if (accumulator === void 0) { accumulator = 0; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            if (state === void 0) { state = ""; }
            this.pid = pid;
            this.pc = pc;
            this.xreg = xreg;
            this.yreg = yreg;
            this.zflag = zflag;
            this.accumulator = accumulator;
            this.base = base;
            this.limit = limit;
            this.state = state;
        }
        ProcessControlBlock.prototype.init = function () {
            this.pid = this.nextPID();
            this.pc = 0;
            this.xreg = 0;
            this.yreg = 0;
            this.zflag = 0;
            this.accumulator = 0;
            this.base = this.getBase();
            this.limit = this.base + this.getLimit();
            this.state = "Ready";
        };
        //gets and returns the next PID using latestPID
        ProcessControlBlock.prototype.nextPID = function () {
            _CPU.latestPID++;
            return _CPU.latestPID;
        };
        //gets the limit of a program
        ProcessControlBlock.prototype.getLimit = function () {
            var limit = document.getElementById("taProgramInput").value.split(" ").length;
            return limit;
        };
        //gets the base of a program
        ProcessControlBlock.prototype.getBase = function () {
            var base;
            switch (_MemoryManager.latestPartition) {
                case 0:
                    base = 0;
                    break;
                case 1:
                    base = 256;
                    break;
                case 2:
                    base = 512;
                    break;
            }
            return base;
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
