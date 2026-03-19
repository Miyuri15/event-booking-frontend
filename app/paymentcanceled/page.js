"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function PaymentCanceledRedirect() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    (async () => {
      await Swal.fire({
        title: "Payment Cancelled",
        text: "Your payment was cancelled. You can try again from the Payments page.",
        icon: "warning",
        confirmButtonText: "Back to Payments",
        allowOutsideClick: false,
      });

      if (!mounted) return;
      router.replace("/payments");
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}
