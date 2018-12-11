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
                //if thePCB is null set it to the latest pcb in the list
                this.thePCB = (_ReadyQ.length - 1);
            }
            else {
                //initialize the variables used
                this.PC = this.thePCB.pc;
                this.Xreg = this.thePCB.xreg;
                this.Yreg = this.thePCB.yreg;
                this.Zflag = this.thePCB.zflag;
                this.Acc = this.thePCB.accumulator;
            }
            if (this.thePCB.state != "Terminated" && this.thePCB.state != "Completed") {
                this.thePCB.state = "Running";
            }
            //run one instruction
            this.opCodes();
            //increment this.PC
            this.PC++;
            //decrement cyclesToDo;
            _CPUScheduler.cyclesToDo--;
            //update thePCB with new values
            this.thePCB.pc = this.PC;
            this.thePCB.xreg = this.Xreg;
            this.thePCB.yreg = this.Yreg;
            this.thePCB.zflag = this.Zflag;
            this.thePCB.accumulator = this.Acc;
            //check to see if this.PC is over the processes limit
            //if so stop executing
            if (this.thePCB.base + this.PC > this.thePCB.limit) {
                this.thePCB.state = "Completed";
            }
            if (this.thePCB.base + this.PC >= _MemoryManager.getLimit(this.thePCB.partition)) {
                this.thePCB.state = "Out of Bounds Error";
            }
            //updates the cpu and pcb displays
            _Kernel.updateCPUTable();
            _Kernel.updateMasterQTable(this.thePCB);
            //depending on thePCB.state, what output we get
            switch (this.thePCB.state) {
                case "Completed":
                    _StdOut.advanceLine();
                    _StdOut.putText("Process " + this.thePCB.pid + " ran successfully!");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    var turnaroundTime = this.thePCB.cyclesToComplete + this.thePCB.waitTime;
                    _StdOut.putText("Turnaround Time: " + turnaroundTime);
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    _StdOut.putText("Wait Time: " + this.thePCB.waitTime);
                    _Kernel.clearCPUTable();
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    if (this.thePCB.base == 0) {
                        _MemoryManager.partitionOneFree = true;
                    }
                    else if (this.thePCB.base == 256) {
                        _MemoryManager.partitionTwoFree = true;
                    }
                    else if (this.thePCB.base == 512) {
                        _MemoryManager.partitionThreeFree = true;
                    }
                    var test;
                    for (var i = _ReadyQ.length - 1; i >= 0; i--) {
                        test = _ReadyQ[i];
                        //test to see if the pid matches the given pid
                        if (test.pid == this.thePCB.pid) {
                            //move the process from ready queue to terminator queue
                            _TerminatedQ.push(test);
                            //remove the process from the resident queue
                            _ReadyQ.splice(i, 1);
                        }
                    }
                    _CPUScheduler.cyclesToDo = 0;
                    _CPUScheduler.processes.splice(_CPUScheduler.counter, 1);
                    if (_CPUScheduler.processes.length == 0) {
                        this.isExecuting = false;
                        _ShouldRun = false;
                        for (var i = 0; i < _TerminatedQ.length; i++) {
                            _krnFSDriver.deleteFile("~" + _TerminatedQ[i].pid.toString());
                        }
                    }
                    _CPUScheduler.counter--;
                    _CPUScheduler.nextToSwap = _CPUScheduler.processes[_CPUScheduler.counter];
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SWITCH_IRQ));
                    break;
                case "Break":
                    break;
                case "Waiting":
                    break;
                case "Out of Bounds Error":
                    var test;
                    for (var i = _ReadyQ.length - 1; i >= 0; i--) {
                        test = _ReadyQ[i];
                        //test to see if the pid matches the given pid
                        if (test.pid == this.thePCB.pid) {
                            //move the process from ready queue to terminator queue
                            _TerminatedQ.push(test);
                            //remove the process from the resident queue
                            _ReadyQ.splice(i, 1);
                            //remove the process from the the disk
                            _krnFSDriver.deleteFile("~" + test.pid.toString());
                        }
                    }
                    _CPUScheduler.cyclesToDo = 0;
                    _CPUScheduler.processes.splice(_CPUScheduler.counter, 1);
                    if (_CPUScheduler.processes.length == 0) {
                        this.isExecuting = false;
                        _ShouldRun = false;
                    }
                    _CPUScheduler.counter--;
                    _CPUScheduler.nextToSwap = _CPUScheduler.processes[_CPUScheduler.counter];
                    _MemoryManager.clearMemPartition(this.thePCB.partition);
                    _StdOut.advanceLine();
                    _StdOut.putText("Process " + this.thePCB.pid + " was removed from memory due to an out of bounds error");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    break;
                case "Invalid Op Code Error":
                    var test;
                    for (var i = _ReadyQ.length - 1; i >= 0; i--) {
                        test = _ReadyQ[i];
                        //test to see if the pid matches the given pid
                        if (test.pid == this.thePCB.pid) {
                            //move the process from ready queue to terminator queue
                            _TerminatedQ.push(test);
                            //remove the process from the resident queue
                            _ReadyQ.splice(i, 1);
                            //remove the process from the the disk
                            _krnFSDriver.deleteFile("~" + test.pid.toString());
                        }
                    }
                    _CPUScheduler.cyclesToDo = 0;
                    _CPUScheduler.processes.splice(_CPUScheduler.counter, 1);
                    if (_CPUScheduler.processes.length == 0) {
                        this.isExecuting = false;
                        _ShouldRun = false;
                    }
                    _CPUScheduler.counter--;
                    _CPUScheduler.nextToSwap = _CPUScheduler.processes[_CPUScheduler.counter];
                    _MemoryManager.clearMemPartition(this.thePCB.partition);
                    _StdOut.advanceLine();
                    _StdOut.putText("Process " + this.thePCB.pid + " was removed from memory due to an invalid op code error");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    break;
            }
        };
        Cpu.prototype.opCodes = function () {
            //make sure all input is uppercase
            this.instruction = _Memory.mem[this.thePCB.base + this.PC].toUpperCase();
            switch (this.instruction) {
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
                    //get the memory address using the same tactic as in loadFromMemory()
                    this.PC++;
                    var first = _Memory.mem[this.thePCB.base + this.PC];
                    this.PC++;
                    var second = _Memory.mem[this.thePCB.base + this.PC];
                    var i = this.thePCB.base + parseInt((second + first), 16);
                    if (i >= _MemoryManager.getLimit(this.thePCB.partition)) {
                        this.thePCB.state = "Out of Bounds Error";
                        break;
                    }
                    //adds a 0 before the number if it only has one digit
                    if (this.Acc.toString(16).length == 1) {
                        var temp = "0" + this.Acc.toString(16);
                        //store accumulator in memory at index i
                        _Memory.mem[i] = temp;
                        //update the memory table
                        document.getElementById(i.toString()).innerHTML = temp;
                    }
                    else {
                        //store accumulator in memory at index i
                        _Memory.mem[i] = this.Acc.toString(16);
                        //update the memory table
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
                        //set this.PC to this location in
                        this.PC += this.loadWithConstant();
                        while (this.PC > 255) {
                            this.PC = (this.PC - 256);
                        }
                        this.PC++;
                    }
                    else {
                        //move past it if this.Zflag is not equal to 0
                        this.PC++;
                    }
                    break;
                case "EE":
                    //increment the value of a byte in memory
                    //first get the index in memory same as in loadFromMemory()
                    this.PC++;
                    var first = _Memory.mem[this.thePCB.base + this.PC];
                    this.PC++;
                    var second = _Memory.mem[this.thePCB.base + this.PC];
                    var i = this.thePCB.base + parseInt((second + first), 16);
                    //then get the value from index i
                    var value = parseInt(_Memory.mem[i], 16);
                    //then increment value by one
                    value++;
                    //then check to make sure the program is not over limit
                    if (i > _Memory.mem.limit) {
                        _StdOut.advanceLine();
                        _StdOut.putText("Out of Memory");
                        this.thePCB.state = "Out of Bounds Error";
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
                            //print out the characters until 00 is at the indexed location
                            _StdOut.putText(String.fromCharCode(parseInt(_Memory.mem[i], 16)));
                            i++;
                        }
                    }
                    break;
                default:
                    _StdOut.advanceLine();
                    _StdOut.putText("Invalid Op Code");
                    this.thePCB.state = "Invalid Op Code Error";
                    break;
            }
        };
        //used to load accumulator, xreg, yreg with a constant
        Cpu.prototype.loadWithConstant = function () {
            //get the first byte after the instruction
            this.PC++;
            //return the value at the next byte
            return parseInt(_Memory.mem[this.thePCB.base + this.PC], 16);
        };
        //used to load accumulator, xreg, yreg from memory
        Cpu.prototype.loadFromMemory = function () {
            //gets the first byte after the instruction
            this.PC++;
            var first = _Memory.mem[this.thePCB.base + this.PC];
            //gets the second byte after the instruction
            this.PC++;
            var second = _Memory.mem[this.thePCB.base + this.PC];
            //adds the two together to get the memory address
            var i = this.thePCB.base + parseInt((second + first), 16);
            //return the value at the memory address
            return parseInt(_Memory.mem[i], 16);
        };
        Cpu.prototype.terminate = function (pcb) {
            pcb.state = "Terminated";
            //update table
            _Kernel.updateMasterQTable(pcb);
            //clear memory partition of killed process
            _MemoryManager.clearMemPartition(pcb.partition);
            //move the process from ready queue to terminated queue
            _TerminatedQ.push(pcb);
            //remove the process from the ready queue
            for (var i = 0; i < _ReadyQ.length; i++) {
                if (pcb.pid == _ReadyQ[i].pid) {
                    _ReadyQ.splice(i, 1);
                }
            }
            //remove the process from the processes queue
            for (var i = 0; i < _CPUScheduler.processes.length; i++) {
                if (pcb.pid == _CPUScheduler.processes[i].pid) {
                    _CPUScheduler.processes.splice(i, 1);
                }
            }
            //remove the process from the the disk
            _krnFSDriver.deleteFile("~" + pcb.pid.toString());
            //stop execution if its the only process Running
            if (_CPUScheduler.processes.length < 1) {
                this.isExecuting = false;
                _ShouldRun = false;
            }
            else {
                _CPUScheduler.counter--;
                if (_CPUScheduler.counter < 0) {
                    _CPUScheduler.counter = 0;
                }
                _CPUScheduler.cyclesToDo = _CPUScheduler.quantum;
            }
            //message for completion
            _StdOut.putText("Process with ID " + pcb.pid + " killed");
            _StdOut.advanceLine();
            _StdOut.putText("Process " + pcb.pid + " was terminated and removed from memory");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 61 00 61 64 6F 6E 65 00
