"use server";

import { PASSWORD_REGEX, PASSWORD_REGEX_ERROR } from "@/lib/constants";
import { z } from "zod";

const checkUsername = (username: string) => !username.includes("potato");
const checkPassword = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "문자만 입력가능함",
        required_error: "이름을 쓰라고 ㅋㅋ",
      })
      .trim()
      .toLowerCase()
      .transform((username) => `🥕 ${username} 🥕`)
      .refine(checkUsername, "No potatoes allowed"),
    email: z.string().email().toLowerCase(),
    password: z.string().min(10).regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string().min(10),
  })
  .refine(checkPassword, {
    message: "설정한 비밀번호가 일치하지 않네요. 같은 비밀번호를 입력해주세요.",
    path: ["confirm_password"],
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const result = formSchema.safeParse(data);
  console.log(result.error?.flatten());
  if (!result.success) {
    return result.error.flatten();
  } else {
    console.log(result.data);
  }
}
