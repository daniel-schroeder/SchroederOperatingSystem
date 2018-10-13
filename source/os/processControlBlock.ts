///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     Class for storing memory
------------ */

module TSOS {
    export class ProcessControlBlock {
        constructor(public pid: number = 0,
                    public pc: number = 0,
                    public xreg: number = 0,
                    public yreg: number = 0,
                    public zflag: number = 0,
                    public accumulator: number = 0,
                    public base: number = 0,
                    public limit: number = 0,
                    public state: String = "") {
        }

        public init(): void {
            this.pid = this.nextPID();
            this.pc = 0;
            this.xreg = 0;
            this.yreg = 0;
            this.zflag = 0;
            this.accumulator = 0;
            this.base = 0;
            this.limit = this.getLimit();
            this.state = "Ready";
        }

        public nextPID(): number {
            _CPU.latestPID++;
            return _CPU.latestPID;
        }

        public getLimit(): number {
            var limit = document.getElementById("taProgramInput").value.split(" ").length;
            return limit;
        }
    }
}
