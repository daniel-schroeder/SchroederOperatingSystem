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
<<<<<<< HEAD
            for (var i = 0; i <= 767; i++) {
=======
            for (var i = 0; i <= 255; i++) {
>>>>>>> f22225aeb90021023c0879573f2cb9d9f4388973
                this.mem[i] = "00";
            }
        }
    }
}
