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
        FSDeviceDriver.prototype.findOpenBlock = function () {
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
                    var i = 0;
                    var fileExists = false;
                    if (data[0] + data[1] == "01") {
                        while (i < filename.length) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                j += 2;
                            }
                            else {
                                break;
                                fileExists = false;
                            }
                            i++;
                        }
                        if (data[j] + data[j + 1] == "00" && filename[i] == null) {
                            fileExists = true;
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
            var tsbForData = this.findOpenBlock();
            if (tsbForData == null) {
                return 2;
            }
            var name = "010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2];
            for (var i = 0; i < filename[0].length; i++) {
                name += filename[0].charCodeAt(i).toString(16);
            }
            if (name.length > (_Disk.blockSize * 2)) {
                name = name.substring(0, (_Disk.blockSize * 2));
                _Disk.writeToDisk(tsbForDirectory, name);
                _Disk.writeToDisk(tsbForData, ("010" + tsbForData[0] + "0" + tsbForData[1] + "0" + tsbForData[2]));
                return 4;
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
                    var i = 0;
                    var fileExists = false;
                    if (data[0] + data[1] == "01") {
                        while (i < filename.length) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                j += 2;
                            }
                            else {
                                break;
                                fileExists = false;
                            }
                            i++;
                        }
                        if (data[j] + data[j + 1] == "00" && filename[i] == null) {
                            fileExists = true;
                        }
                        if (fileExists) {
                            tsb = [data.substring(3, 4), data.substring(5, 6), data.substring(7, 8)];
                            return _Disk.readStringFromDisk(tsb);
                        }
                    }
                }
            }
        };
        FSDeviceDriver.prototype.deleteFile = function (filename) {
            var tsb;
            this.clearFile(filename);
            for (var sector = 0; sector < _Disk.numSectors; sector++) {
                for (var block = 0; block < _Disk.numblocks; block++) {
                    //dont need to check 0:0:0
                    if (sector == 0 && block == 0) {
                        block++;
                    }
                    tsb = [0, sector, block];
                    var data = _Disk.readFromDisk(tsb);
                    var j = 8;
                    var i = 0;
                    var fileExists = false;
                    if (data[0] + data[1] == "01") {
                        while (i < filename.length) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                j += 2;
                            }
                            else {
                                break;
                                fileExists = false;
                            }
                            i++;
                        }
                        if (data[j] + data[j + 1] == "00" && filename[i] == null) {
                            fileExists = true;
                        }
                    }
                    if (fileExists) {
                        _Disk.writeToDisk(tsb, "");
                    }
                }
            }
        };
        FSDeviceDriver.prototype.clearFile = function (filename, tsb) {
            if (tsb === void 0) { tsb = null; }
            if (tsb != null) {
                var data = sessionStorage.getItem(tsb);
                if (data == null) {
                    return;
                }
                else {
                    var nextData;
                    do {
                        nextData = sessionStorage.getItem(data[3] + ':' + data[5] + ':' + data[7]);
                        _Disk.writeToDisk(data[3] + ':' + data[5] + ':' + data[7], "");
                        data = nextData;
                    } while ((data[3] != nextData[3]) || (data[5] != nextData[5]) || (data[7] != nextData[7]));
                    _Disk.writeToDisk(data[3] + ':' + data[5] + ':' + data[7], "");
                }
            }
            else {
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
                        var i = 0;
                        var fileExists = false;
                        if (data[0] + data[1] == "01") {
                            while (i < filename.length) {
                                if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                    j += 2;
                                }
                                else {
                                    break;
                                    fileExists = false;
                                }
                                i++;
                            }
                            if (data[j] + data[j + 1] == "00" && filename[i] == null) {
                                fileExists = true;
                            }
                        }
                        if (fileExists) {
                            var nextData;
                            do {
                                if (nextData != null) {
                                    data = nextData;
                                }
                                nextData = sessionStorage.getItem(data[3] + ':' + data[5] + ':' + data[7]);
                                _Disk.writeToDisk([data[3], data[5], data[7]], "");
                            } while ((data[3] != nextData[3]) || (data[5] != nextData[5]) || (data[7] != nextData[7]));
                            _Disk.writeToDisk([nextData[3], nextData[5], nextData[7]], "");
                        }
                        else {
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
                    var i = 0;
                    var fileExists = false;
                    if (data[0] + data[1] == "01") {
                        while (i < filename.length) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                j += 2;
                            }
                            else {
                                break;
                                fileExists = false;
                            }
                            i++;
                        }
                        if (data[j] + data[j + 1] == "00" && filename[i] == null) {
                            fileExists = true;
                        }
                        if (fileExists) {
                            tsb = [data.substring(3, 4), data.substring(5, 6), data.substring(7, 8)];
                            this.clearFile(filename, tsb);
                            var trimmedText = text.substring(1, text.length - 1);
                            var counter = 0;
                            if (trimmedText.length > _Disk.blockSize - 4) {
                                var nextTSB = this.findOpenBlock();
                                var numBlocksNeeded = Math.ceil(trimmedText.length / (_Disk.blockSize - 4));
                                for (var i = 0; i < numBlocksNeeded; i++) {
                                    if ((i + 1) != numBlocksNeeded) {
                                        var temp = "010" + nextTSB[0] + "0" + nextTSB[1] + "0" + nextTSB[2];
                                    }
                                    else {
                                        var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                                    }
                                    for (var j = 0; j < _Disk.blockSize - 4; j++) {
                                        if (counter >= trimmedText.length) {
                                            j = _Disk.blockSize;
                                        }
                                        else {
                                            temp += trimmedText.charCodeAt(counter).toString(16);
                                            counter++;
                                        }
                                    }
                                    _Disk.writeToDisk(tsb, temp);
                                    if ((i + 1) != numBlocksNeeded) {
                                        _Disk.writeToDisk(nextTSB, "01");
                                    }
                                    tsb = nextTSB;
                                    nextTSB = this.findOpenBlock();
                                }
                            }
                            else {
                                var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                                for (var i = 0; i < trimmedText.length; i++) {
                                    temp += trimmedText.charCodeAt(i).toString(16);
                                }
                                _Disk.writeToDisk(tsb, temp);
                            }
                        }
                    }
                }
            }
        };
        FSDeviceDriver.prototype.writeUserInputToDisk = function (filename, text) {
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
                    var i = 0;
                    var fileExists = false;
                    if (data[0] + data[1] == "01") {
                        while (i < filename.length) {
                            if (filename[i] == String.fromCharCode((data[j] * 16) + parseInt(data[j + 1], 16))) {
                                j += 2;
                            }
                            else {
                                break;
                                fileExists = false;
                            }
                            i++;
                        }
                        if (data[j] + data[j + 1] == "00" && filename[i] == null) {
                            fileExists = true;
                        }
                        if (fileExists) {
                            tsb = [data.substring(3, 4), data.substring(5, 6), data.substring(7, 8)];
                            this.clearFile(filename, tsb);
                            var counter = 0;
                            if (text.length > _Disk.blockSize - 4) {
                                var nextTSB = this.findOpenBlock();
                                var numBlocksNeeded = Math.ceil(text.length / (_Disk.blockSize - 4));
                                for (var i = 0; i < numBlocksNeeded; i++) {
                                    if ((i + 1) != numBlocksNeeded) {
                                        var temp = "010" + nextTSB[0] + "0" + nextTSB[1] + "0" + nextTSB[2];
                                    }
                                    else {
                                        var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                                    }
                                    for (var j = 0; j < _Disk.blockSize - 4; j++) {
                                        if (counter >= text.length) {
                                            j = _Disk.blockSize;
                                        }
                                        else {
                                            temp += text[counter];
                                            counter++;
                                        }
                                    }
                                    _Disk.writeToDisk(tsb, temp);
                                    if ((i + 1) != numBlocksNeeded) {
                                        _Disk.writeToDisk(nextTSB, "01");
                                    }
                                    tsb = nextTSB;
                                    nextTSB = this.findOpenBlock();
                                }
                            }
                            else {
                                var temp = "010" + tsb[0] + "0" + tsb[1] + "0" + tsb[2];
                                for (var i = 0; i < text.length; i++) {
                                    temp += text[i];
                                }
                                _Disk.writeToDisk(tsb, temp);
                            }
                        }
                    }
                }
            }
        };
        FSDeviceDriver.prototype.rollIn = function () {
        };
        FSDeviceDriver.prototype.rollOut = function () {
            var partition = _CPUScheduler.nextToSwap.location;
            switch (partition) {
                case 1:
                    _MemoryManager.partitionOneFree = true;
                    break;
                case 2:
                    _MemoryManager.partitionTwoFree = true;
                    break;
                case 3:
                    _MemoryManager.partitionThreeFree = true;
                    break;
            }
            _CPUScheduler.nextToSwap.location = 4;
            this.createFile(["~" + _CPUScheduler.nextToSwap.pid]);
            var stuffToRollOut = "";
            for (var i = _CPUScheduler.nextToSwap.base; i < _CPUScheduler.nextToSwap.limit; i++) {
                stuffToRollOut += _Memory.mem[i];
            }
            this.writeUserInputToDisk(["~" + _CPUScheduler.nextToSwap.pid], stuffToRollOut);
        };
        return FSDeviceDriver;
    }(TSOS.DeviceDriver));
    TSOS.FSDeviceDriver = FSDeviceDriver;
})(TSOS || (TSOS = {}));
