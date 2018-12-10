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
                    public location: number,
                    public state: String = "",
                    public cyclesToComplete: number,
                    public waitTime: number,
                    public needToSwap: boolean,
                    public priority: number,
                    public tsb: any) {
        }

        public init(priority = 32, location = _MemoryManager.latestPartition): void {
            this.pid = this.nextPID();
            this.pc = 0;
            this.xreg = 0;
            this.yreg = 0;
            this.zflag = 0;
            this.accumulator = 0;
            this.base = this.getBase();
            this.limit = this.base + this.getLimit();
            this.location = location;
            this.state = "Ready";
            this.cyclesToComplete = 0;
            this.waitTime = 0;
            if (this.location == 4) {
                this.needToSwap = true;
                this.tsb = _krnFSDriver.findInDirectory(["~" + this.pid.toString()]);
            } else {
                this.needToSwap = false;
            }
            this.priority = priority;
        }

        //gets and returns the next PID using latestPID
        public nextPID(): number {
            _CPU.latestPID++;
            return _CPU.latestPID;
        }

        //gets the limit of a program
        public getLimit(): any {
            var limit = document.getElementById("taProgramInput").value.split(" ").length;
            return limit;
        }

        //gets the base of a program
        public getBase(): any {
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
                default:
                    base = null;

            }
            return base;
        }
    }
}
