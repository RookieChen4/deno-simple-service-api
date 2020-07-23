import User from "../interface/user.ts";
import { dbClient } from '../db.ts'
import { PostgresClient, bcrypt } from "../deps.ts";

class UserModel {
    private dbClient: PostgresClient;

    constructor(dbClient: PostgresClient) {
        this.dbClient = dbClient;
    }
    
    // 密码加密
    private async hashThePassword(password:string): Promise<string> {
        return await bcrypt.hash(password);
    }

    // 密码加密
    private async beforeInsert(data:User): Promise<User> {
        const hashPassword = await this.hashThePassword(data.password)
        return {
            ...data,
            password:hashPassword
        }
    }
    
    // 添加用户
    public async insert(args:User): Promise<{ id: string }> {
        try {
            await this.dbClient.connect();
            const data = await this.beforeInsert(args);
            const text =
              "insert into users (id, email, password, username) values ($1, $2, $3, $4) returning id";
            const result = await this.dbClient.query({
              text,
              args: [data.id, data.email, data.password, data.username]
            });
            await this.dbClient.end();
            return { id: result.rows[0][0] };
          } catch (error) {
            throw error;
          }
    }

    // 通用搜索
    private async get(type: string, value: string | number): Promise<User[]> {
      try {
        await this.dbClient.connect();
        const text = `select * from users where ${type} = $1`;
        const result = await this.dbClient.query({
          text,
          args: [value]
        });
        await this.dbClient.end();
        return result.rowsOfObjects() as User[];
      } catch (error) {
        throw error;
      }
    }

    async findOneByEmail(email: string): Promise <Omit<User,"password"> | null> {
      try {
        const [result] = await this.get("email", email);
        if (!result) return null;
  
        return {
          id: result.id,
          email: result.email,
          username: result.username
        };
      } catch (error) {
        throw error;
      }
    }

    async findOneById(id: string): Promise <Omit<User,"password"> | null> {
      try {
        const [result] = await this.get("id", id);
        if (!result) return null;
  
        return {
          id: result.id,
          email: result.email,
          username: result.username
        };
      } catch (error) {
        throw error;
      }
    }

    // 验证密码
    async comparePassword(email: string,password: string): Promise<Omit<User, "password"> | null> {
      try {
        const [user] = await this.get("email", email)
        if(!user) return null

        const result = bcrypt.compare(password, user.password)
        if(!result) return null

        return {
          id: user.id,
          email: user.email,
          username: user.username
        }
      } catch (error) {
        throw error
      }
    }

}

export const MUser = new UserModel(dbClient);
