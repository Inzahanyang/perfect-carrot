import getSession from "@/lib/session";
import db from "@/lib/db";
import { notFound, redirect } from "next/navigation";

const getUser = async () => {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: { id: session.id },
    });
    if (user) {
      return user;
    }
  }
  notFound();
};

const Profile = async () => {
  const user = await getUser();

  const logout = async () => {
    "use server";
    const session = await getSession();
    session.destroy();
    redirect("/");
  };
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-black">{user?.username}</h1>
          <form action={logout}>
            <button className=" bg-slate-500 p-2 rounded-md text-white font-bold">
              Logout
            </button>
          </form>
        </div>
        <div>
          <p className="text-gray-800 mb-2">
            <span className="font-bold">Email:</span> {user?.email}
          </p>
          <p className="text-gray-800">
            <span className="font-bold">가입일:</span>{" "}
            {user?.created_at.toDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
