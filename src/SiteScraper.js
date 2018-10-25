// import chalk from 'chalk';
import request from 'request-promise-native';
import env from './env';
import { delay } from './utils';

class SiteScraper {
    constructor(site, processor) {
        this.site = site;
        this.lastComments = [];
        this.processor = processor;
    }

    log(msg) {
        console.log(`[${this.site}] ${msg}`);
    }

    async _scrapePage(page) {
        const comments = [];

        const res = await request({
            uri: 'https://api.stackexchange.com/2.2/comments',
            qs: {
                page,
                order: 'desc',
                pagesize: 100,
                key: env.API_KEY,
                sort: 'creation',
                site: this.site,
                filter: '!SWJ_U*)(*g1RyfTztc',
            },
            gzip: true,
            json: true,
        });

        for (const comment of res.items) {
            if (this.lastComments.includes(comment.comment_id)) {
                break;
            }
            
            comments.push(comment);
        }

        return {
            comments,
            lastDate: new Date(res.items[res.items.length - 1].creation_date * 1000),
            quotaRemaining: res.quota_remaining,
            quotaMax: res.quota_max,
        };
    }

    async scrape() {
        const allComments = [];
        let page = 0;
        let lastCommentDate = null;
        
        while (true) {
            page += 1;

            const { comments, lastDate, quotaRemaining, quotaMax } = await this._scrapePage(page);

            this.log(`Page ${page} complete. Quota: ${quotaRemaining}/${quotaMax}`);

            allComments.push(...comments);
            lastCommentDate = lastDate;

            if (this.lastComments.length === 0 || comments.length < 100) {
                break;
            }

            await delay(50);
        }
        
        this.lastComments = allComments.map(comment => comment.comment_id);

        this.log(`Fetched ${allComments.length} new comments.`);

        await this.processor(allComments);

        return lastCommentDate;
    }
}

export default SiteScraper;