///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        };
        Cpu.prototype.opCodes = function () {
            var i = 1;
            var code = _Memory.Mem[i];
            switch (code) {
                default:
                    break;
                case "A9":
                    //load the accumulator with a constant
                    this.Acc = 1;
                    break;
                case "AD":
                    //load the accumulator from memory
                    this.Acc = 1;
                    break;
                case "8D":
                    //store the accumulator in memory
                    this.Acc = 1;
                    break;
                case "6D":
                    //Adds contents of an address to the contents of the accumulator and keeps the result in the accumulator
                    this.Acc = 1;
                    break;
                case "A2":
                    //Load the X register with a constant
                    this.Acc = 1;
                    break;
                case "AE":
                    //Load the X register from memory
                    this.Acc = 1;
                    break;
                case "A0":
                    //Load the Y register with a constant
                    this.Acc = 1;
                    break;
                case "AC":
                    //Load the Y register from memory
                    this.Acc = 1;
                    break;
                case "EA":
                    //No operation
                    this.Acc = 1;
                    break;
                case "00":
                    //Break
                    this.Acc = 1;
                    break;
                case "EC":
                    //Compare a byte in memory to the X reg sets the Z (zero) flag if equal
                    this.Acc = 1;
                    break;
                case "D0":
                    //Branch n bytes if Z flag = 0
                    this.Acc = 1;
                    break;
                case "EE":
                    //Increment the value of a byte
                    this.Acc = 1;
                    break;
                case "FF":
                    this.Acc = 1;
                    break;
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
