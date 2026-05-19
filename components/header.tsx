import { CloudUploadIcon } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

const Header = () => {
  return (
    <div className='flex flex-row justify-between items-center w-full py-10 border-b mb-7'>
        <div className="flex items-center gap-2">
            <CloudUploadIcon className="w-10 h-10"/>
            <span className="text-2xl text-primary font-bold">Droply</span>
        </div>
        <UserButton/>
    </div>
  )
}

export default Header