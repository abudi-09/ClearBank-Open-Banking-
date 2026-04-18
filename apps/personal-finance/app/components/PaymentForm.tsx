"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@clearbank/ui";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { optimisticAddPayment } from "../../src/lib/queryClient";

const PaymentInputSchema = z.object({
  fromAccountId: z.string().min(1),
  iban: z.string().min(12),
  amount: z.coerce.number().positive(),
  currency: z.enum(["USD", "EUR", "GBP", "ETB", "KES", "AED", "SAR", "INR", "GHS", "NGN"]),
  description: z.string().min(2),
});

type FormData = z.infer<typeof PaymentInputSchema>;

export function PaymentForm({ accounts }: { accounts: Array<{ id: string; label: string }> }) {
  const { register, handleSubmit, reset, formState } = useForm<FormData>({
    resolver: zodResolver(PaymentInputSchema),
    defaultValues: {
      fromAccountId: accounts[0]?.id ?? "",
      currency: "GBP",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return data;
    },
    onMutate: async (data) => {
      return optimisticAddPayment({
        id: crypto.randomUUID(),
        amount: data.amount,
        currency: data.currency,
        status: "PROCESSING",
        description: data.description,
        createdAt: new Date().toISOString(),
      });
    },
    onError: (_error, _variables, rollback) => {
      rollback?.();
    },
    onSuccess: () => reset(),
  });

  return (
    <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
      <label className="block text-sm">
        Source Account
        <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register("fromAccountId")}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Receiver IBAN
        <Input {...register("iban")} />
      </label>
      <label className="block text-sm">
        Amount
        <Input type="number" step="0.01" {...register("amount")} />
      </label>
      <label className="block text-sm">
        Currency
        <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register("currency")}>
          {["USD", "EUR", "GBP", "ETB", "KES", "AED", "SAR", "INR", "GHS", "NGN"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Description
        <Input {...register("description")} />
      </label>
      <Button disabled={mutation.isPending || formState.isSubmitting} type="submit">
        {mutation.isPending ? "Sending..." : "Send Money"}
      </Button>
    </form>
  );
}
