import { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";

import { ErrorType } from "../../domain/entities/errors";

import type { ToastOptions } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export function ErrorToastNotification() {
  // TODO Type global.error
  // This typing is a wild guess of what it could be: errors should be strict-typed in priority
  const error: {
    message: string;
    type: ErrorType;
  } | null = useSelector<any, any>((state) => state.global.error);

  useEffect(() => {
    const toastOptions: ToastOptions = {
      autoClose: 3000,
      position: "bottom-right",
    };

    if (error instanceof Error) {
      toast.error(error.message, toastOptions);

      return;
    }

    if (
      !error ||
      typeof error !== "object" ||
      !error.message ||
      (error.type && error.type === ErrorType.INFO_AND_HIDDEN)
    ) {
      return;
    }

    const toastMessage = error.message.split(":")[0];

    switch (error.type) {
      case ErrorType.INFO:
        toast.info(toastMessage, toastOptions);
        break;

      case ErrorType.WARNING:
        toast.warn(toastMessage, toastOptions);
        break;

      default:
        // eslint-disable-next-line no-console
        console.debug(toastMessage);
    }
  }, [error]);

  return <ToastContainer />;
}
