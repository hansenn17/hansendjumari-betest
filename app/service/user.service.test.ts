import UserService from "../service/user.service";
import UserModel from "../model/user.model";
import { redisClient } from "../config/redis";
import { User } from "../type/user";

jest.mock("../model/user.model");
jest.mock("../config/redis");

describe("UserService", () => {
  let userService: UserService;
  const mockUser = {
    _id: "123",
    accountNumber: "ACC123",
    identityNumber: "ID456",
    username: "John Doe",
    emailAddress: "john@example.com",
  };

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user and cache it", async () => {
      const mockInsertUserPayload = {
        accountNumber: "ACC123",
        identityNumber: "ID456",
        username: "John Doe",
        emailAddress: "john@example.com",
      };
      const mockUserInstance = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };

      (UserModel as unknown as jest.Mock).mockImplementation(
        () => mockUserInstance
      );

      const redisSpy = jest.spyOn(redisClient, "set").mockResolvedValue("OK");

      const result = await userService.createUser(mockInsertUserPayload);

      expect(UserModel).toHaveBeenCalledWith(mockInsertUserPayload);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(redisSpy).toHaveBeenCalledWith(
        `user:${mockUser.accountNumber}`,
        JSON.stringify(mockUser)
      );
      expect(result.accountNumber).toEqual(mockUser.accountNumber);
    });

    it("should throw an error if save fails", async () => {
      const mockError = new Error("Save failed");
      (UserModel as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(mockError),
      }));

      await expect(userService.createUser(mockUser)).rejects.toThrow(mockError);
    });
  });

  describe("getUserByAccountNumber", () => {
    it("should return user from cache if exists", async () => {
      const redisSpy = jest
        .spyOn(redisClient, "get")
        .mockResolvedValue(JSON.stringify(mockUser));

      const result = await userService.getUserByAccountNumber(
        mockUser.accountNumber
      );

      expect(redisSpy).toHaveBeenCalledWith(`user:${mockUser.accountNumber}`);
      expect(UserModel.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should fetch from database and cache if not in cache", async () => {
      jest.spyOn(redisClient, "get").mockResolvedValue(null);
      jest.spyOn(UserModel, "findOne").mockResolvedValue(mockUser);
      const redisSetSpy = jest
        .spyOn(redisClient, "set")
        .mockResolvedValue("OK");

      const result = await userService.getUserByAccountNumber(
        mockUser.accountNumber
      );

      expect(UserModel.findOne).toHaveBeenCalledWith({
        accountNumber: mockUser.accountNumber,
      });
      expect(redisSetSpy).toHaveBeenCalledWith(
        `user:${mockUser.accountNumber}`,
        JSON.stringify(mockUser)
      );
      expect(result).toEqual(mockUser);
    });

    it("should return empty object if user not found", async () => {
      jest.spyOn(redisClient, "get").mockResolvedValue(null);
      jest.spyOn(UserModel, "findOne").mockResolvedValue(null);

      const result = await userService.getUserByAccountNumber("nonexistent");

      expect(result).toEqual({});
    });
  });

  describe("getUserByIdentityNumber", () => {
    it("should return user from cache if exists", async () => {
      const redisSpy = jest
        .spyOn(redisClient, "get")
        .mockResolvedValue(JSON.stringify(mockUser));

      const result = await userService.getUserByIdentityNumber(
        mockUser.identityNumber
      );

      expect(redisSpy).toHaveBeenCalledWith(`user:${mockUser.identityNumber}`);
      expect(UserModel.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should fetch from database and cache if not in cache", async () => {
      jest.spyOn(redisClient, "get").mockResolvedValue(null);
      jest.spyOn(UserModel, "findOne").mockResolvedValue(mockUser);
      const redisSetSpy = jest
        .spyOn(redisClient, "set")
        .mockResolvedValue("OK");

      const result = await userService.getUserByIdentityNumber(
        mockUser.identityNumber
      );

      expect(UserModel.findOne).toHaveBeenCalledWith({
        identityNumber: mockUser.identityNumber,
      });
      expect(redisSetSpy).toHaveBeenCalledWith(
        `user:${mockUser.identityNumber}`,
        JSON.stringify(mockUser)
      );
      expect(result).toEqual(mockUser);
    });

    it("should return empty object if user not found", async () => {
      jest.spyOn(redisClient, "get").mockResolvedValue(null);
      jest.spyOn(UserModel, "findOne").mockResolvedValue(null);

      const result = await userService.getUserByIdentityNumber("nonexistent");

      expect(result).toEqual({});
    });
  });

  describe("updateUser", () => {
    it("should update user and cache", async () => {
      const mockUpdateUserPayload: User = {
        accountNumber: "ACC123",
        identityNumber: "ID456",
        username: "John Doe",
        emailAddress: "john@example.com",
      };
      jest.spyOn(UserModel, "findByIdAndUpdate").mockResolvedValue(mockUser);
      const redisSetSpy = jest
        .spyOn(redisClient, "set")
        .mockResolvedValue("OK");

      const result = await userService.updateUser("123", mockUpdateUserPayload);

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        mockUpdateUserPayload,
        { new: true }
      );
      expect(redisSetSpy).toHaveBeenCalledWith(
        `user:${mockUser.accountNumber}`,
        JSON.stringify(mockUser)
      );
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      const mockUpdateUserPayload: User = {
        accountNumber: "ACC123",
        identityNumber: "ID456",
        username: "John Doe",
        emailAddress: "john@example.com",
      };
      jest.spyOn(UserModel, "findByIdAndUpdate").mockResolvedValue(null);

      const result = await userService.updateUser("123", mockUpdateUserPayload);

      expect(result).toBeNull();
      expect(redisClient.set).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("should delete user and remove from cache", async () => {
      jest.spyOn(UserModel, "findByIdAndDelete").mockResolvedValue(mockUser);
      const redisDelSpy = jest.spyOn(redisClient, "del").mockResolvedValue(1);

      const result = await userService.deleteUser("123");

      expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(redisDelSpy).toHaveBeenCalledWith(
        `user:${mockUser.accountNumber}`
      );
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      jest.spyOn(UserModel, "findByIdAndDelete").mockResolvedValue(null);

      const result = await userService.deleteUser("123");

      expect(result).toBeNull();
      expect(redisClient.del).not.toHaveBeenCalled();
    });
  });
});
