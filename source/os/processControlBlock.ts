///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     Class for storing memory
------------ */

module TSOS {
    export class ProcessControlBlock {
        constructor(public pid: number = 0,
                    public pc: number = 0,
                    public xreg: number = 0,
                    public yreg: number = 0,
                    public zflag: number = 0,
                    public accumulator: number = 0) {
        }
    }
}
