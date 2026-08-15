import type { Metadata } from "next";
import { SignalEarth } from "./signal-earth";

export const metadata: Metadata = {
  title: "向左转向右转 / Signal Earth",
  description: "选择一座城市，把红绿灯里的小人放出来。",
};

export default function Home() {
  return <SignalEarth />;
}
