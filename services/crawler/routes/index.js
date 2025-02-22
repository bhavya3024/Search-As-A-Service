

const crawlerService = require('../services/crawl-service');
const configurations = require('../configurations');

const router = require('express').Router();

router.get('/crawls', async (req, res) => {

    // await crawlerService.crawlApi({
    //     moduleName: ['THE_DOG_API'],
    //     apiName: 'breeds',
    //     axiosQueryParams: {
    //         page: 0,
    //         limit: 10,
    //     }
    // });


    // await crawlerService.crawlApi({
    //     moduleName: ['THE_CAT_API'],
    //     apiName: 'breeds',
    //     axiosQueryParams: {
    //         page: 0,
    //         limit: 10,
    //     }
    // });

    await crawlerService.crawlApi({
        moduleName: ['NEWS_API'],
        apiName: 'searchNews',
        axiosQueryParams: {
            text: 'google',
            ['api-key']: process.env.NEWS_API_KEY,
        }
    });





    // await crawlerService.crawlApi({
    //     moduleName: ['STACKOVERFLOW'],
    //     apiName: 'search',
    //     axiosQueryParams: {
    //         order: 'desc',
    //         sort: 'activity',
    //         intitle: 'javascript',
    //         site: 'stackoverflow',
    //         key: process.env.STACK_EXCHANGE_KEY,
    //     }
    // })


    // await crawlerService.crawlApi({
    //     moduleName: ['GITHUB'],
    //     apiName: 'repositories',
    //     axiosQueryParams: {
    //         limit: 10,
    //     },
    //     headers: {
    //         Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`
    //     },
    // });

    // await crawlerService.crawlApi({
    //     moduleName: ['THE_CAT_API'],
    //     apiName: 'breeds',
    //     axiosQueryParams: {
    //         page: 0,
    //         limit: 10,
    //     }
    // });

    return res.sendStatus(200);



});


module.exports = router;