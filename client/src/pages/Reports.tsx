import { FileText, Download } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-8 pb-10 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-display font-extrabold text-foreground">Health Reports</h1>
        <p className="text-muted-foreground mt-1">Export and view aggregate community health data</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-border border-dashed">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
          <FileText size={40} />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Comprehensive Reporting</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The reporting engine is currently aggregating community data. Check back soon for detailed PDF and CSV exports of local health trends.
        </p>
        <button disabled className="bg-muted text-muted-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
          <Download size={20} /> Generate Report
        </button>
      </div>
    </div>
  );
}
