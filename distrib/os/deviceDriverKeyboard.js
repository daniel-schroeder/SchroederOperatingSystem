///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this) || this;
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) || // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) { // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 32) || // space
                (keyCode == 13) || // enter
                (keyCode == 8) || // backspace
                (keyCode == 9)) {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 38) { // up arrow
                chr = "up"; // used "up" instead of keycode because "&" and up arrow were being stupid
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 40) { // down arrow
                chr = "down"; // used "down" instead of keycode because "(" and down arrow were being stupid
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 48 && keyCode <= 59) || // digits when unshifted, other symbols when shifted
                (keyCode == 61) || // + and =
                (keyCode == 173) || // - and _
                (keyCode >= 188 && keyCode <= 192) || // punctuation
                (keyCode >= 219 && keyCode <= 222)) { // more punctuation/symbols
                //big bad switch for all the cases.
                //with nested if statements for added fun. and to check for shift key press
                switch (keyCode) {
                    case 48: {
                        if (isShifted) {
                            chr = ")";
                        }
                        else {
                            chr = "0";
                        }
                        break;
                    }
                    case 49: {
                        if (isShifted) {
                            chr = "!";
                        }
                        else {
                            chr = "1";
                        }
                        break;
                    }
                    case 50: {
                        if (isShifted) {
                            chr = "@";
                        }
                        else {
                            chr = "2";
                        }
                        break;
                    }
                    case 51: {
                        if (isShifted) {
                            chr = "#";
                        }
                        else {
                            chr = "3";
                        }
                        break;
                    }
                    case 52: {
                        if (isShifted) {
                            chr = "$";
                        }
                        else {
                            chr = "4";
                        }
                        break;
                    }
                    case 53: {
                        if (isShifted) {
                            chr = "%";
                        }
                        else {
                            chr = "5";
                        }
                        break;
                    }
                    case 54: {
                        if (isShifted) {
                            chr = "^";
                        }
                        else {
                            chr = "6";
                        }
                        break;
                    }
                    case 55: {
                        if (isShifted) {
                            chr = "&";
                        }
                        else {
                            chr = "7";
                        }
                        break;
                    }
                    case 56: {
                        if (isShifted) {
                            chr = "*";
                        }
                        else {
                            chr = "8";
                        }
                        break;
                    }
                    case 57: {
                        if (isShifted) {
                            chr = "(";
                        }
                        else {
                            chr = "9";
                        }
                        break;
                    }
                    case 59: {
                        if (isShifted) {
                            chr = ":";
                        }
                        else {
                            chr = ";";
                        }
                        break;
                    }
                    case 61: {
                        if (isShifted) {
                            chr = "+";
                        }
                        else {
                            chr = "=";
                        }
                        break;
                    }
                    case 173: {
                        if (isShifted) {
                            chr = "_";
                        }
                        else {
                            chr = "-";
                        }
                        break;
                    }
                    case 188: {
                        if (isShifted) {
                            chr = "<";
                        }
                        else {
                            chr = ",";
                        }
                        break;
                    }
                    case 190: {
                        if (isShifted) {
                            chr = ">";
                        }
                        else {
                            chr = ".";
                        }
                        break;
                    }
                    case 191: {
                        if (isShifted) {
                            chr = "?";
                        }
                        else {
                            chr = "/";
                        }
                        break;
                    }
                    case 192: {
                        if (isShifted) {
                            chr = "~";
                        }
                        else {
                            chr = "`";
                        }
                        break;
                    }
                    case 219: {
                        if (isShifted) {
                            chr = "{";
                        }
                        else {
                            chr = "[";
                        }
                        break;
                    }
                    case 220: {
                        if (isShifted) {
                            chr = "|";
                        }
                        else {
                            chr = "\\";
                        }
                        break;
                    }
                    case 221: {
                        if (isShifted) {
                            chr = "}";
                        }
                        else {
                            chr = "]";
                        }
                        break;
                    }
                    case 222: {
                        if (isShifted) {
                            chr = "\"";
                        }
                        else {
                            chr = "'";
                        }
                        break;
                    }
                }
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
