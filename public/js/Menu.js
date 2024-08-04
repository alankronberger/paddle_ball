class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    
    preload() {
        this.load.image("logo", "./js/assets/logo.png");
        this.load.image("background", "./js/assets/background.png")
    }

    create() {
        this.add.image(500, 300, "background");
        this.add.text(20, 0, "Credit to Ghoul for SSP's dope logo", {fill : '#DC143C', font: "20px"});
        this.logo = this.physics.add.image(500, 300, "logo");
        this.logo.setScale(.5);
        this.logo.setCollideWorldBounds(true);
        this.logo.setBounce(1);
        this.logo.setVelocity(200);
        this.clickButton = this.add.text(450, 500, "Play", {fill: '#0f0', font: "80px Impact"})
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.enterButtonHoverState() )
        .on('pointerout', () => this.enterButtonRestState() )
        .on('pointerdown', () => this.enterButtonActiveState() )
        .on('pointerup', () => {
            if(this.socket !== undefined){
                this.scene.start("Matching", {socket: this.socket});
            }
        });
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

    setSocket(socket){
        this.socket = socket;
    }

    
}