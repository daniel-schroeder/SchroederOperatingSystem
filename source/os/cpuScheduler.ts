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

        public runAll(): void {
            this.counter = 0;
            for (var i = 0; i < _ResidentQ.length; i++) {
                this.processes[i] = _ResidentQ[i];
                _ReadyQ[i] = _ResidentQ[i];
                this.processes[i].state = "Waiting";
            }
            _CPU.thePCB = this.processes[this.counter];
            _CPU.isExecuting = true;
        }

        public switch(): void {
            if (_CPU.thePCB.state != "Completed") {
                _CPU.thePCB.state = "Waiting";
            }
            _Kernel.updateMasterQTable(_CPU.thePCB.pid);
            this.counter++;
            if (this.counter > this.processes.length - 1) {
                this.counter = 0;
            }
            _CPU.thePCB = this.processes[this.counter];
            this.cyclesToDo = this.quantum;
        }

        public kill(args): void {
            var test;
            var found = false;
            for (var i = _ReadyQ.length - 1; i >= 0; i--) {
                test = _ReadyQ[i];
                //test to see if the pid matches the given pid
                if (test.pid == args) {
                    found = true;
                    _CPU.thePCB = test;
                    //set state to terminated
                    _CPU.thePCB.state = "Terminated";
                    console.log(_CPU.thePCB);
                    //stop execution if its the only process Running
                    if (_CPUScheduler.processes.length <= 1) {
                        _CPU.isExecuting = false;
                    }
                    _CPUScheduler.counter--;
                    //update table
                    _Kernel.updateMasterQTable(test.pid);
                    //clear memory partition of killed process
                    _MemoryManager.clearMemPartition(test.partition);
                    //move the process from ready queue to terminated queue
                    _TerminatedQ.push(test);
                    //remove the process from the ready queue
                    _ReadyQ.splice(i,1);
                    //message for completion
                    _StdOut.putText("Process with ID " + args + " killed")
                    _StdOut.advanceLine();
                }
            }
            if (found == false) {
                //message for if pid given not ok
                _StdOut.putText("No process with ID " + args + " running")
                _StdOut.advanceLine();
            }
        }

        public killAll(): void {
            var test;
            for (var i = 0; i < this.processes.length; i++) {
                test = this.processes[i];
                console.log(test.pid)
                this.kill(test.pid);
            }
        }
    }
}
