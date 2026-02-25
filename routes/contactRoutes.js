const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/', contactController.submitContactForm);

module.exports = router;