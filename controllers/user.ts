import { RouterContext, uuid, yup, validateJwt } from "../deps.ts";
import { MUser } from "../models/user.ts";
import User from "../interface/user.ts";
import { generateJwt } from '../jwt.ts'
import { jwtSecret } from "../config.ts";

// 判断注册的模型是否合法
const signupSchema = yup.object({
    email: yup
      .string()
      .email()
      .required(),
    password: yup.string().required(),
    username: yup.string().required()
  });

const loginSchema = yup.object({
    email: yup
        .string()
        .email()
        .required(),
    password: yup.string().required()
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

// 登录
export async function login(ctx: RouterContext) {
    const { request, response } = ctx
    try {
        const body = await request.body()
        const data: Omit<User, "id"|"name"> = body.value
        await loginSchema.validate(data)

        const user = await MUser.comparePassword(data.email, data.password)
        if(!user) {
            response.status = 400
            response.body = {
                message: "无此用户或密码错误！"
            }
            return
        }

        const jwt = await generateJwt(user.id)
        response.status = 200;
        response.body = {
            data: jwt
        };
    } catch (error) {
        throw error
    }
}

// 获取用户信息
export async function me(ctx: RouterContext) {
    try {
      const { request, response } = ctx;
      const jwt = request.headers.get("authorization");
      if (!jwt) {
        response.status = 401;
        response.body = {
          message: "Unauthorized"
        };
        return;
      }
  
      const validatedJwt :any = await validateJwt({ jwt, key:jwtSecret, algorithm: "HS256"});
  
      if (!validatedJwt) {
        response.status = 401;
        response.body = {
          message: "Unauthorized"
        };
        return;
      }
  
      const user = await MUser.findOneById(validatedJwt.payload?.id as string);
      if (!user) {
        response.status = 401;
        response.body = {
          message: "Unauthorized"
        };
        return;
      }
  
      response.status = 200;
      response.body = user;
    } catch (error) {
      throw error;
    }
  }