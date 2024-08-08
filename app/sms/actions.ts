"use server";

import twilio from "twilio";
import { randomInt, randomBytes } from "crypto";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import validator from "validator";
import { z } from "zod";
import getLogin from "@/lib/getLogin";

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format"
  );

async function tokenExists(token: number) {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: { id: true },
  });

  if (!exists) {
    return false;
  } else {
    return true;
  }
}

const tokenSchema = z.coerce
  .number()
  .min(100000)
  .max(999999)
  .refine(tokenExists, "This token does not exist.");

interface ActionState {
  token: Boolean;
}

const MAX_ATTEMPTS = 10;

const getToken = async (attempt = 1): Promise<string> => {
  if (attempt > MAX_ATTEMPTS) {
    throw new Error("Failed to generate a unique token after maximum attempts");
  }
  const token = randomInt(100000, 999999).toString();

  try {
    const exists = await db.sMSToken.findUnique({
      where: {
        token,
      },
      select: {
        userId: true,
      },
    });
    if (exists) {
      return await getToken();
    } else {
      return token;
    }
  } catch (error) {
    console.error("Error checking token uniqueness:", error);
    throw new Error("Failed to generate token due to database error");
  }
};

export const smsLogIn = async (prevState: ActionState, formData: FormData) => {
  const phone = formData.get("phone");
  const token = formData.get("token");

  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      // Delete previous token
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data,
          },
        },
      });
      // Create token
      const token = await getToken();
      await db.sMSToken.create({
        data: {
          token,
          user: {
            connectOrCreate: {
              where: {
                phone: result.data,
              },
              create: {
                username: randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });
      // Send the token using twilio
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await client.messages.create({
        body: `Your Karrot verification code is ${token}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.TWILIO_VERIFY_PHONE_NUMBER!,
        // to: result.data,
      });
      return {
        token: true,
      };
    }
  } else {
    const result = await tokenSchema.safeParseAsync(token);
    // console.log(result.error?.formErrors.formErrors[0]);

    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
      };
    } else {
      // Get the userId of token
      const token = await db.sMSToken.findUnique({
        where: {
          token: result.data.toString(),
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (token) {
        // Log the user in
        await getLogin(token.userId);
        await db.sMSToken.delete({ where: { id: token.id } });
      }
      redirect("/profile");
    }
  }
};
