import { Router } from "./deps.ts";
const router = new Router()
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from './controllers/product.ts'
import { signUp } from './controllers/user.ts'

router.get('/api/getall',getProducts)
    .get('/api/getProductById/:id',getProductById)
    .post('/api/addProduct',addProduct)
    .post('/api/updateProduct',updateProduct)
    .post('/api/deleteProduct',deleteProduct)
    .post("/api/signup", signUp)
    // .post('/api/InsertUser', InsertUser)
    // .post('/api/login', login)

export default router