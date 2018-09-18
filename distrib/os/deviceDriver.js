/* ------------------------------
     DeviceDriver.ts

     The "base class" for all Device Drivers.
     ------------------------------ */
var DSOS;
(function (DSOS) {
    var DeviceDriver = /** @class */ (function () {
        function DeviceDriver() {
            this.version = '0.07';
            this.status = 'unloaded';
            this.preemptable = false;
            this.driverEntry = null;
            this.isr = null;
            // The constructor below is useless because child classes
            // cannot pass "this" arguments when calling super().
            //constructor(public driverEntry = null,
            //            public isr = null) {
            //}
        }
        return DeviceDriver;
    }());
    DSOS.DeviceDriver = DeviceDriver;
})(DSOS || (DSOS = {}));
