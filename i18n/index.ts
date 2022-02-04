import { BUILD } from "../lib/constants/env";
import en from "./en";

let main: { [k: string]: string };

switch (BUILD.defaultLang) {
  default:
    main = en as any;
    break;
}

export { main };
export { en };
