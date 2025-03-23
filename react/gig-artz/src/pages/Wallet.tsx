import { UserProfile } from '../store/profileSlice';
import WalletTabs from '../components/WalletTabs';
import { RootState } from '../store/store';
import React from 'react'
import { useSelector } from 'react-redux';
import Header from '../components/Header';

function Wallet() {

  const userList = useSelector((state: RootState) => state.profile);
  const uid = useSelector((state: RootState) => state.profile);

  const userProfile = userList?.userList?.find(
    (user: UserProfile) => user?.id === uid
  );

  
  return (
    <div className='main-content p-2'>
        <div>
          <Header title='Wallet' />
          <WalletTabs uid={userProfile?.id}/>
        </div>
    </div>
  )
}

export default Wallet