const router = require('express').Router();
const apiConfigurationController = require('../controllers/api-configurations');

router.post('/', apiConfigurationController.create);
router.get('/', apiConfigurationController.getAll);
router.get('/:id', apiConfigurationController.getById);
router.patch('/:id', apiConfigurationController.update);
router.delete('/:id', apiConfigurationController.delete);

module.exports = router;