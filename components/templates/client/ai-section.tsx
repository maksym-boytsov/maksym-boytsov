"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

import { useForm } from "react-hook-form";
import maksymSrc from "../../../public/maksym.jpg";
import { twMerge } from "tailwind-merge";
import { Button, invalidInputClassName } from "../../shared";
import Image from "next/image";

const COMMON_PHRASES = [
  "Where did you study?",
  "What are your skills?",
  "How old are you?",
];

type Completion = {
  content: string;
  role: "assistant" | "user";
};

const AISection = () => {
  const aiRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<Completion[]>([]);

  const createCompletionForm = useForm({
    defaultValues: {
      message: "",
    },
  });

  const clearChat = () => setChatMessages([]);

  const handleCreateCompletion = createCompletionForm.handleSubmit(
    async (formData) => {
      const newChatMessage: Completion = {
        content: formData.message,
        role: "user",
      };
      const updatedChatMessages = [...chatMessages, newChatMessage];

      setChatMessages(updatedChatMessages);

      try {
        const response = await fetch("/api/ai/create-chat-completion", {
          method: "POST",
          body: JSON.stringify({ messages: updatedChatMessages }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          createCompletionForm.reset();
        } else {
          const error = await response.json();
          alert(error.message);
          // Remove latest message from chat
          setChatMessages((prev) => prev.slice(0, -1));
          return;
        }

        const { choices } = await response.json();

        const newAssistantChatMessage: Completion = {
          content: choices[0]?.message.content,
          role: "assistant",
        };

        setChatMessages((prev) => [...prev, newAssistantChatMessage]);
      } catch (error) {
        console.log(error.message);
        alert("Error creating completion. Please try again.");
        createCompletionForm.reset();
      }
    }
  );

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const chatHasMessages = chatMessages.length > 0;

  return (
    <section id="ai" ref={aiRef} className="bg-zinc-800">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-4 relative isolate overflow-hidden bg-zinc-800 px-6 py-24 sm:rounded-3xl sm:px-24 xl:py-32">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ask me anything 💭
          </h2>
          <p className="mx-auto text-center text-lg leading-8 text-gray-400">
            Specifically trained AI assistant will tell you anything about me 🦾
          </p>

          <div className="isolate mx-auto grid justify-items-center gap-1 md:block">
            {COMMON_PHRASES.map((phrase, index) => {
              const isLast = index === COMMON_PHRASES.length - 1;
              const isFirst = index === 0;

              const className = `rounded-md md:rounded-none relative inline-flex items-center bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-inset ring-gray-700 hover:bg-zinc-800 focus:z-10 ${
                isLast ? "md:rounded-r-md" : ""
              } ${isFirst ? "md:rounded-l-md" : ""}`;

              return (
                <button
                  key={phrase}
                  type="button"
                  className={className}
                  onClick={() =>
                    createCompletionForm.setValue("message", phrase)
                  }
                >
                  {phrase}
                </button>
              );
            })}
          </div>

          <div className="relative w-full max-w-2xl mx-auto">
            <div
              ref={chatRef}
              className="grid items-start gap-2 p-4 h-60 font-medium overflow-auto transition-all duration-100 opacity-1 w-full border-2 border-dashed border-zinc-500 rounded-md bg-zinc-900"
            >
              {chatHasMessages ? (
                <>
                  <div className="grid items gap-4">
                    {chatMessages?.map((message) => {
                      return (
                        <div className="grid gap-2 justify-start grid-flow-col">
                          {message.role == "user" ? (
                            <UserIcon className="h-10 w-10" />
                          ) : (
                            <Image
                              className="inline-block h-10 w-10 rounded-full object-cover"
                              src={maksymSrc}
                              alt="Maksym Boytsov"
                            />
                          )}
                          <p className="pt-1.5 pr-6">{message.content}</p>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    className="mx-auto absolute right-2 bottom-2"
                    colorScheme="gray"
                    type="button"
                    onClick={clearChat}
                    aria-label="Clear"
                  >
                    <XMarkIcon className="h-6 w-6 -mx-2" />
                  </Button>
                </>
              ) : (
                <p className="text-zinc-400 select-none">
                  You will see the conversation here...
                </p>
              )}
            </div>
          </div>

          <form
            onSubmit={handleCreateCompletion}
            className="mx-auto mt-2 flex max-w-md md:gap-x-4"
          >
            <label htmlFor="message" className="sr-only">
              Message
            </label>
            <div className="grid gap-2">
              <div className="relative grid grid-flow-col gap-x-2">
                <input
                  disabled={createCompletionForm.formState.isSubmitting}
                  {...createCompletionForm.register("message", {
                    required: {
                      message: "Please enter a message.",
                      value: true,
                    },
                    minLength: {
                      value: 2,
                      message: "Your message must be at least 2 characters.",
                    },
                    maxLength: {
                      value: 100,
                      message: "Your message must be at most 100 characters.",
                    },
                  })}
                  className={twMerge(
                    "bg-zinc-800 border-zinc-700 block w-full h-10 rounded-md autofill:bg-zinc-700 border px-3 sm:text-md disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-400",
                    createCompletionForm.formState.errors.message &&
                      invalidInputClassName
                  )}
                  placeholder="Write the message"
                />

                {createCompletionForm.formState.errors.message && (
                  <div className="pointer-events-none absolute inset-y-0 left-44 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}

                <Button
                  aria-label="Send"
                  type="submit"
                  disabled={createCompletionForm.formState.isSubmitting}
                >
                  {createCompletionForm.formState.isSubmitting ? (
                    "Loading..."
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5 -mx-1" />
                  )}
                </Button>
              </div>
              {createCompletionForm.formState.errors.message ? (
                <p className="text-red-500 text-sm">
                  {createCompletionForm.formState.errors.message.message}
                </p>
              ) : null}
            </div>
          </form>

          <svg
            className="absolute top-0 left-1/2 -z-10  -translate-x-1/2 blur-3xl xl:-top-6"
            viewBox="0 0 1155 678"
            fill="none"
          >
            <path
              fill="url(#09dbde42-e95c-4b47-a4d6-0c523c2fca9a)"
              fillOpacity=".3"
              d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
            />
            <defs>
              <linearGradient
                id="09dbde42-e95c-4b47-a4d6-0c523c2fca9a"
                x1="1155.49"
                x2="-78.208"
                y1=".177"
                y2="474.645"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#15803d" />
                <stop offset={1} stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default AISection;
