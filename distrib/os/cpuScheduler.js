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
        return CPUScheduler;
    }());
    TSOS.CPUScheduler = CPUScheduler;
})(TSOS || (TSOS = {}));
