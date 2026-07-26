import { StartupForm } from "@/components/startup/StartupForm";

export default function CreateStartup() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <StartupForm 
        title="Create a Startup Idea" 
        subtitle="Fill out the details below to bring your idea to life." 
      />
    </div>
  );
}
