import { express } from "../../helper/index.js"
import {
  createOwnerController,
  getOwnersController,
  getOwnerByIdController,
  updateOwnerController,
  deleteOwnerController,
  getOwnerDashboard
} from "./Owner.Controller.js"
import { validateCreateOwner } from './Owner.Validator.js'

const router = express.Router()

router.post("/", validateCreateOwner, createOwnerController)
router.get("/", getOwnersController)
router.get("/:id", getOwnerByIdController)
router.put("/:id", updateOwnerController)
router.delete("/:id", deleteOwnerController)
router.get('/:ownerId/dashboard', getOwnerDashboard)

export default router
