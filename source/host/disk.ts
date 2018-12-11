///<reference path="../globals.ts" />

/* ------------
     Disk.ts

     Requires global.ts.
     ------------ */

module TSOS {

    export class Disk {

        constructor(public numTracks: number = 4,
                    public numSectors: number = 8,
                    public numblocks: number = 8,
                    public blockSize: number = 64) {
            this.formatDisk();
        }

        public writeToDisk(tsb, data): void {
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
        }

        public formatDisk(): void {
            var tsb;
            for (var track = 0; track < this.numTracks; track++) {
                for (var sector = 0; sector < this.numSectors; sector++) {
                    for (var block = 0; block < this.numblocks; block++) {
                        tsb = [track, sector, block];
                        this.writeToDisk(tsb, "");
                    }
                }
            }
        }

        public readFromDisk(tsb): String {
            var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
            return data;
        }

        public readStringFromDisk(tsb): String {
            var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
            if (((data[3] == tsb[0]) && (data[5] == tsb[1]) && (data[7] == tsb[2]))
                || tsb[0] == 0) {
                var stringData = ""
                for (var i = 8; i < data.length; i+=2) {
                    if ((data[i] + data[i+1]) == "00") {
                        i = data.length;
                        break;
                    } else {
                        stringData += String.fromCharCode(parseInt((data[i] + data[i+1]), 16));
                    }
                }
            } else {
                var nextData;
                var stringData = "";
                do {
                    if (nextData != null) {
                        data = nextData;
                    }
                    nextData = sessionStorage.getItem(data[3] + ":" + data[5] + ":" + data[7]);
                    for (var i = 8; i < data.length; i+=2) {
                        if ((data[i] + data[i+1]) == "00") {
                            i = data.length;
                        } else {
                            stringData += String.fromCharCode(parseInt((data[i] + data[i+1]), 16));
                        }
                    }
                } while ((nextData[3] + ":" + nextData[5] + ":" + nextData[7]) != data[3] + ":" + data[5] + ":" + data[7])
                for (var i = 8; i < nextData.length; i+=2) {
                    if ((nextData[i] + nextData[i+1]) == "00") {
                        i = nextData.length;
                    } else {
                        stringData += String.fromCharCode(parseInt((nextData[i] + nextData[i+1]), 16));
                    }
                }
            }
            return stringData;
        }

        public readOpCodesFromDisk(tsb): String {
            var data = sessionStorage.getItem(tsb[0] + ":" + tsb[1] + ":" + tsb[2]);
            if (((data[3] == tsb[0]) && (data[1] == tsb[5]) && (data[7] == tsb[2]))
                || tsb[0] == 0) {
                var returnData = ""
                for (var i = 8; i < data.length; i+=2) {
                    returnData += (data[i] + data[i+1] + " ");
                }
            } else {
                var nextData;
                var returnData = "";
                do {
                    if (nextData != null) {
                        data = nextData;
                    }
                    nextData = sessionStorage.getItem(data[3] + ":" + data[5] + ":" + data[7]);
                    for (var i = 8; i < data.length; i+=2) {
                        returnData += (data[i] + data[i+1] + " ");
                    }
                } while ((nextData[3] + ":" + nextData[5] + ":" + nextData[7]) != data[3] + ":" + data[5] + ":" + data[7])
                for (var i = 8; i < nextData.length; i+=2) {
                    returnData += (nextData[i] + nextData[i+1] + " ");
                }
            }
            return returnData;
        }
    }
}
