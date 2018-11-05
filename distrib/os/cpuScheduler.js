///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
/* ------------
     cpuScheduler.ts

     Class for scheduling processes
------------ */
var TSOS;
(function (TSOS) {
    var CPUScheduler = /** @class */ (function () {
        function CPUScheduler(quantum, cyclesToDo) {
            this.quantum = quantum;
            this.cyclesToDo = cyclesToDo;
            this.quantum = 6;
            this.cyclesToDo = this.quantum;
        }
        CPUScheduler.prototype.setQuantum = function (q) {
            this.quantum = q;
            this.cyclesToDo = this.quantum;
        };
        return CPUScheduler;
    }());
    TSOS.CPUScheduler = CPUScheduler;
})(TSOS || (TSOS = {}));
