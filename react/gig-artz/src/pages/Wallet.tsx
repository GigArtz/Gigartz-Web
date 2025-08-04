import { UserProfile } from "../store/profileSlice";
import WalletTabs from "../components/WalletTabs";
import { RootState } from "../store/store";
import React from "react";
import { useSelector } from "react-redux";
import Header from "../components/Header";

function Wallet() {
  const userList = useSelector((state: RootState) => state.profile);
  const uid = useSelector((state: RootState) => state.profile);

  const userProfile = userList?.userList?.find(
    (user: UserProfile) => user?.id === uid
  );

  return (
    <div className="main-content p-2 animate-fade-in-up transition-all duration-500">
      <div className="animate-slide-in-left">
        <Header title={"Wallet"} />
        <div className="mt-4 animate-fade-in-up animation-delay-200">
          <WalletTabs uid={userProfile?.id} />
        </div>
      </div>
    </div>
  );
}

export default Wallet;
