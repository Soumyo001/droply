import { CloudUploadIcon } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

const Header = () => {
  return (
    <div className='flex flex-row justify-between items-center w-full py-10 max-sm:py-5 border-b mb-7 max-sm:mb-5'>
        <Link
          href={"/dashboard/files"}
          className="flex items-center gap-2"
        >
            <CloudUploadIcon className="w-10 h-10"/>
            <span className="text-2xl text-primary font-bold">Droply</span>
        </Link>
        <UserButton/>
    </div>
  )
}

export default Header