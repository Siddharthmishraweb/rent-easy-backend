import { express } from '../../helper/index.js'
import * as RentPaymentController from './RentPayment.Controller.js'
import { validateCreatePayment } from './RentPayment.Validator.js'

const router = express.Router()

router.post('/', validateCreatePayment, RentPaymentController.createPayment)
router.get('/user/:userId', RentPaymentController.getPaymentsByUser)
router.get('/:id', RentPaymentController.getPaymentById)
router.put('/:id', RentPaymentController.updatePayment)
router.delete('/:id', RentPaymentController.deletePayment)
router.post("/payment-breakup", RentPaymentController.getPaymentBreakup)

export default router
