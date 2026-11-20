import { redirect } from "next/navigation";

/** Remix now lives in the video create page; old links land there. */
export default function RemixPage() {
  redirect("/create/video?model=smpl-remix");
}
