import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

export const ClerkWrapper = ({ children }) => {
  return (
    <ClerkProvider publishableKey={Meteor.settings.public.clerk.publishableKey}>
      {children}
    </ClerkProvider>
  );
}; 