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
        //public cycles = 0;
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
            this.latestPID = -1;
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
            if (this.thePCB == null) {
            }
            else {
                this.PC = this.thePCB.pc;
                this.Xreg = this.thePCB.xreg;
                this.Yreg = this.thePCB.yreg;
                this.Zflag = this.thePCB.zflag;
                this.Acc = this.thePCB.accumulator;
            }
            this.opCodes();
            this.PC++;
            this.thePCB.pc = this.PC;
            this.thePCB.xreg = this.Xreg;
            this.thePCB.yreg = this.Yreg;
            this.thePCB.zflag = this.Zflag;
            this.thePCB.accumulator = this.Acc;
            if (this.thePCB.base + this.PC > this.thePCB.limit) {
                this.isExecuting = false;
                this.thePCB.state = "Completed";
            }
            this.updateCPU();
            this.updatePCB();
            //this.cycles++;
            switch (this.thePCB.state) {
                case "Completed":
                    _StdOut.advanceLine();
                    _StdOut.putText("Process " + this.thePCB.pid + " ran successfully!");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    this.clearPCB();
                    this.clearCPU();
                    break;
                case "Break":
                    break;
                case "Error":
                    _MemoryManager.clearMem();
                    _StdOut.advanceLine();
                    _StdOut.putText("Process " + this.thePCB.pid + " was removed from memory due to an error");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    break;
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
                    var i = this.thePCB.base + parseInt((second + first), 16);
                    if (this.Acc.toString(16).length == 1) {
                        var temp = "0" + this.Acc.toString(16);
                        _Memory.mem[i] = temp;
                        document.getElementById(i.toString()).innerHTML = temp;
                    }
                    else {
                        _Memory.mem[i] = this.Acc.toString(16);
                        document.getElementById(i.toString()).innerHTML = this.Acc.toString(16);
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
                    this.thePCB.state = "Completed";
                    this.PC = 254;
                    break;
                case "EC":
                    //Compare a byte in memory to the X reg sets the Z (zero) flag if equal
                    if (this.Xreg === this.loadFromMemory()) {
                        this.Zflag = 1;
                    }
                    else {
                        this.Zflag = 0;
                    }
                    break;
                case "D0":
                    //Branch n bytes if Z flag = 0
                    if (this.Zflag === 0) {
                        //set this.PC to this locaiton in
                        this.PC += this.loadWithConstant();
                        while (this.PC > _MemoryManager.getLimit()) {
                            this.PC = (this.PC - _MemoryManager.getLimit());
                        }
                    }
                    else {
                        //move past it if this.Zflag is not equal to 0
                        this.PC++;
                    }
                    break;
                case "EE":
                    //increment the value of a byte in memory
                    //first get the index in memory
                    this.PC++;
                    var first = _Memory.mem[this.thePCB.base + this.PC];
                    this.PC++;
                    var second = _Memory.mem[this.thePCB.base + this.PC];
                    var i = this.thePCB.base + parseInt((second + first), 16);
                    //then get the value from index i
                    var value = parseInt(_Memory.mem[i], 16);
                    //then Increment value by one
                    value++;
                    //then check to make sure the program is not over limit
                    if (i > _Memory.mem.limit) {
                        _StdOut.advanceLine();
                        _StdOut.putText("Out of Memory");
                        this.thePCB.state = "Error";
                        return;
                    }
                    //finally replace the value in memory with the new value
                    _Memory.mem[i] = value.toString(16);
                    break;
                case "FF":
                    if (this.Xreg === 1) {
                        //print out this.Yreg if this.Xreg equals 1
                        _StdOut.putText(this.Yreg.toString(16));
                    }
                    else if (this.Xreg === 2) {
                        //print the 00 - terminated string stored at the address in this.Yreg
                        //get the starting address set by this.Yreg
                        var i = this.thePCB.base + this.Yreg;
                        while (_Memory.mem[i] != "00") {
                            //print out the characters until 00 iss at the indexed location
                            _StdOut.putText(String.fromCharCode(parseInt(_Memory.mem[i], 16)));
                            i++;
                        }
                    }
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
            var i = this.thePCB.base + parseInt((second + first), 16);
            return parseInt(_Memory.mem[i], 16);
        };
        Cpu.prototype.updateCPU = function () {
            document.getElementById("cpuPC").innerHTML = this.PC.toString(16);
            document.getElementById("cpuAcc").innerHTML = this.Acc.toString(16);
            document.getElementById("cpuX").innerHTML = this.Xreg.toString(16);
            document.getElementById("cpuY").innerHTML = this.Yreg.toString(16);
            document.getElementById("cpuZ").innerHTML = this.Zflag.toString(16);
            document.getElementById("cpuInstruction").innerHTML = document.getElementById(this.PC.toString()).innerHTML;
        };
        Cpu.prototype.updatePCB = function () {
            document.getElementById("pcbPID").innerHTML = this.thePCB.pid.toString(16);
            document.getElementById("pcbPC").innerHTML = this.PC.toString(16);
            document.getElementById("pcbAcc").innerHTML = this.Acc.toString(16);
            document.getElementById("pcbXreg").innerHTML = this.Xreg.toString(16);
            document.getElementById("pcbYreg").innerHTML = this.Yreg.toString(16);
            document.getElementById("pcbZflag").innerHTML = this.Zflag.toString(16);
            document.getElementById("pcbInstruction").innerHTML = document.getElementById(this.PC.toString()).innerHTML;
            document.getElementById("pcbState").innerHTML = this.thePCB.state.toString();
        };
        Cpu.prototype.clearPCB = function () {
            document.getElementById("pcbPID").innerHTML = "--";
            document.getElementById("pcbPC").innerHTML = "--";
            document.getElementById("pcbAcc").innerHTML = "--";
            document.getElementById("pcbXreg").innerHTML = "--";
            document.getElementById("pcbYreg").innerHTML = "--";
            document.getElementById("pcbZflag").innerHTML = "--";
            document.getElementById("pcbInstruction").innerHTML = "--";
            document.getElementById("pcbState").innerHTML = "--";
        };
        Cpu.prototype.clearCPU = function () {
            document.getElementById("cpuPC").innerHTML = "--";
            document.getElementById("cpuAcc").innerHTML = "--";
            document.getElementById("cpuX").innerHTML = "--";
            document.getElementById("cpuY").innerHTML = "--";
            document.getElementById("cpuZ").innerHTML = "--";
            document.getElementById("cpuInstruction").innerHTML = "--";
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
