import * as bcrypt from "bcrypt";
import * as argon2 from "argon2";
import { SALT_ROUNDS } from "../../../config/config.service.js";
import { hashEnums } from "../Enums/security.enums.js";
import { badRequest } from "../Response/error.response.js";

export const generateHash = async ({plainText,saltRounds=SALT_ROUNDS,algorithm = hashEnums.BCRYPT}) => {

    let hashResult = "";

    switch (algorithm) {
        case hashEnums.BCRYPT:
            hashResult = await bcrypt.hash(plainText,Number(saltRounds));
            break;

        case hashEnums.ARGON2:
            hashResult = await argon2.hash(plainText);
            break;
        default:
            throw badRequest("Invalid hashing algorithm");
    }
    return hashResult;
}

export const compareHash = async ({plainText,cliphertext,algorithm = hashEnums.BCRYPT}) => {

    let isMatch = false;

    switch (algorithm) {
        case hashEnums.BCRYPT:
            isMatch = await bcrypt.compare(plainText,cliphertext);
            break;
        case hashEnums.ARGON2:
            isMatch = await argon2.verify(cliphertext,plainText);
            break;
        default:
            throw badRequest("Invalid hashing algorithm");
    }
    return isMatch;
}