///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     Class for storing memory
------------ */
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, pc, xreg, yreg, zflag, accumulator) {
            if (pid === void 0) { pid = 0; }
            if (pc === void 0) { pc = 0; }
            if (xreg === void 0) { xreg = 0; }
            if (yreg === void 0) { yreg = 0; }
            if (zflag === void 0) { zflag = 0; }
            if (accumulator === void 0) { accumulator = 0; }
            this.pid = pid;
            this.pc = pc;
            this.xreg = xreg;
            this.yreg = yreg;
            this.zflag = zflag;
            this.accumulator = accumulator;
        }
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
