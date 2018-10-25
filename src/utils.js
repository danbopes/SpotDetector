import { promises as fs } from 'fs';
import request from 'request-promise-native';
import env from './env';

export const delay = ms => new Promise(res => setTimeout(res, ms));

export const fetchSites = async () => {
    let page = 1;
    const sites = [];
    while (true) {
        const res = await request({
            uri: 'https://api.stackexchange.com/2.2/sites',
            qs: {
                page,
                pagesize: 100,
                key: env.API_KEY,
                filter: '!6Oe78nmjjzwCi',
            },
            gzip: true,
            json: true,
        });

        sites.push(...res.items);

        if (!res.has_more) {
            break;
        }

        page += 1;
        await delay(50);
    }

    return sites.map(site => site.api_site_parameter);
}

class Settings {
    constructor() {
        this.config = null;
    }
    
    async get() {
        if (this.config === null) {
            this.config = {};

            const config = (await fs.readFile('./config.json')).toString();


            this.config = JSON.parse(config);

            return this.config;
        }

        return this.config;
    }

    async update(config) {
        this.config = config;

        await fs.writeFile('./config.json', JSON.stringify(this.config));
    }
}

export const settings = new Settings();