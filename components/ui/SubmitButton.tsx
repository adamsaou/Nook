// components/ui/SubmitButton.tsx

"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="primary" className="py-2.5" disabled={pending}>
            {pending ? "Creating..." : children}
        </Button>
    );
}