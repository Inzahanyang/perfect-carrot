import getSession from "./session";

const getLogin = async (id: number) => {
  const session = await getSession();
  session.id = id;
  await session.save();
};
export default getLogin;
