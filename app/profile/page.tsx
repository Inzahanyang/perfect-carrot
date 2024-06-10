import React from "react";
import Image from "next/image";

interface ProfileData {
  name: string;
  age: number;
  profession: string;
  bio: string;
  imageUrl: string;
}

const Profile: React.FC = () => {
  const profileData: ProfileData = {
    name: "김철수",
    age: 30,
    profession: "소프트웨어 엔지니어",
    bio: "안녕하세요! 저는 소프트웨어 엔지니어로 일하고 있는 김철수입니다. 웹 개발과 인공지능에 관심이 많습니다.",
    imageUrl: "https://example.com/profile-image.jpg",
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center mb-6">
          <Image
            src={profileData.imageUrl}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full mr-4"
          />
          <div>
            <h1 className="text-3xl font-bold">{profileData.name}</h1>
            <p className="text-gray-600">{profileData.profession}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-800 mb-2">
            <span className="font-bold">나이:</span> {profileData.age}
          </p>
          <p className="text-gray-800">
            <span className="font-bold">소개:</span> {profileData.bio}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
