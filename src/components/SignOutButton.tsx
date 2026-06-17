'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { Button } from 'antd'; 

export default function SignOutButton() {
    return (
        <Button 
            danger 
            type="primary"
            // The callbackUrl ensures that when the cookie is destroyed, 
            // the user is immediately kicked back to your new gatekeeper screen
            onClick={() => signOut({ callbackUrl: '/signin' })}
        >
            Sign Out
        </Button>
    );
}