// Based on Vercel's very nice MDX utilities
// https://raw.githubusercontent.com/vercel/next.js/canary/examples/with-mdx-remote/utils/mdxUtils.js

import fs from 'fs'
import path from 'path'

// POSTS_PATH is useful when you want to get the path to a specific file
export const POSTS_PATH = path.join(process.cwd(), 'src/lessons')
/* ALWAYS USE SRC. YOU WILL NOT BE ABLE TO BUILD IF YOU DON'T. */
export type Lesson = {
  path: string,
  title: string,
  description: string,
};

// postFilePaths is the list of all mdx files inside the POSTS_PATH directory
export const postFilePaths = fs
  .readdirSync(POSTS_PATH)
  // Only include md(x) files
  .filter((path) => /\.mdx?$/.test(path))
