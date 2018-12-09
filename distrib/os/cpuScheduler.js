///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
/* ------------
     cpuScheduler.ts

     Class for scheduling processes
------------ */
var TSOS;
(function (TSOS) {
    var CPUScheduler = /** @class */ (function () {
        function CPUScheduler(quantum, cyclesToDo, processes, counter, schedule) {
            this.quantum = quantum;
            this.cyclesToDo = cyclesToDo;
            this.processes = processes;
            this.counter = counter;
            this.schedule = schedule;
            this.quantum = 6;
            this.cyclesToDo = this.quantum;
            this.processes = new Array();
            this.counter = 0;
            this.schedule = ROUND_ROBIN;
        }
        CPUScheduler.prototype.setQuantum = function (q) {
            this.quantum = q;
            this.cyclesToDo = this.quantum;
        };
        CPUScheduler.prototype.runAll = function () {
            _ShouldRun = true;
            this.counter = 0;
            this.cyclesToDo = this.quantum;
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
        };
        CPUScheduler.prototype["switch"] = function () {
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
            _CPU.thePCB.state = "Running";
        };
        CPUScheduler.prototype.kill = function (args) {
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
                _StdOut.putText("No process with ID " + args + " running");
                _StdOut.advanceLine();
            }
            if (_ReadyQ.length == 0) {
                _ShouldRun = false;
            }
        };
        CPUScheduler.prototype.killAll = function () {
            var test;
            for (var i = 0; i < this.processes.length; i++) {
                test = this.processes[i];
                this.kill(test.pid);
            }
            _ShouldRun = false;
        };
        CPUScheduler.prototype.setSchedule = function (sched) {
            switch (sched) {
                case "rr":
                    this.schedule = ROUND_ROBIN;
                    this.quantum = DEFAULT_QUANTUM;
                    break;
                case "priority":
                    this.schedule = PRIORITY;
                    break;
                case "fcfs":
                    this.schedule = FCFS;
                    this.quantum = 99999999999999;
                    break;
            }
        };
        CPUScheduler.prototype.getSchedule = function () {
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
        };
        return CPUScheduler;
    }());
    TSOS.CPUScheduler = CPUScheduler;
})(TSOS || (TSOS = {}));
