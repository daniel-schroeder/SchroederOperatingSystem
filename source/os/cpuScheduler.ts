///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
/* ------------
     cpuScheduler.ts

     Class for scheduling processes
------------ */

module TSOS {
    export class CPUScheduler {
        constructor(public quantum: number,
                    public cyclesToDo: number,
                    public processes: any,
                    public counter: number) {
            this.quantum = 6;
            this.cyclesToDo = this.quantum;
            this.processes = new Array();
            this.counter = 0;
        }

        public setQuantum(q): void {
            this.quantum = q;
            this.cyclesToDo = this.quantum;
        }

        public run(): void {

        }

        public runAll(): void {
            for (var i = 0; i < _ResidentQ.length; i++) {
                this.processes[i] = _ResidentQ[i];
                this.processes[i].state = "Waiting";
            }

            _CPU.thePCB = this.processes[this.counter];
            this.processes[this.counter].state == "Running"
            _CPU.isExecuting = true;
        }

        public switch(): void {
            this.processes[this.counter].state == "Waiting";
            this.counter++;
            if (this.counter > this.processes.length - 1) {
                this.counter = 0;
            }
            _CPU.thePCB = this.processes[this.counter];
            this.processes[this.counter].state == "Running";
            this.cyclesToDo = this.quantum;
        }
    }
}
