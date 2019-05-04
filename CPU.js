
/**
 * Most of the registers are set by default with a non-real size.
 * Most of the registers should be 8bit variables, but that's something that's out of my hands
 * using Javascript. So...
 */
class CPU {
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
        this.SP = 0x00;
        //16 bit. Program Counter. Indicates the address in memory to exec.
        this.pc = 0x0;//0x0100;
        
        this.initRegisters();

        this.memory = new MemoryBus();

        //Clock registers
        this.m = 0; 
        this.t = 0;

        //Clock
        this.clock = {
            m: 0,
            t:0
        };
        this.initOpcodes();
    }

    initRegisters(){
        this.setRegister16("AF", 0x0001);
        this.setRegister16("BC", 0x0013);
        this.setRegister16("DE", 0x00D8);
        this.setRegister16("HL", 0x014D);
        //this.setRegister8("F", 0xB0);
    }

    debugRegisters(){
        console.log("AF:", this.getRegister16("AF").toString(16));
        console.log("BC:", this.getRegister16("BC").toString(16));
        console.log("DE:", this.getRegister16("DE").toString(16));
        console.log("HL:", this.getRegister16("HL").toString(16));
        console.log("SP:", this.SP.toString(16));
        console.log("F:", this.getRegister8("F").toString(2));
        console.log("PC:", this.pc);
        
    }

    initOpcodes(){
        //////////////////////
        //  INSTRUCTIONS    //
        //////////////////////
        const LD_16_n_nn = args => {
            const n = args[1];
            const nn = args[0];
            this.setRegister16(n, nn);
        }

        const LDD_8_HL_A = args => {
            this.setRegister8("A", this.memory.readByte(this.getRegister16("HL")));
            this.setRegister16("HL", this.getRegister16("HL") - 1);
        }

        const XOR_A_n = args => {
            const n = this[args[0]];
            this.A ^= n;

            if(this.A == 0){
                console.log("Setting F Zero flag")
                this.setZeroFlag(this.A);
            }
        }

        this.opcodes = {
            //0x OPCODES
            0x00: () => { throw "NOT DONE STILL..."  },
            0x04: () => {   this.increase("B");     },
            0x08: () => {   this.memory.writeWord(0xA16, this.sp); this.pc += 2; this.m = 3; this.t = 20; },
            
            //1x OPCDES
            0x13: () => {   this.increaseDE()    },
            
            //2x OPCODES
            0x20: () => {   let i = this.memory.readByte(this.pc); if ( i > 127 ) i = -((~i + 1) & 255); this.pc++; this.m = 2; this.t = 8; if((this.f & 0x80) == 0x00) { this.pc += i; this.m++; this.t+=4;   }    },
        
            0x21: {
                fn: LD_16_n_nn,
                cycles: 12,
                register: "HL",
                flags: [],
                inmediate16: true,
                pc: 3
            },
            0x23: () => {   this.increaseHL()   },

            
            //0x3x OPCODES
            0x31: {   
                fn: LD_16_n_nn,
                cycles: 12,
                register: "SP",
                flags: [],
                inmediate16: true,
                pc: 3
            },

            0x32: {
                fn: LDD_8_HL_A,
                cycles: 8,
                flags: [],
                pc: 1
            },

            //Ax OPCODES
            0xAF: {
                fn: XOR_A_n,
                cycles: 4,
                pc: 1,
                register: 'A',
                flags: ['Z']
            },

            //Fx OPCODES
            0xFF: () => {   this.sp -= 2; this.memory.writeWord(this.sp, this.pc); this.pc = 0x38; this.m = 1; this.t = 16}
        };
        this.commands = {

        }
    }

    //TODO: Review setHalCarry
    increase(reg){  this[reg]++; this.pc += 2; this.setZeroFlag(this[reg]); this.setSubstractFlag(false); this.setHalfCarryFlag(this[reg] > 255); this[reg] &= 0xFF; this.m }

    //TODO: Review this pc += 2
    increaseDE(){   this.setDE(this.getDE() + 1); this.m = 1; this.pc += 2; this.t = 8  };
    increaseHL(){   this.setHL(this.getHL() + 1); this.m = 1; this.pc += 2; this.t = 8  }

    getRegister8(reg){
        return this[reg];
    }

    getRegister16(reg){
        return (this[reg.charAt(0)] << 8) | this[reg.charAt(1)];
    }

    setRegister8(reg, value){
        this[reg] = value;
    }

    setRegister16(reg, value){
        console.log("ARGS:", reg, value);
        if(reg == "SP") {
            this.SP = value;
            return;
        }
        this.setRegister8(reg.charAt(0), (value >> 8) & 0xFF);
        this.setRegister8(reg.charAt(1), value & 0xFF);
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
    setZeroFlag(value){
        const bool = value == 0;
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


    //////////////////////  
    //  INSTRUCTIONS    //
    //////////////////////
    
    /**
     * Add to HL
     * Value is added to the HL register
     */
    ADDHL(value) {
        const newHL = this.getHL() + value;
        this.setHL(newHL);
    }

    /**
     * Add with carry
     * The value of the carry flag is also added to the number
     * @param {*} value 
     */
    ADC(value){

    }

    run(){
        //To get opcode we get the memory at the program counter (PC)
        const args = [];
        const opcode = this.memory.readByte(this.pc);
        const hexOpcode = opcode.toString(16);
        console.log("OPCODE:", hexOpcode);
        
        //Decoding
        const instruction = this.opcodes[opcode];
        console.log("instruction", instruction);
        //Fetch additional
        if(instruction.inmediate16 != null) args.push(this.memory.readWord(this.pc + 1));
        else if (instruction.inmediate8 != null) args.push(this.memory.readByte(this.pc + 1));
        if (instruction.register) args.push(instruction.register);
        //Exec command
        const fn = instruction['fn'];
        fn(args);
        console.log(args);
        //Increase pc
        this.pc += instruction['pc'];
        //Set flags        
        this.debugRegisters();
    }



}