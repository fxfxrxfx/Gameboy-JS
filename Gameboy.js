class Gameboy {
    constructor(){
        this.CPU = new CPU();
    }

    loadGame(data){
        this.CPU.memory.loadProgram(data);
    }

    getMemoryByte(addres){
        return this.CPU.memory.getByte(addres);
    }

    run(){
        this.CPU.run();
    }
}  