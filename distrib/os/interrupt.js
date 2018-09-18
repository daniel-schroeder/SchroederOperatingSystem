/* ------------
   Interrupt.ts
   ------------ */
var DSOS;
(function (DSOS) {
    var Interrupt = (function () {
        function Interrupt(irq, params) {
            this.irq = irq;
            this.params = params;
        }
        return Interrupt;
    })();
    DSOS.Interrupt = Interrupt;
})(DSOS || (DSOS = {}));
