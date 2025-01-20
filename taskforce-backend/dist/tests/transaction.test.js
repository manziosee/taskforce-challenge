"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('Transaction API', () => {
    let token;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Login to get a token
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'test@example.com',
            password: 'password123',
        });
        token = res.body.token;
    }));
    it('should get transactions for a user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .get('/api/transactions/12345') // Replace with a valid user ID
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    }));
    it('should add a new transaction', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send({
            userId: '12345', // Replace with a valid user ID
            amount: 100,
            type: 'expense',
            category: 'Food',
            subcategory: 'Groceries',
            account: 'Bank',
            date: '2025-01-01',
            description: 'Grocery shopping',
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('amount', 100);
    }));
    it('should delete a transaction', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .delete('/api/transactions/12345') // Replace with a valid transaction ID
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Transaction deleted successfully');
    }));
});
