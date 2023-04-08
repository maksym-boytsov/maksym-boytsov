"use client";
import { ExclamationCircleIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import React from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";

import { Button, invalidInputClassName } from "../../shared";

const NewsletterForm = () => {
  const newsletterForm = useForm({
    defaultValues: {
      email: "",
      firstName: "",
    },
  });

  const handleSendMessage = newsletterForm.handleSubmit(async (data) => {
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        newsletterForm.reset();
        alert("Successfully subscribed to newsletter!");
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to subscribe to newsletter. Please try again.");
    }
  });

  return (
    <form
      id="newsletter"
      noValidate
      onSubmit={handleSendMessage}
      className="grid gap-6 py-24 px-4 mx-auto max-w-3xl sm:py-16 sm:px-6 lg:py-32 lg:px-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
          Subscribe to Newsletter 💌
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-400">
          Get the latest news and updates about my projects and services first
          in your inbox. No spam, I promise 🤞
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-400"
          >
            Email <span className="text-red-600">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              {...newsletterForm.register("email", {
                required: { value: true, message: "Email is required." },
                pattern: {
                  value:
                    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                  message: "Email is not valid.",
                },
              })}
              type="email"
              id="email"
              className={twMerge(
                "bg-zinc-800 border-zinc-700 block w-full h-10 rounded-md autofill:bg-zinc-700 border px-3 pr-10 sm:text-sm",
                newsletterForm.formState.errors.email && invalidInputClassName
              )}
              placeholder="you@example.com"
              defaultValue={newsletterForm.formState.defaultValues?.email}
              aria-describedby="email-error"
            />
            {newsletterForm.formState.errors.email && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          {newsletterForm.formState.errors.email && (
            <p className="mt-2 text-sm text-red-600" id="email-error">
              {newsletterForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-400"
          >
            First Name <span className="text-red-600">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              {...newsletterForm.register("firstName")}
              type="text"
              id="first-name"
              className={twMerge(
                "bg-zinc-800 border-zinc-700 block w-full h-10 rounded-md autofill:bg-zinc-700 border px-3 pr-10 sm:text-sm",
                newsletterForm.formState.errors.email && invalidInputClassName
              )}
              placeholder="Alex"
              defaultValue={newsletterForm.formState.defaultValues?.firstName}
              aria-describedby="first-name-error"
            />
            {newsletterForm.formState.errors.firstName && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          {newsletterForm.formState.errors.firstName && (
            <p className="mt-2 text-sm text-red-600" id="first-name-error">
              {newsletterForm.formState.errors.firstName.message}
            </p>
          )}
        </div>
      </div>

      <Button
        disabled={newsletterForm.formState.isSubmitting}
        type="submit"
        className="mx sm:w-auto"
      >
        <UserPlusIcon className="h-5 w-5 mr-2" />
        {newsletterForm.formState.isSubmitting ? "Loading..." : "Subscribe"}
      </Button>
    </form>
  );
};

export default NewsletterForm;
