const { fork } = require('child_process');
const dogApiChild = fork('./services/crawl-service');
const catApiChild = fork('./services/crawl-service');

dogApiChild.send('THE_DOG_API');
catApiChild.send('THE_CAT_API');





// module.exports = router;