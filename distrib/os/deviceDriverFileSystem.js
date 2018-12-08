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
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var FSDeviceDriver = /** @class */ (function (_super) {
        __extends(FSDeviceDriver, _super);
        function FSDeviceDriver() {
            var _this = _super.call(this) || this;
            _this.driverEntry = _this.krnFSDriverEntry;
            return _this;
        }
        FSDeviceDriver.prototype.krnFSDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
            // More?
        };
        FSDeviceDriver.prototype.getAllFiles = function () {
            var filenames = new Array();
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    var name = _Disk.readStringFromDisk([0, sector, block]);
                    if (name.length != 0) {
                        filenames.push(name);
                    }
                }
            }
            return filenames;
        };
        FSDeviceDriver.prototype.findOpenSpace = function () {
            var tsb;
            for (var track = 1; track < _Disk.numTracks; track++) {
                for (var sector = 0; sector < _Disk.numSectors; sector++) {
                    for (var block = 0; block < _Disk.numblocks; block++) {
                        tsb = [track, sector, block];
                        var data = _Disk.readFromDisk(tsb);
                        if (data[0] + data[1] == "00") {
                            return tsb;
                        }
                    }
                }
            }
        };
        FSDeviceDriver.prototype.findSpotInDirectory = function (filename) {
            var tsb;
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    tsb = [0, sector, block];
                    var data = _Disk.readFromDisk(tsb);
                    var j = 8;
                    var fileExists = true;
                    if (data[0] + data[1] == "01") {
                        for (var i = 0; i < filename.length; i++) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                j += 2;
                            }
                            else {
                                i = filename.length;
                                fileExists = false;
                            }
                        }
                        if (data[j] + data[j + 1] != "00") {
                            fileExists = false;
                        }
                        if (fileExists) {
                            return -1;
                        }
                    }
                    else if (data[0] + data[1] == "00") {
                        return tsb;
                    }
                }
            }
        };
        FSDeviceDriver.prototype.createFile = function (filename) {
            var tsbForDirectory = this.findSpotInDirectory(filename[0]);
            if (tsbForDirectory == -1) {
                return 1;
            }
            var tsbForData = this.findOpenSpace();
            if (tsbForData == null) {
                return 2;
            }
            var name = "010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2];
            for (var i = 0; i < filename[0].length; i++) {
                name += filename[0].charCodeAt(i).toString(16);
            }
            _Disk.writeToDisk(tsbForDirectory, name);
            _Disk.writeToDisk(tsbForData, ("010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2]));
            return 3;
        };
        FSDeviceDriver.prototype.readFromDisk = function (filename) {
            var tsb;
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    tsb = [0, sector, block];
                    var data = _Disk.readFromDisk(tsb);
                    var j = 8;
                    var fileExists = true;
                    if (data[0] + data[1] == "01") {
                        for (var i = 0; i < filename.length; i++) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                j += 2;
                            }
                            else {
                                i = filename.length;
                                fileExists = false;
                            }
                        }
                        if (data[j] + data[j + 1] != "00") {
                            fileExists = false;
                        }
                        if (fileExists) {
                            tsb = [data.substring(3, 4), data.substring(5, 6), data.substring(7, 8)];
                            return _Disk.readStringFromDisk(tsb);
                        }
                    }
                }
            }
        };
        FSDeviceDriver.prototype.writeToDisk = function (filename, text) {
            var tsb;
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    tsb = [0, sector, block];
                    var data = _Disk.readFromDisk(tsb);
                    var j = 8;
                    var fileExists = true;
                    if (data[0] + data[1] == "01") {
                        for (var i = 0; i < filename.length; i++) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                j += 2;
                            }
                            else {
                                i = filename.length;
                                fileExists = false;
                            }
                        }
                        if (data[j] + data[j + 1] != "00") {
                            fileExists = false;
                        }
                        if (fileExists) {
                            tsb = [data.substring(3, 4), data.substring(5, 6), data.substring(7, 8)];
                            var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                            for (var i = 1; i < text.length - 1; i++) {
                                temp += text.charCodeAt(i).toString(16);
                            }
                            _Disk.writeToDisk(tsb, temp);
                        }
                    }
                }
            }
        };
        return FSDeviceDriver;
    }(TSOS.DeviceDriver));
    TSOS.FSDeviceDriver = FSDeviceDriver;
})(TSOS || (TSOS = {}));
