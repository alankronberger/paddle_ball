class GameOver extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }

    
    preload() {

    }

    create(data) {
        this.socket = data.socket;
        this.title = this.add.text(0, 0, "GAME OVER", {font: "120px Impact"});
        if(data.winner !== undefined){
            this.msg = this.add.text(0, 0, `${data.winner} is the winner!!`, {align: "center", font: "40px Impact"});
        }
        else if(data.opponent !== undefined){
            this.msg = this.add.text(0, 0, `${data.opponent} disconnected!`, {align: "center", font: "40px Impact"});
        }
        this.clickButton = this.add.text(0, 0, 'Play Again', { fill: '#0f0', font: "80px" })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.enterButtonHoverState() )
        .on('pointerout', () => this.enterButtonRestState() )
        .on('pointerdown', () => this.enterButtonActiveState() )
        .on('pointerup', () => {
            this.scene.start("Matching", {socket: this.socket});
        });
        this.zone = this.add.zone(500, 300, 1000, 600);

        Phaser.Display.Align.In.TopCenter(this.title, this.zone);
        Phaser.Display.Align.In.Center(this.msg, this.zone);
        Phaser.Display.Align.In.BottomCenter(this.clickButton, this.zone);
    }

    enterButtonHoverState() {
        this.clickButton.setStyle({ fill: '#ff0'});
    }

    enterButtonRestState() {
        this.clickButton.setStyle({ fill: '#0f0' });
    }

    enterButtonActiveState() {
        this.clickButton.setStyle({ fill: '#0ff' });
    }

    
}