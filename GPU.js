const NUMBER_OF_PIXELS = 160 * 144;

class GPU {
    constructor(){ 
        //384
        this.tile_set = [];

        this.canvas_buffer = new Uint8Array(NUMBER_OF_PIXELS);
    }
}