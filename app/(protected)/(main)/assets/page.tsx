import MediaExplorer from "@/features/media/components/MediaExplorer";

export default function AssetsPage() {
  return (
    <div className="flex h-full  flex-col overflow-y-auto">
      <div className="container mx-auto flex min-h-full max-w-7xl flex-col gap-8 p-6 md:p-10">
        <div className="flex flex-col gap-1.5">
          <h1 className="bg-gradient-to-br from-white via-white to-neutral-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Assets
          </h1>
          <p className="text-neutral-400">
            Everything you have made, in one place. Filter by type, model or project.
          </p>
        </div>

        <section className="flex-1 rounded-2xl  backdrop-blur-xl">
          <MediaExplorer />
        </section>
      </div>
    </div>
  );
}
