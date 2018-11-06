///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
/* ------------
     cpuScheduler.ts

     Class for scheduling processes
------------ */
var TSOS;
(function (TSOS) {
    var CPUScheduler = /** @class */ (function () {
        function CPUScheduler(quantum, cyclesToDo, processes, counter) {
            this.quantum = quantum;
            this.cyclesToDo = cyclesToDo;
            this.processes = processes;
            this.counter = counter;
            this.quantum = 6;
            this.cyclesToDo = this.quantum;
            this.processes = new Array();
            this.counter = 0;
        }
        CPUScheduler.prototype.setQuantum = function (q) {
            this.quantum = q;
            this.cyclesToDo = this.quantum;
        };
        CPUScheduler.prototype.runAll = function () {
            this.counter = 0;
            for (var i = 0; i < _ResidentQ.length; i++) {
                this.processes[i] = _ResidentQ[i];
                _ReadyQ[i] = _ResidentQ[i];
                this.processes[i].state = "Waiting";
            }
            _CPU.thePCB = this.processes[this.counter];
            _CPU.isExecuting = true;
        };
        CPUScheduler.prototype["switch"] = function () {
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
        };
        CPUScheduler.prototype.kill = function (args) {
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
                    _ReadyQ.splice(i, 1);
                    //message for completion
                    _StdOut.putText("Process with ID " + args + " killed");
                    _StdOut.advanceLine();
                }
            }
            if (found == false) {
                //message for if pid given not ok
                _StdOut.putText("No process with ID " + args + " running");
                _StdOut.advanceLine();
            }
        };
        CPUScheduler.prototype.killAll = function () {
            var test;
            for (var i = 0; i < this.processes.length; i++) {
                test = this.processes[i];
                console.log(test.pid);
                this.kill(test.pid);
            }
        };
        return CPUScheduler;
    }());
    TSOS.CPUScheduler = CPUScheduler;
})(TSOS || (TSOS = {}));
