"use client";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { Button, invalidInputClassName } from "../../shared";

const COMMON_PHRASES = [
  "How old are you?",
  "What are your skills?",
  "Do you have any pets?",
];

const CreateCompletionForm = () => {
  const aiRef = useRef(null);
  const [completion, setCompletion] = useState("");

  const createCompletionForm = useForm({
    defaultValues: {
      question: "",
    },
  });

  const handleCreateCompletion = createCompletionForm.handleSubmit(
    async (formData) => {
      setCompletion("");
      try {
        const response = await fetch("/api/ai/completion", {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          createCompletionForm.reset();
        } else {
          alert("Failed to create completion.");
        }

        const data = await response.json();

        if (data.message) {
          typeWriter(data.message);
        }
      } catch (error) {
        alert("Error creating completion. Please try again.");
      }
    }
  );

  const typeWriter = (text: string, i: number = 0) => {
    const timeoutMs = 5;

    if (i < text.length) {
      setCompletion((prev) => prev + text.charAt(i));
      setTimeout(() => typeWriter(text, i + 1), timeoutMs);
    }
  };

  return (
    <section id="ai" ref={aiRef} className="bg-zinc-800">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-4 relative isolate overflow-hidden bg-zinc-800 px-6 py-24 sm:rounded-3xl sm:px-24 xl:py-32">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ask me anything 💭
          </h2>
          <p className="mx-auto mt-2 text-center text-lg leading-8 text-gray-400">
            Specifically trained AI model will answer any question about me 🦾
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
                    createCompletionForm.setValue("question", phrase)
                  }
                >
                  {phrase}
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleCreateCompletion}
            className="mx-auto mt-2 flex max-w-md md:gap-x-4"
          >
            <label htmlFor="question" className="sr-only">
              Question
            </label>
            <div className="grid gap-2">
              <div className="grid grid-flow-col gap-x-2">
                <input
                  {...createCompletionForm.register("question", {
                    required: {
                      message: "Please enter a question.",
                      value: true,
                    },
                    minLength: {
                      value: 6,
                      message: "Your question must be at least 6 characters.",
                    },
                    maxLength: {
                      value: 100,
                      message: "Your question must be at most 100 characters.",
                    },
                  })}
                  className={twMerge(
                    "bg-zinc-800 border-zinc-700 block w-full h-10 rounded-md autofill:bg-zinc-700 border px-3 sm:text-sm",
                    createCompletionForm.formState.errors.question &&
                      invalidInputClassName
                  )}
                  placeholder="Your question..."
                />
                <Button
                  type="submit"
                  disabled={createCompletionForm.formState.isSubmitting}
                >
                  {createCompletionForm.formState.isSubmitting
                    ? "Loading..."
                    : "Ask"}
                </Button>
              </div>
              {createCompletionForm.formState.errors.question ? (
                <p className="text-red-500 text-sm">
                  {createCompletionForm.formState.errors.question.message}
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
                <stop stopColor="#0284c7" />
                <stop offset={1} stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>

          {completion && (
            <div
              className={`${
                completion ? "opacity-1 p-4 mt-10" : "opacity-0 h-0 p-0 mt-0"
              } transition-all duration-100 grid gap-2 items-center mx-auto opacity-1 max-w-2xl border border-zinc-500 rounded-md border-dashed bg-zinc-900`}
            >
              <p>{completion}</p>

              <Button
                colorScheme="gray"
                type="button"
                onClick={() => setCompletion("")}
              >
                Got it!
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CreateCompletionForm;
