"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import GenerateCourseSteps from "./GenerateCourseSteps";

export default function CreateCourseDialog({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Course with AI</DialogTitle>
          <DialogDescription>
            Let AI help you create a complete course structure with just a few clicks.
          </DialogDescription>
        </DialogHeader>
        <GenerateCourseSteps setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}