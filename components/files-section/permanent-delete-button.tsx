import { FileItem } from "@/lib/types";
import { 
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";


type Props = {
    handlePermanentDelete: () => void;
}

const PermanentDeletebutton = ({handlePermanentDelete}: Props) => {
  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant={"ghost"}
              size={"icon"}
              className={"w-8 h-8 cursor-pointer"}
            >
              <Trash2 className="w-4 h-4 text-destructive"/>
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your file
                    and remove all its data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    variant={"destructive"}
                    onClick={handlePermanentDelete}
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default PermanentDeletebutton