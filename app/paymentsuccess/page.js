"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function PaymentSuccessRedirect() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    (async () => {
      await Swal.fire({
        title: "Payment Successful",
        text: "Thank you — your payment was processed successfully.",
        icon: "success",
        confirmButtonText: "Go to Payments",
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
