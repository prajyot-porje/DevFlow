import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface LimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LimitDialog({ open, onOpenChange }: LimitDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Daily Limit Reached</AlertDialogTitle>
          <AlertDialogDescription>
            You have reached your daily conversation limit (4 per day). Please try again tomorrow.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogAction onClick={() => onOpenChange(false)}>OK</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}