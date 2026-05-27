"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { AlertTriangle, Clock } from "lucide-react";

interface LimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LimitDialog({ open, onOpenChange }: LimitDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-xl">
        <AlertDialogHeader className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[var(--color-warning)]" />
          </div>
          <AlertDialogTitle className="text-center font-heading font-semibold text-lg text-[var(--color-text-primary)]">
            Daily Limit Reached
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-[var(--color-text-secondary)] leading-relaxed">
            You&apos;ve used all <span className="font-semibold text-[var(--color-text-primary)]">4 conversations</span> for today. 
            Your limit resets at midnight.
          </AlertDialogDescription>
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-tertiary)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Resets daily at 12:00 AM</span>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogAction className="w-full bg-[var(--color-accent)] text-white hover:brightness-110 rounded-lg font-body font-semibold text-sm py-2.5 transition-all duration-fast cursor-pointer">
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}