import { Router } from "https://deno.land/x/oak@v4.0.0/mod.ts"
const router = new Router()
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from './controllers/product.ts'
import { InsertUser, login } from './controllers/user.ts'

router.get('/api/getall',getProducts)
    .get('/api/getProductById/:id',getProductById)
    .post('/api/addProduct',addProduct)
    .post('/api/updateProduct',updateProduct)
    .post('/api/deleteProduct',deleteProduct)
    .post('/api/InsertUser', InsertUser)
    .post('/api/login', login)

export default router