///<reference path="../globals.ts" />
///<reference path="queue.ts" />
/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Kernel = /** @class */ (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            //initialize _ReadyQ and _ResidentQ
            _ReadyQ = new Array();
            _ResidentQ = new Array();
            _TerminatedQ = new Array();
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.krnKbdDriverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            // Load the File System Device Driver
            this.krnTrace("Loading the file system device driver.");
            _krnFSDriver = new TSOS.FSDeviceDriver(); // Construct it.
            _krnFSDriver.krnFSDriverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnFSDriver.status);
            //
            // ... more?
            //
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                if (_CPUScheduler.cyclesToDo > 0) {
                    _CPU.cycle();
                    _CPU.thePCB.cyclesToComplete++;
                    for (var i = 0; i < _CPUScheduler.processes.length; i++) {
                        if (_CPUScheduler.processes[i] != _CPU.thePCB) {
                            _CPUScheduler.processes[i].waitTime++;
                        }
                    }
                }
                else if (_CPUScheduler.processes.length > 0) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SWITCH_IRQ));
                    _CPU.cycle();
                    _CPU.thePCB.cyclesToComplete++;
                    for (var i = 0; i < _CPUScheduler.processes.length; i++) {
                        if (_CPUScheduler.processes[i] != _CPU.thePCB) {
                            _CPUScheduler.processes[i].waitTime++;
                        }
                    }
                }
                else {
                    _CPU.isExecuting = false;
                }
            }
            else { // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
        };
        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SWITCH_IRQ:
                    _CPUScheduler["switch"]();
                    break;
                case TERMINATE_IRQ:
                    _CPU.terminate(params);
                    _CPU.thePCB = _CPUScheduler.processes[_CPUScheduler.counter];
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };
        //update the cpu table on index.html
        Kernel.prototype.updateCPUTable = function () {
            document.getElementById("cpuPC").innerHTML = _CPU.PC.toString(16);
            document.getElementById("cpuAcc").innerHTML = _CPU.Acc.toString(16);
            document.getElementById("cpuX").innerHTML = _CPU.Xreg.toString(16);
            document.getElementById("cpuY").innerHTML = _CPU.Yreg.toString(16);
            document.getElementById("cpuZ").innerHTML = _CPU.Zflag.toString(16);
            document.getElementById("cpuIr").innerHTML = document.getElementById(_CPU.PC.toString()).innerHTML;
        };
        //update the master q table on index.html
        Kernel.prototype.updateMasterQTable = function (row) {
            document.getElementById("masterQPID" + row.pid).innerHTML = row.pid.toString();
            document.getElementById("masterQPC" + row.pid).innerHTML = row.pc.toString(16);
            document.getElementById("masterQAcc" + row.pid).innerHTML = row.accumulator.toString(16);
            document.getElementById("masterQXreg" + row.pid).innerHTML = row.xreg.toString(16);
            document.getElementById("masterQYreg" + row.pid).innerHTML = row.yreg.toString(16);
            document.getElementById("masterQZflag" + row.pid).innerHTML = row.zflag.toString(16);
            document.getElementById("masterQIr" + row.pid).innerHTML = document.getElementById(row.pc.toString()).innerHTML;
            document.getElementById("masterQState" + row.pid).innerHTML = row.state.toString();
        };
        Kernel.prototype.addRowToMasterQTable = function () {
            var table = document.getElementById("tableMasterQ");
            if (document.getElementById("tempMQ")) {
                table.deleteRow(1);
            }
            var row = table.insertRow(1);
            var cell1 = row.insertCell();
            var cell2 = row.insertCell();
            var cell3 = row.insertCell();
            var cell4 = row.insertCell();
            var cell5 = row.insertCell();
            var cell6 = row.insertCell();
            var cell7 = row.insertCell();
            var cell8 = row.insertCell();
            cell1.id = "masterQPID" + _PCB.pid;
            cell2.id = "masterQPC" + _PCB.pid;
            cell3.id = "masterQIr" + _PCB.pid;
            cell4.id = "masterQAcc" + _PCB.pid;
            cell5.id = "masterQXreg" + _PCB.pid;
            cell6.id = "masterQYreg" + _PCB.pid;
            cell7.id = "masterQZflag" + _PCB.pid;
            cell8.id = "masterQState" + _PCB.pid;
            this.updateMasterQTable(_PCB);
        };
        //reset the cpu table on index.html
        Kernel.prototype.clearCPUTable = function () {
            document.getElementById("cpuPC").innerHTML = "--";
            document.getElementById("cpuAcc").innerHTML = "--";
            document.getElementById("cpuX").innerHTML = "--";
            document.getElementById("cpuY").innerHTML = "--";
            document.getElementById("cpuZ").innerHTML = "--";
            document.getElementById("cpuIr").innerHTML = "--";
        };
        //update the disk display on index.html
        Kernel.prototype.updateDiskDisplay = function (row, data) {
            var table = document.getElementById("tableDisk");
            for (var i = 0; i < table.rows.length; i++) {
                if (table.rows[i].cells[0].innerHTML == row) {
                    if (data == "") {
                        table.rows[i].cells[1].innerHTML = "0";
                        table.rows[i].cells[2].innerHTML = "0:0:0";
                        table.rows[i].cells[3].innerHTML = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
                    }
                    else {
                        table.rows[i].cells[1].innerHTML = data.substring(1, 2);
                        table.rows[i].cells[2].innerHTML = data.substring(3, 4) + ":" + data.substring(5, 6) + ":" + data.substring(7, 8);
                        table.rows[i].cells[3].innerHTML = data.slice(8);
                    }
                }
            }
        };
        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            document.getElementById("display").style.background = "#5ce3f2";
            _Console.clearScreen();
            _Console.resetXY();
            _StdOut.putText("Uh-Oh. Something went wrong. Shutting Down...");
            this.krnShutdown();
        };
        return Kernel;
    }());
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
