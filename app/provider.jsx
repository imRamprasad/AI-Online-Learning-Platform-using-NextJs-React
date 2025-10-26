"use client";

import React, { useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/contex/userDetailContext';

function Provider({ children }) {
    const { user } = useUser();
    const [userDetail,setUserDetail]=React.useState(null);
    useEffect(() => {
        if (!user) return;

        const createNewUser = async () => {
            try {
                const result = await axios.post('/api/user', {
                    name: user?.fullName,
                    email: user?.primaryEmailAddress?.emailAddress,
                });
                console.log('create user response:', result.data);
                setUserDetail(result.data);
            } catch (err) {
                console.error('Failed to create user:', err);
            }
        };

        createNewUser();
    }, [user]);

    return (
    <div>
        <UserDetailContext.Provider value={{ userDetail,setUserDetail}}>
        {children}
        </UserDetailContext.Provider>
    </div>);
}

export default Provider;