const { fork } = require('child_process');
const dogApiChild = fork('./services/crawl-service');
const catApiChild = fork('./services/crawl-service');

dogApiChild.send('THE_DOG_API');
catApiChild.send('THE_CAT_API');


catApiChild.on('message', (message) => {
    console.log('Message from child:', message);
});

dogApiChild.on('message', (message) => {        
    console.log('Message from child:', message);
})

catApiChild.on('error', (error) => {
    console.log('Error from child:', error);
});

dogApiChild.on('error', (error) => {
    console.log('Error from child:', error);
});


// module.exports = router;