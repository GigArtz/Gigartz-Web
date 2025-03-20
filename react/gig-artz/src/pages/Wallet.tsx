import { UserProfile } from '../store/profileSlice';
import WalletTabs from '../components/WalletTabs';
import { RootState } from '../store/store';
import React from 'react'
import { useSelector } from 'react-redux';

function Wallet() {

  const userList = useSelector((state: RootState) => state.profile);

  const userProfile = userList?.userList?.find(
    (user: UserProfile) => user?.id === uid
  );

  
  return (
    <div className='main-content'>
        <div>
          <WalletTabs uid={userProfile?.id}/>
        </div>
    </div>
  )
}

export default Wallet