import Queue from './Queue';
import SiteScraper from './SiteScraper';
import Bot from './Bot';
import env from './env';

import { fetchSites, delay, settings } from './utils';

const bot = new Bot(env.EMAIL, env.PASSWORD, env.ROOM);

const queue = new Queue(50);

const main = async () => {
    await bot.connect();

    await bot.sendMessage('Initializing nose, starting the hunt.');

    const sites = await fetchSites();

    const processor = async comments => {
        const blacklist = (await settings.get()).blacklist || [];

        const regexes = blacklist.map(item => new RegExp(item, 'u'));

        for (const comment of comments) {
            for (const regex of regexes) {
                if (regex.test(comment.body)) {
                    await bot.sendMessage(`Blacklisted comment matches \`${regex}\`: [link](${comment.link}).`);
                    await delay(50);
                }
            }
        }
    };

    for (const site of sites) {
        const scraper = new SiteScraper(site, processor);

        const fn = async () => {
            const oldest = await scraper.scrape();

            let diff = (new Date().getTime() - oldest.getTime()) / 1000;

            if (diff === null || diff > 60 * 60 * 10) {
                // No more than 5 hours at most
                diff = 60 * 60 * 10;
            }

            const after = new Date();

            after.setSeconds(after.getSeconds() + (diff / 2));
            queue.add(fn, after);
            
            // console.log(`Oldest Comment: ${oldest} Seconds: ${diff}. Queueing scrape for ${after}.`);
        };

        queue.add(fn);
    }

    await queue.run();
}


main();