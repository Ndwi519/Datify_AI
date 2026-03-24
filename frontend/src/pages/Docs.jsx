import { useNavigate } from 'react-router-dom';
import { BookOpen, Database, BarChart2, FileText, CheckCircle } from 'lucide-react';

const Docs = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase italic">User Guide & Help</h1>
        <p className="text-blue-500 dark:text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Learn how to use Datify AI and turn your spreadsheets into clear insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DocSection 
          icon={<Database className="w-5 h-5 text-blue-500" />}
          title="Source Ingestion"
          description="Upload one or more CSV files. Datify automatically links files based on matching column names."
          steps={[
            "Go to the Datasets tab",
            "Drag & Drop your CSV files",
            "Wait for the files to process",
            "Verify with the data preview"
          ]}
        />
        <DocSection 
          icon={<BarChart2 className="w-5 h-5 text-emerald-500" />}
          title="Asking Questions"
          description="Use natural language to query your data. No SQL or Python knowledge required."
          steps={[
            "Go to the Analytics tab",
            "Type a natural question (e.g. 'Compare sales by region')",
            "View AI-generated charts and storyteller insights",
            "Refine your question for deeper analysis"
          ]}
        />
        <DocSection 
          icon={<FileText className="w-5 h-5 text-blue-500" />}
          title="Generating Reports"
          description="Export your analysis as professional PDF briefings to share with non-technical stakeholders."
          steps={[
            "After a query, click 'Export Briefing PDF'",
            "Include chart visualizations and AI narratives",
            "Download instantly to your local machine"
          ]}
        />
        <DocSection 
          icon={<BookOpen className="w-5 h-5 text-purple-500" />}
          title="Best Practices"
          description="Tips for getting the most accurate results from the AI Storyteller."
          steps={[
            "Ensure CSV headers are descriptive",
            "Clean missing values before upload",
            "Be specific with your questions",
            "Use the 'Settings' to toggle dark mode for late-night analysis"
          ]}
        />
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
        <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black uppercase italic mb-2">Connect Data?</h3>
            <p className="opacity-90 max-w-md text-[10px] font-black uppercase tracking-widest">Connect your data files and get AI insights in seconds.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white text-blue-600 font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-lg active:scale-95"
          >
            Engage Portal
          </button>
        </div>
      </div>
    </div>
  );
};

const DocSection = ({ icon, title, description, steps }) => (
  <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
    </div>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{description}</p>
    <ul className="space-y-3">
      {steps.map((step, idx) => (
        <li key={idx} className="flex items-start space-x-3">
          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{step}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Docs;
