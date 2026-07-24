import { readdir } from "node:fs/promises";

export async function listJsonFiles(directory) {
  try {
    return (await readdir(directory))
      .filter((file) => file.endsWith(".json"))
      .sort();
  } catch (error) {
    if (error?.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}
