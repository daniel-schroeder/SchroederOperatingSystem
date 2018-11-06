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
            //set up the processes queue and ready queue
            for (var i = 0; i < _ResidentQ.length; i++) {
                this.processes[i] = _ResidentQ[i];
                _ReadyQ[i] = _ResidentQ[i];
                //set the state of all processes in processes to waiting
                this.processes[i].state = "Waiting";
            }
            _CPU.thePCB = this.processes[this.counter];
            //if simgle step is on dont start until user presses step
            if (_SingleStep) {

            }
            //otherwise run free
            else {
                _CPU.isExecuting = true;
            }
        }

        public switch(): void {
            if (_CPU.thePCB.state != "Completed" && _CPU.thePCB.state != "Terminated"
                && this.processes.length != 1) {
                //set the state to waiting if its not completed or terminated
                _CPU.thePCB.state = "Waiting";
            }
            //update the master q
            _Kernel.updateMasterQTable(_CPU.thePCB);
            this.counter++;
            if (this.counter > this.processes.length - 1) {
                this.counter = 0;
            }
            //reset cyclesToDo
            this.cyclesToDo = this.quantum;
            _CPU.thePCB = this.processes[this.counter];
            _CPU.thePCB.state = "Running"
        }

        public kill(args): void {
            var test;
            var found = false;
            for (var i = _ReadyQ.length - 1; i >= 0; i--) {
                test = _ReadyQ[i];
                //test to see if the pid matches the given pid
                if (test.pid == args) {
                    found = true;
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_IRQ, test));
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
                this.kill(test.pid);
            }
        }
    }
}
