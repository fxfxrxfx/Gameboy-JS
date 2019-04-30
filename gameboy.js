
/**
 * Most of the registers are set by default with a non-real size.
 * Most of the registers should be 8bit variables, but that's something that's out of my hands
 * using Javascript. So...
 */
class Gameboy {
    constructor(){
        //8 bits register. Accumulator. The only one that can do arithmetic operations
        this.A = 0x00;
        //8 bits register. Flags. Indicates the processor status.
        this.F = 0x00;
        //8 bits registers for general use.
        this.B = 0x00;
        this.C = 0x00;
        this.D = 0x00;
        this.H = 0x00;
        this.E = 0x00;
        this.L = 0x00;
        //16 bit. Stack Pointer. Indicates the address in memory of the element at the top of the stack.
        this.stackPointer = 0xFFEE;
        //16 bit. Program Counter. Indicates the address in memory to exec.
        this.pc = 0x0100;
        //Gameboy has an address space of 64k. Divided id:
        //[0000-7FFF] ROM: Game loaded. Divided in:
        //  ROM0: Static. Redirects to game base.
        //  ROM1: Has memory banks, that can be exchange using "Memory banking"
        //  [0000-00FF] BOOT ROM / BIOS: Cleans RAM, writes Nintendo logo, plays "GAMEBOY" sound.
        //  [0100-014F] Header: Points to header with metadata of the game (Game, reqs, etc).
        //[8000-9FFF] Video RAM: Sprites and backgrounds.
        //[A000-BFFF] External RAM: Optional. Points to RAM's chip from the game.
        //[C000-DFFF] Work RAM: 8k. Internal RAM of the console. Can be read and written.
        //[E000-FDFF] "Mirror" zone: These addresses points to Work RAM. It's not convenient their use.
        //[FE00-FFFF] Have some subdivs:
        //  [FE00-FE9F] OAM (Object Attribute Memory) RAM: Saves properties of sprites (Position, transparency, etc).
        //  [FEA0-FEFF] Reserved. Not used for devs.
        //  [FF00-FF7F] I/O: Controls input and outpus
        //  [FF80-FFFE] High RAM: Fastest RAM. 
        //  [FFFF] System interruptions.
        this.memory = new Uint8Array(1024 * 64);

        this.display = new Uint8Array(160 * 144);
    }


    loadProgram(data) {
        for (let i = 0x0000; i < 0x7FFF; i++){
            const instruction = data[i];
            this.memory[i] = instruction
        }
    
        this.name = "";
        for (var index = 0x134; index < 0x13F; index++) {
            if (this.memory[index] > 0) {
                this.name += String.fromCharCode(this.memory[index]);
            }
        }
        console.log(this.name);
        console.log("Memory: ", this.memory);
    }

    //////////////////////
    //  FLAG REGISTER   //
    //////////////////////
    //  7 6 5 4 3 2 1 0 //
    //  Z N H C 0 0 0 0 //
    //////////////////////

    /**
     * Zero Flag (Z):
     * This bit is set when the result of a math operation
     * is zero or two values match when using the CP
     * instruction.
     * @param bool 
     */
    setZeroFlag(bool){
        const bit = bool ? 1 : 0;
        this.F |= bit << 7;
    }

    /**
     * ï Subtract Flag (N):
     * This bit is set if a subtraction was performed in the
     * last math instruction
     */
    setSubstractFlag(bool){
        const bit = bool ? 1 : 0;
        this.F |= bit << 6;
    }

    /**
     * Half Carry Flag (H): 
     * This bit is set if a carry occurred from the lower
     * nibble in the last math operation.
     * @param  bool 
     */
    setHalfCarryFlag(bool){
        const bit = bool ? 1 : 0;
        this.F |= bit << 5;
    }

    /**
     * ï Carry Flag (C):
     * This bit is set if a carry occurred from the last
     * math operation or if register A is the smaller value
     * when executing the CP instruction.
     * @param bool 
     */
    setCarryFlag(bool) {
        const bit = bool ? 1 : 0;
        this.F |= bit << 4;
    }

    setByteFlag(value) {
        this.F | value;
    }

    run(){
        //To get opcode we get the memory at the program counter (PC)
        //We carry those bytes 8 bits to left ( << operator )
        //Then we add the next ones pair of bytes to it ( | OR Operator )
        const opcode = this.memory[this.pc];
        this.pc++;
        const hexOpcode = opcode.toString(16);
        console.log("OPCODE:", hexOpcode);

        switch (opcode) {
            case 0x00: {
                //Don't do anything...
                break;
            }

            //Increase B
            case 0x04: {
                const cycles = 4;
                for (let i = 0; i < cycles; i++) {
                    this.B = (this.B + 0x01) & 0xFF;    
                }    
                break;
            }

            //RLCA
            //Rotate A left. Old bit 7 to Carry flag.
            case 0x07: {

            }

            case 0x7F: {
                const cycles = 4;

            }
        }
    }

}