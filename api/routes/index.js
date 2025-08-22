import { express } from '../helper/index.js'
import addressRoutes from '../resources/Address/Address.Router.js'
import userRoutes from '../resources/User/User.Router.js'
import documentRoutes from '../resources/Document/Document.Router.js'
import propertyRoutes from '../resources/Property/Property.Router.js'
import roomRoutes from '../resources/Room/Room.Router.js'
import ownerRouter from '../resources/Owner/Owner.Router.js'
import rentalAgreementRoutes from '../resources/RentalAgreement/RentalAgreement.Router.js'
import rentPaymentRoutes from '../resources/RentPayment/RentPayment.Router.js'
import { updatingPropertyStats } from '../middleware/updatingPropertyStats.js'
import maintainanceRequestRoutes from '../resources/Request/Request.Router.js'

const router = express.Router()

router.use('/address', addressRoutes)
router.use('/user', userRoutes)
router.use('/documents', documentRoutes)
router.use('/property', propertyRoutes)
router.use('/room', updatingPropertyStats, roomRoutes)
router.use('/owner', ownerRouter)
router.use('/rental-agreement', rentalAgreementRoutes)
router.use('/rent-payment', rentPaymentRoutes)
router.use('/requests', maintainanceRequestRoutes)

export default router
