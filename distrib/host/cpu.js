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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, thePCB, instruction) {
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
            this.thePCB = thePCB;
            this.instruction = instruction;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.thePCB = null;
            this.instruction = '';
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.isExecuting = true;
            while (this.isExecuting) {
                this.opCodes();
                this.PC++;
                this.thePCB.pc = this.PC;
                this.thePCB.xreg = this.Xreg;
                this.thePCB.yreg = this.Yreg;
                this.thePCB.zflag = this.Zflag;
                this.thePCB.accumulator = this.Acc;
                if (this.thePCB.base + this.PC > this.thePCB.limit) {
                    this.isExecuting = false;
                }
            }
        };
        Cpu.prototype.opCodes = function () {
            this.instruction = _Memory.mem[this.thePCB.base + this.PC];
            switch (this.instruction) {
                default:
                    break;
                case "A9":
                    //load the accumulator with a constant
                    this.Acc = this.loadWithConstant();
                    break;
                case "AD":
                    //load the accumulator from memory
                    this.Acc = this.loadFromMemory();
                    break;
                case "8D":
                    //store the accumulator in memory
                    this.PC++;
                    var first = _Memory.mem[this.thePCB.base + this.PC];
                    this.PC++;
                    var second = _Memory.mem[this.thePCB.base + this.PC];
                    var addressIndex = this.thePCB.base + parseInt((second + first), 16);
                    if (this.Acc.toString(16).length == 1) {
                        var temp = "0" + this.Acc.toString(16);
                        _Memory.mem[addressIndex] = temp;
                        document.getElementById(addressIndex.toString()).innerHTML = temp;
                    }
                    else {
                        _Memory.mem[addressIndex] = this.Acc.toString(16);
                        document.getElementById(addressIndex.toString()).innerHTML = this.Acc.toString(16);
                    }
                    break;
                case "6D":
                    //Adds contents of an address to the contents of the accumulator and keeps the result in the accumulator
                    this.Acc += this.loadFromMemory();
                    break;
                case "A2":
                    //Load the X register with a constant
                    this.Xreg = this.loadWithConstant();
                    break;
                case "AE":
                    //Load the X register from memory
                    this.Xreg = this.loadFromMemory();
                    break;
                case "A0":
                    //Load the Y register with a constant
                    this.Yreg = this.loadWithConstant();
                    break;
                case "AC":
                    //Load the Y register from memory
                    this.Yreg = this.loadFromMemory();
                    break;
                case "EA":
                    //No operation
                    break;
                case "00":
                    //Break
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
        //used to load accumulator, xreg, yreg with a constant
        Cpu.prototype.loadWithConstant = function () {
            this.PC++;
            var constant = parseInt(_Memory.mem[this.thePCB.base + this.PC], 16);
            return constant;
        };
        //used to load accumulator, xreg, yreg from memory
        Cpu.prototype.loadFromMemory = function () {
            this.PC++;
            var first = _Memory.mem[this.thePCB.base + this.PC];
            this.PC++;
            var second = _Memory.mem[this.thePCB.base + this.PC];
            var addressIndex = this.thePCB.base + parseInt((second + first), 16);
            return parseInt(_Memory.mem[addressIndex], 16);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
