"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const assetController_1 = require("../controllers/assetController");
const router = express_1.default.Router();
router.get('/characters', auth_1.authenticateToken, assetController_1.getCharacters);
router.get('/environments', auth_1.authenticateToken, assetController_1.getEnvironments);
router.get('/characters/:id', auth_1.authenticateToken, assetController_1.getCharacterById);
exports.default = router;
//# sourceMappingURL=assets.js.map