import { RouterContext, uuid, yup } from "../deps.ts";
import { MUser } from "../models/user.ts";
import User from "../interface/user.ts";
import { generateJwt } from '../jwt.ts'

// 判断注册的模型是否合法
const signupSchema = yup.object({
    email: yup
      .string()
      .email()
      .required(),
    password: yup.string().required(),
    username: yup.string().required()
  });


  // 注册
export async function signUp(ctx: RouterContext) {
    const { request, response } = ctx
    try {
        const body = await request.body()
        const data: Omit<User, 'id'> = body.value
        await signupSchema.validate(data);
        const userId = uuid.generate();
        // 查找邮箱是否注册过
        const user = await MUser.findOneByEmail(data.email);
        if(user) {
            response.status = 400;
            response.body = {
                message: `该邮箱${data.email} 已被注册！`
            };
            return;
        }
        const { id } = await MUser.insert({ ...data, id: userId });
        const jwt = await generateJwt(id);
        response.status = 201;
        response.body = {
            data: jwt
        };
    } catch (error) {
        throw error
    }
}