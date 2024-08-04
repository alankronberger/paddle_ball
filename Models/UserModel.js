class UserModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    async createTable () {
        const sql = `
            CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            passwordHash TEXT,
            color TEXT DEFAULT black,
            paddle TEXT DEFAULT pgreen,
            wins INTEGER DEFAULT 0
        )`
        return await this.DAO.run(sql)
    }

    async getPasswordHash (username) {
        return await this.DAO.get(
            'select passwordHash from Users where username=?', 
            [username]
        );
    }

    async addUser (username, passwordHash) {
        const sql = `INSERT INTO Users (username, passwordHash) VALUES (?, ?)`;
        // Username needs to be unique so this will throw an exception if we 
        // attempt to add a user that already exists
        await this.DAO.run(sql, [username, passwordHash]);
    }

    async getUserInfo (username) {
        return await this.DAO.get(
            'select username,color,paddle from Users where username = ?',
            [username]
        );
    }

    async updateColor (username, color) {
        const sql = `UPDATE Users SET color = ? WHERE username = ?`;
        
        await this.DAO.run(sql, [color, username]);
    }

    async getColor (username){
        const sql = `SELECT color FROM Users where username = ?`;
        return await this.DAO.get(sql, [username]);
    }

    async updatePaddle (username, paddle) {
        const sql = `UPDATE Users SET paddle = ? WHERE username = ?`;
        
        await this.DAO.run(sql, [paddle, username]);
    }

    async getPaddle (username){
        const sql = `SELECT paddle FROM Users where username = ?`;
        return await this.DAO.get(sql, [username]);
    }

    async getLeaderboard(){
        const sql = "SELECT username, wins FROM Users ORDER BY wins DESC LIMIT 100";
        return await this.DAO.all(sql);
    }

    async incrementWins(username){
        const sql = "Update Users SET wins = wins + 1 WHERE username = ?";
        await this.DAO.run(sql, [username]);
    }

    async updatePasswordHash(username, newHash){
        const sql = "UPDATE Users SET passwordHash = ? WHERE username = ?";
        await this.DAO.run(sql, [newHash, username]);
    }

    async updateUsername(username, newUsername){
        const sql = "UPDATE Users SET username = ? WHERE username = ?";
        await this.DAO.run(sql, [newUsername, username]);
    }

    async deleteAccount(username){
        const sql = "DELETE FROM Users where username = ?";
        await this.DAO.run(sql, [username]);
    }
}

module.exports = UserModel;