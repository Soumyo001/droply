'use client';
import Header from "./header";
import { usePathname } from "next/navigation";

const noHeaderRoutes = ["/","/login","/signup"];

const ConditionalHeader = () => {
    const path = usePathname();
    if(noHeaderRoutes.includes(path)) {
        return null;
    }
    return <Header/>;
}

export default ConditionalHeader;