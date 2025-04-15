"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameController_1 = require("../controllers/gameController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/assets', auth_1.authenticateToken, gameController_1.getAssets);
router.get('/levels', auth_1.authenticateToken, gameController_1.getLevels);
router.get('/question/:level', auth_1.authenticateToken, gameController_1.getQuestion);
router.post('/answer', auth_1.authenticateToken, gameController_1.submitAnswer);
router.post('/score', auth_1.authenticateToken, gameController_1.updateScore);
exports.default = router;
//# sourceMappingURL=game.js.map