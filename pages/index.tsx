import { FaLinkedin } from "react-icons/fa";
import {
  ArrowDownIcon,
  ExclamationCircleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import { useRef, useState } from "react";
import Head from "next/head";
import { useForm } from "react-hook-form";
import Image from "next/image";

import maksymSrc from "../public/maksym.jpg";
import shadowSrc from "../public/shadow.jpg";

const COMMON_PHRASES = [
  "How old are you?",
  "What are your skills?",
  "Do you have any pets?",
];

export default function Home() {
  const [completion, setCompletion] = useState("");
  const contactForm = useForm({
    defaultValues: {
      email: "",
      name: "",
      message: "",
    },
  });

  const createCompletionForm = useForm({
    defaultValues: {
      question: "",
    },
  });

  const aiRef = useRef(null);
  const contactRef = useRef(null);

  const typeWriter = (text: string, i: number = 0) => {
    const timeoutMs = 5;

    if (i < text.length) {
      setCompletion((prev) => prev + text.charAt(i));
      setTimeout(() => typeWriter(text, i + 1), timeoutMs);
    }
  };

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

  const invalidInputClassName =
    "border-red-300 text-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500";

  return (
    <>
      <Head>
        <title>Maksym Boytsov</title>
        <meta name="description" content="Maksym Boytsov's personal website" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link rel="canonical" href="https://maksym.page/" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <main className="text-zinc-100">
        <header className="fixed z-10 backdrop-blur-sm bg-zinc-900/75 rounded-full left-0 right-0 top-2 py-1.5 sm:py-3 mx-auto max-w-7xl px-2 sm:px-4">
          <div className="flex justify-between items-center">
            <div className="grid grid-flow-col items-center">
              <div className="mr-3 flex-shrink-0">
                <Image
                  className="inline-block h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover"
                  src={maksymSrc}
                  alt="Maksym Boytsov"
                />
              </div>
              <div>
                <h1 className="text-md sm:text-lg font-bold">Maksym Boytsov</h1>
                <h2 className="text-sm sm:text-md">🧑‍💻 Software Engineer</h2>
              </div>
            </div>

            <div className="flex justify-center space-x-2 sm:space-x-4">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-300"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </header>

        <section
          id="hero"
          className="relative bg-zinc-900 h-screen grid md:grid-cols-2 grid-flow-col border-b border-zinc-700"
        >
          <div className="h-screen grid gap-5 justify-center items-center justify-items-center content-center">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              {keywords.map((keyword, index) => {
                return (
                  <p
                    key={keyword.name}
                    style={{ animationDelay: `${index}s` }}
                    className={`mt-1 animate-[gradient-fade_4s_ease-out_infinite] bg-[length:600%] bg-bottom bg-gradient-to-r ${keyword.fromColor} ${keyword.viaColor} to-stone-500 text-transparent bg-clip-text text-4xl font-bold tracking-tight  sm:text-5xl lg:text-6xl`}
                  >
                    {keyword.name}
                  </p>
                );
              })}

              <p className="mx-auto mt-5 max-w-xl text-xl text-gray-400">
                I value in myself and the people I work with.
              </p>
            </div>
            <button
              onClick={() =>
                contactRef.current.scrollIntoView({ behavior: "smooth" })
              }
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-400 px-4 py-2 text-base font-medium text-zinc-900 shadow-sm hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Let's Connect
            </button>
          </div>
          <div className="hidden md:block relative">
            <Image
              alt="Man walking towards his shadow."
              src={shadowSrc}
              placeholder="blur"
              quality={75}
              className="w-full h-full absolute bottom-0 right-0 left-0 top-0 object-cover"
              fill
              priority
            />
          </div>
          <button
            aria-label="Scroll down"
            type="button"
            onClick={() => aiRef.current.scrollIntoView({ behavior: "smooth" })}
            className="absolute bottom-4 right-1/2 translate-x-1/2 inline-flex items-center rounded-full border border-transparent bg-gray-600 p-1 text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowDownIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </section>

        <section id="ai" ref={aiRef} className="bg-zinc-800">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid gap-4 relative isolate overflow-hidden bg-zinc-800 px-6 py-24 sm:rounded-3xl sm:px-24 xl:py-32">
              <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ask me anything 🤖
              </h2>
              <p className="mx-auto mt-2 text-center text-lg leading-8 text-gray-400">
                Specifically trained AI model will answer any question about me
                🦾
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
                          message:
                            "Your question must be at least 6 characters.",
                        },
                        maxLength: {
                          value: 100,
                          message:
                            "Your question must be at most 100 characters.",
                        },
                      })}
                      className={`bg-zinc-800 border-zinc-700 block w-full h-10 rounded-md autofill:bg-zinc-700 border px-3 pr-10 sm:text-sm${
                        createCompletionForm.formState.errors.question
                          ? ` ${invalidInputClassName}`
                          : ""
                      }`}
                      placeholder="Your question..."
                    />
                    <button
                      type="submit"
                      disabled={createCompletionForm.formState.isSubmitting}
                      className="flex-none rounded-md bg-zinc-600 py-2.5 px-3.5 text-sm font-semibold text-zinc-100 shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {createCompletionForm.formState.isSubmitting
                        ? "Loading..."
                        : "Ask"}
                    </button>
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
                    completion
                      ? "opacity-1 p-4 mt-10"
                      : "opacity-0 h-0 p-0 mt-0"
                  } transition-all duration-100 grid gap-2 items-center mx-auto opacity-1 max-w-2xl border border-zinc-500 rounded-md border-dashed bg-zinc-900`}
                >
                  <p>{completion}</p>

                  <button
                    type="button"
                    onClick={() => setCompletion(null)}
                    className=" flex-none rounded-md bg-zinc-600 py-2.5 px-3.5 text-sm font-semibold text-zinc-100 shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="stats" className="bg-blue-900"></section>

        <form
          id="contact"
          ref={contactRef}
          noValidate
          onSubmit={handleSendMessage}
          className="grid gap-10 py-10 px-4 mx-auto max-w-7xl sm:py-16 sm:px-6 lg:py-20 lg:px-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
              Leave a message 📝
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-400">
              I'm always open to new partnerships and opportunities. If you have
              any questions or just want to say hi, feel free to contact me.
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
                  className={`bg-zinc-800 border-zinc-700 block w-full h-10 rounded-md autofill:bg-zinc-700 border px-3 pr-10 sm:text-sm${
                    contactForm.formState.errors.email
                      ? ` ${invalidInputClassName}`
                      : ""
                  }`}
                  placeholder="you@example.com"
                  defaultValue={contactForm.formState.defaultValues.email}
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
                  className={`bg-zinc-800 border-zinc-700 block w-full h-10 rounded-md autofill:bg-zinc-700 border px-3 pr-10 sm:text-sm${
                    contactForm.formState.errors.name
                      ? ` ${invalidInputClassName}`
                      : ""
                  }`}
                  placeholder="Alex Smith"
                  defaultValue={contactForm.formState.defaultValues.name}
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
                className={`bg-zinc-800 border-zinc-700 block w-full h-32 rounded-md autofill:bg-zinc-700 border px-3 py-2 pr-10 sm:text-sm${
                  contactForm.formState.errors.message
                    ? ` ${invalidInputClassName}`
                    : ""
                }`}
                placeholder="Hi, I'm interested in working with you on..."
                defaultValue={contactForm.formState.defaultValues.message}
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
          <button
            disabled={contactForm.formState.isSubmitting}
            type="submit"
            className="place-self-end inline-flex items-center rounded-md border border-transparent bg-blue-400 px-4 py-2 text-base font-medium text-zinc-900 shadow-sm hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {contactForm.formState.isSubmitting ? "Loading..." : "Send Message"}
          </button>
        </form>

        <footer className="bg-zinc-800 border-t border-zinc-700">
          <div className="mx-auto max-w-7xl overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-4">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-300"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="mt-8 text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} Maksym Boytsov. Crafted with 🫶
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

const keywords = [
  { name: "Speed", fromColor: "from-cyan-500", viaColor: "via-cyan-400" },
  {
    name: "Reliability",
    fromColor: "from-sky-500",
    viaColor: "via-sky-400",
  },
  {
    name: "Dedication",
    fromColor: "from-blue-500",
    viaColor: "via-blue-400",
  },
  {
    name: "Responsiveness",
    fromColor: "from-indigo-500",
    viaColor: "via-indigo-400",
  },
];

const social = [
  {
    name: "GitHub",
    href: "https://github.com/maksym-boytsov",
    icon: (props) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Linkedin",
    href: "https://www.linkedin.com/in/maksym-boytsov",
    icon: (props) => <FaLinkedin {...props} size="24" />,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/maksym_boytsov",
    icon: (props) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
];

const experiences = [
  {
    company: "Freelance",
    name: "Web Developer",
    description:
      "Working with clients on Upwork as a freelance developers to help them build their websites.",
    start: "Mar 2018",
    end: "Aug 2019",
  },
  {
    company: "Alpha Soft",
    name: "Front-end Developer",
    description: "Building a CRM web-application for the company's clients.",
    start: "Aug 2019",
    end: "Nov 2019",
  },
  {
    company: "Startup House",
    name: "Full-stack Engineer",
    description:
      "Worked with countless various teams on different projects to build and maintain web applications in a startup environment.",
    start: "Dec 2019",
    end: "Dec 2021",
  },
  {
    company: "Fleek",
    name: "Software Engineer",
    description:
      "Continuing to build and maintain world-class applications in web3 space.",
    start: "Sep 2021",
    end: "Now",
  },
];

const skills = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "GraphQL",
  "Redux",
  "Git",
  "Databases (SQL, NoSQL)",
  "Testing (Jest, Cypress)",
  "CI/CD",
  "Cloud Computing",
  "Distributed Systems",
  "Microservices",
  "Design Systems",
  "Design",
  "Wallets (Metamask, WalletConnect)",
  "Web3 (Ethers.js, Web3.js)",
  "Blockchains (Ethereum, Polygon, BSC)",
];

const languages = [
  "English, Ukrainian, Polish, Russian (Professional)",
  "Spanish (Basic)",
];
