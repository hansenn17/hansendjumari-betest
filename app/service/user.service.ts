import { User } from "../type/user";
import UserModel from "../model/user.model";
import { redisClient } from "../config/redis";

export default class UserService {
  async createUser(userData: any) {
    const user = new UserModel(userData);
    await user.save();
    await redisClient.set(`user:${user.accountNumber}`, JSON.stringify(user));
    return user;
  }

  async getUserByAccountNumber(accountNumber: string) {
    // get user data from cache
    const cachedUser = await redisClient.get(`user:${accountNumber}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await UserModel.findOne({ accountNumber });
    if (!user) {
      return {};
    }

    // cache the user data
    await redisClient.set(`user:${accountNumber}`, JSON.stringify(user));

    return user;
  }

  async getUserByIdentityNumber(identityNumber: string) {
    // get user data from cache
    const cachedUser: string | null = await redisClient.get(
      `user:${identityNumber}`
    );
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await UserModel.findOne({ identityNumber });
    if (!user) {
      return {};
    }

    // cache the user data
    await redisClient.set(`user:${identityNumber}`, JSON.stringify(user));

    return user;
  }

  async updateUser(id: string, userData: User) {
    const user = await UserModel.findByIdAndUpdate(id, userData, {
      new: true,
    });

    if (!user) {
      return user;
    }

    // update cache
    await redisClient.set(`user:${user.accountNumber}`, JSON.stringify(user));

    return user;
  }

  async deleteUser(id: string) {
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      return null;
    }

    // remove from cache
    await redisClient.del(`user:${user.accountNumber}`);

    return user;
  }
}
