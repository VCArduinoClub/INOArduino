import { GetStaticProps, NextPageContext, type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import fs from 'fs';

import { api } from "../utils/api";
import HomeLink from "../components/HomeLink";
import { postFilePaths, POSTS_PATH } from "../utils/mdxUtils";
import matter from "gray-matter";
import path from "path";

type Lesson = {
  path: string,
  title: string,
  description: string,
};

type HomeProps = {
  lessons: Lesson[]
}

const Home: NextPage<HomeProps> = ({lessons}) => {
  const test = api.example.hello.useQuery({ text: "from tRPC" });
  return (
    <>
      <Head>
        <title>InoAduino App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">InoArduino</span>
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            {
              lessons.map((lesson) => (
                <HomeLink 
                  path={lesson.path.replace('.mdx', '')}
                  title={lesson.title}
                  description={lesson.description}
                  key={lesson.path.replace('.mdx', '')}>
                </HomeLink>
              ))
            }
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async() => {

  const lessonInfo = 
  postFilePaths.map((lesson_path) => {
    const postFilePath = path.join(POSTS_PATH, `${lesson_path}`);
    const source = fs.readFileSync(postFilePath);
    const matterContent = matter(source);
    return {
          path: lesson_path,
          ...matterContent.data,
      }
    }
  )
  
  return {
    props: {
      lessons: lessonInfo,
    }
  };
}