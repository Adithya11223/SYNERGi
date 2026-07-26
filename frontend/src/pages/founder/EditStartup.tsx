import { StartupForm } from "@/components/startup/StartupForm";
import { useParams } from "react-router-dom";

export default function EditStartup() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <StartupForm 
        startupId={id} 
        title="Edit Startup" 
        subtitle="Update the details of your startup." 
      />
    </div>
  );
}
