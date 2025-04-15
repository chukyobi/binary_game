"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const levelController_1 = require("../controllers/levelController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, levelController_1.getLevels);
router.get('/:id', auth_1.authenticateToken, levelController_1.getLevelById);
router.post('/', auth_1.authenticateToken, levelController_1.createLevel);
router.put('/:id', auth_1.authenticateToken, levelController_1.updateLevel);
exports.default = router;
//# sourceMappingURL=levelRoutes.js.map