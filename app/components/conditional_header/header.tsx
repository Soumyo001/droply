import { CloudUploadIcon } from "lucide-react";
import styles from "@/app/components/conditional_header/header.module.css";
import { UserButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      padding: "10px 20px"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
        fontSize: "25px"
      }}>
        <CloudUploadIcon size={48}/>
        <p>Droply</p>
      </div>
      <UserButton/>
    </div>
  )
}

export default Header