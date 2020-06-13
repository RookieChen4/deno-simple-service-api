import product from '../interface/product.ts'
import { v4 } from 'https://deno.land/std/uuid/mod.ts'
import { Client } from "https://deno.land/x/postgres/mod.ts";
import { dbCreds } from '../config.ts'
const client = new Client(dbCreds);
let products: product[] = [
    {
        id: '1',
        name: 'Product one',
        des: 'hhh',
        price: 29.9
    },
    {
        id: '2',
        name: 'Product two',
        des: 'hhh',
        price: 29.9
    },
    {
        id: '3',
        name: 'Product three',
        des: 'hhh',
        price: 29.9
    },
    {
        id: '4',
        name: 'Product four',
        des: 'hhh',
        price: 29.9
    },
]


const handleResult = (result:any) => {
    let property: string[]= result.rowDescription.columns.map((it:any) => it.name)
    let products = result.rows.map((el:any) => {
        let obj: any = {}
        property.forEach((it,index) => {
            obj[it] = el[index]
        })
        return obj
    })
    return products
}


// get all products
const getProducts = async({response}:{response:any}) => {
    try {
        await client.connect()
        const result = await client.query("SELECT * FROM PRODUCT")
        products = handleResult(result)
        response.body = {
            success: true,
            data: products
        }
    } catch (err){
        response.status = 500
        response.body = {
            success: false,
            data: err.toString()
        }
    } finally {
        client.end()
    }
}

// get product by Id
const getProductById = async ({params, response}:{params:{id:string},response:any}) => {
    try {
        await client.connect()
        const result = await client.query( "SELECT * FROM PRODUCT WHERE ID = $1",params.id)
        if(result.rowCount === 0) {
            response.status = 404
            response.body = {
                success: false,
                data: 'no product'
            }
        } else {
            products = handleResult(result)
            response.status = 200
            response.body = {
                success: true,
                data: products
            }
        }
    } catch (err) {
        response.status = 500
        response.body = {
            success: false,
            data: err.toString()
        }
    } finally {
        client.end()
    }
}

// add product
const addProduct = async({request ,response}:{request:any,response:any}) => {
    const body = await request.body()
    if(!request.hasBody) {
        response.status = 400
        response.body = {
            success: false,
            data: 'bad request'
        }
    } else {
        try {
            await client.connect()
            const product:product = body.value
            const result = await client.query("INSERT INTO PRODUCT(name,des,price) VALUES($1,$2,$3)",
            product.name,product.des,product.price)
            response.status = 200
            response.body = {
                success: true,
                data: product
            }
        }catch (err){
            response.status = 500
            response.body = {
                success: false,
                data: err.toString()
            }
        } finally {
            await client.end()
        }
    }
}


// updateProduct
const updateProduct = async({request ,response}:{request:any,response:any}) => {
    const body = await request.body()
    const product:product = body.value
    if(!request.hasBody) {
        response.status = 400
        response.body = {
            success: false,
            data: 'bad request'
        }
    } else {
        await getProductById({params:{"id":product.id},response})
        if(!response.body.success) {
            response.status = 404
            response.body = {
                success: false,
                data: 'No such product'
            }
        } else {
            try {
                await client.connect()
                const result = await client.query("UPDATE PRODUCT SET name=$1,des=$2,price=$3 WHERE id=$4", product.name,product.des,product.price,product.id)
                response.status = 200
                response.body = {
                    success: true,
                    data: 'update success'
                }
            }catch (err){
                response.status = 500
                response.body = {
                    success: false,
                    data: err.toString()
                }
            } finally {
                await client.end()
            }
        }
    }
}

const deleteProduct = async({request ,response}:{request:any,response:any}) => {
    const body = await request.body()
    const product: { id:string } = body.value
    if(!request.hasBody) {
        response.status = 400
        response.body = {
            success: false,
            data: 'bad request'
        }
    }else {
        await getProductById({params:{"id":product.id},response})
        if(!response.body.success) {
            response.status = 404
            response.body = {
                success: false,
                data: 'No such product'
            }
        } else {
            try {
                await client.connect()
                const result = await client.query("DELETE FROM PRODUCT WHERE id=$1", product.id)
                response.status = 200
                response.body = {
                    success: true,
                    data: 'reomve success'
                }
            }catch (err){
                response.status = 500
                response.body = {
                    success: false,
                    data: err.toString()
                }
            } finally {
                await client.end()
            }
        }
    }
}
export { getProducts, getProductById, addProduct, updateProduct, deleteProduct }

