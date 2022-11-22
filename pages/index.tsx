import { FaLinkedin } from "react-icons/fa";
import {
  ArrowDownIcon,
  BriefcaseIcon,
  UserPlusIcon,
  WindowIcon,
} from "@heroicons/react/24/solid";

export default function Home() {
  return (
    <div className="">
      <div className="fixed z-10 bg-white left-0 right-0 py-3 mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="grid grid-flow-col items-center">
            <div className="mr-3 flex-shrink-0">
              <img
                className="inline-block h-14 w-14 rounded-full object-cover"
                src="maksym.jpg"
                alt=""
              />
            </div>
            <div>
              <h4 className="text-lg font-bold">Maksym Boytsov</h4>
              <p>🧑‍💻 Software Engineer</p>
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            {social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <section
        id="hero"
        className="relative bg-white h-screen grid gap-5 justify-center items-center justify-items-center content-center"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-lg font-semibold text-gray-800">Qualities</h2>

          {keywords.map((keyword) => (
            <p
              key={keyword.name}
              className={`mt-1 text-4xl font-bold tracking-tight text-${keyword.color}-900 sm:text-5xl lg:text-6xl`}
            >
              {keyword.name}
            </p>
          ))}

          <p className="mx-auto mt-5 max-w-xl text-xl text-gray-500">
            I have, and I value in projects and people I work with.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Contact Me
        </button>

        <button
          type="button"
          className="absolute bottom-4 inline-flex items-center rounded-full border border-transparent bg-gray-600 p-1 text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <ArrowDownIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </section>

      <section id="experience" className="bg-zinc-900">
        <div className="mx-auto max-w-7xl py-24 px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">
              Experience
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-400">
              Majority of my experience in the field of software development.
            </p>
          </div>
          <dl className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {experiences.map((experience) => (
              <div key={experience.name} className="relative">
                <dt>
                  <BriefcaseIcon
                    className="absolute mt-1 h-6 w-6 text-indigo-400"
                    aria-hidden="true"
                  />
                  <p className="ml-10 text-lg font-semibold leading-8 text-gray-100">
                    {experience.company}
                  </p>
                  <WindowIcon
                    className="absolute mt-1 h-6 w-6 text-indigo-400"
                    aria-hidden="true"
                  />
                  <p className="ml-10 text-md font-semibold leading-8 text-gray-100">
                    {experience.name}
                  </p>
                </dt>
                <dd className="mt-2 ml-10 text-base leading-7 text-gray-400">
                  {experience.description}
                </dd>
                <p className="mt-2 ml-10 text-gray-200 text-sm">
                  {experience.start} - {experience.end}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto max-w-7xl overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8 flex justify-center space-x-6">
            {social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-gray-500"
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
    </div>
  );
}

const keywords = [
  { name: "Fast", color: "red" },
  { name: "Friendly", color: "green" },
  { name: "Responsive", color: "teal" },
  { name: "Reliable", color: "blue" },
];

const social = [
  {
    name: "GitHub",
    href: "#",
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
    href: "#",
    icon: (props) => <FaLinkedin {...props} size="24" />,
  },
  {
    name: "Twitter",
    href: "#",
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
      "Working with clients as a freelance developers to help them build websites of their dreams.",
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
    name: "Fullstack Engineer",
    description:
      "Worked with countless various teams on different projects to build and maintain web applications in a startup environment.",
    start: "Dec 2019",
    end: "Dec 2021",
  },
  {
    company: "Fleek",
    name: "Software Engineer",
    description:
      "Worked with multiple various teams on different projects to build and maintain web applications in a startup environment.",
    start: "Sep 2021",
    end: "Now",
  },
];
