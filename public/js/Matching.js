class Matching extends Phaser.Scene {
    constructor() {
        super("Matching");
    }

    
    preload() {
        //this.load.image("loader", "./js/assets/loader.gif");

    }

    create(data) {
        this.socket = data.socket;
        this.text = this.add.text(200, 200, "Looking for a match", {font: "100px Impact"});
        this.zone = this.add.zone(500, 300, 1000, 200);
        //this.add.image(500, 500, 'loader');

        Phaser.Display.Align.In.Center(this.text, this.zone);
        this.findGame();
        
    }

    joinGame(player, opponent) {
        this.scene.start("Play", {socket: this.socket, player, opponent});
    }

    findGame() {
        const msg = {
            cmd : "jg"
        };
        this.socket.send(JSON.stringify(msg));
    }

    
}