'use client'
import { FolderDown, Loader } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { 
    Dialog, 
    DialogTrigger, 
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "../ui/dialog"
import { 
    Field,
    FieldGroup,
    FieldLabel,
} from "../ui/field"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type Props = {
    loading: boolean;
    handleNewFolderCreate: (name: string) => Promise<void>;
}

const NewFolderButton = ({loading, handleNewFolderCreate}: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  useEffect(() => {
    if(open) setFolderName("New Folder");
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={
            <Button
              type="button"
              variant={"secondary"}
              size={"lg"}
              className={"p-4 flex-1/2 cursor-pointer"}
              disabled={loading}
            />
        }>
            <FolderDown className="w-2 h-2"/> New Folder
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create folder</DialogTitle>
                <DialogDescription>Enter your folder name</DialogDescription>
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="folder-name">Folder name</FieldLabel>
                    <Input
                        id="folder-name"
                        type="text"
                        placeholder="Vacation Days..."
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                    />
                </Field>
            </FieldGroup>
            <DialogFooter>
                <Button
                    variant={"ghost"}
                    onClick={() => setFolderName("")}
                >
                    Clear
                </Button>
                <Button
                    disabled={loading}
                    onClick={async() => {
                        if(!folderName.trim()) {
                            toast.error("Folder name cannot be empty");
                            return;
                        }
                        await handleNewFolderCreate(folderName);
                        setFolderName("");
                        setOpen(false);
                    }}
                >
                    {loading?(
                        <>
                            <Loader className="mr-1 w-4 h-4 animate-spin"/>
                            Creating...
                        </>
                    ):(
                        <>Create</>
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default NewFolderButton