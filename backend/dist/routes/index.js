"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const user_1 = __importDefault(require("./user"));
const levelRoutes_1 = __importDefault(require("./levelRoutes"));
const game_1 = __importDefault(require("./game"));
const assets_1 = __importDefault(require("./assets"));
const router = express_1.default.Router();
router.use('/auth', auth_1.default);
router.use('/users', user_1.default);
router.use('/levels', levelRoutes_1.default);
router.use('/game', game_1.default);
router.use('/assets', assets_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map