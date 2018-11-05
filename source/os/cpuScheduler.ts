///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
/* ------------
     cpuScheduler.ts

     Class for scheduling processes
------------ */

module TSOS {
    export class CPUScheduler {
        constructor(public quantum: number,
                    public cyclesToDo: number) {
            this.quantum = 6;
            this.cyclesToDo = this.quantum;
        }

        public setQuantum(q): void {
            this.quantum = q;
            this.cyclesToDo = this.quantum;
        }

        
    }
}
