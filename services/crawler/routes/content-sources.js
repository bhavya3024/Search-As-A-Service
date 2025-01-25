const router = require('express').Router();
const multer = require('multer');
const contentSourceContoller = require('../controllers/content-sources');
const upload = multer({ dest: 'temp/' });

router.post('/', upload.single('logo'), contentSourceContoller.create);
router.get('/', contentSourceContoller.getAll);
router.get('/:id', contentSourceContoller.getById);
router.patch('/:id', contentSourceContoller.update);
router.delete('/:id', contentSourceContoller.delete);

module.exports = router;