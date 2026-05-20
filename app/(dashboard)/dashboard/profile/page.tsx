'use client'
import { Loader, Shield, UserIcon, Mail } from "lucide-react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  return (
    <div className='flex justify-center items-center w-full px-8 py-16 max-sm:py-10'>
      <div className='flex flex-col items-start border border-border rounded-xl max-w-lg w-full max-sm:max-w-sm p-4'>
        <section className="flex items-center w-full mb-8 pb-4 border-b border-border max-sm:mb-4">
          <UserIcon className="w-8 h-8 max-sm:w-6 max-sm:h-6 mr-2 shrink-0"/>
          <span className="text-xl text-primary text-left max-sm:text-base font-medium">
            User Profile
          </span>
        </section>
        {!isLoaded && <div className="relative w-full min-h-75">
          <div className="absolute inset-0 flex justify-center items-center w-full">
            <Loader className="w-4 h-4 animate-spin mr-1"/>
            <span className="max-sm:text-xs font-medium text-muted-foreground">
              fetching your data...
            </span>
          </div>
        </div>}
        {isLoaded && <div className="flex flex-col items-center w-full gap-3 border-b border-border pt-2 pb-8 mb-8 max-sm:pb-5 max-sm:mb-5">
            <div className="relative w-32 min-h-32 max-sm:w-18 max-sm:min-h-18 overflow-hidden rounded-full shrink-0">
              {user ? (
                <Image
                  src={user.imageUrl}
                  alt="profile"
                  fill
                  sizes="1024px"
                  className="object-cover"
                />
              ):(
                <UserIcon className="w-4 h-4"/>
              )}
            </div>
            <p>{user?.primaryEmailAddress?.emailAddress}</p>
        </div>}
        {isLoaded && <div className="w-full pb-8 border-b border-border mb-8 max-sm:pb-5 max-sm:mb-5">
          <div className="flex items-center gap-2 w-full mb-4">
            <p className="flex-1 flex items-center gap-2">
              <Shield className="w-6 h-6 max-sm:w-5 max-sm:h-5"/>
              <span className="max-sm:text-base">Account Status</span>
            </p>
            <Badge
              variant={"outline"}
              className="p-3 text-xs"
            >
              {isLoaded && isSignedIn && user ? "Active":"Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 w-full">
            <p className="flex-1 flex items-center gap-2">
              <Mail className="w-6 h-6 max-sm:w-5 max-sm:h-5"/>
              <span className="max-sm:text-base">Email Verification</span>
            </p>
            <Badge
              variant={"outline"}
              className="p-3 text-xs"
            >
              {user?.primaryEmailAddress?.verification.status}
            </Badge>
          </div>
        </div>}
        {isLoaded && <div className="w-full">
          <SignOutButton>
            <Button
              variant={"destructive"}
              size={"lg"}
            >
              Signout
            </Button>
          </SignOutButton>
        </div>}
      </div>
    </div>
  )
}

export default ProfilePage