
class GPU {
    constructor(){ 
        //384
        this.tile_set = [];
        this.memory = new Uint8Array(VRAM_MEMORY_SIZE)
        this.canvas_buffer = new Uint8Array(NUMBER_OF_PIXELS);
    }

    getInstruction(address){
        return this.memory[address];
    }

    setInstruction(address, value){
        this.memory[address] = value;
    }
}