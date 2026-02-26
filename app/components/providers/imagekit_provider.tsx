import React from 'react';
import { IKContext } from "imagekitio-react";

const ImagekitProvider = ({children}: {children: React.ReactNode}) => {
  return (
    <IKContext
        publicKey={process.env.IMAGEKIT_PUBLIC_KEY || ""}
        urlEndpoint={process.env.IMAGEKIT_URL_ENDPOINT || ""}
        authenticationEndpoint="/api/imagekit-auth"
    >
        {children}
    </IKContext>
  );
}

export default ImagekitProvider;