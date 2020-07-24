const data = [
    {
        id: 1
    },
    {
        id: 2
    },
    {
        id: 3
    }
]
const test = async({response}:{response:any}) => {
    try {
        response.body = {
            success: true,
            data: data
        }
    } catch (err){
        response.status = 500
        response.body = {
            success: false,
            data: err.toString()
        }
    } finally {
    }
}

export { test } 