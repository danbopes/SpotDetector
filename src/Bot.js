import Client from 'chatexchange';

class Bot {
    constructor(email, password, room) {
        this.email = email;
        this.password = password;
        this.roomId = room;
        this.prefix = '[ [SpotDetector](https://stackapps.com/questions/8077/spotdetector-sniff-out-blacklisted-comments) ] ';
    }

    async connect() {
        // Create new client for site
        const client = new Client('stackoverflow.com');
        
        await client.login(this.email, this.password);

        const room = await client.joinRoom(this.roomId);

        this.room = room;
    }

    sendMessage(msg) {
        return this.room.sendMessage(`${this.prefix}${msg}`);
    }
}

export default Bot;