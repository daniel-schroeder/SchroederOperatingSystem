///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     Class for storing memory
------------ */

module TSOS {
    export class Memory {
        constructor(public mem: String[]) {
        }

        //initialize memory to "00"
        public init(): void {
            for (var i = 0; i <= 767; i++) {
                this.mem[i] = "00";
            }
        }
    }
}
