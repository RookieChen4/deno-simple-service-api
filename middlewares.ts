import { Context, validateJwt } from "./deps.ts";
import User from "./interface/user.ts";
import {MUser} from "./models/user.ts";
import { jwtSecret } from "./config.ts";

export async function handleAuthHeader(
    ctx: Context<{ user: Omit<User, "password"> | null }>,
    next: () => Promise<void>
    ) {
    try {
        const { request, state } = ctx;

        const jwt = request.headers.get("authorization")|| "";
        const validatedJwt :any = await validateJwt({ jwt, key:jwtSecret, algorithm: "HS256"});
        if (!validatedJwt.isValid) {
            state.user = null;
        } else {
            const user = await MUser.findOneById(validatedJwt.payload?.id as string);
            if (!user) {
                state.user = null;
                return
            }
            state.user = user;
        }
        await next();
    } catch (error) {
        throw error;
    }
}

export async function handleErrors(
context: Context,
next: () => Promise<void>
) {
try {
    await next();
} catch (err) {
    context.response.status = err.status;
    const { message = "unkown error", status = 500, stack = null } = err;
    context.response.body = { message, status, stack };
    context.response.type = "json";
}
}