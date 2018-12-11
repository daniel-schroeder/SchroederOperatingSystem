///<reference path="../globals.ts" />
/* ------------
     Disk.ts

     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk(numTracks, numSectors, numblocks, blockSize) {
            if (numTracks === void 0) { numTracks = 4; }
            if (numSectors === void 0) { numSectors = 8; }
            if (numblocks === void 0) { numblocks = 8; }
            if (blockSize === void 0) { blockSize = 64; }
            this.numTracks = numTracks;
            this.numSectors = numSectors;
            this.numblocks = numblocks;
            this.blockSize = blockSize;
            this.formatDisk();
        }
        Disk.prototype.writeToDisk = function (tsb, data) {
            var editedData = data;
            //fill in rest of block will null character 0
            while (editedData.length < this.blockSize * 2) {
                editedData += "00";
            }
            sessionStorage.setItem((tsb[0] + ":" + tsb[1] + ":" + tsb[2]), editedData);
            if (data == "") {
                _Kernel.updateDiskDisplay((tsb[0] + ":" + tsb[1] + ":" + tsb[2]), data);
            }
            else {
                _Kernel.updateDiskDisplay((tsb[0] + ":" + tsb[1] + ":" + tsb[2]), editedData);
            }
        };
        Disk.prototype.formatDisk = function () {
            var tsb;
            for (var track = 0; track < this.numTracks; track++) {
                for (var sector = 0; sector < this.numSectors; sector++) {
                    for (var block = 0; block < this.numblocks; block++) {
                        tsb = [track, sector, block];
                        this.writeToDisk(tsb, "");
                    }
                }
            }
        };
        Disk.prototype.readFromDisk = function (tsb) {
            var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
            return data;
        };
        Disk.prototype.readStringFromDisk = function (tsb) {
            var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
            if (((data[3] == tsb[0]) && (data[5] == tsb[1]) && (data[7] == tsb[2]))
                || tsb[0] == 0) {
                var stringData = "";
                for (var i = 8; i < data.length; i += 2) {
                    if ((data[i] + data[i + 1]) == "00") {
                        i = data.length;
                        break;
                    }
                    else {
                        stringData += String.fromCharCode(parseInt((data[i] + data[i + 1]), 16));
                    }
                }
            }
            else {
                var nextData;
                var stringData = "";
                do {
                    if (nextData != null) {
                        data = nextData;
                    }
                    nextData = sessionStorage.getItem(data[3] + ":" + data[5] + ":" + data[7]);
                    for (var i = 8; i < data.length; i += 2) {
                        if ((data[i] + data[i + 1]) == "00") {
                            i = data.length;
                        }
                        else {
                            stringData += String.fromCharCode(parseInt((data[i] + data[i + 1]), 16));
                        }
                    }
                } while ((nextData[3] + ":" + nextData[5] + ":" + nextData[7]) != data[3] + ":" + data[5] + ":" + data[7]);
                for (var i = 8; i < nextData.length; i += 2) {
                    if ((nextData[i] + nextData[i + 1]) == "00") {
                        i = nextData.length;
                    }
                    else {
                        stringData += String.fromCharCode(parseInt((nextData[i] + nextData[i + 1]), 16));
                    }
                }
            }
            return stringData;
        };
        Disk.prototype.readOpCodesFromDisk = function (tsb) {
            var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
            if (((data[3] == tsb[0]) && (data[1] == tsb[5]) && (data[7] == tsb[2]))
                || tsb[0] == 0) {
                var returnData = "";
                for (var i = 8; i < data.length; i += 2) {
                    returnData += (data[i] + data[i + 1] + " ");
                }
            }
            else {
                var nextData;
                var returnData = "";
                do {
                    if (nextData != null) {
                        data = nextData;
                    }
                    nextData = sessionStorage.getItem(data[3] + ":" + data[5] + ":" + data[7]);
                    for (var i = 8; i < data.length; i += 2) {
                        returnData += (data[i] + data[i + 1] + " ");
                    }
                } while ((nextData[3] + ":" + nextData[5] + ":" + nextData[7]) != data[3] + ":" + data[5] + ":" + data[7]);
                for (var i = 8; i < nextData.length; i += 2) {
                    returnData += (nextData[i] + nextData[i + 1] + " ");
                }
            }
            return returnData;
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
