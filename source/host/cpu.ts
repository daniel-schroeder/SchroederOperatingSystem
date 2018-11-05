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

module TSOS {

    export class Cpu {
        public latestPID = -1;
        //public cycles = 0;

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public thePCB: any,
                    public instruction: String) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.thePCB = null;
            this.instruction = '';
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.thePCB == null) {
                //if thePCB is null set it to the latest pcb in the list
                this.thePCB = (_ReadyQ.length - 1);
            }
            else {
                //initialize the variables used
                this.PC = this.thePCB.pc
                this.Xreg = this.thePCB.xreg;
                this.Yreg =this.thePCB.yreg;
                this.Zflag = this.thePCB.zflag;
                this.Acc = this.thePCB.accumulator;
            }

            //run one instruction
            this.opCodes();

            //increment this.PC
            this.PC++;

            //update thePCB with new values
            this.thePCB.pc = this.PC;
            this.thePCB.xreg = this.Xreg;
            this.thePCB.yreg = this.Yreg;
            this.thePCB.zflag = this.Zflag;
            this.thePCB.accumulator = this.Acc;

            //check to see if this.PC is over the processes limit
            //if so stop executing
            if (this.thePCB.base + this.PC > this.thePCB.limit) {
                this.isExecuting = false;
                this.thePCB.state = "Completed"
            }

            //updates the cpu and pcb displays
            _Kernel.updateCPUTable();
            _Kernel.updateMasterQTable(this.thePCB.pid);
            //this.cycles++;


            //depending on thePCB.state, what output we get
            switch(this.thePCB.state) {
                case "Completed":
                    _StdOut.advanceLine();
                    _StdOut.putText("Process " + this.thePCB.pid + " ran successfully!");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    _Kernel.clearCPUTable();
                    if (this.thePCB.base == 0) {
                        _MemoryManager.partitionOneFree = true;
                    }
                    else if (this.thePCB.base == 256) {
                        _MemoryManager.partitionTwoFree = true;
                    }
                    else if (this.thePCB.base == 512) {
                        _MemoryManager.partitionThreeFree = true;
                    }
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
        }

        public opCodes(): void {
            //make sure all input is uppercase
            this.instruction = _Memory.mem[this.thePCB.base + this.PC].toUpperCase();
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
                    //get the memory address using the same tactic as in loadFromMemory()
                    this.PC++;
                    var first = _Memory.mem[this.thePCB.base + this.PC];
                    this.PC++;
                    var second = _Memory.mem[this.thePCB.base + this.PC];
                    var i = this.thePCB.base + parseInt((second + first), 16);

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
                    this.isExecuting = false;
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
                        while (this.PC > _MemoryManager.getLimit(this.thePCB.partition)) {
                            this.PC = (this.PC - 256);
                        }
                        this.PC++;
                    }
                    else {
                        //move past it if this.Zflag is not equal to 0
                        this.PC++
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
        }

        //used to load accumulator, xreg, yreg with a constant
        public loadWithConstant(): number {
            //get the first byte after the instruction
            this.PC++;

            //return the value at the next byte
            return parseInt(_Memory.mem[this.thePCB.base + this.PC], 16);
        }

        //used to load accumulator, xreg, yreg from memory
        public loadFromMemory(): number {
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
        }
    }
}
