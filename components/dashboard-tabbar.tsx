'use client'
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { usePathname, useRouter } from "next/navigation"
import { File, User2 } from "lucide-react";

const DashboardTabbar = () => {
    const activePageValue = usePathname() === "/dashboard/files" ? "files":"profile";
    const router = useRouter();
    return (
        <Tabs
            className={"shrink-0"}
            value={activePageValue}
            onValueChange={(value) => {
              value === "files"
                      ? router.push("/dashboard/files")
                      : router.push("/dashboard/profile")
            }}
        >
            <TabsList variant={"line"}>
                <TabsTrigger value="files" className="cursor-pointer font-bold text-sm">
                  <File className="w-4 h-4"/>Files
                </TabsTrigger>
                <TabsTrigger value="profile" className="cursor-pointer font-bold text-sm">
                  <User2 className="w-4 h-4"/>Profile
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}

export default DashboardTabbar