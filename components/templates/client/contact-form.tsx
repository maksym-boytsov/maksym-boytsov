"use client";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";

import { Button, invalidInputClassName } from "../../shared";

const ContactForm = () => {
  const contactForm = useForm({
    defaultValues: {
      email: "",
      name: "",
      message: "",
    },
  });

  const contactRef = useRef(null);

  const handleSendMessage = contactForm.handleSubmit(async (data) => {
    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        contactForm.reset();
        alert("Message sent successfully!");
      } else {
        alert("Message failed to send.");
      }
    } catch (error) {
      alert("Error sending message. Please try again.");
    }
  });

  return (
    <form
      id="contact"
      ref={contactRef}
      noValidate
      onSubmit={handleSendMessage}
      className="grid gap-10 py-24 px-4 mx-auto max-w-7xl sm:py-16 sm:px-6 lg:py-32 lg:px-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
          Leave a message 📝
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-400">
          I'm always open to new partnerships and opportunities. If you have any
          questions or just want to say hi, feel free to contact me.
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
              {...contactForm.register("email", {
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
                contactForm.formState.errors.email && invalidInputClassName
              )}
              placeholder="you@example.com"
              defaultValue={contactForm.formState.defaultValues?.email}
              aria-describedby="email-error"
            />
            {contactForm.formState.errors.email && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          {contactForm.formState.errors.email && (
            <p className="mt-2 text-sm text-red-600" id="email-error">
              {contactForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-400"
          >
            Name <span className="text-red-600">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              {...contactForm.register("name", {
                required: { value: true, message: "Name is required." },
              })}
              type="text"
              id="name"
              className={twMerge(
                "bg-zinc-800 border-zinc-700 block w-full h-10 rounded-md autofill:bg-zinc-700 border px-3 pr-10 sm:text-sm",
                contactForm.formState.errors.email && invalidInputClassName
              )}
              placeholder="Alex Smith"
              defaultValue={contactForm.formState.defaultValues?.name}
              aria-describedby="name-error"
            />
            {contactForm.formState.errors.name && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          {contactForm.formState.errors.name && (
            <p className="mt-2 text-sm text-red-600" id="name-error">
              {contactForm.formState.errors.name.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-400"
        >
          Message <span className="text-red-600">*</span>
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <textarea
            {...contactForm.register("message", {
              required: { value: true, message: "Message is required." },
              minLength: {
                value: 10,
                message:
                  "Message must be at least 10 characters - be more descriptive.",
              },
              maxLength: {
                value: 1000,
                message:
                  "Message must be at most 1000 characters. Drop a short note and we can talk more on email or any messenger.",
              },
            })}
            id="message"
            className={twMerge(
              "bg-zinc-800 border-zinc-700 block w-full h-32 rounded-md autofill:bg-zinc-700 border px-3 py-2 pr-10 sm:text-sm",
              contactForm.formState.errors.message && invalidInputClassName
            )}
            placeholder="Hi, I'm interested in working with you on..."
            defaultValue={contactForm.formState.defaultValues?.message}
            aria-describedby="message-error"
          />
          {contactForm.formState.errors.message && (
            <div className="pointer-events-none absolute right-0 top-0 flex items-center pr-3 pt-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        {contactForm.formState.errors.message && (
          <p className="mt-2 text-sm text-red-600" id="message-error">
            {contactForm.formState.errors.message.message}
          </p>
        )}
      </div>
      <Button
        disabled={contactForm.formState.isSubmitting}
        type="submit"
        className="place-self-end"
      >
        {contactForm.formState.isSubmitting ? "Loading..." : "Send Message"}
      </Button>
    </form>
  );
};

export default ContactForm;
