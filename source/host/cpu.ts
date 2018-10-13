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
        }

        public opCodes(): void {
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
        }

        //used to load accumulator, xreg, yreg with a constant
        public loadWithConstant(): number {
            this.PC++;
            var constant = parseInt(_Memory.mem[this.thePCB.base + this.PC], 16);
            return constant;
        }

        //used to load accumulator, xreg, yreg from memory
        public loadFromMemory(): number {
            this.PC++;
            var first = _Memory.mem[this.thePCB.base + this.PC];
            this.PC++;
            var second = _Memory.mem[this.thePCB.base + this.PC];
            var addressIndex = this.thePCB.base + parseInt((second + first), 16);
            return parseInt(_Memory.mem[addressIndex], 16);
        }
    }
}
