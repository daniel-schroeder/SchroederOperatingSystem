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
                    public counter: number,
                    public schedule: any,
                    public nextToSwap: any) {
            this.quantum = 6;
            this.cyclesToDo = this.quantum;
            this.processes = new Array();
            this.counter = 0;
            this.schedule = ROUND_ROBIN;
        }

        public setQuantum(q): void {
            this.quantum = q;
            this.cyclesToDo = this.quantum;
        }

        public runAll(): void {
            _ShouldRun = true;
            this.counter = 0;
            this.cyclesToDo = this.quantum;
            if (this.schedule = PRIORITY) {
                //sort the _ResidentQ by priority
                for (var i = 1; i < _ResidentQ.length; i++) {
                    if (_ResidentQ[i].priority < _ResidentQ[i-1].priority) {
                        var j = i;
                        while (j > 0 && _ResidentQ[j].priority < _ResidentQ[j-1].priority) {
                            var temp = _ResidentQ[j];
                            _ResidentQ[j] = _ResidentQ[j-1];
                            _ResidentQ[j-1] = temp;
                            j--;

                        }
                    }
                }
                //set up the processes queue and ready queue for priority
                for (var i = 0; i < _ResidentQ.length; i++) {
                    this.processes[i] = _ResidentQ[i];
                    _ReadyQ[i] = _ResidentQ[i];
                    //set the state of all processes in processes to waiting
                    this.processes[i].state = "Waiting";
                }
            } else {
                //set up the processes queue and ready queue for fcfs and rr
                for (var i = 0; i < _ResidentQ.length; i++) {
                    this.processes[i] = _ResidentQ[i];
                    _ReadyQ[i] = _ResidentQ[i];
                    //set the state of all processes in processes to waiting
                    this.processes[i].state = "Waiting";
                }
            }
            _CPU.thePCB = this.processes[this.counter];
            if (_CPU.thePCB.needToSwap) {
                _krnFSDriver.rollOut(this.nextToSwap);
                _krnFSDriver.rollIn(_CPU.thePCB);
            }
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
            this.nextToSwap = _CPU.thePCB;
            _CPU.thePCB = this.processes[this.counter];
            if (_CPU.thePCB.needToSwap) {
                _krnFSDriver.rollOut(this.nextToSwap);
                _krnFSDriver.rollIn(_CPU.thePCB);
            }
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
            if (_ReadyQ.length == 0) {
                _ShouldRun = false;
            }
        }

        public killAll(): void {
            var test;
            for (var i = 0; i < this.processes.length; i++) {
                test = this.processes[i];
                this.kill(test.pid);
            }
            _ShouldRun = false;
            for (var i = 0; i < _TerminatedQ.length; i++) {
                _krnFSDriver.deleteFile("~" + _TerminatedQ[i].pid.toString());
            }
        }

        public setSchedule(sched): void {
            switch (sched) {
                case "rr":
                    this.schedule = ROUND_ROBIN;
                    this.quantum = DEFAULT_QUANTUM;
                    break;
                case "priority":
                    this.schedule = PRIORITY;
                    this.quantum = 99999999999999;
                    break;
                case "fcfs":
                    this.schedule = FCFS;
                    this.quantum = 99999999999999;
                    break;
            }
        }

        public getSchedule(): String {
            switch (this.schedule) {
                case ROUND_ROBIN:
                    return "Round Robin";
                    break;
                case PRIORITY:
                    return "Priority";
                    break;
                case FCFS:
                    return "First Come First Serve";
                    break;
            }
        }
    }
}

//A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 61 00 61 64 6F 6E 65 00
//A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 06 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 62 00 62 64 6F 6E 65 00
//A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 09 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 63 00 63 64 6F 6E 65 00
//A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 0C AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 64 00 64 64 6F 6E 65 00
