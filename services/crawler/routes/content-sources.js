const router = require('express').Router();
const contentSourceContoller = require('../controllers/content-source');

router.post('/', contentSourceContoller.create);
router.get('/', contentSourceContoller.getAll);
router.patch('/:id', contentSourceContoller.update);
router.delete('/:id', contentSourceContoller.delete);

module.exports = router;