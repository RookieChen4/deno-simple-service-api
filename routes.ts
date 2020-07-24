import { Router } from "./deps.ts";
const router = new Router()
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from './controllers/product.ts'
import { signUp, login, me } from './controllers/user.ts'
import { test } from './controllers/test.ts'

router.get('/api/getall',getProducts)
    .get('/api/getProductById/:id',getProductById)
    .post('/api/addProduct',addProduct)
    .post('/api/updateProduct',updateProduct)
    .post('/api/deleteProduct',deleteProduct)
    .post("/api/signup", signUp)
    .post('/api/login', login)
    .post('/api/me', me)
    .post('/api/test', test)

export default router