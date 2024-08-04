const UserModel = require('../Models/UserModel');

class UserController {
    constructor (dao) {
        this.UserModel = new UserModel(dao);
    }

    async getUserAccount(username) {
        return await this.UserModel.getUserInfo(username);
    }

    async updateColor(username, color) {
        await this.UserModel.updateColor(username, color);
    }

    async getColor(username){
        return await this.UserModel.getColor(username);
    }

    async updatePaddle(username, paddle) {
        await this.UserModel.updatePaddle(username, paddle);
    }

    async getPaddle(username){
        return await this.UserModel.getPaddle(username);
    }

    async getLeaderboard(){
        return await this.UserModel.getLeaderboard();
    }

    async incrementWins(username){
        await this.UserModel.incrementWins(username);
    }

    async delete(username){
        await this.UserModel.deleteAccount(username);
    }
}

module.exports = UserController;